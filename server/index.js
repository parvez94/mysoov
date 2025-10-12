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
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
      'Access-Control-Allow-Origin',
      'https://mysoov-frontend.vercel.app'
    );
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

// Health check route
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
    cookies: req.cookies,
    headers: {
      origin: req.headers.origin,
      'user-agent': req.headers['user-agent'],
      cookie: req.headers.cookie,
    },
    timestamp: new Date().toISOString(),
  });
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

      console.log('✅ MongoDB connected successfully');
      return;
    } catch (err) {
      isConnected = false;
      connectionPromise = null;

      console.error('❌ MongoDB connection error:', err.message);
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
      console.log('✅ Database connected successfully');

      // Start listening only after DB is connected
      app.listen(port, () => {
        console.log(`✅ Server running on http://localhost:${port}`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    }
  };

  startServer();
} else {
  // For production (Vercel), attempt initial connection but don't fail
  // The middleware will handle connection on first request if needed
  connectDB()
    .then(() => {
      console.log('✅ Database connected successfully (production)');
      console.log('Environment check:', {
        hasMongoUrl: !!process.env.MONGO_URL,
        hasSecretKey: !!process.env.SECRET_KEY,
        hasCloudinary: !!(process.env.CLOUD_NAME && process.env.CLOUD_API),
        nodeEnv: process.env.NODE_ENV,
      });
    })
    .catch((error) => {
      console.warn(
        '⚠️ Initial database connection failed, will retry on first request:',
        error.message
      );
      console.log('Environment variables check:', {
        hasMongoUrl: !!process.env.MONGO_URL,
        hasSecretKey: !!process.env.SECRET_KEY,
        nodeEnv: process.env.NODE_ENV,
      });
      // Don't exit - let the middleware handle connection on first request
    });
}

export default app;
