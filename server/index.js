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
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:5173', 'https://mysoov-frontend.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/videos', videoRouter);
app.use('/api/v1', uploadRouter);
app.use('/api/v1/comments', commentRouter);

// Database connection
const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URL;
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to database...');
  } catch (err) {
    console.error('Error connecting to the database:', err.message);
    process.exit(1);
  }
};

// Error Handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';

  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

// Upload progress middleware removed:
// express-fileupload with useTempFiles=true writes to disk and does not expose a streaming `data` API.
// Use client-side onUploadProgress (Axios) or implement server-side progress via streaming middleware if needed.

// Server connection
const port = process.env.PORT || 5100;

app.listen(port, () => {
  connectDB();
  console.log(`Server is running on PORT ${port}....`);
});

export default app;
