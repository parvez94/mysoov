import * as dotenv from 'dotenv';
import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { verifyToken } from '../utils/verifyToken.js';

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

    const file = req.files.video;

    if (!file) return res.status(400).json({ msg: 'Missing video file' });

    if (file.size > 60 * 1024 * 1024) {
      removeTmp(file.tempFilePath);
      return res.status(400).json({ msg: 'Size too large' });
    }

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'videos',
      resource_type: 'video',
    });

    // Clean up temporary file
    removeTmp(file.tempFilePath);

    // Send response with Cloudinary public_id and URL
    res.json({ public_id: result.public_id, url: result.secure_url });
  } catch (err) {
    // Handle errors
    console.error('Error uploading file:', err);
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
    console.error('Error uploading image:', err);
    return res.status(500).json({ msg: 'Internal server error' });
  }
});

const removeTmp = (path) => {
  if (!path) return;
  fs.unlink(path, (err) => {
    if (err) {
      // Do not throw here; unlink errors should not break the request lifecycle
      console.error('Failed to remove temp file:', err.message);
    }
  });
};

export default router;
