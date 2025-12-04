import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base upload directory
const UPLOAD_BASE_DIR = path.join(__dirname, '..', 'uploads');

// Ensure upload directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Initialize upload directories
const initializeStorage = () => {
  ensureDirectoryExists(UPLOAD_BASE_DIR);
  ensureDirectoryExists(path.join(UPLOAD_BASE_DIR, 'videos'));
  ensureDirectoryExists(path.join(UPLOAD_BASE_DIR, 'images'));
  ensureDirectoryExists(path.join(UPLOAD_BASE_DIR, 'avatars'));
  ensureDirectoryExists(path.join(UPLOAD_BASE_DIR, 'thumbnails'));
};

// Generate unique filename
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  const sanitizedName = nameWithoutExt
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 30);
  return `${sanitizedName}_${timestamp}_${randomString}${ext}`;
};

/**
 * Generate video thumbnail using FFmpeg
 * @param {string} videoPath - Path to video file
 * @param {string} outputPath - Path to save thumbnail
 * @returns {Promise<string>} - Path to generated thumbnail
 */
const generateThumbnail = (videoPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['00:00:01'],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '1200x630'
      })
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err));
  });
};

/**
 * Upload file to local storage
 * @param {string} tempFilePath - Temporary file path
 * @param {object} options - Upload options (folder, originalName)
 * @returns {Promise<object>} - Upload result with URL and path
 */
export const uploadToLocal = async (tempFilePath, options = {}) => {
  try {
    const { folder = 'videos', originalName = 'file' } = options;

    // Ensure storage is initialized
    initializeStorage();

    // Generate unique filename
    const filename = generateUniqueFilename(originalName);
    const destinationDir = path.join(UPLOAD_BASE_DIR, folder);
    const destinationPath = path.join(destinationDir, filename);

    // Move file from temp to permanent location using streams for better performance
    await new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(tempFilePath);
      const writeStream = fs.createWriteStream(destinationPath);
      
      readStream.on('error', (err) => {
        writeStream.destroy();
        reject(new Error(`Read stream error: ${err.message}`));
      });
      writeStream.on('error', (err) => {
        readStream.destroy();
        reject(new Error(`Write stream error: ${err.message}`));
      });
      writeStream.on('finish', resolve);
      
      readStream.pipe(writeStream);
    });
    
    // Verify file was written successfully
    if (!fs.existsSync(destinationPath)) {
      throw new Error('File was not written to destination');
    }

    // Generate URL path
    const relativePath = `/uploads/${folder}/${filename}`;

    // Construct absolute URL for frontend access
    const port = process.env.PORT || 5000;
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${port}`;
    const absoluteUrl = `${backendUrl}${relativePath}`;

    const result = {
      success: true,
      public_id: `${folder}/${filename}`,
      url: absoluteUrl,
      path: destinationPath,
      filename: filename,
      provider: 'local',
    };

    // Generate thumbnail for videos (non-blocking for faster response)
    if (folder === 'videos') {
      const thumbnailFilename = filename.replace(/\.[^/.]+$/, '.jpg');
      const thumbnailPath = path.join(UPLOAD_BASE_DIR, 'thumbnails', thumbnailFilename);
      const thumbnailRelativePath = `/uploads/thumbnails/${thumbnailFilename}`;
      const thumbnailAbsoluteUrl = `${backendUrl}${thumbnailRelativePath}`;
      
      // Generate thumbnail in background
      generateThumbnail(destinationPath, thumbnailPath)
        .catch(() => {
          // Silent error - thumbnail generation is optional
        });
      
      // Return thumbnail URL immediately (it will be available shortly)
      result.thumbnailUrl = thumbnailAbsoluteUrl;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to upload file to local storage: ${error.message}`);
  }
};

/**
 * Delete file from local storage
 * @param {string} publicId - File public ID (e.g., 'videos/filename.mp4')
 * @returns {Promise<boolean>}
 */
export const deleteFromLocal = async (publicId) => {
  try {
    if (!publicId) return false;

    const filePath = path.join(UPLOAD_BASE_DIR, publicId);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error deleting file from local storage:', error);
    return false;
  }
};

/**
 * Get file stats from local storage
 * @param {string} publicId - File public ID
 * @returns {Promise<object>} - File stats
 */
export const getLocalFileStats = async (publicId) => {
  try {
    const filePath = path.join(UPLOAD_BASE_DIR, publicId);

    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    const stats = await fs.promises.stat(filePath);

    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
    };
  } catch (error) {
    throw new Error(`Failed to get file stats: ${error.message}`);
  }
};

/**
 * Check available disk space
 * @returns {Promise<object>} - Disk space info
 */
export const getDiskSpace = async () => {
  try {
    // Calculate total size of uploads directory
    const calculateDirSize = (dirPath) => {
      let totalSize = 0;

      if (!fs.existsSync(dirPath)) return 0;

      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          totalSize += calculateDirSize(filePath);
        } else {
          totalSize += stats.size;
        }
      }

      return totalSize;
    };

    const usedSpace = calculateDirSize(UPLOAD_BASE_DIR);

    // Convert bytes to GB
    const usedSpaceGB = (usedSpace / (1024 * 1024 * 1024)).toFixed(2);

    return {
      used: usedSpace,
      usedGB: parseFloat(usedSpaceGB),
      path: UPLOAD_BASE_DIR,
    };
  } catch (error) {
    throw new Error(`Failed to get disk space: ${error.message}`);
  }
};

/**
 * Clean up old temporary files
 * @param {number} maxAgeHours - Maximum age in hours
 */
export const cleanupTempFiles = async (maxAgeHours = 24) => {
  try {
    const tmpDir = path.join(__dirname, '..', 'tmp');

    if (!fs.existsSync(tmpDir)) return;

    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds

    const files = await fs.promises.readdir(tmpDir);

    for (const file of files) {
      const filePath = path.join(tmpDir, file);
      const stats = await fs.promises.stat(filePath);

      if (now - stats.mtimeMs > maxAge) {
        await fs.promises.unlink(filePath);
        console.log(`Cleaned up old temp file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
};

// Initialize storage on module load
initializeStorage();

export default {
  uploadToLocal,
  deleteFromLocal,
  getLocalFileStats,
  getDiskSpace,
  cleanupTempFiles,
  UPLOAD_BASE_DIR,
};
