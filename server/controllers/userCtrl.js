import User from '../models/User.js';
import Video from '../models/Video.js';
import { createError } from '../utils/error.js';
import { createNotification } from './notificationCtrl.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const checkUsernameAvailability = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { currentUserId } = req.query; // Optional: exclude current user from check

    if (!username || username.length < 2) {
      return res.status(400).json({
        available: false,
        message: 'Username must be at least 2 characters long',
      });
    }

    // Check if username contains only valid characters (alphanumeric and underscores)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        available: false,
        message: 'Username can only contain letters, numbers, and underscores',
      });
    }

    // Build query to check if username exists
    const query = { username: { $regex: new RegExp(`^${username}$`, 'i') } };

    // If checking for current user, exclude their ID
    if (currentUserId) {
      query._id = { $ne: currentUserId };
    }

    const existingUser = await User.findOne(query);

    if (existingUser) {
      return res.status(200).json({
        available: false,
        message: 'Username is already taken',
      });
    }

    res.status(200).json({
      available: true,
      message: 'Username is available',
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  if (req.params.id === req.user.id) {
    try {
      // Whitelist updatable fields for safety
      const { username, displayName, bio, displayImage } = req.body;
      const payload = {};
      if (typeof username === 'string') payload.username = username;
      if (typeof displayName === 'string') payload.displayName = displayName;
      if (typeof bio === 'string') payload.bio = bio;
      if (typeof displayImage === 'string') payload.displayImage = displayImage;

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: payload },
        { new: true }
      ).select('-password');

      res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  } else {
    next(createError(403, 'You can only update your profile.'));
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.params.id === req.user.id) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ msg: 'User has been deleted.' });
    } catch (err) {
      next(err);
    }
  } else {
    next(createError(403, 'You can only delete your profile.'));
  }
};

export const followUser = async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const followedId = req.params.id;

    // Use $addToSet to avoid duplicate follows in the following array
    await User.findByIdAndUpdate(followerId, {
      $addToSet: { following: followedId },
    });

    await User.findByIdAndUpdate(followedId, {
      $inc: { followers: 1 },
    });

    // Get follower's info for notification
    const follower = await User.findById(followerId).select(
      'username displayName'
    );

    // Create notification for the followed user
    await createNotification(
      followedId,
      followerId,
      'follow',
      `${follower.displayName || follower.username} started following you`
    );

    res.status(200).json('Following successfully');
  } catch (err) {
    next(err);
  }
};

export const unfollowUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { following: req.params.id },
    });

    await User.findByIdAndUpdate(req.params.id, {
      $inc: { followers: -1 },
    });

    res.status(200).json('Following successfully');
  } catch (err) {}
};

export const likeVideo = async (req, res, next) => {
  const userId = req.user.id;
  const videoId = req.params.videoId;
  try {
    // Get video and user info for notification
    const video = await Video.findById(videoId);
    const user = await User.findById(userId).select('username displayName');

    if (!video) {
      return next(createError(404, 'Video not found'));
    }

    await Video.findByIdAndUpdate(videoId, {
      $addToSet: { likes: userId },
    });

    // Create notification for video owner (if not liking own video)
    // Convert both to strings for proper comparison
    if (video.userId.toString() !== userId.toString()) {
      await createNotification(
        video.userId,
        userId,
        'like',
        `${user.displayName || user.username} liked your video "${
          video.title
        }"`,
        videoId
      );
    }

    res.status(200).json('You have liked this video');
  } catch (err) {
    next(err);
  }
};

export const unLikeVideo = async (req, res, next) => {
  const user = req.user.id;
  const videoId = req.params.videoId;
  try {
    await Video.findByIdAndUpdate(videoId, {
      $pull: { likes: user },
    });
    res.status(200).json('You have unliked this video');
  } catch (err) {}
};

// Save (bookmark) a video for the authenticated user
export const saveVideo = async (req, res, next) => {
  const user = req.user.id;
  const videoId = req.params.videoId;
  try {
    await Video.findByIdAndUpdate(videoId, {
      $addToSet: { saved: user },
    });
    res.status(200).json('You have saved this video');
  } catch (err) {
    next(err);
  }
};

// Unsave (remove bookmark) a video for the authenticated user
export const unSaveVideo = async (req, res, next) => {
  const user = req.user.id;
  const videoId = req.params.videoId;
  try {
    await Video.findByIdAndUpdate(videoId, {
      $pull: { saved: user },
    });
    res.status(200).json('You have unsaved this video');
  } catch (err) {
    next(err);
  }
};

// Get saved videos for a user (private: only owner can view)
export const getSavedVideos = async (req, res, next) => {
  try {
    const userId = String(req.params.id);
    if (String(req.user.id) !== userId) {
      return next(createError(403, 'You can only view your own saved videos.'));
    }

    // Fetch saved videos
    const videos = await Video.find({ saved: userId }).sort({ createdAt: -1 });

    // Fetch authors in one batch and attach minimal author info
    const authorIds = [
      ...new Set(videos.map((v) => String(v.userId)).filter(Boolean)),
    ];
    const authors = await User.find({ _id: { $in: authorIds } }).select(
      '_id username displayName displayImage'
    );
    const authorMap = new Map(authors.map((u) => [String(u._id), u]));

    const enriched = videos.map((v) => {
      const obj = v.toObject();
      const author = authorMap.get(String(v.userId));
      return {
        ...obj,
        author: author
          ? {
              _id: author._id,
              username: author.username,
              displayName: author.displayName,
              displayImage: author.displayImage,
            }
          : null,
      };
    });

    res.status(200).json(enriched);
  } catch (err) {
    next(err);
  }
};

export const getUserVideos = async (req, res, next) => {
  try {
    const profileUserId = req.params.id;
    const currentUserId = req.user?.id;

    let query = { userId: profileUserId };

    // If viewing someone else's profile, only show public videos
    // If viewing own profile, show all videos (public and private)
    if (String(currentUserId) !== String(profileUserId)) {
      query.privacy = 'Public';
    }

    const videos = await Video.find(query).sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};

// Get followers list for a user
export const getFollowers = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Find all users who follow this user
    const followers = await User.find({ following: userId })
      .select('_id username displayName displayImage')
      .sort({ displayName: 1, username: 1 });

    res.status(200).json(followers);
  } catch (err) {
    next(err);
  }
};

// Get following list for a user
export const getFollowing = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Get the user and populate their following list
    const user = await User.findById(userId).select('following');
    if (!user) {
      return next(createError(404, 'User not found'));
    }

    // Get details of users being followed
    const following = await User.find({ _id: { $in: user.following } })
      .select('_id username displayName displayImage')
      .sort({ displayName: 1, username: 1 });

    res.status(200).json(following);
  } catch (err) {
    next(err);
  }
};
