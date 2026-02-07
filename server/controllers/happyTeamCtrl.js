import HappyTeamContent from '../models/HappyTeamContent.js';
import Video from '../models/Video.js';
import User from '../models/User.js';
import FilmDirectory from '../models/FilmDirectory.js';
import FilmImage from '../models/FilmImage.js';
import { createError } from '../utils/error.js';
import path from 'path';
import fs from 'fs';

// Editor: Upload content
export const uploadContent = async (req, res, next) => {
  try {
    const { title, description, type, fileUrl, watermarkedUrl, thumbnailUrl } =
      req.body;

    if (!type || !fileUrl) {
      return next(createError(400, 'Type and file URL are required'));
    }

    const content = new HappyTeamContent({
      userId: req.user.id,
      type,
      fileUrl,
      watermarkedUrl: watermarkedUrl || null,
      thumbnailUrl: thumbnailUrl || null,
      title: title || '',
      description: description || '',
      code: 'TEMP' + Date.now(),
      price: 0,
      status: 'pending',
    });

    await content.save();
    await content.populate('userId', 'displayName username email editorRole');

    res.status(201).json(content);
  } catch (err) {
    next(err);
  }
};

// Editor: Get own content
export const getOwnContent = async (req, res, next) => {
  try {
    const content = await HappyTeamContent.find({ userId: req.user.id })
      .populate('userId', 'displayName username email editorRole')
      .sort({ createdAt: -1 });

    res.status(200).json(content);
  } catch (err) {
    next(err);
  }
};

// Admin: Get all content (for admin table)
export const getAllContent = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(createError(403, 'Only admins can view all content'));
    }

    const content = await HappyTeamContent.find()
      .populate('userId', 'displayName username email editorRole')
      .sort({ createdAt: -1 });

    res.status(200).json(content);
  } catch (err) {
    next(err);
  }
};

