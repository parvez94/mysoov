import User from '../models/User.js';
import Video from '../models/Video.js';
import { createError } from '../utils/error.js';

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
      total: users.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get all videos
export const getAllVideos = async (req, res, next) => {
  try {
    const videos = await Video.find()
      .populate('userId', 'username displayName displayImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      videos,
      total: videos.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVideos = await Video.countDocuments();
    const totalViews = await Video.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalVideos,
        totalViews: totalViews[0]?.totalViews || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update user (edit, pause/suspend)
export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Prevent updating password through this endpoint
    if (updates.password) {
      return next(
        createError(400, 'Cannot update password through this endpoint')
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return next(createError(400, 'You cannot delete your own account'));
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    // Also delete all videos by this user
    await Video.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: 'User and their videos deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Delete video
export const deleteVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findByIdAndDelete(videoId);

    if (!video) {
      return next(createError(404, 'Video not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get all admins
export const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 1 })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      admins,
      total: admins.length,
    });
  } catch (error) {
    next(error);
  }
};

// Search users (for adding admins)
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json({
        success: true,
        users: [],
      });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    })
      .select('-password')
      .limit(10);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Promote user to admin
export const promoteToAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { role: 1 },
      { new: true }
    ).select('-password');

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    res.status(200).json({
      success: true,
      message: 'User promoted to admin successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Demote admin to regular user
export const demoteFromAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Prevent admin from demoting themselves
    if (userId === req.user.id) {
      return next(createError(400, 'You cannot demote yourself'));
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: 0 },
      { new: true }
    ).select('-password');

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Admin demoted to regular user successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};
