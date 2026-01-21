import * as dotenv from 'dotenv';
import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from '../utils/verifyToken.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import { getTotalStorageLimit } from '../config/pricingPlans.js';
import {
  uploadToYouTube,
  isYouTubeConfigured,
} from '../utils/youtubeUploader.js';
import { uploadToLocal, deleteFromLocal } from '../utils/localStorage.js';

dotenv.config();

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for large file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '..', 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'upload-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000 * 1024 * 1024, // 1000MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept video, image, and audio files
    if (
      file.mimetype.startsWith('video/') ||
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('audio/')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only video, image, and audio files are allowed'));
    }
  },
});

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

router.post(
  '/upload',
  verifyToken,
  (req, res, next) => {
    // Accept either 'video' or 'image' field
    upload.fields([
      { name: 'video', maxCount: 1 },
      { name: 'image', maxCount: 1 },
    ])(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res
              .status(400)
              .json({ msg: 'File size exceeds 1000MB limit' });
          }
          return res.status(400).json({ msg: `Upload error: ${err.message}` });
        }
        return res.status(500).json({ msg: err.message || 'Upload failed' });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      // Handle both 'video' and 'image' field names
      const file = req.files?.video?.[0] || req.files?.image?.[0];

      if (!file) return res.status(400).json({ msg: 'No file was uploaded.' });

      // Get user's upload limit based on subscription
      const user = await User.findById(req.user.id);
      if (!user) {
        removeTmp(file.path);
        return res.status(404).json({ msg: 'User not found' });
      }

      // Determine if it's a video or image based on mimetype
      const isVideo = file.mimetype.startsWith('video/');

      // Check if this is a film upload (films don't count toward profile storage)
      const isFilmUpload = req.body.isFilm === 'true' || req.body.isFilm === true;

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

      const fileSizeMB = file.size / (1024 * 1024);

      // Only check storage limits for non-film uploads
      if (!isFilmUpload) {
        const totalStorageLimit = getTotalStorageLimit(user);
        const storageUsed = user.storageUsed || 0;
        const availableStorage = totalStorageLimit - storageUsed;

        if (fileSizeMB > availableStorage) {
          removeTmp(file.path);
          return res.status(403).json({
            msg: `Not enough storage. File size: ${fileSizeMB.toFixed(
              2
            )}MB, Available: ${availableStorage.toFixed(2)}MB`,
            exceedsLimit: true,
            fileSize: fileSizeMB.toFixed(2),
            storageUsed: storageUsed.toFixed(2),
            totalStorageLimit: totalStorageLimit,
            availableStorage: availableStorage.toFixed(2),
            currentPlan: user.subscription?.plan || 'free',
          });
        }
      }

      let result;

      // For videos, use the configured provider
      if (isVideo && provider === 'youtube' && isYouTubeConfigured()) {
        try {
          // Upload to YouTube
          const youtubeResult = await uploadToYouTube(file.path, {
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
          provider = 'local';
        }
      }

      // Upload to Cloudinary
      if (!result && provider === 'cloudinary') {
        try {
          const cloudinaryResult = await cloudinary.uploader.upload(file.path, {
            folder: isVideo ? 'videos' : 'images',
            resource_type: isVideo ? 'video' : 'image',
          });

          result = {
            public_id: cloudinaryResult.public_id,
            url: cloudinaryResult.secure_url,
            provider: 'cloudinary',
          };
        } catch (cloudinaryError) {
          provider = 'local';
        }
      }

      // Upload to local storage (default or fallback)
      if (!result) {
        const localResult = await uploadToLocal(file.path, {
          folder: isVideo ? 'videos' : 'images',
          originalName: file.originalname,
        });

        result = {
          public_id: localResult.public_id,
          url: localResult.url,
          provider: 'local',
        };

        if (localResult.thumbnailUrl) {
          result.thumbnailUrl = localResult.thumbnailUrl;
        }
      }

      // Clean up temporary file
      removeTmp(file.path);

      // Only increment storageUsed for non-film uploads
      if (!isFilmUpload) {
        await User.findByIdAndUpdate(req.user.id, {
          $inc: { storageUsed: fileSizeMB },
        });
      }

      res.json({ ...result, fileSize: fileSizeMB });
    } catch (err) {
      // Clean up file on error
      const file = req.files?.video?.[0] || req.files?.image?.[0];
      if (file?.path) {
        removeTmp(file.path);
      }
      return res
        .status(500)
        .json({ msg: err.message || 'Internal server error' });
    }
  }
);

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
router.post(
  '/upload/image',
  verifyToken,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ msg: 'File size exceeds limit' });
          }
          return res.status(400).json({ msg: `Upload error: ${err.message}` });
        }
        return res.status(500).json({ msg: err.message || 'Upload failed' });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ msg: 'No file was uploaded.' });

      const file = req.file;

      // ~5MB limit for avatars
      if (file.size > 5 * 1024 * 1024) {
        removeTmp(file.path);
        return res.status(400).json({ msg: 'Image too large (max 5MB)' });
      }

      // Get storage settings
      let settings = await Settings.findOne();
      const provider = settings?.storageProvider || 'local';

      let result;

      if (provider === 'cloudinary') {
        const cloudinaryResult = await cloudinary.uploader.upload(file.path, {
          folder: 'avatars',
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        });
        result = {
          public_id: cloudinaryResult.public_id,
          url: cloudinaryResult.secure_url,
        };
      } else {
        // Use local storage
        const localResult = await uploadToLocal(file.path, {
          folder: 'avatars',
          originalName: file.originalname,
        });
        result = { public_id: localResult.public_id, url: localResult.url };
      }

      removeTmp(file.path);

      return res.json(result);
    } catch (err) {
      if (req.file?.path) {
        removeTmp(req.file.path);
      }
      return res
        .status(500)
        .json({ msg: err.message || 'Internal server error' });
    }
  }
);