// Bulk delete content (Admin or own pending content)
export const bulkDeleteContent = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return next(createError(400, 'IDs array is required'));
    }

    const contents = await HappyTeamContent.find({ _id: { $in: ids } });

    for (const content of contents) {
      if (
        content.userId.toString() !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        return next(createError(403, 'You can only delete your own content'));
      }

      if (content.status !== 'pending' && req.user.role !== 'admin') {
        return next(createError(403, 'You can only delete pending content'));
      }
    }

    await HappyTeamContent.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ message: 'Content deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Editor/Admin: Delete own content
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
    deleteFileFromDisk(content.watermarkedUrl);
    deleteFileFromDisk(content.thumbnailUrl);

    if (content.status === 'approved' && content.type === 'video') {
      const film = await Video.findOne({
        customerCode: content.code.trim().toUpperCase(),
        isFilm: true,
        mediaType: 'video'
      });

      if (film) {
        const otherContentWithSameCode = await HappyTeamContent.countDocuments({
          code: content.code,
          status: 'approved',
          type: 'video',
          _id: { $ne: content._id }
        });

        if (otherContentWithSameCode === 0) {
          const videosToDelete = await Video.find({ sourceFilmId: film._id });
          
          for (const video of videosToDelete) {
            if (video.fileSize && video.userId) {
              await User.findByIdAndUpdate(video.userId, {
                $inc: { storageUsed: -video.fileSize },
              });
            }
          }
          
          await Video.deleteMany({ sourceFilmId: film._id });
          
          if (film.fileSize && film.userId) {
            await User.findByIdAndUpdate(film.userId, {
              $inc: { storageUsed: -film.fileSize },
            });
          }
          
          await Video.findByIdAndDelete(film._id);
        }
      }
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

    const { price, code } = req.body;

    if (price === undefined || price < 0) {
      return next(createError(400, 'Valid price is required'));
    }

    if (!code || code.trim() === '') {
      return next(createError(400, 'Access code is required'));
    }

    const content = await HappyTeamContent.findById(req.params.id);

    if (!content) {
      return next(createError(404, 'Content not found'));
    }

    const normalizedCode = code.trim().toUpperCase();

    content.price = price;
    content.code = normalizedCode;
    content.status = 'approved';

    if (content.type === 'video') {
      let film = await Video.findOne({ 
        customerCode: normalizedCode,
        isFilm: true,
        mediaType: 'video'
      });
      
      
      if (!film) {
        const filmData = {
          caption: content.title || 'Happy Team Content',
          customerCode: normalizedCode,
          purchasePrice: price,
          thumbnailUrl: content.thumbnailUrl || '',
          userId: content.userId,
          privacy: 'Private',
          isFilm: true,
          mediaType: 'video',
          storageProvider: 'local',
          videoUrl: { url: content.fileUrl },
          images: []
        };

        film = await Video.create(filmData);
      } else {
        film.purchasePrice = price;
        await film.save();
      }
      
      await content.save();
      await content.populate('userId', 'displayName username email editorRole');
      
      return res.status(200).json({
        ...content.toObject(),
        filmId: film._id,
        customerCode: film.customerCode,
      });
    }

    await content.save();
    await content.populate('userId', 'displayName username email editorRole');

    res.status(200).json({
      ...content.toObject(),
      customerCode: normalizedCode,
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
    deleteFileFromDisk(content.watermarkedUrl);
    deleteFileFromDisk(content.thumbnailUrl);

    if (content.type === 'video') {
      const film = await Video.findOne({
        customerCode: content.code.trim().toUpperCase(),
        isFilm: true,
        mediaType: 'video'
      });

      if (film) {
        await Video.deleteMany({ sourceFilmId: film._id });
        await Video.findByIdAndDelete(film._id);
      }
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

    const normalizedCode = code.trim().toUpperCase();
    
    const contents = await HappyTeamContent.find({ 
      code: normalizedCode,
      status: 'approved' 
    }).populate('userId', 'displayName username editorRole');

    if (!contents || contents.length === 0) {
      const directFilm = await Video.findOne({
        customerCode: normalizedCode,
        isFilm: true,
        mediaType: 'video'
      });

      if (!directFilm) {
        const imageGallery = await FilmDirectory.findOne({
          folderName: { $regex: new RegExp(`^${normalizedCode}$`, 'i') },
        });

        if (!imageGallery) {
          return next(createError(404, 'Content not found or not available'));
        }

        const galleryImages = await FilmImage.find({ 
          filmDirectoryId: imageGallery._id 
        }).sort({ createdAt: -1 });

        if (!galleryImages || galleryImages.length === 0) {
          return next(createError(404, 'No images found in this gallery'));
        }

        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5100';
        
        const convertToAbsoluteUrl = (url) => {
          if (!url) return url;
          if (url.startsWith('http://') || url.startsWith('https://')) return url;
          return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
        };

        const imageUrls = galleryImages.map(img => ({
          url: convertToAbsoluteUrl(img.watermarkedUrl),
          originalUrl: convertToAbsoluteUrl(img.imageUrl),
          imageId: img._id,
          title: img.title || ''
        }));

        const userVideo = await Video.create({
          caption: imageGallery.description || '',
          videoUrl: { url: imageUrls[0].url },
          thumbnailUrl: imageUrls[0].url,
          images: imageUrls,
          userId: req.user.id,
          privacy: 'Public',
          isFilm: false,
          mediaType: 'image',
          storageProvider: 'local',
          filmDirectoryId: imageGallery._id,
        });

        await userVideo.populate('userId', 'displayName username editorRole');
        await userVideo.populate('filmDirectoryId', 'price folderName description');

        return res.status(200).json({
          success: true,
          message: 'Gallery successfully added to your profile!',
          alreadyPurchased: false,
          totalItems: galleryImages.length,
          film: {
            ...userVideo.toObject(),
            originalTitle: imageGallery.folderName,
            purchasePrice: imageGallery.price ?? 0,
            customerCode: normalizedCode,
          }
        });
      }

      const userId = req.user.id;
      const existingCopy = await Video.findOne({
        userId: userId,
        sourceFilmId: directFilm._id,
      });

      if (existingCopy) {
        await existingCopy.populate('userId', 'displayName username editorRole');
        return res.status(200).json({
          success: true,
          alreadyPurchased: true,
          totalItems: 1,
          film: existingCopy.toObject(),
          message: 'You already own this content'
        });
      }

      console.log('📋 Creating film copy in redeem:', {
        filmId: directFilm._id,
        caption: directFilm.caption,
        hasWatermark: !!directFilm.watermarkedVideoUrl,
        watermarkUrl: directFilm.watermarkedVideoUrl?.url
      });

      const userVideo = await Video.create({
        caption: directFilm.caption,
        videoUrl: directFilm.videoUrl,
        watermarkedVideoUrl: directFilm.watermarkedVideoUrl,
        thumbnailUrl: directFilm.thumbnailUrl,
        images: [],
        userId: userId,
        privacy: 'Public',
        isFilm: false,
        mediaType: 'video',
        storageProvider: directFilm.storageProvider,
        sourceFilmId: directFilm._id,
      });
      
      console.log('✅ Film copy created:', {
        copyId: userVideo._id,
        watermarkedVideoUrl: userVideo.watermarkedVideoUrl
      });

      await userVideo.populate('userId', 'displayName username editorRole');

      return res.status(200).json({
        success: true,
        message: 'Content successfully added to your profile!',
        alreadyPurchased: false,
        totalItems: 1,
        film: {
          ...userVideo.toObject(),
          originalTitle: directFilm.caption,
          purchasePrice: directFilm.purchasePrice ?? 0,
          customerCode: normalizedCode,
        }
      });
    }

    const userId = req.user.id;
    const firstContent = contents[0];
    const alreadyPurchased = firstContent.purchasedBy.some(
      id => id.toString() === userId
    );

    if (alreadyPurchased) {
      const existingVideo = await Video.findOne({
        userId: userId,
        $or: [
          { 'images.contentId': firstContent._id },
          { sourceFilmId: { $exists: true } }
        ]
      }).populate('userId', 'displayName username editorRole');

      return res.status(200).json({
        success: true,
        alreadyPurchased: true,
        totalItems: contents.length,
        film: existingVideo ? existingVideo.toObject() : null,
        message: 'You already own this content'
      });
    }

    let userVideo;

    if (firstContent.type === 'video') {
      const film = await Video.findOne({
        customerCode: normalizedCode,
        isFilm: true,
        mediaType: 'video'
      });

      if (!film) {
        return next(createError(404, 'Film not found for this content. Please contact support.'));
      }

      const existingCopy = await Video.findOne({
        userId: userId,
        sourceFilmId: film._id,
      });

      if (!existingCopy) {
        userVideo = await Video.create({
          caption: film.caption,
          videoUrl: film.videoUrl,
          thumbnailUrl: film.thumbnailUrl,
          images: [],
          userId: userId,
          privacy: 'Public',
          isFilm: false,
          mediaType: 'video',
          storageProvider: film.storageProvider,
          sourceFilmId: film._id,
        });
      } else {
        userVideo = existingCopy;
      }
    } else {
      const imageUrls = contents.map(img => ({
        url: img.watermarkedUrl || img.fileUrl,
        originalUrl: img.fileUrl,
        contentId: img._id
      }));

      userVideo = await Video.create({
        caption: firstContent.title || 'Happy Team Album',
        videoUrl: { url: imageUrls[0].url },
        thumbnailUrl: firstContent.thumbnailUrl || imageUrls[0].url,
        images: imageUrls,
        userId: userId,
        privacy: 'Public',
        isFilm: false,
        mediaType: 'image',
        storageProvider: 'local',
      });
    }

    for (const content of contents) {
      if (!content.purchasedBy.includes(userId)) {
        content.purchasedBy.push(userId);
        await content.save();
      }
    }

    await userVideo.populate('userId', 'displayName username editorRole');

    res.status(200).json({
      success: true,
      message: 'Content successfully added to your profile!',
      alreadyPurchased: false,
      totalItems: contents.length,
      film: {
        ...userVideo.toObject(),
        originalTitle: firstContent.title,
        purchasePrice: firstContent.price,
        customerCode: normalizedCode,
      }
    });
  } catch (err) {
    next(err);
  }
};
