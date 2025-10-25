import * as dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, 'tmp');

// Ensure temp directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Middleware
app.use(express.static('public'));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://mysoov.tv',
        'https://www.mysoov.tv',
        'http://mysoov.tv',
        'http://www.mysoov.tv',
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

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
    optionsSuccessStatus: 200,
    preflightContinue: false,
  })
);

// File upload configuration - MUST come before express.json()
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: tempDir,
    createParentPath: true,
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB max
    },
    abortOnLimit: true,
    debug: false, // Disable debug to avoid logging non-file requests
  })
);

// JSON parser - comes after file upload
app.use(express.json());

// Import routes
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
import paymentRouter from './routes/paymentRoutes.js';

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API is running successfully!',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API v1 is running successfully!',
  });
});

// Database connection middleware
let isConnected = false;
let connectionPromise = null;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error('MONGO_URL environment variable is not set');
  }

  connectionPromise = (async () => {
    try {
      const connectionOptions = {
        bufferCommands: true,
        maxPoolSize: 50,
        minPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        retryReads: true,
        family: 4,
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

mongoose.connection.on('error', () => {
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
});

// Check database connection for API routes
app.use('/api', async (req, res, next) => {
  try {
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

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/videos', videoRouter);
app.use('/api/v1', uploadRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/admin', adminRouter);
app.use('/api/public', publicRouter);
app.use('/api/v1/blog', blogRouter);
app.use('/api/v1/films', filmRouter);
app.use('/api/v1/payment', paymentRouter);

// Social media meta tags route - /video/:id (backward compatibility)
app.get('/video/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const Video = (await import('./models/Video.js')).default;
    const User = (await import('./models/User.js')).default;

    const video = await Video.findById(req.params.id);

    if (!video || video.privacy === 'Private') {
      return res.status(404).send('Video not found');
    }

    // Check if the request is from a social media crawler
    const userAgent = req.get('user-agent') || '';
    const isCrawler =
      /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Pinterest|instagram/i.test(
        userAgent
      );

    // If it's a regular user (not a crawler), serve React's index.html
    // This lets React Router handle the routing without infinite loops
    if (!isCrawler) {
      const reactIndexPath = path.join(__dirname, '../client/dist/index.html');

      // Check if React build exists (production), otherwise show a simple page
      if (fs.existsSync(reactIndexPath)) {
        return res.sendFile(reactIndexPath);
      } else {
        // Fallback for development - show simple redirect page
        return res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>View Video - Mysoov</title>
</head>
<body>
    <script>
        // Development fallback - redirect to frontend dev server
        window.location.href = "http://localhost:5173/video/${req.params.id}";
    </script>
</body>
</html>`);
      }
    }

    const user = await User.findById(video.userId);
    const videoUrl =
      typeof video.videoUrl === 'string' ? video.videoUrl : video.videoUrl?.url;

    let thumbnailUrl = 'https://via.placeholder.com/1200x630?text=Mysoov';
    let contentUrl = videoUrl;

    // Handle image posts
    if (
      video.mediaType === 'image' &&
      video.images &&
      video.images.length > 0
    ) {
      // Use the first image as the thumbnail
      const firstImage = video.images[0];
      contentUrl =
        typeof firstImage === 'string' ? firstImage : firstImage?.url;
      thumbnailUrl = contentUrl;

      // If using Cloudinary, ensure we get a properly sized image
      if (video.storageProvider === 'cloudinary' && thumbnailUrl) {
        thumbnailUrl = thumbnailUrl.replace(
          '/upload/',
          '/upload/w_1200,h_630,c_fill/'
        );
      }
    }
    // Handle video posts
    else if (video.mediaType === 'video') {
      if (video.storageProvider === 'cloudinary' && videoUrl) {
        thumbnailUrl = videoUrl.replace(
          '/upload/',
          '/upload/so_0,w_1200,h_630,c_fill/'
        );
        if (videoUrl.includes('.mp4') || videoUrl.includes('.mov')) {
          thumbnailUrl = thumbnailUrl.replace(/\.(mp4|mov)$/, '.jpg');
        }
      } else if (video.storageProvider === 'youtube' && videoUrl) {
        const youtubeIdMatch = videoUrl.match(
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        );
        if (youtubeIdMatch && youtubeIdMatch[1]) {
          thumbnailUrl = `https://img.youtube.com/vi/${youtubeIdMatch[1]}/maxresdefault.jpg`;
        }
      }
    }

    const videoTitle = video.caption || 'Untitled';
    const videoDescription = video.caption
      ? `${video.caption} (Shared ${video.share || 0} times)`
      : `Amazing content on Mysoov - Connect, share, and discover videos! (Shared ${
          video.share || 0
        } times)`;

    // Always use the production domain for og:url to prevent Facebook URL issues
    const frontendUrl = process.env.FRONTEND_URL || 'https://mysoov.tv';

    // IMPORTANT: Use absolute URL with https protocol for social media
    const shareUrl = `${frontendUrl}/video/${req.params.id}`;

    // Social media crawler - serve full meta tags
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${videoDescription.replace(
      /"/g,
      '&quot;'
    )}" />
    
    <!-- Open Graph tags -->
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
    <h1>${videoTitle}</h1>
    <p>${videoDescription}</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlContent);
  } catch (error) {
    res.status(500).send('Error loading video');
  }
});

// Social media meta tags route - /post/:id
app.get('/post/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const Video = (await import('./models/Video.js')).default;
    const User = (await import('./models/User.js')).default;

    const video = await Video.findById(req.params.id);

    if (!video || video.privacy === 'Private') {
      return res.status(404).send('Post not found');
    }

    // Check if the request is from a social media crawler
    const userAgent = req.get('user-agent') || '';
    const isCrawler =
      /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Pinterest|instagram/i.test(
        userAgent
      );

    const user = await User.findById(video.userId);
    const videoUrl =
      typeof video.videoUrl === 'string' ? video.videoUrl : video.videoUrl?.url;

    let thumbnailUrl = 'https://via.placeholder.com/1200x630?text=Mysoov';
    let contentUrl = videoUrl;

    // Handle image posts
    if (
      video.mediaType === 'image' &&
      video.images &&
      video.images.length > 0
    ) {
      // Use the first image as the thumbnail
      const firstImage = video.images[0];
      contentUrl =
        typeof firstImage === 'string' ? firstImage : firstImage?.url;
      thumbnailUrl = contentUrl;

      // If using Cloudinary, ensure we get a properly sized image
      if (video.storageProvider === 'cloudinary' && thumbnailUrl) {
        thumbnailUrl = thumbnailUrl.replace(
          '/upload/',
          '/upload/w_1200,h_630,c_fill/'
        );
      }
    }
    // Handle video posts
    else if (video.mediaType === 'video') {
      if (video.storageProvider === 'cloudinary' && videoUrl) {
        thumbnailUrl = videoUrl.replace(
          '/upload/',
          '/upload/so_0,w_1200,h_630,c_fill/'
        );
        if (videoUrl.includes('.mp4') || videoUrl.includes('.mov')) {
          thumbnailUrl = thumbnailUrl.replace(/\.(mp4|mov)$/, '.jpg');
        }
      } else if (video.storageProvider === 'youtube' && videoUrl) {
        const youtubeIdMatch = videoUrl.match(
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        );
        if (youtubeIdMatch && youtubeIdMatch[1]) {
          thumbnailUrl = `https://img.youtube.com/vi/${youtubeIdMatch[1]}/maxresdefault.jpg`;
        }
      }
    }

    const videoTitle = video.caption || 'Untitled';
    const videoDescription = video.caption
      ? `${video.caption} (Shared ${video.share || 0} times)`
      : `Amazing content on Mysoov - Connect, share, and discover! (Shared ${
          video.share || 0
        } times)`;

    // Always use the production domain for og:url to prevent Facebook URL issues
    const frontendUrl = process.env.FRONTEND_URL || 'https://mysoov.tv';

    // IMPORTANT: Use absolute URL with https protocol for social media
    const shareUrl = `${frontendUrl}/post/${video._id}`;

    // If it's a regular user (not a crawler), serve React's index.html
    // This lets React Router handle the routing without infinite loops
    if (!isCrawler) {
      const reactIndexPath = path.join(__dirname, '../client/dist/index.html');

      // Check if React build exists (production), otherwise show a simple page
      if (fs.existsSync(reactIndexPath)) {
        return res.sendFile(reactIndexPath);
      } else {
        // Fallback for development - show simple redirect page
        return res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>View Post - Mysoov</title>
</head>
<body>
    <script>
        // Development fallback - redirect to frontend dev server
        window.location.href = "http://localhost:5173/post/${video._id}";
    </script>
</body>
</html>`);
      }
    }

    // Social media crawler - serve full meta tags
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${videoDescription.replace(
      /"/g,
      '&quot;'
    )}" />
    
    <!-- Open Graph tags -->
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
    <h1>${videoTitle}</h1>
    <p>${videoDescription}</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(htmlContent);
  } catch (error) {
    res.status(500).send('Error loading post');
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

// Graceful shutdown handler
const gracefulShutdown = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }

    // Clean up temp files
    try {
      const files = fs.readdirSync(tempDir);
      files.forEach((file) => {
        const filePath = path.join(tempDir, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (e) {}

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    await connectDB();

    const port = process.env.PORT || 5100;
    const server = app.listen(port, () => {
      console.log(
        `🚀 Mysoov API server running on port ${port} - Environment: ${
          process.env.NODE_ENV || 'development'
        }`
      );
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
