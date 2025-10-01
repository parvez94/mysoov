import * as dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

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
import messageRouter from './routes/messageRoutes.js';
import {
  authenticateSocket,
  handleConnection,
} from './socket/socketHandler.js';

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
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/messages', messageRouter);

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

// Create HTTP server and Socket.IO instance
const server = createServer(app);
const io = new Server(server, {
  cors: {
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
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

// Make io available globally for other modules
global.io = io;

// Server connection
const port = process.env.PORT || 5100;

// For local development
if (process.env.NODE_ENV !== 'production') {
  server.listen(port, async () => {
    try {
      await connectDB();

      // Set up Socket.IO authentication and connection handling after DB connection
      io.use(authenticateSocket);
      io.on('connection', (socket) => handleConnection(io, socket));

      console.log(`Server is running on PORT ${port}....`);
      console.log('Socket.IO server is ready for connections');
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  });
} else {
  // For production (Vercel), ensure DB connection is established
  connectDB()
    .then(() => {
      // Set up Socket.IO authentication and connection handling after DB connection
      io.use(authenticateSocket);
      io.on('connection', (socket) => handleConnection(io, socket));
      console.log('Production server initialized with database connection');
    })
    .catch((error) => {
      console.error('Failed to initialize production server:', error);
    });
}

export default app;
