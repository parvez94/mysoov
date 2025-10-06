import * as dotenv from 'dotenv';
import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { verifyToken } from '../utils/verifyToken.js';
import User from '../models/User.js';
import { getMaxUploadSize } from '../config/pricingPlans.js';

dotenv.config();

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API,
  api_secret: process.env.CLOUD_SECRET,
});

// Handle preflight requests for upload endpoint
router.options('/upload', (req, res) => {
  res.header(
    'Access-Control-Allow-Origin',
    'https://mysoov-frontend.vercel.app'
  );
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Cookie'
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

router.post('/upload', verifyToken, async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0)
      return res.status(400).json({ msg: 'No files were uploaded.' });

    const file = req.files.video || req.files.image;

    if (!file) return res.status(400).json({ msg: 'Missing media file' });

    // Get user's upload limit based on subscription
    const user = await User.findById(req.user.id);
    if (!user) {
      removeTmp(file.tempFilePath);
      return res.status(404).json({ msg: 'User not found' });
    }

    const userMaxUploadSize = getMaxUploadSize(user);
    const maxSizeBytes = userMaxUploadSize * 1024 * 1024; // Convert MB to bytes
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    if (file.size > maxSizeBytes) {
      removeTmp(file.tempFilePath);
      return res.status(403).json({
        msg: `File size (${fileSizeMB}MB) exceeds your plan limit of ${userMaxUploadSize}MB`,
        exceedsLimit: true,
        fileSize: fileSizeMB,
        maxSize: userMaxUploadSize,
        currentPlan: user.subscription?.plan || 'free',
      });
    }

    // Determine if it's a video or image
    const isVideo = req.files.video ? true : false;

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: isVideo ? 'videos' : 'images',
      resource_type: isVideo ? 'video' : 'image',
    });

    // Clean up temporary file
    removeTmp(file.tempFilePath);

    // Send response with Cloudinary public_id and URL
    res.json({ public_id: result.public_id, url: result.secure_url });
  } catch (err) {
    return res.status(500).json({ msg: 'Internal server error' });
  }
});

// Handle preflight requests for image upload endpoint
router.options('/upload/image', (req, res) => {
  res.header(
    'Access-Control-Allow-Origin',
    'https://mysoov-frontend.vercel.app'
  );
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Cookie'
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Upload profile image
router.post('/upload/image', verifyToken, async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0)
      return res.status(400).json({ msg: 'No files were uploaded.' });

    const file = req.files.image;
    if (!file) return res.status(400).json({ msg: 'Missing image file' });

    // ~5MB limit for avatars
    if (file.size > 5 * 1024 * 1024) {
      removeTmp(file.tempFilePath);
      return res.status(400).json({ msg: 'Image too large (max 5MB)' });
    }

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'avatars',
      resource_type: 'image',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });

    removeTmp(file.tempFilePath);

    return res.json({ public_id: result.public_id, url: result.secure_url });
  } catch (err) {
    return res.status(500).json({ msg: 'Internal server error' });
  }
});

const removeTmp = (path) => {
  if (!path) return;
  fs.unlink(path, (err) => {
    // Silent error handling - unlink errors should not break the request lifecycle
  });
};

export default router;
