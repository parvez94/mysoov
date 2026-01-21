import Video from '../models/Video.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import { createError } from '../utils/error.js';
import { deleteFromLocal } from '../utils/localStorage.js';
import { processVideo } from '../utils/videoProcessor.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const addVideo = async (req, res, next) => {
  try {
    // Prevent happy-team users from posting directly to their profile
    if (req.user.accountType === 'happy-team') {
      return next(createError(403, 'Happy team members cannot post directly to their profile. Please use the Happy Team content upload system.'));
    }

    const { videoMetadata, ...videoData } = req.body;
    const newVideo = new Video({ userId: req.user.id, ...videoData });
    
    const savedVideo = await newVideo.save();
    
    // If video has editing metadata, process it in the background
    if (videoMetadata && videoData.mediaType === 'video' && videoData.videoUrl) {
      processVideoInBackground(savedVideo._id, videoData.videoUrl, videoMetadata);
    }
    
    res.status(200).json(savedVideo);
  } catch (err) {
    next(err);
  }
};

// Process video in background (non-blocking)
async function processVideoInBackground(videoId, videoUrl, metadata) {
  try {
    console.log('🎬 Starting video processing for:', videoId);
    
    // Get video file path from URL
    const videoPath = getLocalPathFromUrl(videoUrl.url || videoUrl);
    if (!videoPath || !fs.existsSync(videoPath)) {
      console.error('❌ Video file not found:', videoPath);
      return;
    }
    
    // Prepare output path
    const outputFilename = `processed_${Date.now()}_${path.basename(videoPath)}`;
    const outputPath = path.join(path.dirname(videoPath), outputFilename);
    
    // Handle background music upload if provided
    let musicPath = null;
    if (metadata.backgroundMusic) {
      // Music file should be uploaded separately or provided as path
      musicPath = metadata.backgroundMusic;
    }
    
    console.log('📝 Video processing metadata:', metadata);
    console.log('📝 Trim settings - Start:', metadata.trimStart, 'End:', metadata.trimEnd);
    
    // Process video with FFmpeg
    const processedPath = await processVideo(videoPath, {
      ...metadata,
      backgroundMusic: musicPath
    }, outputPath);
    
    // Update video document with processed video URL
    const port = process.env.PORT || 5000;
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${port}`;
    const relativePath = processedPath.replace(path.join(__dirname, '..', 'uploads'), '/uploads');
    const processedUrl = `${backendUrl}${relativePath}`;
    
    await Video.findByIdAndUpdate(videoId, {
      'videoUrl.url': processedUrl,
      'videoUrl.processed': true
    });
    
    // Delete original video file to save space
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
      console.log('🗑️ Deleted original video:', videoPath);
    }
    
    console.log('✅ Video processing completed:', videoId);
  } catch (err) {
    console.error('❌ Background video processing failed:', err);
    // Video stays with original URL if processing fails
  }
}

// Helper function to convert URL to local file path
function getLocalPathFromUrl(url) {
  try {
    const uploadsIndex = url.indexOf('/uploads/');
    if (uploadsIndex === -1) return null;
    
    const relativePath = url.substring(uploadsIndex);
    const localPath = path.join(__dirname, '..', relativePath);
    return localPath;
  } catch (err) {
    return null;
  }
}

export const getVideo = async (req, res, next) => {
  try {
    const videoDoc = await Video.findById(req.params.id)
      .populate('sourceFilmId', 'purchasePrice customerCode caption');
    if (!videoDoc) return next(createError(404, 'Video not found'));

    // Convert to plain object for safe spreading
    const video =
      typeof videoDoc.toObject === 'function' ? videoDoc.toObject() : videoDoc;

    // Check privacy: if video is private, only owner or admin can view it
    if (video.privacy === 'Private') {
      const currentUserId = req.user?.id;
      const isAdmin = req.user?.role === 'admin';
      const isOwner =
        currentUserId && String(currentUserId) === String(video.userId);

      if (!isOwner && !isAdmin) {
        return next(createError(403, 'This video is private'));
      }
    }

    // Attach dynamic comments count for detail page
    const commentsCount = await Comment.countDocuments({
      videoId: String(video._id),
    });

    res.status(200).json({ ...video, commentsCount });
  } catch (err) {
    next(err);
  }
};

export const updateVideo = async (req, res, next) => {
  try {
    // Prevent happy-team users from updating videos on their profile
    if (req.user.accountType === 'happy-team') {
      return next(createError(403, 'Happy team members cannot update videos on their profile.'));
    }

    const video = await Video.findById(req.params.id);

    if (!video) return next(createError(404, 'Video not found'));

    if (req.user.id === video.userId) {
      // If video is paused (privacy: 'Private') and user is editing it,
      // set pendingReview flag to request admin review
      const wasPaused = video.privacy === 'Private';

      const updateData = { ...req.body };

      // If video was paused, keep it private and require admin approval
      if (wasPaused) {
        // Force privacy to remain Private until admin approves
        updateData.privacy = 'Private';
        updateData.pendingReview = true;
        updateData.reviewRequestedAt = new Date();
      }

      const updatedVideo = await Video.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );

      // Notify admin if review is requested
      if (wasPaused && updateData.pendingReview) {
        // Import Notification model at the top if not already imported
        const Notification = (await import('../models/Notification.js'))
          .default;
        const User = (await import('../models/User.js')).default;

        // Find admin users
        const admins = await User.find({ role: 'admin' });

        // Create notification for each admin
        for (const admin of admins) {
          await Notification.create({
            recipient: admin._id,
            sender: req.user.id,
            type: 'review_requested',
            message: `A user has edited their paused ${
              video.mediaType === 'image' ? 'post' : 'video'
            } and requested review.`,
            relatedVideo: video._id,
          });
        }
      }

      res.status(200).json(updatedVideo);
    } else {
      return next(createError(403, 'You can update only your video'));
    }
  } catch (err) {
    next(err);
  }
};

export const deleteVideo = async (req, res, next) => {
  try {
    // Prevent happy-team users from deleting videos on their profile
    if (req.user.accountType === 'happy-team') {
      return next(createError(403, 'Happy team members cannot delete videos on their profile.'));
    }

    const video = await Video.findById(req.params.id);

    if (!video) return next(createError(404, 'Video not found'));

    if (req.user.id === video.userId) {
      // Delete files from local storage if applicable
      if (video.storageProvider === 'local') {
        // Delete video file
        if (video.videoUrl?.public_id) {
          await deleteFromLocal(video.videoUrl.public_id).catch((err) =>
            console.error('Error deleting video file:', err)
          );
        }

        // Delete image files
        if (video.images && video.images.length > 0) {
          for (const image of video.images) {
            const publicId =
              typeof image === 'string' ? image : image.public_id;
            if (publicId) {
              await deleteFromLocal(publicId).catch((err) =>
                console.error('Error deleting image file:', err)
              );
            }
          }
        }
      }

      await Video.findByIdAndDelete(req.params.id);

      if (video.fileSize) {
        await User.findByIdAndUpdate(video.userId, {
          $inc: { storageUsed: -video.fileSize },
        });
      }

      res.status(200).json('Video deleted');
    } else {
      return next(createError(403, 'You can delete only your video'));
    }
  } catch (err) {
    next(err);
  }
};

export const addView = async (req, res, next) => {
  try {
    await Video.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 },
    });
    res.status(200).json('View increased');
  } catch (err) {
    next(err);
  }
};

export const addShare = async (req, res, next) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { share: 1 },
      },
      { new: true }
    );

    if (!video) {
      return next(createError(404, 'Video not found'));
    }

    res.status(200).json({ share: video.share });
  } catch (err) {
    next(err);
  }
};

// export const randomVideos = async (req, res, next) => {
//   try {
//     const currentUser = req.user.id

//     const videos = await Video.aggregate([{ $sample: { size: 10 } }])
//     res.status(200).json(videos)
//   } catch (err) {
//     next(err)
//   }
// }

export const randomVideos = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let pipeline = [];

    // Safely check if user is authenticated
    const currentUser = req.user?.id;

    // Only exclude current user's videos if user is authenticated
    if (currentUser) {
      pipeline.push({ $match: { userId: { $ne: currentUser } } });
    }

    // Only show public videos without access codes for random endpoint
    pipeline.push({
      $match: {
        privacy: 'Public',
        isFilm: { $ne: true }, // Exclude films from explore
        $or: [{ accessCode: null }, { accessCode: { $exists: false } }],
      },
    });
    
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const videos = await Video.aggregate(pipeline);

    // If no videos found, return empty array
    if (videos.length === 0) {
      return res.status(200).json([]);
    }

    // Attach dynamic comment counts excluding orphan replies (those whose parent no longer exists)
    const ids = videos.map((v) => String(v._id));
    const comments = await Comment.find(
      { videoId: { $in: ids } },
      { _id: 1, parentId: 1, videoId: 1 }
    ).lean();

    // Build per-video sets of existing comment ids
    const idSetsByVideo = ids.reduce((acc, vid) => {
      acc[vid] = new Set();
      return acc;
    }, {});
    for (const c of comments) {
      const vid = String(c.videoId);
      if (idSetsByVideo[vid]) idSetsByVideo[vid].add(String(c._id));
    }

    // Count comments whose parentId is null OR whose parent exists within the same video
    const countMap = {};
    for (const c of comments) {
      const vid = String(c.videoId);
      const idSet = idSetsByVideo[vid];
      const isRoot = !c.parentId;
      const hasParent = !isRoot && idSet.has(String(c.parentId));
      if (isRoot || hasParent) {
        countMap[vid] = (countMap[vid] || 0) + 1;
      }
    }

    const enriched = videos.map((v) => ({
      ...v,
      commentsCount: countMap[String(v._id)] || 0,
    }));

    res.status(200).json(enriched);
  } catch (err) {
    next(err);
  }
};

export const trend = async (req, res, next) => {
  try {
    // Only show public videos without access codes in trending
    const videos = await Video.find({
      privacy: 'Public',
      isFilm: { $ne: true }, // Exclude films from trending
      $or: [{ accessCode: null }, { accessCode: { $exists: false } }],
    }).sort({ views: -1 });
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};

export const videoFeeds = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id);
    // Ensure unique followings to avoid duplicate fetches
    // Remove self and ensure unique followings to avoid duplicate/self fetches
    const followings = Array.from(
      new Set(
        (user.following || []).filter(
          (id) => String(id) !== String(req.user.id)
        )
      )
    );

    const currentUserPosts = await Video.find({
      userId: req.user.id,
      privacy: 'Public',
      isFilm: { $ne: true }, // Exclude films from profile
      $or: [{ accessCode: null }, { accessCode: { $exists: false } }],
    });

    // If user has no posts and follows no one, return empty feed (do NOT fallback to explore)
    if (currentUserPosts.length === 0 && followings.length === 0) {
      return res.status(200).json([]);
    }

    let allPosts = currentUserPosts;

    if (followings.length > 0) {
      const followingsPosts = await Promise.all(
        followings.map(async (channelId) => {
          // Only show public videos without access codes from followed users
          return await Video.find({
            userId: channelId,
            privacy: 'Public',
            isFilm: { $ne: true }, // Exclude films from feed
            $or: [{ accessCode: null }, { accessCode: { $exists: false } }],
          });
        })
      );

      allPosts = [...allPosts, ...followingsPosts.flat()];
    }

    // If there are still no posts (e.g., follows exist but those users have no posts),
    // fall back to some random public videos without access codes to keep the feed populated.
    if (allPosts.length === 0) {
      allPosts = await Video.aggregate([
        {
          $match: {
            privacy: 'Public',
            isFilm: { $ne: true }, // Exclude films from fallback feed
            $or: [{ accessCode: null }, { accessCode: { $exists: false } }],
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 100 },
      ]);
    }

    // Dedupe by _id across all sources (own posts, followings, random fallback)
    const uniqueByIdMap = new Map();
    for (const v of allPosts) {
      const id = v._id ? String(v._id) : String(v.id);
      if (!uniqueByIdMap.has(id)) uniqueByIdMap.set(id, v);
    }
    const uniquePosts = Array.from(uniqueByIdMap.values());

    // Sort by createdAt desc
    const sortedPosts = uniquePosts.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Apply pagination
    const paginatedPosts = sortedPosts.slice(skip, skip + limit);

    // Attach dynamic comment counts to feed videos (exclude orphan replies)
    const ids = paginatedPosts.map((v) => String(v._id));
    const comments = await Comment.find(
      { videoId: { $in: ids } },
      { _id: 1, parentId: 1, videoId: 1 }
    ).lean();

    const idSetsByVideo = ids.reduce((acc, vid) => {
      acc[vid] = new Set();
      return acc;
    }, {});
    for (const c of comments) {
      const vid = String(c.videoId);
      if (idSetsByVideo[vid]) idSetsByVideo[vid].add(String(c._id));
    }

    const countMap = {};
    for (const c of comments) {
      const vid = String(c.videoId);
      const idSet = idSetsByVideo[vid];
      const isRoot = !c.parentId;
      const hasParent = !isRoot && idSet.has(String(c.parentId));
      if (isRoot || hasParent) {
        countMap[vid] = (countMap[vid] || 0) + 1;
      }
    }

    const enriched = paginatedPosts.map((v) => ({
      ...(typeof v.toObject === 'function' ? v.toObject() : v),
      commentsCount: countMap[String(v._id)] || 0,
    }));

    res.status(200).json(enriched);
  } catch (err) {
    next(err);
  }
};

export const getByTags = async (req, res, next) => {
  const tags = req.query.tags.split(',');
  try {
    const videos = await Video.find({ tags: { $in: tags } }).limit(20);
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};

export const search = async (req, res, next) => {
  const query = req.query.q;

  try {
    // Only show public videos without access codes in search results
    const videos = await Video.find({
      caption: { $regex: query, $options: 'i' },
      privacy: 'Public',
      $or: [{ accessCode: null }, { accessCode: { $exists: false } }],
    }).limit(20);
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};

// Search videos by access code (case-insensitive)
export const searchByAccessCode = async (req, res, next) => {
  const code = req.query.code;

  try {
    if (!code || code.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Access code is required',
      });
    }

    // Search for videos with matching access code (case-insensitive)
    // Videos with access codes can be private or public, but must have the exact code
    const videos = await Video.find({
      accessCode: { $regex: `^${code.trim()}$`, $options: 'i' },
    }).sort({ createdAt: -1 });

    // Attach dynamic comment counts
    if (videos.length > 0) {
      const ids = videos.map((v) => String(v._id));
      const comments = await Comment.find(
        { videoId: { $in: ids } },
        { _id: 1, parentId: 1, videoId: 1 }
      ).lean();

      const idSetsByVideo = ids.reduce((acc, vid) => {
        acc[vid] = new Set();
        return acc;
      }, {});
      for (const c of comments) {
        const vid = String(c.videoId);
        if (idSetsByVideo[vid]) idSetsByVideo[vid].add(String(c._id));
      }

      const countMap = {};
      for (const c of comments) {
        const vid = String(c.videoId);
        const idSet = idSetsByVideo[vid];
        const isRoot = !c.parentId;
        const hasParent = !isRoot && idSet.has(String(c.parentId));
        if (isRoot || hasParent) {
          countMap[vid] = (countMap[vid] || 0) + 1;
        }
      }

      const enriched = videos.map((v) => ({
        ...(typeof v.toObject === 'function' ? v.toObject() : v),
        commentsCount: countMap[String(v._id)] || 0,
      }));

      return res.status(200).json(enriched);
    }

    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};
