import HappyTeamContent from '../models/HappyTeamContent.js';
import User from '../models/User.js';
import Video from '../models/Video.js';
import { createError } from '../utils/error.js';
import fs from 'fs';
import path from 'path';

// Get all content (for editors - only their own, for admin - all)
export const getAllContent = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { userId: req.user.id };

    const content = await HappyTeamContent.find(query)
      .populate('userId', 'displayName username email editorRole')
      .sort({ createdAt: -1 });

    res.status(200).json(content);
  } catch (err) {
    next(err);
  }
};

// Upload new content
export const uploadContent = async (req, res, next) => {
  try {
    console.log('Upload request body:', req.body);
    console.log('User:', req.user);

    const { type, fileUrl, thumbnailUrl, title, description, code, price } = req.body;

    if (!type || !fileUrl) {
      console.log('Validation failed - type:', type, 'fileUrl:', fileUrl);
      return next(createError(400, 'Type and file URL are required'));
    }

    if (!code) {
      return next(createError(400, 'Code is required'));
    }

    if (price === undefined || price < 0) {
      return next(createError(400, 'Valid price is required'));
    }

    const existingCode = await HappyTeamContent.findOne({ code });
    if (existingCode) {
      return next(createError(400, 'Code already exists. Please use a unique code.'));
    }

    const newContent = new HappyTeamContent({
      userId: req.user.id,
      type,
      fileUrl,
      thumbnailUrl,
      title,
      description,
      code,
      price,
      status: 'pending',
    });

    await newContent.save();

    const populatedContent = await HappyTeamContent.findById(
      newContent._id
    ).populate('userId', 'displayName username email editorRole');

    res.status(201).json(populatedContent);
  } catch (err) {
    console.error('Error in uploadContent:', err);
    next(err);
  }
};

// Delete own content (only pending status)
export const deleteOwnContent = async (req, res, next) => {
  try {
    const content = await HappyTeamContent.findById(req.params.id);

    if (!content) {
      return next(createError(404, 'Content not found'));
    }

    // Only allow deletion of own pending content
    if (
      content.userId.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(createError(403, 'You can only delete your own content'));
    }

    if (content.status !== 'pending' && req.user.role !== 'admin') {
      return next(createError(403, 'You can only delete pending content'));
    }

    const deleteFileFromDisk = (fileUrl) => {
      if (!fileUrl) return;

      let relativePath = fileUrl;
      if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        const urlObj = new URL(fileUrl);
        relativePath = urlObj.pathname;
      }

      if (relativePath.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), relativePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    };

    deleteFileFromDisk(content.fileUrl);
    deleteFileFromDisk(content.thumbnailUrl);

    const film = await Video.findOne({
      customerCode: content.code.trim().toUpperCase(),
      isFilm: true,
    });

    if (film) {
      await Video.deleteMany({ sourceFilmId: film._id });
      await Video.findByIdAndDelete(film._id);
    }

    await HappyTeamContent.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Content deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Admin: Approve content
export const approveContent = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(createError(403, 'Only admins can approve content'));
    }

    const content = await HappyTeamContent.findById(req.params.id);

    if (!content) {
      return next(createError(404, 'Content not found'));
    }

    let film = await Video.findOne({ 
      customerCode: content.code.trim().toUpperCase() 
    });
    
    if (content.status === 'approved' && film) {
      await content.populate('userId', 'displayName username email editorRole');
      return res.status(200).json({
        ...content.toObject(),
        filmId: film._id,
        customerCode: film.customerCode,
        message: 'Content is already approved and film exists'
      });
    }

    if (!film) {
      film = await Video.create({
        caption: content.title || 'Happy Team Content',
        customerCode: content.code.trim().toUpperCase(),
        purchasePrice: content.price || 0,
        videoUrl: { url: content.fileUrl },
        thumbnailUrl: content.thumbnailUrl || '',
        userId: content.userId,
        privacy: 'Private',
        isFilm: true,
        mediaType: content.type,
        storageProvider: 'local',
      });
    }

    content.status = 'approved';
    await content.save();

    await content.populate('userId', 'displayName username email editorRole');

    res.status(200).json({
      ...content.toObject(),
      filmId: film._id,
      customerCode: film.customerCode,
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Reject content (and delete it)
export const rejectContent = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(createError(403, 'Only admins can reject content'));
    }

    const { reason } = req.body;
    const content = await HappyTeamContent.findById(req.params.id);

    if (!content) {
      return next(createError(404, 'Content not found'));
    }

    const deleteFileFromDisk = (fileUrl) => {
      if (!fileUrl) return;

      let relativePath = fileUrl;
      if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        const urlObj = new URL(fileUrl);
        relativePath = urlObj.pathname;
      }

      if (relativePath.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), relativePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    };

    deleteFileFromDisk(content.fileUrl);
    deleteFileFromDisk(content.thumbnailUrl);

    const film = await Video.findOne({
      customerCode: content.code.trim().toUpperCase(),
      isFilm: true,
    });

    if (film) {
      await Video.deleteMany({ sourceFilmId: film._id });
      await Video.findByIdAndDelete(film._id);
    }

    await HappyTeamContent.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: `Content rejected and deleted${reason ? `: ${reason}` : ''}`,
    });
  } catch (err) {
    next(err);
  }
};

// Get approved content (public)
export const getApprovedContent = async (req, res, next) => {
  try {
    const content = await HappyTeamContent.find({ status: 'approved' })
      .populate('userId', 'displayName username editorRole')
      .sort({ createdAt: -1 });

    res.status(200).json(content);
  } catch (err) {
    next(err);
  }
};

// Get pending content (admin only)
export const getPendingContent = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(createError(403, 'Only admins can view pending content'));
    }

    const content = await HappyTeamContent.find({ status: 'pending' })
      .populate('userId', 'displayName username email editorRole')
      .sort({ createdAt: -1 });

    res.status(200).json(content);
  } catch (err) {
    next(err);
  }
};

// Redeem content by code (for users)
export const redeemContent = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return next(createError(400, 'Code is required'));
    }

    const content = await HappyTeamContent.findOne({ 
      code: code.trim(),
      status: 'approved' 
    }).populate('userId', 'displayName username editorRole');

    if (!content) {
      return next(createError(404, 'Content not found or not available'));
    }

    const userId = req.user.id;
    const alreadyPurchased = content.purchasedBy.some(
      id => id.toString() === userId
    );

    if (alreadyPurchased) {
      const userFilm = await Video.findOne({
        userId: userId,
        customerCode: content.code.trim().toUpperCase(),
      });

      return res.status(200).json({
        ...content.toObject(),
        alreadyPurchased: true,
        filmId: userFilm?._id,
      });
    }

    const film = await Video.findOne({
      customerCode: code.trim().toUpperCase(),
      isFilm: true,
    });

    if (!film) {
      return next(createError(404, 'Film not found for this content. Please contact support.'));
    }

    const userHasFilm = await Video.findOne({
      userId: userId,
      sourceFilmId: film._id,
    });

    if (!userHasFilm) {
      const filmCopy = new Video({
        caption: film.caption,
        videoUrl: film.videoUrl,
        thumbnailUrl: film.thumbnailUrl,
        images: film.images || [],
        userId: userId,
        privacy: 'Public',
        isFilm: false,
        mediaType: film.mediaType,
        storageProvider: film.storageProvider,
        sourceFilmId: film._id,
      });
      await filmCopy.save();
    }

    content.purchasedBy.push(userId);
    await content.save();

    res.status(200).json({
      ...content.toObject(),
      alreadyPurchased: false,
      filmId: film._id,
    });
  } catch (err) {
    next(err);
  }
};
