import * as dotenv from 'dotenv';
import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { verifyToken } from '../utils/verifyToken.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import { getMaxUploadSize } from '../config/pricingPlans.js';
import {
  uploadToYouTube,
  isYouTubeConfigured,
} from '../utils/youtubeUploader.js';
import { uploadToLocal, deleteFromLocal } from '../utils/localStorage.js';

dotenv.config();

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API,
  api_secret: process.env.CLOUD_SECRET,
});

// Handle preflight requests for upload endpoint
// Note: CORS is handled globally in index.js, but keep this for backward compatibility
router.options('/upload', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://mysoov.tv',
    'https://www.mysoov.tv',
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
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

    // Determine if it's a video or image
    const isVideo = req.files.video ? true : false;

    // Get storage settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        storageProvider: 'local',
        localStorageConfig: { enabled: true, maxSizeGB: 75 },
        cloudinaryConfig: { enabled: true },
        youtubeConfig: { enabled: false },
      });
    }

    let provider = settings.storageProvider || 'local';
    console.log('🔍 Upload Debug - Storage Provider:', provider);
    console.log('🔍 Upload Debug - Is Video:', isVideo);

    // Check size limits based on provider
    // YouTube uploads bypass size limits, local/cloudinary have limits
    const willCheckSize = provider !== 'youtube' || !isYouTubeConfigured();

    if (willCheckSize) {
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
    }

    let result;

    // For videos, use the configured provider
    if (isVideo && provider === 'youtube' && isYouTubeConfigured()) {
      try {
        // Upload to YouTube
        const youtubeResult = await uploadToYouTube(file.tempFilePath, {
          title: req.body.title || `Video by ${user.username}`,
          description: req.body.description || 'Uploaded via Mysoov.TV',
          tags: ['mysoov', user.username],
          privacyStatus: settings.youtubeConfig?.defaultPrivacy || 'unlisted',
        });

        result = {
          public_id: youtubeResult.videoId,
          url: youtubeResult.embedUrl, // Use embed URL for iframe
          provider: 'youtube',
          videoId: youtubeResult.videoId,
          thumbnailUrl: youtubeResult.thumbnailUrl,
        };
      } catch (youtubeError) {
        console.error(
          'YouTube upload failed, falling back to local storage:',
          youtubeError.message
        );
        provider = 'local';
      }
    }

    // Upload to Cloudinary
    if (!result && provider === 'cloudinary') {
      try {
        const cloudinaryResult = await cloudinary.uploader.upload(
          file.tempFilePath,
          {
            folder: isVideo ? 'videos' : 'images',
            resource_type: isVideo ? 'video' : 'image',
          }
        );

        result = {
          public_id: cloudinaryResult.public_id,
          url: cloudinaryResult.secure_url,
          provider: 'cloudinary',
        };
      } catch (cloudinaryError) {
        console.error(
          'Cloudinary upload failed, falling back to local storage:',
          cloudinaryError.message
        );
        provider = 'local';
      }
    }

    // Upload to local storage (default or fallback)
    if (!result) {
      const localResult = await uploadToLocal(file.tempFilePath, {
        folder: isVideo ? 'videos' : 'images',
        originalName: file.name,
      });

      result = {
        public_id: localResult.public_id,
        url: localResult.url,
        provider: 'local',
      };
    }

    // Clean up temporary file
    removeTmp(file.tempFilePath);

    // Send response
    res.json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ msg: err.message || 'Internal server error' });
  }
});

// Handle preflight requests for image upload endpoint
// Note: CORS is handled globally in index.js, but keep this for backward compatibility
router.options('/upload/image', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://mysoov.tv',
    'https://www.mysoov.tv',
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Cookie'
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Generate Cloudinary signature for client-side uploads
router.post('/upload/signature', verifyToken, async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = req.body.folder || 'videos';
    const resourceType = req.body.resourceType || 'video';

    // Get user's upload limit based on subscription
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Generate signature for Cloudinary upload
    // Only sign parameters that will be sent to Cloudinary
    const paramsToSign = {
      timestamp: timestamp,
      folder: folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUD_SECRET
    );

    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUD_NAME,
      apiKey: process.env.CLOUD_API,
      folder,
    });
  } catch (err) {
    return res.status(500).json({ msg: 'Internal server error' });
  }
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

    // Get storage settings
    let settings = await Settings.findOne();
    const provider = settings?.storageProvider || 'local';

    let result;

    if (provider === 'cloudinary') {
      const cloudinaryResult = await cloudinary.uploader.upload(
        file.tempFilePath,
        {
          folder: 'avatars',
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        }
      );
      result = {
        public_id: cloudinaryResult.public_id,
        url: cloudinaryResult.secure_url,
      };
    } else {
      // Use local storage
      const localResult = await uploadToLocal(file.tempFilePath, {
        folder: 'avatars',
        originalName: file.name,
      });
      result = { public_id: localResult.public_id, url: localResult.url };
    }

    removeTmp(file.tempFilePath);

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ msg: 'Internal server error' });
  }
});

