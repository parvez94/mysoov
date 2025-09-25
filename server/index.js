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

// Configure cookie settings for production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });
}
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import videoRouter from './routes/videoRoutes.js';
import uploadRouter from './routes/uploadRoutes.js';
import commentRouter from './routes/commentRoutes.js';

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
    await connectDB();
    const Video = (await import('./models/Video.js')).default;
    const count = await Video.countDocuments();
    res.json({
      success: true,
      message: 'Database connection successful',
      videoCount: count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database test failed:', error);
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

// Middleware to ensure database connection for API routes
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/videos', videoRouter);
app.use('/api/v1', uploadRouter);
app.use('/api/v1/comments', commentRouter);

// Database connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    console.error('MONGO_URL environment variable is not set');
    throw new Error('MONGO_URL environment variable is not set');
  }

  try {
    await mongoose.connect(mongoUrl, {
      bufferCommands: false,
    });
    isConnected = true;
    console.log('Connected to database...');
  } catch (err) {
    console.error('Error connecting to the database:', err.message);
    throw err;
  }
};

// Error Handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';

  // Log error details for debugging
  console.error('Error occurred:', {
    status,
    message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

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
  app.listen(port, async () => {
    try {
      await connectDB();
      console.log(`Server is running on PORT ${port}....`);
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  });
}

export default app;
