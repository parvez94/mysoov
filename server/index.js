import * as dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// Enhanced CORS configuration for production
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:5173',
        'https://mysoov-frontend.vercel.app',
        'https://mysoov-backend.vercel.app',
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // For development, allow any localhost origin
      if (
        process.env.NODE_ENV !== 'production' &&
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    preflightContinue: false,
  })
);

// Additional CORS headers for production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://mysoov-frontend.vercel.app',
      'https://mysoov-backend.vercel.app',
    ];

    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }

    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Cookie, X-Requested-With, Accept, Origin'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    next();
  });
}
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    createParentPath: true,
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB max file size
    },
    abortOnLimit: true,
  })
);

import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import videoRouter from './routes/videoRoutes.js';
import uploadRouter from './routes/uploadRoutes.js';
import commentRouter from './routes/commentRoutes.js';
import notificationRouter from './routes/notificationRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import publicRouter from './routes/publicRoutes.js';
import blogRouter from './routes/blogRoutes.js';
import filmRouter from './routes/filmRoutes.js';

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API is running successfully!',
    timestamp: new Date().toISOString(),
    version: '1.0.1',
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API v1 is running successfully!',
    version: '1.0.0',
  });
});

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    // Just check connection status, don't try to reconnect
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected',
        readyState: mongoose.connection.readyState,
      });
    }

    const Video = (await import('./models/Video.js')).default;
    const count = await Video.countDocuments();
    res.json({
      success: true,
      message: 'Database connection successful',
      videoCount: count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// Test authentication endpoint
app.get('/api/test-auth', (req, res) => {
  const token = req.cookies.access_token;
  res.json({
    success: true,
    message: 'Auth test endpoint',
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    cookies: Object.keys(req.cookies),
    allCookies: req.cookies,
    headers: {
      origin: req.headers.origin,
      'user-agent': req.headers['user-agent'],
      cookie: req.headers.cookie ? 'present' : 'missing',
      cookieLength: req.headers.cookie ? req.headers.cookie.length : 0,
    },
    timestamp: new Date().toISOString(),
  });
});

// Debug endpoint to check video structure
app.get('/api/debug-video/:id', async (req, res) => {
  try {
    const Video = (await import('./models/Video.js')).default;
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json({
      _id: video._id,
      caption: video.caption,
      videoUrl: video.videoUrl,
      videoUrlType: typeof video.videoUrl,
      hasUrl: !!video.videoUrl?.url,
      urlValue: video.videoUrl?.url,
      storageProvider: video.storageProvider,
      mediaType: video.mediaType,
      privacy: video.privacy,
      isFilm: video.isFilm,
      userId: video.userId,
      filmDirectoryId: video.filmDirectoryId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware to check database connection for API routes
app.use('/api', async (req, res, next) => {
  try {
    // If not connected, try to connect (important for serverless cold starts)
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: 'Database service temporarily unavailable',
      error:
        process.env.NODE_ENV === 'production'
          ? 'Connection failed'
          : error.message,
    });
  }
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/videos', videoRouter);
app.use('/api/v1', uploadRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/admin', adminRouter); // Fixed: Added v1 prefix
app.use('/api/admin', adminRouter); // Keep backward compatibility
app.use('/api/public', publicRouter);
app.use('/api/v1/blog', blogRouter);
app.use('/api/v1/films', filmRouter);

// Database connection
let isConnected = false;
let connectionPromise = null;

const connectDB = async () => {
  // If already connected, return immediately
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error('MONGO_URL environment variable is not set');
  }

  // Create connection promise
  connectionPromise = (async () => {
    try {
      // Optimized settings for Vercel serverless functions
      const connectionOptions = {
        bufferCommands: false,
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 15000, // Increased for serverless cold starts
        socketTimeoutMS: 45000,
        connectTimeoutMS: 15000,
        retryWrites: true,
        retryReads: true,
      };

      await mongoose.connect(mongoUrl, connectionOptions);

      isConnected = true;
      connectionPromise = null;
      return;
    } catch (err) {
      isConnected = false;
      connectionPromise = null;
      throw new Error(`Failed to connect to database: ${err.message}`);
    }
  })();

  return connectionPromise;
};

// Handle connection events
mongoose.connection.on('connected', () => {
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
});

// Route to serve post page with Open Graph meta tags (for social media crawlers like Facebook)
// Keep /video/:id for backward compatibility, redirect to /post/:id
app.get('/video/:id', async (req, res) => {
  try {
    // Ensure DB is connected
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const Video = (await import('./models/Video.js')).default;
    const User = (await import('./models/User.js')).default;

    const video = await Video.findById(req.params.id);

    if (!video || video.privacy === 'Private') {
      return res.status(404).send('Video not found');
    }

    // Fetch user info for channel avatar
    const user = await User.findById(video.userId);

    // Extract video data
    const videoUrl =
      typeof video.videoUrl === 'string' ? video.videoUrl : video.videoUrl?.url;

    // Generate thumbnail based on storage provider
    let thumbnailUrl = 'https://via.placeholder.com/1200x630?text=Mysoov';

    if (video.storageProvider === 'cloudinary' && videoUrl) {
      // Extract Cloudinary public ID and generate thumbnail
      // Convert video URL to thumbnail URL by replacing upload with upload/so_0/f_jpg
      thumbnailUrl = videoUrl.replace(
        '/upload/',
        '/upload/so_0,w_1200,h_630,c_fill/'
      );
      // If it's a video, ensure we get a frame as jpg
      if (videoUrl.includes('.mp4') || videoUrl.includes('.mov')) {
        thumbnailUrl = thumbnailUrl.replace(/\.(mp4|mov)$/, '.jpg');
      }
    } else if (video.storageProvider === 'youtube' && videoUrl) {
      // Extract YouTube video ID and use YouTube thumbnail
      const youtubeIdMatch = videoUrl.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      );
      if (youtubeIdMatch && youtubeIdMatch[1]) {
        thumbnailUrl = `https://img.youtube.com/vi/${youtubeIdMatch[1]}/maxresdefault.jpg`;
      }
    }

    const videoTitle = video.caption || 'Check out this video on Mysoov!';
    const videoDescription =
      video.caption ||
      'Amazing content on Mysoov - Connect, share, and discover videos!';

    // Dynamically determine the frontend URL based on the request
    let frontendUrl = process.env.FRONTEND_URL || 'https://mysoov.tv';

    // Check if there's a Referer header (indicates where the share was initiated from)
    const referer = req.get('Referer') || req.get('Origin');
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        frontendUrl = `${refererUrl.protocol}//${refererUrl.host}`;
      } catch (e) {
        // Invalid referer, use default
      }
    }

    const shareUrl = `${frontendUrl}/post/${video._id}`;

    // Generate HTML with Open Graph meta tags (no redirect - handled by frontend serverless function)
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${videoDescription.replace(
      /"/g,
      '&quot;'
    )}" />
    
    <!-- Open Graph tags for social sharing -->
    <meta property="og:title" content="${videoTitle.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${videoDescription.replace(
      /"/g,
      '&quot;'
    )}" />
    <meta property="og:image" content="${thumbnailUrl}" />
    <meta property="og:image:secure_url" content="${thumbnailUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:url" content="${shareUrl}" />
    <meta property="og:type" content="video.other" />
    <meta property="og:site_name" content="Mysoov" />
    <meta property="fb:app_id" content="324758342758749" />
    ${videoUrl ? `<meta property="og:video" content="${videoUrl}" />` : ''}
    <meta property="og:video:type" content="video/mp4" />
    <meta property="og:video:width" content="1280" />
    <meta property="og:video:height" content="720" />
    
    <!-- Twitter Card tags -->
    <meta name="twitter:title" content="${videoTitle.replace(
      /"/g,
      '&quot;'
    )}" />
    <meta name="twitter:description" content="${videoDescription.replace(
      /"/g,
      '&quot;'
    )}" />
    <meta name="twitter:image" content="${thumbnailUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    
    <title>${videoTitle} - Mysoov</title>
</head>
<body>
    <p>Loading video...</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlContent);
  } catch (error) {
    res.status(500).send('Error loading video');
  }
});

