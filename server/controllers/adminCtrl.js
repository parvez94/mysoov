import User from '../models/User.js';
import Video from '../models/Video.js';
import Settings from '../models/Settings.js';
import { createError } from '../utils/error.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isYouTubeConfigured } from '../utils/youtubeUploader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const admins = await User.find({ role: 'admin' })
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
      { role: 'admin' },
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
      { role: 'user' },
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

// Get pricing plans
export const getPricingPlans = async (req, res, next) => {
  try {
    const configPath = path.join(__dirname, '../config/pricingPlans.js');

    // Read the file content
    const fileContent = fs.readFileSync(configPath, 'utf8');

    // Extract the pricing plans object using regex
    const match = fileContent.match(
      /export const pricingPlans = ({[\s\S]*?});/
    );

    if (!match) {
      return next(createError(500, 'Failed to parse pricing plans'));
    }

    // Import the actual module to get the data
    const { pricingPlans, pricingConfig } = await import(
      '../config/pricingPlans.js'
    );

    res.status(200).json({
      success: true,
      pricingPlans,
      pricingConfig: pricingConfig || {},
    });
  } catch (error) {
    next(error);
  }
};

// Update pricing plans
export const updatePricingPlans = async (req, res, next) => {
  try {
    const { pricingPlans, pricingConfig } = req.body;

    if (!pricingPlans) {
      return next(createError(400, 'Pricing plans data is required'));
    }

    // Validate pricing plans structure
    const requiredPlans = ['free', 'basic', 'pro', 'premium'];
    for (const planKey of requiredPlans) {
      if (!pricingPlans[planKey]) {
        return next(createError(400, `Missing required plan: ${planKey}`));
      }

      const plan = pricingPlans[planKey];
      if (
        typeof plan.name !== 'string' ||
        typeof plan.price !== 'number' ||
        typeof plan.maxUploadSize !== 'number' ||
        !Array.isArray(plan.features)
      ) {
        return next(createError(400, `Invalid plan structure for: ${planKey}`));
      }
    }

    // Default pricing config if not provided
    const defaultConfig = {
      recommendedPlan: 'pro',
      footerText: 'All plans include a 7-day free trial. Cancel anytime.',
      paymentEnabled: false,
      supportEmail: 'support@mysoov.com',
      comingSoonMessage: '🚀 Payment Integration Coming Soon!',
      comingSoonDescription:
        "We're currently setting up secure payment processing. In the meantime, please contact our support team to upgrade your account manually.",
      upgradeInstructions:
        "Include your username and desired plan in your message, and we'll upgrade your account within 24 hours.",
    };

    const config = pricingConfig || defaultConfig;

    // Generate the new file content
    const fileContent = `export const pricingPlans = ${JSON.stringify(
      pricingPlans,
      null,
      2
    )};

// Additional pricing configuration
export const pricingConfig = ${JSON.stringify(config, null, 2)};

export const getMaxUploadSize = (user) => {
  // Admin gets unlimited (500MB as practical limit)
  if (user.role === 'admin') {
    return 500;
  }

  // Paid users get their plan's limit
  if (user.subscription?.isPaid && user.subscription?.plan) {
    return pricingPlans[user.subscription.plan]?.maxUploadSize || 5;
  }

  // Free users get 5MB
  return pricingPlans.free?.maxUploadSize || 5;
};
`;

    const configPath = path.join(__dirname, '../config/pricingPlans.js');

    // Write the updated content to the file
    fs.writeFileSync(configPath, fileContent, 'utf8');

    res.status(200).json({
      success: true,
      message: 'Pricing plans updated successfully',
      pricingPlans,
      pricingConfig: config,
    });
  } catch (error) {
    next(error);
  }
};

// Get storage settings
export const getStorageSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({
        storageProvider: 'cloudinary',
        cloudinaryConfig: { enabled: true },
        youtubeConfig: { enabled: false, defaultPrivacy: 'unlisted' },
      });
    }

    // Check if YouTube is properly configured in environment
    const youtubeConfigured = isYouTubeConfigured();

    res.status(200).json({
      success: true,
      storageProvider: settings.storageProvider,
      cloudinaryConfig: settings.cloudinaryConfig,
      youtubeConfig: {
        ...settings.youtubeConfig,
        isConfigured: youtubeConfigured,
      },
      youtubeConfigured: youtubeConfigured, // Add this for frontend compatibility
    });
  } catch (error) {
    next(error);
  }
};

// Update storage settings
export const updateStorageSettings = async (req, res, next) => {
  try {
    const { storageProvider, youtubeConfig, cloudinaryConfig } = req.body;

    // Validate storage provider
    if (
      storageProvider &&
      !['cloudinary', 'youtube'].includes(storageProvider)
    ) {
      return next(createError(400, 'Invalid storage provider'));
    }

    // If YouTube is selected, check if it's configured
    if (storageProvider === 'youtube' && !isYouTubeConfigured()) {
      return next(
        createError(
          400,
          'YouTube is not configured. Please set up YouTube API credentials first.'
        )
      );
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        storageProvider: storageProvider || 'cloudinary',
        cloudinaryConfig: cloudinaryConfig || { enabled: true },
        youtubeConfig: youtubeConfig || {
          enabled: false,
          defaultPrivacy: 'unlisted',
        },
      });
    } else {
      if (storageProvider) settings.storageProvider = storageProvider;
      if (cloudinaryConfig) settings.cloudinaryConfig = cloudinaryConfig;
      if (youtubeConfig)
        settings.youtubeConfig = {
          ...settings.youtubeConfig,
          ...youtubeConfig,
        };
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Storage settings updated successfully',
      settings: {
        storageProvider: settings.storageProvider,
        cloudinaryConfig: settings.cloudinaryConfig,
        youtubeConfig: settings.youtubeConfig,
      },
    });
  } catch (error) {
    next(error);
  }
};
