import HappyTeamContent from '../models/HappyTeamContent.js';
import User from '../models/User.js';
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

    const content = await HappyTeamContent.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('userId', 'displayName username email editorRole');

    if (!content) {
      return next(createError(404, 'Content not found'));
    }

    res.status(200).json(content);
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
      return res.status(200).json({
        ...content.toObject(),
        alreadyPurchased: true
      });
    }

    content.purchasedBy.push(userId);
    await content.save();

    res.status(200).json({
      ...content.toObject(),
      alreadyPurchased: false
    });
  } catch (err) {
    next(err);
  }
};