// Upload multiple images
router.post('/upload/images', verifyToken, async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ msg: 'No files were uploaded.' });
    }

    // Get user's upload limit based on subscription
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const userMaxUploadSize = getMaxUploadSize(user);
    const maxSizeBytes = userMaxUploadSize * 1024 * 1024;

    // Handle both single and multiple file uploads
    const files = req.files.images;
    const fileArray = Array.isArray(files) ? files : [files];

    // Validate file sizes
    for (const file of fileArray) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      if (file.size > maxSizeBytes) {
        // Clean up temp files
        fileArray.forEach((f) => removeTmp(f.tempFilePath));
        return res.status(403).json({
          msg: `File size (${fileSizeMB}MB) exceeds your plan limit of ${userMaxUploadSize}MB`,
          exceedsLimit: true,
          fileSize: fileSizeMB,
          maxSize: userMaxUploadSize,
          currentPlan: user.subscription?.plan || 'free',
        });
      }
    }

    // Get storage settings
    let settings = await Settings.findOne();
    const provider = settings?.storageProvider || 'local';

    let uploadedImages;

    if (provider === 'cloudinary') {
      // Upload all images to Cloudinary
      const uploadPromises = fileArray.map((file) =>
        cloudinary.uploader.upload(file.tempFilePath, {
          folder: 'images',
          resource_type: 'image',
        })
      );

      const results = await Promise.all(uploadPromises);

      // Format results
      uploadedImages = results.map((result) => ({
        public_id: result.public_id,
        url: result.secure_url,
        provider: 'cloudinary',
      }));
    } else {
      // Upload all images to local storage
      const uploadPromises = fileArray.map((file) =>
        uploadToLocal(file.tempFilePath, {
          folder: 'images',
          originalName: file.name,
        })
      );

      const results = await Promise.all(uploadPromises);

      // Format results
      uploadedImages = results.map((result) => ({
        public_id: result.public_id,
        url: result.url,
        provider: 'local',
      }));
    }

    // Clean up temporary files
    fileArray.forEach((file) => removeTmp(file.tempFilePath));

    res.json({ images: uploadedImages });
  } catch (err) {
    return res
      .status(500)
      .json({ msg: err.message || 'Internal server error' });
  }
});

const removeTmp = (path) => {
  if (!path) return;
  fs.unlink(path, (err) => {
    // Silent error handling - unlink errors should not break the request lifecycle
  });
};

// Delete uploaded file (when user cancels)
router.delete('/upload', verifyToken, async (req, res) => {
  try {
    const { publicId, provider } = req.body;

    if (!publicId) {
      return res.status(400).json({ msg: 'Missing publicId' });
    }

    let deleted = false;

    // Delete from appropriate provider
    switch (provider) {
      case 'cloudinary':
        try {
          // Determine if it's video or image based on folder in publicId
          const resourceType =
            publicId.includes('videos') || publicId.includes('video')
              ? 'video'
              : 'image';

          await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
          });
          deleted = true;
          console.log(`✅ Deleted from Cloudinary: ${publicId}`);
        } catch (err) {
          console.error('Cloudinary delete error:', err.message);
        }
        break;

      case 'youtube':
        // YouTube videos cannot be deleted via API easily
        // Would require separate implementation
        console.log('⚠️ YouTube video deletion not implemented');
        return res.status(200).json({
          msg: 'YouTube videos cannot be automatically deleted',
          deleted: false,
        });

      case 'local':
      default:
        deleted = await deleteFromLocal(publicId);
        if (deleted) {
          console.log(`✅ Deleted from local storage: ${publicId}`);
        }
        break;
    }

    res.json({
      success: true,
      deleted,
      msg: deleted
        ? 'File deleted successfully'
        : 'File not found or already deleted',
    });
  } catch (err) {
    console.error('Error deleting upload:', err);
    return res.status(500).json({
      msg: 'Failed to delete file',
      error: err.message,
    });
  }
});

export default router;
