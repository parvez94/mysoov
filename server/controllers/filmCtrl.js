import FilmDirectory from '../models/FilmDirectory.js';
import Video from '../models/Video.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import { createError } from '../utils/error.js';
import { sendPurchaseConfirmationEmail } from '../services/emailService.js';

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
      price: price || 9.99,
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

    // Update video to mark as film
    video.isFilm = true;
    video.filmDirectoryId = directoryId;
    video.privacy = 'Private'; // Films are private by default
    await video.save();

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
    // Note: Films don't use profile storage, so no need to update storageUsed
    await Video.deleteMany({
      filmDirectoryId: directoryId,
      isFilm: true,
    });

    // Keep user COPIES but remove filmDirectoryId reference (removes buy button)
    await Video.updateMany(
      { filmDirectoryId: directoryId, isFilm: false },
      { $set: { filmDirectoryId: null } }
    );

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
    }).populate('films', 'caption videoUrl mediaType createdAt');

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
      select: 'caption videoUrl thumbnail mediaType createdAt userId',
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

    // Create a copy of the film for the user (not removing from directory)
    const filmCopy = new Video({
      caption: film.caption,
      videoUrl: film.videoUrl,
      thumbnail: film.thumbnail,
      userId: userId,
      privacy: 'Public',
      isFilm: false,
      mediaType: film.mediaType,
      storageProvider: film.storageProvider,
      sourceFilmId: film._id, // Track the original film
      filmDirectoryId: directoryId, // Track the directory for buy button
    });

    await filmCopy.save();

    res.status(200).json({
      success: true,
      message: 'Film successfully added to your profile!',
      film: filmCopy,
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

    // Verify the original film exists
    const originalFilm = await Video.findById(filmId);
    if (!originalFilm) {
      return next(createError(404, 'Film not found'));
    }

    // Old system: verify film belongs to directory
    if (!isNewSystem && originalFilm.filmDirectoryId?.toString() !== directoryId) {
      return next(createError(400, 'Film does not belong to this directory'));
    }

    // Check if user already has this film in their profile
    let userFilm = await Video.findOne({
      userId: userId,
      sourceFilmId: filmId,
      isFilm: false,
    });

    // If film not in user's profile, create a copy (auto-add to profile)
    if (!userFilm) {
      userFilm = new Video({
        caption: originalFilm.caption,
        videoUrl: originalFilm.videoUrl,
        thumbnail: originalFilm.thumbnail,
        userId: userId,
        privacy: 'Public',
        isFilm: false,
        mediaType: originalFilm.mediaType,
        storageProvider: originalFilm.storageProvider,
        sourceFilmId: originalFilm._id,
        filmDirectoryId: null, // Already purchased, no buy button
      });
      await userFilm.save();
    } else {
      // Film already in profile, just mark as purchased (remove buy button)
      userFilm.filmDirectoryId = null;
      userFilm.sourceFilmId = null; // Also remove sourceFilmId to indicate fully owned
      await userFilm.save();
    }

    // ✅ AUTO-DELETE FOLDER AFTER SUCCESSFUL PURCHASE (OLD SYSTEM ONLY)
    if (!isNewSystem) {
      try {
        // Delete ORIGINAL films in the folder (isFilm: true)
        await Video.deleteMany({
          filmDirectoryId: directoryId,
          isFilm: true,
        });

        // Keep user COPIES but remove filmDirectoryId reference
        await Video.updateMany(
          { filmDirectoryId: directoryId, isFilm: false },
          { $set: { filmDirectoryId: null } }
        );

        // Delete the directory itself
        await FilmDirectory.findByIdAndDelete(directoryId);

        console.log(
          `✅ Folder ${directoryId} automatically deleted after purchase`
        );
      } catch (deleteError) {
        // Log error but don't fail the purchase
        console.error('⚠️ Failed to auto-delete folder:', deleteError);
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

    res.status(200).json({
      success: true,
      message:
        'Film purchased successfully! Download will start automatically.',
      film: userFilm,
      downloadUrl: userFilm.videoUrl?.url || userFilm.videoUrl,
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

    const film = await Video.create({
      caption,
      customerCode: customerCode.trim().toUpperCase(),
      purchasePrice: purchasePrice || 0,
      videoUrl: videoUrl || {},
      thumbnail: thumbnail || '',
      userId: req.user.id,
      privacy: 'Public',
      isFilm: true,
      mediaType: 'video',
      fileSize: req.body.fileSize || 0,
    });

    await film.populate('userId', 'username displayName displayImage');

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
export const deleteFilm = async (req, res, next) => {
  try {
    const { filmId } = req.params;

    const film = await Video.findById(filmId);
    if (!film) {
      return next(createError(404, 'Film not found'));
    }

    // Delete video file from local storage if applicable
    if (film.storageProvider === 'local' && film.videoUrl?.public_id) {
      const { deleteFromLocal } = await import('../utils/localStorage.js');
      await deleteFromLocal(film.videoUrl.public_id).catch((err) => {
        // Log but don't fail if file deletion fails
      });
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

    if (!code) {
      return next(createError(400, 'Customer code is required'));
    }

    // Find film by customer code
    const film = await Video.findOne({
      customerCode: code.trim().toUpperCase(),
      isFilm: true,
    });

    if (!film) {
      return next(createError(404, 'Film not found with this code'));
    }

    // Check if user already has this film
    const userHasFilm = await Video.findOne({
      userId: req.user.id,
      sourceFilmId: film._id,
    });

    if (userHasFilm) {
      return next(
        createError(400, 'You already have this film in your profile')
      );
    }

    // Create a copy for the user (add to profile automatically)
    const filmCopy = new Video({
      caption: film.caption,
      videoUrl: film.videoUrl,
      thumbnail: film.thumbnail,
      userId: req.user.id,
      privacy: 'Public',
      isFilm: false,
      mediaType: film.mediaType,
      storageProvider: film.storageProvider,
      sourceFilmId: film._id,
    });

    await filmCopy.save();

    res.status(200).json({
      success: true,
      message: 'Film successfully added to your profile!',
      film: {
        ...filmCopy.toObject(),
        originalTitle: film.caption,
        purchasePrice: film.purchasePrice,
        customerCode: film.customerCode,
      },
    });
  } catch (error) {
    next(error);
  }
};