// New post route - same as video but with updated URL structure
app.get('/post/:id', async (req, res) => {
  try {
    // Ensure DB is connected
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const Video = (await import('./models/Video.js')).default;
    const User = (await import('./models/User.js')).default;

    const video = await Video.findById(req.params.id);

    if (!video || video.privacy === 'Private') {
      return res.status(404).send('Post not found');
    }

    // Fetch user info for channel avatar
    const user = await User.findById(video.userId);

    // Extract video data
    const videoUrl =
      typeof video.videoUrl === 'string' ? video.videoUrl : video.videoUrl?.url;

    // Generate thumbnail based on storage provider
    let thumbnailUrl = 'https://via.placeholder.com/1200x630?text=Mysoov';

    if (video.storageProvider === 'cloudinary' && videoUrl) {
      // Extract Cloudinary public ID and generate thumbnail
      // Convert video URL to thumbnail URL by replacing upload with upload/so_0/f_jpg
      thumbnailUrl = videoUrl.replace(
        '/upload/',
        '/upload/so_0,w_1200,h_630,c_fill/'
      );
      // If it's a video, ensure we get a frame as jpg
      if (videoUrl.includes('.mp4') || videoUrl.includes('.mov')) {
        thumbnailUrl = thumbnailUrl.replace(/\.(mp4|mov)$/, '.jpg');
      }
    } else if (video.storageProvider === 'youtube' && videoUrl) {
      // Extract YouTube video ID and use YouTube thumbnail
      const youtubeIdMatch = videoUrl.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      );
      if (youtubeIdMatch && youtubeIdMatch[1]) {
        thumbnailUrl = `https://img.youtube.com/vi/${youtubeIdMatch[1]}/maxresdefault.jpg`;
      }
    }

    const videoTitle = video.caption || 'Check out this post on Mysoov!';
    const videoDescription =
      video.caption ||
      'Amazing content on Mysoov - Connect, share, and discover!';

    // Dynamically determine the frontend URL based on the request
    let frontendUrl = process.env.FRONTEND_URL || 'https://mysoov.tv';

    // Check if there's a Referer header (indicates where the share was initiated from)
    const referer = req.get('Referer') || req.get('Origin');
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        frontendUrl = `${refererUrl.protocol}//${refererUrl.host}`;
      } catch (e) {
        // Invalid referer, use default
      }
    }

    const shareUrl = `${frontendUrl}/post/${video._id}`;

    // Generate HTML with Open Graph meta tags
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${videoDescription.replace(
      /"/g,
      '&quot;'
    )}" />
    
    <!-- Open Graph tags for social sharing -->
    <meta property="og:title" content="${videoTitle.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${videoDescription.replace(
      /"/g,
      '&quot;'
    )}" />
    <meta property="og:image" content="${thumbnailUrl}" />
    <meta property="og:image:secure_url" content="${thumbnailUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:url" content="${shareUrl}" />
    <meta property="og:type" content="${
      video.mediaType === 'image' ? 'article' : 'video.other'
    }" />
    <meta property="og:site_name" content="Mysoov" />
    <meta property="fb:app_id" content="324758342758749" />
    ${
      videoUrl && video.mediaType !== 'image'
        ? `<meta property="og:video" content="${videoUrl}" />`
        : ''
    }
    ${
      video.mediaType !== 'image'
        ? `<meta property="og:video:type" content="video/mp4" />`
        : ''
    }
    ${
      video.mediaType !== 'image'
        ? `<meta property="og:video:width" content="1280" />`
        : ''
    }
    ${
      video.mediaType !== 'image'
        ? `<meta property="og:video:height" content="720" />`
        : ''
    }
    
    <!-- Twitter Card tags -->
    <meta name="twitter:title" content="${videoTitle.replace(
      /"/g,
      '&quot;'
    )}" />
    <meta name="twitter:description" content="${videoDescription.replace(
      /"/g,
      '&quot;'
    )}" />
    <meta name="twitter:image" content="${thumbnailUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    
    <title>${videoTitle} - Mysoov</title>
</head>
<body>
    <p>Loading post...</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlContent);
  } catch (error) {
    res.status(500).send('Error loading post');
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
});

// Error Handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';

  return res.status(status).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Upload progress middleware removed:
// express-fileupload with useTempFiles=true writes to disk and does not expose a streaming `data` API.
// Use client-side onUploadProgress (Axios) or implement server-side progress via streaming middleware if needed.

// Server connection
const port = process.env.PORT || 5100;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const startServer = async () => {
    try {
      // Connect to database BEFORE starting the server
      await connectDB();
      // Start listening only after DB is connected
      app.listen(port, () => {});
    } catch (error) {
      process.exit(1);
    }
  };

  startServer();
} else {
  // For production (Vercel), attempt initial connection but don't fail
  // The middleware will handle connection on first request if needed
  connectDB()
    .then(() => {})
    .catch((error) => {
      // Don't exit - let the middleware handle connection on first request
    });
}

export default app;
