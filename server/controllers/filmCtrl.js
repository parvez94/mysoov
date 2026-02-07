import FilmDirectory from '../models/FilmDirectory.js';
import Video from '../models/Video.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import FilmImage from '../models/FilmImage.js';
import { createError } from '../utils/error.js';
import { sendPurchaseConfirmationEmail } from '../services/emailService.js';
import { createWatermarkedCopy } from '../utils/watermark.js';
import { createWatermarkedVideoCopy } from '../utils/videoProcessor.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Admin: Get all film directories
export const getAllFilmDirectories = async (req, res, next) => {
  try {
    const directories = await FilmDirectory.find()
      .populate('createdBy', 'username displayName displayImage')
      .populate('films')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      directories,
      total: directories.length,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get single film directory with all films
export const getFilmDirectory = async (req, res, next) => {
  try {
    const { directoryId } = req.params;

    const directory = await FilmDirectory.findById(directoryId)
      .populate('createdBy', 'username displayName displayImage')
      .populate('films');

    if (!directory) {
      return next(createError(404, 'Film directory not found'));
    }
    res.status(200).json({
      success: true,
      directory,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create new film directory
export const createFilmDirectory = async (req, res, next) => {
  try {
    const { folderName, description, price } = req.body;

    if (!folderName) {
      return next(createError(400, 'Folder name is required'));
    }

    // Check if folder name already exists
    const existingDirectory = await FilmDirectory.findOne({ folderName });

    if (existingDirectory) {
      return next(createError(400, 'Folder name already exists'));
    }

    const directory = await FilmDirectory.create({
      folderName,
      description: description || '',
      price: price ?? 0,
      createdBy: req.user.id,
      films: [],
    });

    await directory.populate('createdBy', 'username displayName displayImage');

    res.status(201).json({
      success: true,
      message: 'Film directory created successfully',
      directory,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Upload film to directory
export const uploadFilmToDirectory = async (req, res, next) => {
  try {
    const { directoryId } = req.params;
    const { videoId } = req.body;

    if (!videoId) {
      return next(createError(400, 'Video ID is required'));
    }

    // Find directory
    const directory = await FilmDirectory.findById(directoryId);
    if (!directory) {
      return next(createError(404, 'Film directory not found'));
    }

    // Find video
    const video = await Video.findById(videoId);
    if (!video) {
      return next(createError(404, 'Video not found'));
    }

    // Create watermarked video copy if video is local and doesn't already have watermark
    console.log('🔍 Checking watermark conditions for video:', {
      caption: video.caption,
      storageProvider: video.storageProvider,
      hasVideoUrl: !!video.videoUrl?.url,
      mediaType: video.mediaType,
      hasWatermark: !!video.watermarkedVideoUrl
    });
    
    if (
      video.storageProvider === 'local' &&
      video.videoUrl?.url &&
      video.mediaType === 'video' &&
      !video.watermarkedVideoUrl
    ) {
      try {
        let videoPath = video.videoUrl.url;
        if (videoPath.startsWith('http')) {
          const urlObj = new URL(videoPath);
          videoPath = urlObj.pathname;
        }
        videoPath = videoPath.replace(/^\//, '');

        const fullVideoPath = path.join(process.cwd(), videoPath);

        if (fs.existsSync(fullVideoPath)) {
          console.log('🎬 Creating watermarked video copy for:', video.caption);
          const originalFileName = path.basename(video.videoUrl.url);
          
          const watermarkResult = await createWatermarkedVideoCopy(
            fullVideoPath,
            originalFileName
          );

          // Convert to absolute URL
          const backendUrl = process.env.BACKEND_URL || 'http://localhost:5100';
          const absoluteUrl = watermarkResult.url.startsWith('http') 
            ? watermarkResult.url 
            : `${backendUrl}${watermarkResult.url.startsWith('/') ? '' : '/'}${watermarkResult.url}`;

          console.log('✅ Watermark created:', absoluteUrl);
          video.watermarkedVideoUrl = {
            url: absoluteUrl,
            public_id: watermarkResult.fileName,
          };
          console.log('✅ Watermarked URL set to:', video.watermarkedVideoUrl);
        } else {
          console.error('❌ Video file not found:', fullVideoPath);
        }
      } catch (watermarkError) {
        console.error('❌ Video watermark creation failed:', watermarkError.message);
        console.error('❌ Stack:', watermarkError.stack);
      }
    } else {
    }

    // Update video to mark as film
    video.isFilm = true;
    video.filmDirectoryId = directoryId;
    video.privacy = 'Private'; // Films are private by default
    await video.save();
    console.log('💾 Video saved with watermark URL:', video.watermarkedVideoUrl?.url);

    // Add video to directory
    if (!directory.films.includes(videoId)) {
      directory.films.push(videoId);
      await directory.save();
    } else {
    }

    await directory.populate('films');
    res.status(200).json({
      success: true,
      message: 'Film added to directory successfully',
      directory,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Remove film from directory
export const removeFilmFromDirectory = async (req, res, next) => {
  try {
    const { directoryId, filmId } = req.params;

    const directory = await FilmDirectory.findById(directoryId);
    if (!directory) {
      return next(createError(404, 'Film directory not found'));
    }

    // Remove film from directory
    directory.films = directory.films.filter(
      (film) => film.toString() !== filmId
    );
    await directory.save();

    // Update video
    const video = await Video.findById(filmId);
    if (video) {
      video.isFilm = false;
      video.filmDirectoryId = null;
      await video.save();
    }

    res.status(200).json({
      success: true,
      message: 'Film removed from directory successfully',
      directory,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete film directory
export const deleteFilmDirectory = async (req, res, next) => {
  try {
    const { directoryId } = req.params;

    const directory = await FilmDirectory.findById(directoryId);
    if (!directory) {
      return next(createError(404, 'Film directory not found'));
    }

    // Delete ORIGINAL films in the folder (isFilm: true)
    await Video.deleteMany({
      filmDirectoryId: directoryId,
      isFilm: true,
    });

    // Delete ALL user copies (both purchased and unpurchased)
    // This includes image galleries in user profiles
    const userCopies = await Video.find({
      $or: [
        { filmDirectoryId: directoryId, isFilm: false }, // Unpurchased copies with filmDirectoryId
        { sourceFilmId: { $in: await Video.find({ filmDirectoryId: directoryId, isFilm: true }).distinct('_id') } } // Purchased copies
      ]
    });
    
    console.log(`🗑️ Deleting ${userCopies.length} user copies of gallery ${directoryId}`);
    
    await Video.deleteMany({
      $or: [
        { filmDirectoryId: directoryId, isFilm: false },
        { sourceFilmId: { $in: await Video.find({ filmDirectoryId: directoryId, isFilm: true }).distinct('_id') } }
      ]
    });

    // Delete all images in the directory and their files
    const images = await FilmImage.find({ filmDirectoryId: directoryId });
    for (const image of images) {
      const deleteFile = (url) => {
        if (!url) return;
        const filePath = path.join(process.cwd(), url.replace(/^\//, '').replace(/^uploads\//, 'uploads/'));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      };

      deleteFile(image.imageUrl);
      deleteFile(image.watermarkedUrl);
    }
    await FilmImage.deleteMany({ filmDirectoryId: directoryId });

    // Delete directory
    await FilmDirectory.findByIdAndDelete(directoryId);

    res.status(200).json({
      success: true,
      message: 'Film directory deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to escape special regex characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// User: Search for film directory by folder name (which is the code)
export const searchFilmDirectory = async (req, res, next) => {
  try {
    const { code } = req.params;

    if (!code) {
      return next(createError(400, 'Folder name is required'));
    }

    // Use simple case-insensitive string comparison (more reliable than regex for exact matches)
    const directory = await FilmDirectory.findOne({
      folderName: { $regex: new RegExp(`^${escapeRegex(code)}$`, 'i') },
    }).populate({
      path: 'films',
      match: { isFilm: true }, // Only return original films, not user copies
      select: 'caption videoUrl watermarkedVideoUrl mediaType createdAt',
    });

    if (!directory) {
      return next(createError(404, 'Film directory not found'));
    }

    // Check if user has already added films from this directory to their profile
    // Only check for COPIED films (isFilm: false), not original films in the folder
    const userHasFilms = await Video.findOne({
      userId: req.user.id,
      filmDirectoryId: directory._id,
      isFilm: false, // Only check for copies, not originals
    });

    // Don't show directory if user has already added films from it
    if (userHasFilms) {
      return next(
        createError(400, 'You have already added films from this folder')
      );
    }

    // Return limited info (don't expose full film details until added to profile)
    res.status(200).json({
      success: true,
      directory: {
        _id: directory._id,
        folderName: directory.folderName,
        description: directory.description,
        price: directory.price,
        filmCount: directory.films.length,
        createdAt: directory.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// User: Get film directory details with all films (already found via search)
export const getFilmDirectoryDetails = async (req, res, next) => {
  try {
    const { directoryId } = req.params;

    const directory = await FilmDirectory.findById(directoryId).populate({
      path: 'films',
      match: { isFilm: true }, // Only return original films, not user copies
      select: 'caption videoUrl watermarkedVideoUrl thumbnail mediaType createdAt userId',
      populate: {
        path: 'userId',
        select: 'username displayName displayImage',
      },
    });

    if (!directory) {
      return next(createError(404, 'Film directory not found'));
    }

    res.status(200).json({
      success: true,
      directory: {
        _id: directory._id,
        folderName: directory.folderName,
        description: directory.description,
        price: directory.price,
        films: directory.films,
        createdAt: directory.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// User: Purchase/Own individual film from directory
// User: Add film to profile for FREE (no payment required)
export const addFilmToProfile = async (req, res, next) => {
  try {
    const { filmId, directoryId } = req.body;
    const userId = req.user.id;

    if (!filmId || !directoryId) {
      return next(createError(400, 'Film ID and Directory ID are required'));
    }

    if (directoryId === 'null' || directoryId === 'undefined') {
      return next(
        createError(
          400,
          'Invalid request. Please return to the film directory page and try again.'
        )
      );
    }

    // Verify directory exists
    const directory = await FilmDirectory.findById(directoryId);
    if (!directory) {
      return next(createError(404, 'Film directory not found'));
    }

    // Verify film exists and belongs to this directory
    const film = await Video.findById(filmId);
    if (!film) {
      return next(createError(404, 'Film not found'));
    }

    if (film.filmDirectoryId?.toString() !== directoryId) {
      return next(createError(400, 'Film does not belong to this directory'));
    }

    // Check if user already has this film in their profile
    let existingCopy = await Video.findOne({
      userId: userId,
      sourceFilmId: filmId,
      isFilm: false,
    });

    if (existingCopy) {
      // Already added - just return the existing copy
      return res.status(200).json({
        success: true,
        message: 'Film is already in your profile',
        film: existingCopy,
      });
    }

    // Auto-generate watermark if missing
    console.log('🔍 Checking watermark for film:', {
      filmId: film._id,
      caption: film.caption,
      hasWatermark: !!film.watermarkedVideoUrl,
      watermarkUrl: film.watermarkedVideoUrl?.url,
      mediaType: film.mediaType,
      videoUrl: film.videoUrl?.url
    });
    
    if (!film.watermarkedVideoUrl && film.mediaType === 'video' && film.videoUrl?.url) {
      try {
        let videoPath = film.videoUrl.url;
        if (videoPath.startsWith('http')) {
          const urlObj = new URL(videoPath);
          videoPath = urlObj.pathname;
        }
        videoPath = videoPath.replace(/^\//, '');

        const fullVideoPath = path.join(process.cwd(), videoPath);
        
        console.log('🎬 Attempting to create watermark:', {
          videoPath,
          fullVideoPath,
          exists: fs.existsSync(fullVideoPath),
          isUploads: videoPath.includes('/uploads/')
        });
        
        if (fs.existsSync(fullVideoPath) && videoPath.includes('/uploads/')) {
          const originalFileName = path.basename(film.videoUrl.url);
          const watermarkResult = await createWatermarkedVideoCopy(
            fullVideoPath,
            originalFileName
          );

          // Convert to absolute URL
          const backendUrl = process.env.BACKEND_URL || 'http://localhost:5100';
          const absoluteUrl = watermarkResult.url.startsWith('http') 
            ? watermarkResult.url 
            : `${backendUrl}${watermarkResult.url.startsWith('/') ? '' : '/'}${watermarkResult.url}`;

          film.watermarkedVideoUrl = {
            url: absoluteUrl,
            public_id: watermarkResult.fileName,
          };
          
          console.log('✅ Watermark created and set:', film.watermarkedVideoUrl);
          
          if (!film.storageProvider) {
            film.storageProvider = 'local';
          }
          
          await film.save();
        } else {
          console.log('⚠️ Skipping watermark: file not found or not in uploads/');
        }
      } catch (watermarkError) {
        console.error('❌ Auto-watermark failed:', watermarkError.message);
      }
    }

    // Re-fetch film from DB to ensure we have the latest watermark
    const freshFilm = await Video.findById(film._id);
    
    // Create a copy of the film for the user (not removing from directory)
    // Use watermarked video if available (user hasn't purchased yet)
    
    // Helper to convert relative URLs to absolute
    const toAbsoluteUrl = (urlObj) => {
      if (!urlObj?.url) return urlObj;
      
      const url = urlObj.url;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return urlObj;
      }
      
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:5100';
      return {
        ...urlObj,
        url: `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`
      };
    };
    
    const convertToAbsoluteUrl = (url) => {
      if (!url) return url;
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:5100';
      return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };
    
    // For image galleries, fetch watermarked images from FilmImage collection
    let images = [];
    if (freshFilm.mediaType === 'image') {
      const galleryImages = await FilmImage.find({ 
        filmDirectoryId: directoryId 
      }).sort({ createdAt: -1 });
      
      images = galleryImages.map(img => ({
        url: convertToAbsoluteUrl(img.watermarkedUrl), // Use watermarked for unpurchased
        originalUrl: convertToAbsoluteUrl(img.watermarkedUrl),
        imageId: img._id,
        title: img.title || ''
      }));
    }
    
    // Prepare watermark URL for copy
    const watermarkedUrlForCopy = freshFilm.watermarkedVideoUrl ? toAbsoluteUrl(freshFilm.watermarkedVideoUrl) : null;
    
    console.log('📋 Creating film copy with:', {
      originalFilmId: freshFilm._id,
      hasWatermark: !!freshFilm.watermarkedVideoUrl,
      watermarkUrl: freshFilm.watermarkedVideoUrl?.url,
      watermarkedUrlForCopy: watermarkedUrlForCopy?.url,
      mediaType: freshFilm.mediaType
    });
    
    const filmCopy = new Video({
      caption: freshFilm.caption,
      videoUrl: toAbsoluteUrl(freshFilm.videoUrl), // Always use original videoUrl
      watermarkedVideoUrl: watermarkedUrlForCopy, // Set watermark separately for frontend to detect
      thumbnail: freshFilm.thumbnail,
      images: images, // Add watermarked images for galleries
      userId: userId,
      privacy: 'Public',
      isFilm: false,
      mediaType: freshFilm.mediaType,
      storageProvider: freshFilm.storageProvider,
      sourceFilmId: freshFilm._id, // Track the original film
      filmDirectoryId: directoryId, // Track the directory for buy button
    });

    await filmCopy.save();
    
    console.log('✅ Film copy saved:', {
      copyId: filmCopy._id,
      videoUrl: filmCopy.videoUrl?.url,
      watermarkedVideoUrl: filmCopy.watermarkedVideoUrl?.url,
      sourceFilmId: filmCopy.sourceFilmId
    });
    
    // Re-fetch to verify what was actually saved
    const savedCopy = await Video.findById(filmCopy._id);
    console.log('🔍 Verifying saved copy from DB:', {
      _id: savedCopy._id,
      watermarkedVideoUrl: savedCopy.watermarkedVideoUrl,
      hasWatermark: !!savedCopy.watermarkedVideoUrl
    });

    res.status(200).json({
      success: true,
      message: 'Film successfully added to your profile!',
      film: savedCopy,
    });
  } catch (error) {
    next(error);
  }
};

// User: Purchase film completely (PAID - requires payment)
export const purchaseFilm = async (req, res, next) => {
  try {
    const { filmId, directoryId } = req.body;
    const userId = req.user.id;

    if (!filmId || !directoryId) {
      return next(createError(400, 'Film ID and Directory ID are required'));
    }

    if (directoryId === 'null' || directoryId === 'undefined') {
      return next(
        createError(
          400,
          'Invalid purchase request. Please return to the film directory page and try again.'
        )
      );
    }

    // Handle both film systems:
    // - Old system: directoryId is a MongoDB ObjectId (folder-based)
    // - New system: directoryId is 'new-system' (customerCode films)
    const isNewSystem = directoryId === 'new-system';

    let directory = null;
    if (!isNewSystem) {
      // Old system: verify directory exists
      directory = await FilmDirectory.findById(directoryId);
      if (!directory) {
        return next(createError(404, 'Film directory not found'));
      }
    }

    // Find the film (could be original film OR user's copy)
    const filmDoc = await Video.findById(filmId);
    if (!filmDoc) {
      return next(createError(404, 'Film not found'));
    }

    let originalFilm;
    let userFilm;

    if (filmDoc.isFilm === true) {
      // filmId is the ORIGINAL film - find user's copy
      originalFilm = filmDoc;
      
      // Old system: verify film belongs to directory
      if (!isNewSystem && originalFilm.filmDirectoryId?.toString() !== directoryId) {
        return next(createError(400, 'Film does not belong to this directory'));
      }

      // Find user's copy by sourceFilmId
      userFilm = await Video.findOne({
        userId: userId,
        sourceFilmId: filmId,
        isFilm: false,
      });
    } else {
      // filmId is the USER'S COPY - use it directly
      userFilm = filmDoc;
      
      // Verify this copy belongs to the current user
      if (userFilm.userId?.toString() !== userId) {
        return next(createError(403, 'Unauthorized: This film does not belong to you'));
      }
      
      // Try to find the original film
      const sourceId = userFilm.sourceFilmId;
      if (sourceId) {
        originalFilm = await Video.findById(sourceId);
      }
      
      // If originalFilm not found, use userFilm as reference
      // (original may have been deleted in previous folder cleanup)
      if (!originalFilm) {
        console.log('⚠️ Original film not found, using user copy as reference');
        originalFilm = {
          _id: sourceId || userFilm._id,
          caption: userFilm.caption,
          mediaType: userFilm.mediaType,
          videoUrl: userFilm.videoUrl,
          filmDirectoryId: userFilm.filmDirectoryId,
        };
      }
    }

    // If film not in user's profile, create a copy (auto-add to profile)
    if (!userFilm) {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:5100';
      
      const convertToAbsoluteUrl = (url) => {
        if (!url) return url;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
      };

      let images = [];
      
      // For image galleries, fetch original images from FilmImage collection
      if (originalFilm.mediaType === 'image' && !isNewSystem && directory) {
        const galleryImages = await FilmImage.find({ 
          filmDirectoryId: directory._id 
        }).sort({ createdAt: -1 });
        
        if (galleryImages.length === 0) {
          console.error('⚠️ ERROR: No FilmImage records found for directory', directory._id);
          return next(createError(500, 'Gallery cannot be purchased: Original images not found. Please contact support.'));
        }
        
        images = galleryImages.map(img => ({
          url: convertToAbsoluteUrl(img.imageUrl), // Use original, not watermarked
          originalUrl: convertToAbsoluteUrl(img.imageUrl),
          imageId: img._id,
          title: img.title || ''
        }));
      }
      
      // For galleries, use first original image as videoUrl (not watermarked)
      let videoUrl = originalFilm.videoUrl;
      let thumbnailUrl = originalFilm.thumbnail;
      if (originalFilm.mediaType === 'image' && images.length > 0) {
        videoUrl = { url: images[0].url };
        thumbnailUrl = images[0].url;
        console.log('✅ Setting videoUrl to original image:', videoUrl.url);
      }
      
      userFilm = new Video({
        caption: originalFilm.caption,
        videoUrl: videoUrl,
        thumbnail: thumbnailUrl,
        images: images,
        userId: userId,
        privacy: 'Public',
        isFilm: false,
        mediaType: originalFilm.mediaType,
        storageProvider: originalFilm.storageProvider,
        sourceFilmId: originalFilm._id,
        filmDirectoryId: null, // Already purchased, no buy button
      });
      await userFilm.save();
      console.log('✅ Created purchased film with', images.length, 'images');
    } else {
      // Film already in profile, just mark as purchased (remove buy button)
      console.log('🔄 Updating existing user film:', {
        filmId: userFilm._id,
        mediaType: userFilm.mediaType,
        isNewSystem,
        hasDirectory: !!directory,
        directoryId: directory?._id,
        currentImagesCount: userFilm.images?.length || 0,
        userFilmDirectoryId: userFilm.filmDirectoryId
      });
      
      // CRITICAL FIX: If directory is null but userFilm has filmDirectoryId, fetch it
      if (!directory && userFilm.filmDirectoryId && !isNewSystem) {
        console.log('⚠️ Directory not loaded, fetching from userFilm.filmDirectoryId:', userFilm.filmDirectoryId);
        directory = await FilmDirectory.findById(userFilm.filmDirectoryId);
        console.log('✅ Loaded directory:', directory?._id);
      }
      
      // Store directory ID before clearing it (needed for folder deletion later)
      const directoryIdForCleanup = userFilm.filmDirectoryId || directoryId;
      
      userFilm.filmDirectoryId = null;
      userFilm.sourceFilmId = null; // Also remove sourceFilmId to indicate fully owned
      
      // For videos, replace watermarked video with original
      if (userFilm.mediaType === 'video' && originalFilm.videoUrl) {
        userFilm.videoUrl = originalFilm.videoUrl; // Replace watermarked with original
        userFilm.watermarkedVideoUrl = null; // Remove watermarked reference
      }
      
      // For image galleries, fetch and replace with original images from FilmImage collection
      console.log('🔍 Checking image replacement conditions:', {
        isImage: userFilm.mediaType === 'image',
        isOldSystem: !isNewSystem,
        hasDirectory: !!directory,
        directoryId: directory?._id
      });
      
      if (userFilm.mediaType === 'image' && !isNewSystem && directory) {
        console.log('✅ Condition met: Fetching original images from FilmImage collection');
        console.log('Directory ID for FilmImage query:', directory._id);
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5100';
        
        const convertToAbsoluteUrl = (url) => {
          if (!url) return url;
          if (url.startsWith('http://') || url.startsWith('https://')) return url;
          return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
        };
        
        // Fetch original images from FilmImage collection
        const galleryImages = await FilmImage.find({ 
          filmDirectoryId: directory._id 
        }).sort({ createdAt: -1 });
        
        console.log(`📷 Found ${galleryImages.length} FilmImage records for directory ${directory._id}`);
        if (galleryImages.length === 0) {
          console.error('⚠️ ERROR: No FilmImage records found for this directory!');
          console.error('Directory ID:', directory._id);
          console.error('This gallery may not have been created using the new system');
          
          // Return error - cannot purchase without original images
          return next(createError(500, 'Gallery cannot be purchased: Original images not found. Please contact support.'));
        }
        
        // Replace entire images array with original images
        const newImages = galleryImages.map(img => {
          const imageObj = {
            url: convertToAbsoluteUrl(img.imageUrl), // Use original, not watermarked
            originalUrl: convertToAbsoluteUrl(img.imageUrl),
            imageId: img._id,
            title: img.title || ''
          };
          console.log(`  📷 Mapping image: ${img.imageUrl} → ${imageObj.url}`);
          return imageObj;
        });
        
        userFilm.images = newImages;
        
        console.log(`✅ Replaced ${userFilm.images.length} watermarked images with originals`);
        console.log('First original image URL:', userFilm.images[0]?.url);
        
        // Update thumbnail and videoUrl to use the first non-watermarked image
        if (userFilm.images[0]) {
          userFilm.thumbnailUrl = userFilm.images[0].url;
          userFilm.videoUrl = { url: userFilm.images[0].url };
          // Mark these as modified so Mongoose saves them
          userFilm.markModified('videoUrl');
          userFilm.markModified('thumbnailUrl');
        }
        
        // Mark the document as modified to ensure save works
        userFilm.markModified('images');
      } else {
        console.error('❌ IMAGE REPLACEMENT SKIPPED - Condition not met!');
        console.error('This will cause purchase to fail because images are still watermarked');
        if (!directory) {
          console.error('⚠️ REASON: directory is null or undefined');
          console.error('Attempting to recover by not failing...');
        }
      }
      
      const saveResult = await userFilm.save();
      console.log('✅ User film SAVE COMPLETE');
      console.log('Save result images count:', saveResult.images?.length || 0);
      console.log('Save result videoUrl:', saveResult.videoUrl?.url);
      console.log('Save result thumbnailUrl:', saveResult.thumbnailUrl);
      console.log('Saved images URLs:', userFilm.images?.map(img => img.url));
      
      // CRITICAL: Verify save worked by fetching from database
      const dbCheck = await Video.findById(userFilm._id).lean();
      console.log('DATABASE CHECK - mediaType:', dbCheck.mediaType);
      console.log('DATABASE CHECK - images count:', dbCheck.images?.length || 0);
      console.log('DATABASE CHECK - first image:', dbCheck.images?.[0]);
      console.log('DATABASE CHECK - videoUrl:', dbCheck.videoUrl?.url);
      console.log('DATABASE CHECK - thumbnailUrl:', dbCheck.thumbnailUrl);
      
      // Validation: For image galleries, check images array; for videos, check videoUrl
      if (dbCheck.mediaType === 'image') {
        if (!dbCheck.images || dbCheck.images.length === 0) {
          console.error('❌ CRITICAL ERROR: Images not saved to database for image gallery!');
          console.error('Attempted to save:', userFilm.images?.length, 'images');
          throw new Error('Failed to save images to database');
        }
        
        if (dbCheck.videoUrl?.url && dbCheck.videoUrl.url.includes('watermarked')) {
          console.error('❌ WARNING: videoUrl still points to watermarked file!');
          console.error('videoUrl:', dbCheck.videoUrl.url);
        }
      } else if (dbCheck.mediaType === 'video') {
        if (!dbCheck.videoUrl?.url) {
          console.error('❌ CRITICAL ERROR: videoUrl not saved to database for video!');
          throw new Error('Failed to save video to database');
        }
        
        if (dbCheck.videoUrl.url.includes('watermarked')) {
          console.error('❌ WARNING: videoUrl still points to watermarked file after purchase!');
          console.error('videoUrl:', dbCheck.videoUrl.url);
        }
      }
      
      // Reload to ensure we have fresh data
      await userFilm.populate('userId', 'username displayName displayImage');
      console.log('After populate - images count:', userFilm.images?.length || 0);
    }

    // ✅ DELETE DUPLICATE USER COPIES (cleanup from old bug)
    // Remove any other copies for the same user that reference this film
    try {
      const originalFilmId = originalFilm._id;
      
      // Build query conditions - avoid ObjectId cast error for "new-system"
      const orConditions = [{ sourceFilmId: originalFilmId }];
      if (!isNewSystem) {
        orConditions.push({ filmDirectoryId: directoryId }); // Only for old system
      }
      
      const duplicates = await Video.find({
        _id: { $ne: userFilm._id }, // Don't delete the purchased copy
        userId: userId, // Same user
        $or: orConditions
      });
      
      if (duplicates.length > 0) {
        console.log(`🗑️ Found ${duplicates.length} duplicate copies for user ${userId}, deleting...`);
        await Video.deleteMany({
          _id: { $in: duplicates.map(d => d._id) }
        });
        console.log(`✅ Deleted ${duplicates.length} duplicate copies`);
      }
    } catch (cleanupError) {
      console.error('⚠️ Failed to cleanup duplicates:', cleanupError.message);
    }

    // ✅ AUTO-DELETE FOLDER AFTER SUCCESSFUL PURCHASE (OLD SYSTEM ONLY)
    if (!isNewSystem) {
      try {
        console.log('🗑️ Starting folder deletion process for directory:', directoryId);
        console.log('Directory object exists:', !!directory);
        console.log('Directory ID:', directory?._id);
        
        // Verify the purchaser's images were saved before cleanup
        const verifyUserFilm = await Video.findById(userFilm._id);
        console.log('🔍 Verifying saved images before cleanup:', {
          filmId: verifyUserFilm._id,
          imageCount: verifyUserFilm.images?.length || 0,
          firstImageUrl: verifyUserFilm.images?.[0]?.url,
          allImages: verifyUserFilm.images?.map(img => ({ url: img.url, title: img.title }))
        });
        
        if (!verifyUserFilm.images || verifyUserFilm.images.length === 0) {
          console.error('⚠️ WARNING: User film has no images saved! Skipping cleanup to prevent data loss.');
          console.error('This means image replacement did not work properly.');
          throw new Error('Failed to save images before cleanup');
        }
        
        console.log('✅ Images verified, proceeding with folder deletion');
        
        // Delete ORIGINAL films in the folder (isFilm: true)
        const originalFilms = await Video.find({
          filmDirectoryId: directoryId,
          isFilm: true,
        });
        const originalFilmIds = originalFilms.map(f => f._id);
        
        await Video.deleteMany({
          filmDirectoryId: directoryId,
          isFilm: true,
        });

        // Delete ALL other user copies except the current purchaser's
        console.log('🗑️ Preparing to delete other users copies...');
        console.log(`Purchaser user ID: ${userId}`);
        console.log(`Purchaser film ID: ${userFilm._id}`);
        
        // Double-check purchaser's film has no directoryId before cleanup
        const purchaserCheck = await Video.findById(userFilm._id);
        console.log('Purchaser film check:', {
          _id: purchaserCheck._id,
          userId: purchaserCheck.userId,
          filmDirectoryId: purchaserCheck.filmDirectoryId,
          sourceFilmId: purchaserCheck.sourceFilmId,
          imageCount: purchaserCheck.images?.length || 0
        });
        
        const deletedCount = await Video.deleteMany({
          _id: { $ne: userFilm._id }, // NEVER delete the purchaser's film
          $or: [
            { filmDirectoryId: directoryId, isFilm: false, userId: { $ne: userId } }, // Other unpurchased copies
            { sourceFilmId: { $in: originalFilmIds }, userId: { $ne: userId } } // Other purchased copies
          ]
        });
        console.log(`🗑️ Deleted ${deletedCount.deletedCount} other user copies`);

        // Delete all image files (watermarked only) and FilmImage records
        // The purchaser's Video.images already has the original URLs saved
        const images = await FilmImage.find({ filmDirectoryId: directoryId });
        console.log(`🗑️ Cleaning up ${images.length} FilmImage records`);
        
        for (const image of images) {
          // Extract file path from URL (remove domain if present)
          let originalUrlPath = image.imageUrl;
          if (originalUrlPath.startsWith('http://') || originalUrlPath.startsWith('https://')) {
            const urlObj = new URL(originalUrlPath);
            originalUrlPath = urlObj.pathname; // Get just the path part
          }
          const originalFilePath = path.join(process.cwd(), originalUrlPath.replace(/^\//, ''));
          
          // Verify original file exists
          if (!fs.existsSync(originalFilePath)) {
            console.error(`  ❌ WARNING: Original file doesn't exist: ${originalFilePath}`);
            console.error(`     URL was: ${image.imageUrl}`);
          } else {
            console.log(`  ✅ VERIFIED original file exists: ${originalFilePath}`);
          }
          
          // Only delete watermarked files, keep originals for the purchaser
          if (image.watermarkedUrl) {
            let watermarkedUrlPath = image.watermarkedUrl;
            if (watermarkedUrlPath.startsWith('http://') || watermarkedUrlPath.startsWith('https://')) {
              const urlObj = new URL(watermarkedUrlPath);
              watermarkedUrlPath = urlObj.pathname;
            }
            const watermarkedPath = path.join(process.cwd(), watermarkedUrlPath.replace(/^\//, ''));
            
            if (fs.existsSync(watermarkedPath)) {
              fs.unlinkSync(watermarkedPath);
              console.log(`  🗑️  Deleted watermarked: ${watermarkedPath}`);
            }
          }
        }
        
        // Delete FilmImage records (purchaser's Video.images has the URLs)
        await FilmImage.deleteMany({ filmDirectoryId: directoryId });
        console.log(`✅ Deleted FilmImage records`);

        // Delete the directory database record
        await FilmDirectory.findByIdAndDelete(directoryId);

        console.log(
          `✅ Folder ${directoryId} automatically deleted after purchase`
        );
        
        // FINAL VERIFICATION: Ensure purchaser's film still exists with images
        const finalCheck = await Video.findById(userFilm._id);
        if (!finalCheck) {
          console.error('❌ CRITICAL: Purchaser film was accidentally deleted!');
          throw new Error('Purchaser film deleted during cleanup');
        }
        console.log('✅ FINAL CHECK - Purchaser film still exists:', {
          _id: finalCheck._id,
          imageCount: finalCheck.images?.length || 0,
          hasFilmDirectoryId: !!finalCheck.filmDirectoryId
        });
        
      } catch (deleteError) {
        // Log error but don't fail the purchase
        console.error('⚠️ Failed to auto-delete folder:', deleteError);
        throw deleteError; // Re-throw to prevent completing purchase if cleanup failed
      }
    }

    const user = await User.findById(userId);
    const settings = await Settings.findOne();
    const currency = settings?.stripeConfig?.currency || 'usd';

    sendPurchaseConfirmationEmail(user, {
      type: 'film_purchase',
      filmName: originalFilm.caption || 'Film',
      amount: req.body.amount || directory?.price || '0',
      currency,
      date: new Date(),
    }).catch(err => {
      console.error('Failed to send purchase confirmation email:', err);
    });

    // Fetch fresh data from database to ensure we return the latest
    const finalUserFilm = await Video.findById(userFilm._id)
      .populate('userId', 'username displayName displayImage');
    
    console.log('📤 Sending response with film data:', {
      filmId: finalUserFilm._id,
      mediaType: finalUserFilm.mediaType,
      imageCount: finalUserFilm.images?.length || 0,
      firstImageUrl: finalUserFilm.images?.[0]?.url,
      allImageUrls: finalUserFilm.images?.map(img => img.url)
    });

    res.status(200).json({
      success: true,
      message:
        'Film purchased successfully! Redirecting to your profile...',
      film: finalUserFilm,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get film directory statistics
export const getFilmDirectoryStats = async (req, res, next) => {
  try {
    const totalDirectories = await FilmDirectory.countDocuments();
    const totalFilms = await Video.countDocuments({ isFilm: true });

    res.status(200).json({
      success: true,
      stats: {
        totalDirectories,
        totalFilms,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Sync orphaned films to their directories
export const syncOrphanedFilms = async (req, res, next) => {
  try {
    // Find all films that have a filmDirectoryId but are not in the directory's films array
    const orphanedFilms = await Video.find({
      isFilm: true,
      filmDirectoryId: { $exists: true, $ne: null },
    });
    let syncedCount = 0;

    for (const film of orphanedFilms) {
      const directory = await FilmDirectory.findById(film.filmDirectoryId);

      if (directory && !directory.films.includes(film._id)) {
        directory.films.push(film._id);
        await directory.save();
        syncedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Synced ${syncedCount} orphaned film(s) to their directories`,
      syncedCount,
      totalFilmsChecked: orphanedFilms.length,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// NEW SIMPLIFIED FILM SYSTEM (NO FOLDERS)
// ========================================

// Admin: Get all films (videos with customer codes)
export const getAllFilms = async (req, res, next) => {
  try {
    const films = await Video.find({
      customerCode: { $exists: true, $ne: null },
    })
      .populate('userId', 'username displayName displayImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      films,
      total: films.length,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create film with video upload
export const createFilm = async (req, res, next) => {
  try {
    const { caption, customerCode, purchasePrice, videoUrl, thumbnail } =
      req.body;

    if (!caption || !customerCode) {
      return next(createError(400, 'Title and customer code are required'));
    }

    // Check if code already exists
    const existingFilm = await Video.findOne({ customerCode });
    if (existingFilm) {
      return next(createError(400, 'Customer code already exists'));
    }

    const storageProvider = req.body.storageProvider || (videoUrl?.provider) || 'local';
    
    const film = await Video.create({
      caption,
      customerCode: customerCode.trim().toUpperCase(),
      purchasePrice: purchasePrice ?? 0,
      videoUrl: videoUrl || {},
      thumbnail: thumbnail || '',
      userId: req.user.id,
      privacy: 'Public',
      isFilm: true,
      mediaType: 'video',
      fileSize: req.body.fileSize || 0,
      storageProvider: storageProvider,
    });

    console.log('🎬 Film created, checking watermark conditions:', {
      caption,
      storageProvider,
      hasVideoUrl: !!videoUrl?.url,
      videoUrl: videoUrl?.url,
      hasWatermark: !!film.watermarkedVideoUrl
    });
    
    if (
      storageProvider === 'local' &&
      videoUrl?.url &&
      !film.watermarkedVideoUrl
    ) {
      try {
        let videoPath = videoUrl.url;
        if (videoPath.startsWith('http')) {
          const urlObj = new URL(videoPath);
          videoPath = urlObj.pathname;
        }
        videoPath = videoPath.replace(/^\//, '');

        const fullVideoPath = path.join(process.cwd(), videoPath);

        if (fs.existsSync(fullVideoPath)) {
          const originalFileName = path.basename(videoUrl.url);
          
          const watermarkResult = await createWatermarkedVideoCopy(
            fullVideoPath,
            originalFileName
          );

          // Convert to absolute URL
          const backendUrl = process.env.BACKEND_URL || 'http://localhost:5100';
          const absoluteUrl = watermarkResult.url.startsWith('http') 
            ? watermarkResult.url 
            : `${backendUrl}${watermarkResult.url.startsWith('/') ? '' : '/'}${watermarkResult.url}`;

          console.log('✅ Film watermark created:', absoluteUrl);
          film.watermarkedVideoUrl = {
            url: absoluteUrl,
            public_id: watermarkResult.fileName,
          };
          await film.save();
          console.log('💾 Watermark saved to DB:', {
            filmId: film._id,
            watermarkedUrl: film.watermarkedVideoUrl?.url
          });
          
        } else {
          console.error('❌ Video file not found:', fullVideoPath);
        }
      } catch (watermarkError) {
        console.error('❌ Video watermark creation failed:', watermarkError.message);
        console.error('❌ Stack:', watermarkError.stack);
      }
    } else {
    }

    await film.populate('userId', 'username displayName displayImage');

    console.log('📤 Sending response with film:', {
      filmId: film._id,
      caption: film.caption,
      hasWatermark: !!film.watermarkedVideoUrl,
      watermarkedVideoUrl: film.watermarkedVideoUrl?.url
    });

    res.status(201).json({
      success: true,
      message: 'Film created successfully',
      film,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete film
// Admin: Regenerate watermarks for all existing films
export const regenerateAllWatermarks = async (req, res, next) => {
  try {
    const filmsToWatermark = await Video.find({
      isFilm: true,
      mediaType: 'video',
      'videoUrl.url': { $exists: true },
      $or: [
        { watermarkedVideoUrl: { $exists: false } },
        { watermarkedVideoUrl: null }
      ]
    });


    const results = {
      total: filmsToWatermark.length,
      success: 0,
      failed: 0,
      errors: []
    };

    for (const film of filmsToWatermark) {
      try {
        let videoPath = film.videoUrl.url;
        if (videoPath.startsWith('http')) {
          const urlObj = new URL(videoPath);
          videoPath = urlObj.pathname;
        }
        videoPath = videoPath.replace(/^\//, '');

        const fullVideoPath = path.join(process.cwd(), videoPath);

        if (!fs.existsSync(fullVideoPath)) {
          console.error(`❌ Video file not found: ${fullVideoPath}`);
          results.failed++;
          results.errors.push({ filmId: film._id, error: 'Video file not found' });
          continue;
        }

        if (!videoPath.includes('/uploads/')) {
          continue;
        }

        const originalFileName = path.basename(film.videoUrl.url);
        
        
        const watermarkResult = await createWatermarkedVideoCopy(
          fullVideoPath,
          originalFileName
        );

        // Convert to absolute URL
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5100';
        const absoluteUrl = watermarkResult.url.startsWith('http') 
          ? watermarkResult.url 
          : `${backendUrl}${watermarkResult.url.startsWith('/') ? '' : '/'}${watermarkResult.url}`;

        film.watermarkedVideoUrl = {
          url: absoluteUrl,
          public_id: watermarkResult.fileName,
        };
        
        if (!film.storageProvider) {
          film.storageProvider = 'local';
        }
        
        await film.save();
        
        results.success++;
      } catch (error) {
        console.error(`❌ Failed to watermark film ${film._id}:`, error);
        results.failed++;
        results.errors.push({ filmId: film._id, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Watermarking completed: ${results.success} successful, ${results.failed} failed`,
      results
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete film
export const deleteFilm = async (req, res, next) => {
  try {
    const { filmId } = req.params;

    const film = await Video.findById(filmId);
    if (!film) {
      return next(createError(404, 'Film not found'));
    }

    // Delete video files from local storage if applicable
    if (film.storageProvider === 'local') {
      const { deleteFromLocal } = await import('../utils/localStorage.js');
      
      // Delete original video
      if (film.videoUrl?.public_id) {
        await deleteFromLocal(film.videoUrl.public_id).catch((err) => {
          console.error('Failed to delete original video:', err);
        });
      }
      
      // Delete watermarked video
      if (film.watermarkedVideoUrl?.public_id) {
        await deleteFromLocal(film.watermarkedVideoUrl.public_id).catch((err) => {
          console.error('Failed to delete watermarked video:', err);
        });
      }
    }

    // Delete the film
    await Video.findByIdAndDelete(filmId);

    // Also delete any user copies of this film
    await Video.deleteMany({ sourceFilmId: filmId });

    res.status(200).json({
      success: true,
      message: 'Film deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// User: Search film by customer code (for frontpage)
export const searchFilmByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    
    console.log('🔍 Searching for film with code:', code);

    if (!code) {
      return next(createError(400, 'Customer code is required'));
    }

    // Find film by customer code
    const film = await Video.findOne({
      customerCode: code.trim().toUpperCase(),
      isFilm: true,
    });

    if (!film) {
      console.log('❌ Film not found with code:', code);
      return next(createError(404, 'Film not found with this code'));
    }
    
    console.log('✅ Film found:', {
      filmId: film._id,
      caption: film.caption,
      hasWatermark: !!film.watermarkedVideoUrl,
      watermarkUrl: film.watermarkedVideoUrl?.url
    });


    // Auto-generate watermark if missing
    if (!film.watermarkedVideoUrl && film.mediaType === 'video' && film.videoUrl?.url) {
      try {
        let videoPath = film.videoUrl.url;
        if (videoPath.startsWith('http')) {
          const urlObj = new URL(videoPath);
          videoPath = urlObj.pathname;
        }
        videoPath = videoPath.replace(/^\//, '');

        const fullVideoPath = path.join(process.cwd(), videoPath);
        
        if (fs.existsSync(fullVideoPath) && videoPath.includes('/uploads/')) {
          const originalFileName = path.basename(film.videoUrl.url);
          const watermarkResult = await createWatermarkedVideoCopy(
            fullVideoPath,
            originalFileName
          );

          // Convert to absolute URL
          const backendUrl = process.env.BACKEND_URL || 'http://localhost:5100';
          const absoluteUrl = watermarkResult.url.startsWith('http') 
            ? watermarkResult.url 
            : `${backendUrl}${watermarkResult.url.startsWith('/') ? '' : '/'}${watermarkResult.url}`;

          film.watermarkedVideoUrl = {
            url: absoluteUrl,
            public_id: watermarkResult.fileName,
          };
          
          if (!film.storageProvider) {
            film.storageProvider = 'local';
          }
          
          await film.save();
        }
      } catch (watermarkError) {
        console.error('❌ Auto-watermark failed:', watermarkError.message);
      }
    }


    // Check if user already has this film
    const userHasFilm = await Video.findOne({
      userId: req.user.id,
      sourceFilmId: film._id,
    });

    if (userHasFilm) {
      console.log('⚠️ User already has this film');
      return next(
        createError(400, 'You already have this film in your profile')
      );
    }
    
    console.log('✅ User does not have this film yet, creating copy...');

    // Create a copy for the user (add to profile automatically)
    // Use watermarked video if available (user hasn't purchased yet)
    
    // Helper to convert relative URLs to absolute
    const toAbsoluteUrl = (urlObj) => {
      if (!urlObj?.url) return urlObj;
      
      const url = urlObj.url;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return urlObj;
      }
      
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:5100';
      return {
        ...urlObj,
        url: `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`
      };
    };
    
    // Re-fetch film from DB to ensure we have the latest watermark
    const freshFilm = await Video.findById(film._id);
    
    console.log('📋 Creating film copy from search:', {
      originalFilmId: freshFilm._id,
      hasWatermark: !!freshFilm.watermarkedVideoUrl,
      watermarkUrl: freshFilm.watermarkedVideoUrl?.url,
      videoUrl: freshFilm.videoUrl?.url
    });
    
    // Prepare watermarked URL (ensure it's set if exists)
    const watermarkedUrl = freshFilm.watermarkedVideoUrl ? toAbsoluteUrl(freshFilm.watermarkedVideoUrl) : null;
    
    const filmCopy = new Video({
      caption: freshFilm.caption,
      videoUrl: toAbsoluteUrl(freshFilm.videoUrl), // Always use original videoUrl
      watermarkedVideoUrl: watermarkedUrl, // Set watermark separately for frontend
      thumbnail: freshFilm.thumbnail,
      userId: req.user.id,
      privacy: 'Public',
      isFilm: false,
      mediaType: freshFilm.mediaType,
      storageProvider: freshFilm.storageProvider,
      sourceFilmId: freshFilm._id,
    });

    await filmCopy.save();
    
    console.log('✅ Film copy saved from search:', {
      copyId: filmCopy._id,
      videoUrl: filmCopy.videoUrl?.url,
      watermarkedVideoUrl: filmCopy.watermarkedVideoUrl?.url,
      sourceFilmId: filmCopy.sourceFilmId
    });
    
    // Re-fetch to verify what was actually saved
    const savedCopy = await Video.findById(filmCopy._id);
    console.log('🔍 Verifying saved copy from DB:', {
      _id: savedCopy._id,
      watermarkedVideoUrl: savedCopy.watermarkedVideoUrl,
      hasWatermark: !!savedCopy.watermarkedVideoUrl
    });
    
    const responseData = {
      success: true,
      message: 'Film successfully added to your profile!',
      film: {
        ...savedCopy.toObject(),
        originalTitle: freshFilm.caption,
        purchasePrice: freshFilm.purchasePrice,
        customerCode: freshFilm.customerCode,
      },
    };
    
    console.log('📤 Sending response to frontend:', {
      filmId: responseData.film._id,
      caption: responseData.film.caption,
      watermarkedVideoUrl: responseData.film.watermarkedVideoUrl,
      hasWatermark: !!responseData.film.watermarkedVideoUrl
    });

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// ========================================
// FILM IMAGE GALLERY SYSTEM
// ========================================

// Admin: Upload images to film directory
export const uploadImagesToDirectory = async (req, res, next) => {
  try {
    const { directoryId } = req.params;
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return next(createError(400, 'No images provided'));
    }

    const directory = await FilmDirectory.findById(directoryId);
    if (!directory) {
      return next(createError(404, 'Film directory not found'));
    }

    // Get existing image count for numbering
    const existingImagesCount = await FilmImage.countDocuments({ filmDirectoryId: directoryId });
    
    const uploadedImages = [];
    let imageCounter = existingImagesCount + 1;

    for (const imageData of images) {
      const { url, publicId, provider, fileSize } = imageData;

      if (!url) {
        continue;
      }

      let watermarkedUrl = url;
      
      if (provider === 'local' && url.includes('/uploads/images/')) {
        try {
          let urlPath = url;
          if (urlPath.startsWith('http')) {
            const urlObj = new URL(urlPath);
            urlPath = urlObj.pathname;
          }
          urlPath = urlPath.replace(/^\//, '');
          
          const imagePath = path.join(process.cwd(), urlPath);
          
          if (fs.existsSync(imagePath)) {
            const originalFileName = path.basename(url);
            const watermarkResult = await createWatermarkedCopy(imagePath, originalFileName);
            watermarkedUrl = watermarkResult.url;
          } else {
            console.error('Image file not found:', imagePath);
          }
        } catch (watermarkError) {
          console.error('Watermark creation failed:', watermarkError);
        }
      }

      const filmImage = await FilmImage.create({
        filmDirectoryId: directoryId,
        imageUrl: url,
        watermarkedUrl: watermarkedUrl,
        title: `${directory.folderName}(${imageCounter})`,
        fileSize: fileSize || 0,
        storageProvider: provider || 'local',
        publicId: publicId || '',
        uploadedBy: req.user.id,
      });

      uploadedImages.push(filmImage);
      imageCounter++;
    }

    res.status(201).json({
      success: true,
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      images: uploadedImages,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all images in a film directory
export const getDirectoryImages = async (req, res, next) => {
  try {
    const { directoryId } = req.params;

    const directory = await FilmDirectory.findById(directoryId);
    if (!directory) {
      return next(createError(404, 'Film directory not found'));
    }

    const images = await FilmImage.find({ filmDirectoryId: directoryId })
      .populate('uploadedBy', 'username displayName')
      .sort({ createdAt: -1 });

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5100';
    
    const convertToAbsoluteUrl = (url) => {
      if (!url) return url;
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const imagesWithAbsoluteUrls = images.map(img => ({
      ...img.toObject(),
      imageUrl: convertToAbsoluteUrl(img.imageUrl),
      watermarkedUrl: convertToAbsoluteUrl(img.watermarkedUrl),
    }));

    res.status(200).json({
      success: true,
      images: imagesWithAbsoluteUrls,
      total: images.length,
      directory: {
        _id: directory._id,
        folderName: directory.folderName,
        description: directory.description,
        price: directory.price,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete image from film directory
export const deleteImageFromDirectory = async (req, res, next) => {
  try {
    const { imageId } = req.params;

    const image = await FilmImage.findById(imageId);
    if (!image) {
      return next(createError(404, 'Image not found'));
    }

    if (image.storageProvider === 'local') {
      const deleteFile = (url) => {
        if (!url || !url.includes('/uploads/')) return;
        
        const filePath = path.join(process.cwd(), url.replace(/^\//, '').replace(/^uploads\//, 'uploads/'));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      };

      deleteFile(image.imageUrl);
      deleteFile(image.watermarkedUrl);
    }

    await FilmImage.findByIdAndDelete(imageId);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// User: Get images by access code (shows watermarked versions until purchased)
export const getImagesByAccessCode = async (req, res, next) => {
  try {
    const { code } = req.params;

    if (!code) {
      return next(createError(400, 'Access code is required'));
    }

    const directory = await FilmDirectory.findOne({
      folderName: { $regex: new RegExp(`^${code}$`, 'i') },
    });

    if (!directory) {
      return next(createError(404, 'Gallery not found'));
    }

    const images = await FilmImage.find({ filmDirectoryId: directory._id })
      .select('watermarkedUrl title description createdAt')
      .sort({ createdAt: -1 });

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5100';
    
    const convertToAbsoluteUrl = (url) => {
      if (!url) return url;
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    res.status(200).json({
      success: true,
      images: images.map(img => ({
        _id: img._id,
        imageUrl: convertToAbsoluteUrl(img.watermarkedUrl),
        title: img.title,
        description: img.description,
        createdAt: img.createdAt,
      })),
      gallery: {
        _id: directory._id,
        folderName: directory.folderName,
        description: directory.description,
        price: directory.price,
        imageCount: images.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Cleanup broken galleries with watermarked videoUrl
export const cleanupBrokenGalleries = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let totalDeleted = 0;
    
    // 1. Find and delete galleries with watermarked videoUrl
    const watermarkedVideoUrlGalleries = await Video.find({
      userId: userId,
      mediaType: 'image',
      isFilm: false,
      'videoUrl.url': { $regex: 'watermarked' }
    });
    console.log(`Found ${watermarkedVideoUrlGalleries.length} galleries with watermarked videoUrl for user ${userId}`);
    watermarkedVideoUrlGalleries.forEach(g => {
      console.log(`  - ${g._id}: ${g.caption || 'No caption'} - ${g.videoUrl?.url}`);
    });
    
    const result1 = await Video.deleteMany({
      userId: userId,
      mediaType: 'image',
      isFilm: false,
      'videoUrl.url': { $regex: 'watermarked' }
    });
    totalDeleted += result1.deletedCount;
    console.log(`✅ Deleted ${result1.deletedCount} galleries with watermarked videoUrl`);
    
    // 2. Find and delete galleries with watermarked images in images array
    const watermarkedImagesGalleries = await Video.find({
      userId: userId,
      mediaType: 'image',
      isFilm: false,
      images: { $exists: true, $ne: [] }
    });
    
    const galleriesToDelete = [];
    for (const gallery of watermarkedImagesGalleries) {
      // Check if any image URL contains 'watermarked'
      const hasWatermarkedImages = gallery.images?.some(img => 
        img.url && img.url.includes('watermarked')
      );
      if (hasWatermarkedImages) {
        galleriesToDelete.push(gallery._id);
        console.log(`  - ${gallery._id}: ${gallery.caption || 'No caption'} - has watermarked images`);
      }
    }
    
    if (galleriesToDelete.length > 0) {
      const result2 = await Video.deleteMany({
        _id: { $in: galleriesToDelete }
      });
      totalDeleted += result2.deletedCount;
      console.log(`✅ Deleted ${result2.deletedCount} galleries with watermarked images array`);
    }
    
    // 3. Find and remove duplicate galleries (keep only the newest for each sourceFilmId)
    const allUserGalleries = await Video.find({
      userId: userId,
      mediaType: 'image',
      isFilm: false,
      sourceFilmId: { $exists: true, $ne: null }
    }).sort({ createdAt: -1 });
    
    const seenSourceFilmIds = new Set();
    const duplicatesToDelete = [];
    
    for (const gallery of allUserGalleries) {
      const sourceId = gallery.sourceFilmId?.toString();
      if (sourceId) {
        if (seenSourceFilmIds.has(sourceId)) {
          // This is a duplicate - delete it
          duplicatesToDelete.push(gallery._id);
          console.log(`  - ${gallery._id}: ${gallery.caption || 'No caption'} - duplicate of sourceFilmId ${sourceId}`);
        } else {
          // First occurrence - keep it
          seenSourceFilmIds.add(sourceId);
        }
      }
    }
    
    if (duplicatesToDelete.length > 0) {
      const result3 = await Video.deleteMany({
        _id: { $in: duplicatesToDelete }
      });
      totalDeleted += result3.deletedCount;
      console.log(`✅ Deleted ${result3.deletedCount} duplicate galleries`);
    }
    
    res.status(200).json({
      success: true,
      message: `Deleted ${totalDeleted} broken/duplicate galleries`,
      deletedCount: totalDeleted
    });
  } catch (error) {
    next(error);
  }
};