// Upload multiple images
router.post(
  '/upload/images',
  verifyToken,
  (req, res, next) => {
    upload.array('images', 10)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res
              .status(400)
              .json({ msg: 'One or more files exceed size limit' });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ msg: 'Too many files (max 10)' });
          }
          return res.status(400).json({ msg: `Upload error: ${err.message}` });
        }
        return res.status(500).json({ msg: err.message || 'Upload failed' });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ msg: 'No files were uploaded.' });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      const fileArray = req.files;

      const totalStorageLimit = getTotalStorageLimit(user);
      const storageUsed = user.storageUsed || 0;
      const totalFileSizeMB = fileArray.reduce(
        (sum, file) => sum + file.size / (1024 * 1024),
        0
      );
      const availableStorage = totalStorageLimit - storageUsed;

      if (totalFileSizeMB > availableStorage) {
        fileArray.forEach((f) => removeTmp(f.path));
        return res.status(403).json({
          msg: `Not enough storage. Total size: ${totalFileSizeMB.toFixed(
            2
          )}MB, Available: ${availableStorage.toFixed(2)}MB`,
          exceedsLimit: true,
          fileSize: totalFileSizeMB.toFixed(2),
          storageUsed: storageUsed.toFixed(2),
          totalStorageLimit: totalStorageLimit,
          availableStorage: availableStorage.toFixed(2),
          currentPlan: user.subscription?.plan || 'free',
        });
      }

      // Get storage settings
      let settings = await Settings.findOne();
      const provider = settings?.storageProvider || 'local';

      let uploadedImages;

      if (provider === 'cloudinary') {
        // Upload all images to Cloudinary
        const uploadPromises = fileArray.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: 'images',
            resource_type: 'image',
          })
        );

        const results = await Promise.all(uploadPromises);

        // Format results with file sizes
        uploadedImages = results.map((result, index) => ({
          public_id: result.public_id,
          url: result.secure_url,
          provider: 'cloudinary',
          fileSize: fileArray[index].size / (1024 * 1024),
        }));
      } else {
        // Upload all images to local storage
        const uploadPromises = fileArray.map((file) =>
          uploadToLocal(file.path, {
            folder: 'images',
            originalName: file.originalname,
          })
        );

        const results = await Promise.all(uploadPromises);

        // Format results with file sizes
        uploadedImages = results.map((result, index) => ({
          public_id: result.public_id,
          url: result.url,
          provider: 'local',
          fileSize: fileArray[index].size / (1024 * 1024),
        }));
      }

      // Clean up temporary files
      fileArray.forEach((file) => removeTmp(file.path));

      await User.findByIdAndUpdate(req.user.id, {
        $inc: { storageUsed: totalFileSizeMB },
      });

      res.json({ images: uploadedImages, totalSize: totalFileSizeMB });
    } catch (err) {
      // Clean up files on error
      if (req.files) {
        req.files.forEach((file) => removeTmp(file.path));
      }
      return res
        .status(500)
        .json({ msg: err.message || 'Internal server error' });
    }
  }
);

const removeTmp = (path) => {
  if (!path) return;
  fs.unlink(path, (err) => {
    // Silent error handling - unlink errors should not break the request lifecycle
  });
};

// Delete uploaded file (when user cancels)
router.delete('/upload', verifyToken, async (req, res) => {
  try {
    const { publicId, provider, fileSize } = req.body;

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

    // Decrement user's storage usage if file was deleted and fileSize was provided
    if (deleted && fileSize && req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { storageUsed: -fileSize },
      });
      console.log(`✅ Decremented storage for user ${req.user.id} by ${fileSize}MB`);
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

// Audio upload endpoint for background music
router.post(
  '/upload/audio',
  verifyToken,
  (req, res, next) => {
    upload.single('audio')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res
              .status(400)
              .json({ msg: 'Audio file size exceeds limit' });
          }
        }
        return res.status(400).json({ msg: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: 'No audio file uploaded' });
      }

      // Audio files are kept in temp directory and will be used during video processing
      const audioPath = req.file.path;
      
      res.json({
        success: true,
        path: audioPath,
        filename: req.file.filename,
        msg: 'Audio file uploaded successfully'
      });
    } catch (err) {
      console.error('Error uploading audio:', err);
      return res.status(500).json({
        msg: 'Failed to upload audio file',
        error: err.message,
      });
    }
  }
);

export default router;
