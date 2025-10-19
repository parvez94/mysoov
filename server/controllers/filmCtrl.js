import FilmDirectory from '../models/FilmDirectory.js';
import Video from '../models/Video.js';
import User from '../models/User.js';
import { createError } from '../utils/error.js';

// Admin: Get all film directories
export const getAllFilmDirectories = async (req, res, next) => {
  try {
    const directories = await FilmDirectory.find()
      .populate('createdBy', 'username displayName displayImage')
      .populate('redeemedBy', 'username displayName displayImage')
      .populate('films')
      .sort({ createdAt: -1 });
    directories.forEach((dir, index) => {});

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
      .populate('redeemedBy', 'username displayName displayImage')
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

    // Check if directory is already redeemed
    if (directory.isRedeemed) {
      return next(createError(400, 'Cannot add films to a redeemed directory'));
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

    // Check if directory is already redeemed
    if (directory.isRedeemed) {
      return next(
        createError(400, 'Cannot remove films from a redeemed directory')
      );
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

    // Update all films in this directory
    await Video.updateMany(
      { filmDirectoryId: directoryId },
      { $set: { isFilm: false, filmDirectoryId: null } }
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
    })
      .populate('films', 'caption videoUrl mediaType createdAt')
      .populate('redeemedBy', 'username displayName displayImage');

    if (!directory) {
      return next(createError(404, 'Film directory not found'));
    }

    // Check if directory is already redeemed (has been used by someone)
    if (directory.isRedeemed) {
      return next(
        createError(
          400,
          'This folder has already been redeemed by another user'
        )
      );
    }

    // Check if user has already added films from this directory to their profile
    // This applies to everyone (including admins) - admins can manage folders from dashboard
    const userHasFilms = await Video.findOne({
      userId: req.user.id,
      filmDirectoryId: directory._id,
    });

    // Don't show directory if user has already added films from it
    if (userHasFilms) {
      return next(
        createError(400, 'You have already added films from this folder')
      );
    }

    // Return limited info (don't expose full film details until code is verified)
    // Include redemption status so users know if it's already been redeemed
    res.status(200).json({
      success: true,
      directory: {
        _id: directory._id,
        folderName: directory.folderName,
        description: directory.description,
        filmCount: directory.films.length,
        isRedeemed: directory.isRedeemed,
        redeemedBy: directory.isRedeemed ? directory.redeemedBy : null,
        redeemedAt: directory.redeemedAt,
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

    const directory = await FilmDirectory.findById(directoryId)
      .populate({
        path: 'films',
        select: 'caption videoUrl thumbnail mediaType createdAt userId',
        populate: {
          path: 'userId',
          select: 'username displayName displayImage',
        },
      })
      .populate('redeemedBy', 'username displayName displayImage');

    if (!directory) {
      return next(createError(404, 'Film directory not found'));
    }

    res.status(200).json({
      success: true,
      directory: {
        _id: directory._id,
        folderName: directory.folderName,
        description: directory.description,
        films: directory.films,
        isRedeemed: directory.isRedeemed,
        redeemedBy: directory.redeemedBy,
        redeemedAt: directory.redeemedAt,
        createdAt: directory.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// User: Verify code and automatically redeem films to user's profile
export const verifyAndGetFilms = async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return next(createError(400, 'Folder name is required'));
    }

    // Escape special regex characters and search case-insensitive
    const escapedCode = escapeRegex(code);
    const directory = await FilmDirectory.findOne({
      folderName: { $regex: new RegExp(`^${escapedCode}$`, 'i') },
    }).populate('films');

    if (!directory) {
      return next(createError(404, 'Invalid folder name'));
    }

    // Check if already redeemed by someone
    if (directory.isRedeemed) {
      return next(
        createError(
          400,
          'This folder has already been redeemed by another user'
        )
      );
    }

    // Automatically transfer all films to user
    const filmIds = directory.films.map((film) => film._id);
    // Update each video - transfer ownership to user
    await Video.updateMany(
      { _id: { $in: filmIds } },
      {
        $set: {
          userId: userId,
          privacy: 'Public',
          isFilm: false,
          filmDirectoryId: null,
        },
      }
    );

    // Verify the transfer
    const transferredVideos = await Video.find({
      _id: { $in: filmIds },
    }).select('videoUrl userId isFilm');
    // Mark directory as redeemed
    directory.isRedeemed = true;
    directory.redeemedBy = userId;
    directory.redeemedAt = new Date();
    await directory.save();

    // Delete the directory after redemption
    await FilmDirectory.findByIdAndDelete(directory._id);
    res.status(200).json({
      success: true,
      message: `Successfully added ${filmIds.length} film(s) to your profile`,
      filmsCount: filmIds.length,
    });
  } catch (error) {
    next(error);
  }
};

// User: Redeem film directory with folder name (code verification)
export const redeemFilmDirectory = async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return next(createError(400, 'Folder name is required'));
    }

    // Escape special regex characters and search case-insensitive
    const escapedCode = escapeRegex(code);
    const directory = await FilmDirectory.findOne({
      folderName: { $regex: new RegExp(`^${escapedCode}$`, 'i') },
    }).populate('films');

    if (!directory) {
      return next(createError(404, 'Invalid folder name'));
    }

    // Check if already redeemed
    if (directory.isRedeemed) {
      return next(createError(400, 'This folder has already been redeemed'));
    }

    // Transfer all films to user
    const filmIds = directory.films.map((film) => film._id);

    // Update each video individually to ensure videoUrl is preserved
    const updateResult = await Video.updateMany(
      { _id: { $in: filmIds } },
      {
        $set: {
          userId: userId,
          privacy: 'Public', // Make films public in user's profile
          isFilm: false, // No longer a film, now a regular video
          filmDirectoryId: null,
        },
      }
    );
    // Verify the transfer worked correctly
    const transferredVideos = await Video.find({
      _id: { $in: filmIds },
    }).select('videoUrl userId isFilm');
    // Mark directory as redeemed
    directory.isRedeemed = true;
    directory.redeemedBy = userId;
    directory.redeemedAt = new Date();
    await directory.save();

    // Delete the directory after redemption
    await FilmDirectory.findByIdAndDelete(directory._id);

    res.status(200).json({
      success: true,
      message: `Successfully redeemed ${filmIds.length} film(s)! They are now in your profile.`,
      filmsCount: filmIds.length,
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

    // Create a permanent copy of the film for the user (PURCHASED)
    const purchasedFilm = new Video({
      caption: film.caption,
      videoUrl: film.videoUrl,
      thumbnail: film.thumbnail,
      userId: userId,
      privacy: 'Public',
      isFilm: false,
      mediaType: film.mediaType,
      storageProvider: film.storageProvider,
      sourceFilmId: film._id, // Track the original film
    });

    await purchasedFilm.save();

    res.status(200).json({
      success: true,
      message: "Film purchased successfully! It's now permanently yours.",
      film: {
        _id: film._id,
        caption: film.caption,
        videoUrl: film.videoUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get film directory statistics
export const getFilmDirectoryStats = async (req, res, next) => {
  try {
    const totalDirectories = await FilmDirectory.countDocuments();
    const redeemedDirectories = await FilmDirectory.countDocuments({
      isRedeemed: true,
    });
    const totalFilms = await Video.countDocuments({ isFilm: true });

    res.status(200).json({
      success: true,
      stats: {
        totalDirectories,
        redeemedDirectories,
        activeDirectories: totalDirectories - redeemedDirectories,
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
