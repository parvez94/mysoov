import User from '../models/User.js';
import Video from '../models/Video.js';
import Article from '../models/Article.js';
import Settings from '../models/Settings.js';
import Notification from '../models/Notification.js';
import { createError } from '../utils/error.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isYouTubeConfigured } from '../utils/youtubeUploader.js';
import { getDiskSpace, deleteFromLocal } from '../utils/localStorage.js';

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
    // Exclude films from admin dashboard posts
    const videos = await Video.find({ isFilm: { $ne: true } }).sort({
      createdAt: -1,
    });

    // Manually populate user data since userId is stored as String, not ObjectId
    const videosWithUserData = await Promise.all(
      videos.map(async (video) => {
        const videoObj = video.toObject();
        try {
          const user = await User.findById(videoObj.userId).select(
            'username displayName displayImage'
          );
          videoObj.userId = user || {
            username: 'Unknown',
            displayName: 'Unknown User',
            displayImage: null,
          };
        } catch (err) {
          // If user not found, set default values
          videoObj.userId = {
            username: 'Unknown',
            displayName: 'Unknown User',
            displayImage: null,
          };
        }
        return videoObj;
      })
    );

    res.status(200).json({
      success: true,
      videos: videosWithUserData,
      total: videosWithUserData.length,
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
    const totalArticles = await Article.countDocuments();
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
        totalArticles,
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

    const video = await Video.findById(videoId);

    if (!video) {
      return next(createError(404, 'Video not found'));
    }

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
          const publicId = typeof image === 'string' ? image : image.public_id;
          if (publicId) {
            await deleteFromLocal(publicId).catch((err) =>
              console.error('Error deleting image file:', err)
            );
          }
        }
      }
    }

    await Video.findByIdAndDelete(videoId);

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Toggle video privacy (pause/unpause)
export const toggleVideoPrivacy = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { reason } = req.body; // Optional reason from admin

    const video = await Video.findById(videoId);

    if (!video) {
      return next(createError(404, 'Video not found'));
    }

    const wasPaused = video.privacy === 'Private';

    // Toggle between Public and Private
    video.privacy = video.privacy === 'Public' ? 'Private' : 'Public';
    await video.save();

    // Send notification to content owner if paused
    if (video.privacy === 'Private' && !wasPaused) {
      const contentType = video.type === 'image' ? 'post' : 'video';
      let notificationMessage = `Action required: Your ${contentType} has been paused. Please review the content guidelines.`;

      if (reason) {
        notificationMessage += ` Reason: ${reason}`;
      }

      const notification = await Notification.create({
        recipient: video.userId,
        sender: req.user.id,
        type: 'content_paused',
        message: notificationMessage,
        relatedVideo: videoId,
        adminReason: reason || null,
      });

      // Populate sender info
      await notification.populate(
        'sender',
        'username displayName displayImage'
      );
    }

    res.status(200).json({
      success: true,
      message: `Video ${
        video.privacy === 'Private' ? 'paused' : 'unpaused'
      } successfully`,
      video,
    });
  } catch (error) {
    next(error);
  }
};

// Transfer video to another user
export const transferVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return next(createError(400, 'Target user ID is required'));
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return next(createError(404, 'Target user not found'));
    }

    // Find and update the video
    const video = await Video.findById(videoId);
    if (!video) {
      return next(createError(404, 'Video not found'));
    }

    // Update the video's userId
    video.userId = targetUserId;
    await video.save();

    // Get updated video with user data
    const updatedVideo = video.toObject();
    updatedVideo.userId = {
      _id: targetUser._id,
      username: targetUser.username,
      displayName: targetUser.displayName,
      displayImage: targetUser.displayImage,
    };

    res.status(200).json({
      success: true,
      message: `Video transferred to ${
        targetUser.displayName || targetUser.username
      } successfully`,
      video: updatedVideo,
    });
  } catch (error) {
    next(error);
  }
};

// Get all articles
export const getAllArticles = async (req, res, next) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });

    // Manually populate user data
    const articlesWithUserData = await Promise.all(
      articles.map(async (article) => {
        const articleObj = article.toObject();
        try {
          const user = await User.findById(articleObj.author).select(
            'username displayName displayImage'
          );
          articleObj.author = user || {
            username: 'Unknown',
            displayName: 'Unknown User',
            displayImage: null,
          };
        } catch (err) {
          articleObj.author = {
            username: 'Unknown',
            displayName: 'Unknown User',
            displayImage: null,
          };
        }
        return articleObj;
      })
    );

    res.status(200).json({
      success: true,
      articles: articlesWithUserData,
      total: articlesWithUserData.length,
    });
  } catch (error) {
    next(error);
  }
};

// Delete article
export const deleteArticle = async (req, res, next) => {
  try {
    const { articleId } = req.params;

    const article = await Article.findByIdAndDelete(articleId);

    if (!article) {
      return next(createError(404, 'Article not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Toggle article pause status (pause/unpause)
export const toggleArticlePause = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { reason } = req.body; // Optional reason from admin

    const article = await Article.findById(articleId);

    if (!article) {
      return next(createError(404, 'Article not found'));
    }

    const wasPaused = article.isPaused;

    // Toggle pause status
    article.isPaused = !article.isPaused;
    await article.save();

    // Send notification to content owner if paused
    if (article.isPaused && !wasPaused) {
      let notificationMessage = `Action required: Your article has been paused. Please review the content guidelines.`;

      if (reason) {
        notificationMessage += ` Reason: ${reason}`;
      }

      const notification = await Notification.create({
        recipient: article.author,
        sender: req.user.id,
        type: 'content_paused',
        message: notificationMessage,
        relatedArticle: articleId,
        adminReason: reason || null,
      });

      // Populate sender info
      await notification.populate(
        'sender',
        'username displayName displayImage'
      );
    }

    res.status(200).json({
      success: true,
      message: `Article ${
        article.isPaused ? 'paused' : 'unpaused'
      } successfully`,
      article,
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
    const plansMatch = fileContent.match(
      /export const pricingPlans = ({[\s\S]*?});/
    );

    if (!plansMatch) {
      return next(createError(500, 'Failed to parse pricing plans'));
    }

    // Extract the pricing config object using regex
    const configMatch = fileContent.match(
      /export const pricingConfig = ({[\s\S]*?});/
    );

    // Parse the JSON objects
    const pricingPlans = JSON.parse(plansMatch[1]);
    const pricingConfig = configMatch ? JSON.parse(configMatch[1]) : {};

    res.status(200).json({
      success: true,
      pricingPlans,
      pricingConfig,
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
        typeof plan.totalStorageLimit !== 'number' ||
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

export const getTotalStorageLimit = (user) => {
  if (user.role === 'admin') {
    return 102400;
  }

  if (user.subscription?.isPaid && user.subscription?.plan) {
    return pricingPlans[user.subscription.plan]?.totalStorageLimit || 100;
  }

  return pricingPlans.free?.totalStorageLimit || 100;
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
        storageProvider: 'local',
        localStorageConfig: { enabled: true, maxSizeGB: 75 },
        cloudinaryConfig: { enabled: true },
        youtubeConfig: { enabled: false, defaultPrivacy: 'unlisted' },
      });
    }

    // Check if YouTube is properly configured in environment
    const youtubeConfigured = isYouTubeConfigured();

    // Get disk space information for local storage
    let diskSpace = null;
    try {
      diskSpace = await getDiskSpace();
    } catch (error) {
      console.error('Error getting disk space:', error);
    }

    res.status(200).json({
      success: true,
      storageProvider: settings.storageProvider,
      localStorageConfig: {
        ...settings.localStorageConfig,
        diskSpace: diskSpace,
      },
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
    const {
      storageProvider,
      youtubeConfig,
      cloudinaryConfig,
      localStorageConfig,
    } = req.body;

    // Validate storage provider
    if (
      storageProvider &&
      !['local', 'cloudinary', 'youtube'].includes(storageProvider)
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
        storageProvider: storageProvider || 'local',
        localStorageConfig: localStorageConfig || {
          enabled: true,
          maxSizeGB: 75,
        },
        cloudinaryConfig: cloudinaryConfig || { enabled: true },
        youtubeConfig: youtubeConfig || {
          enabled: false,
          defaultPrivacy: 'unlisted',
        },
      });
    } else {
      if (storageProvider) settings.storageProvider = storageProvider;
      if (localStorageConfig)
        settings.localStorageConfig = {
          ...settings.localStorageConfig,
          ...localStorageConfig,
        };
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
        localStorageConfig: settings.localStorageConfig,
        cloudinaryConfig: settings.cloudinaryConfig,
        youtubeConfig: settings.youtubeConfig,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Stripe settings
export const getStripeSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({
        stripeConfig: {
          enabled: false,
          mode: 'test',
          currency: 'usd',
        },
      });
    }

    // Don't send secret keys to frontend, only indicate if they're set
    const stripeConfig = {
      enabled: settings.stripeConfig?.enabled || false,
      mode: settings.stripeConfig?.mode || 'test',
      currency: settings.stripeConfig?.currency || 'usd',
      testPublishableKey: settings.stripeConfig?.testPublishableKey || '',
      livePublishableKey: settings.stripeConfig?.livePublishableKey || '',
      webhookSecret: settings.stripeConfig?.webhookSecret || '',
      hasTestSecretKey: !!settings.stripeConfig?.testSecretKey,
      hasLiveSecretKey: !!settings.stripeConfig?.liveSecretKey,
    };

    res.status(200).json({
      success: true,
      stripeConfig,
    });
  } catch (error) {
    next(error);
  }
};

// Update Stripe settings
export const updateStripeSettings = async (req, res, next) => {
  try {
    const { stripeConfig } = req.body;

    if (!stripeConfig) {
      return next(createError(400, 'Stripe configuration is required'));
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        stripeConfig: {
          enabled: stripeConfig.enabled || false,
          mode: stripeConfig.mode || 'test',
          currency: stripeConfig.currency || 'usd',
          testPublishableKey: stripeConfig.testPublishableKey || '',
          testSecretKey: stripeConfig.testSecretKey || '',
          livePublishableKey: stripeConfig.livePublishableKey || '',
          liveSecretKey: stripeConfig.liveSecretKey || '',
          webhookSecret: stripeConfig.webhookSecret || '',
        },
      });
    } else {
      // Update only provided fields, preserve existing secret keys if not provided
      settings.stripeConfig = {
        enabled:
          stripeConfig.enabled ?? settings.stripeConfig?.enabled ?? false,
        mode: stripeConfig.mode || settings.stripeConfig?.mode || 'test',
        currency:
          stripeConfig.currency || settings.stripeConfig?.currency || 'usd',
        testPublishableKey:
          stripeConfig.testPublishableKey ??
          settings.stripeConfig?.testPublishableKey ??
          '',
        testSecretKey:
          stripeConfig.testSecretKey ||
          settings.stripeConfig?.testSecretKey ||
          '',
        livePublishableKey:
          stripeConfig.livePublishableKey ??
          settings.stripeConfig?.livePublishableKey ??
          '',
        liveSecretKey:
          stripeConfig.liveSecretKey ||
          settings.stripeConfig?.liveSecretKey ||
          '',
        webhookSecret:
          stripeConfig.webhookSecret ??
          settings.stripeConfig?.webhookSecret ??
          '',
      };
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Stripe settings updated successfully',
      stripeConfig: {
        enabled: settings.stripeConfig.enabled,
        mode: settings.stripeConfig.mode,
        currency: settings.stripeConfig.currency,
        hasTestSecretKey: !!settings.stripeConfig.testSecretKey,
        hasLiveSecretKey: !!settings.stripeConfig.liveSecretKey,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get pending reviews (videos and articles)
export const getPendingReviews = async (req, res, next) => {
  try {
    // Find videos pending review (paused and pendingReview = true)
    const videos = await Video.find({
      privacy: 'Private',
      pendingReview: true,
    })
      .sort({ reviewRequestedAt: -1 })
      .lean();

    // Manually populate user data for videos
    const videosWithUserData = await Promise.all(
      videos.map(async (video) => {
        const user = await User.findById(video.userId).select(
          'username displayName displayImage'
        );
        return {
          ...video,
          user,
          contentType: 'video',
        };
      })
    );

    // Find articles pending review
    const articles = await Article.find({
      isPaused: true,
      pendingReview: true,
    })
      .populate('author', 'username displayName profilePic')
      .sort({ reviewRequestedAt: -1 })
      .lean();

    const articlesWithType = articles.map((article) => ({
      ...article,
      contentType: 'article',
    }));

    // Combine and sort by reviewRequestedAt
    const allPendingReviews = [...videosWithUserData, ...articlesWithType].sort(
      (a, b) => new Date(b.reviewRequestedAt) - new Date(a.reviewRequestedAt)
    );

    res.status(200).json({
      success: true,
      total: allPendingReviews.length,
      reviews: allPendingReviews,
    });
  } catch (error) {
    next(error);
  }
};

// Approve review (unpause content)
export const approveReview = async (req, res, next) => {
  try {
    const { contentId, contentType } = req.params;
    const { notes } = req.body;

    let content;
    let Model;
    let notificationField;

    if (contentType === 'video') {
      Model = Video;
      notificationField = 'relatedVideo';
      content = await Video.findById(contentId);

      if (!content) {
        return next(createError(404, 'Video not found'));
      }

      // Unpause video
      content.privacy = 'Public';
      content.pendingReview = false;
      content.lastReviewedBy = req.user.id;
      content.reviewNotes = notes || '';
      await content.save();
    } else if (contentType === 'article') {
      Model = Article;
      notificationField = 'relatedArticle';
      content = await Article.findById(contentId);

      if (!content) {
        return next(createError(404, 'Article not found'));
      }

      // Unpause article
      content.isPaused = false;
      content.pendingReview = false;
      content.lastReviewedBy = req.user.id;
      content.reviewNotes = notes || '';
      await content.save();
    } else {
      return next(createError(400, 'Invalid content type'));
    }

    // Notify content owner
    const ownerId = contentType === 'video' ? content.userId : content.author;

    await Notification.create({
      recipient: ownerId,
      sender: req.user.id,
      type: 'review_approved',
      message: `Great news! Your ${contentType} has been reviewed and approved. It's now public again.${
        notes ? ` Admin note: ${notes}` : ''
      }`,
      [notificationField]: contentId,
    });

    res.status(200).json({
      success: true,
      message: `${
        contentType.charAt(0).toUpperCase() + contentType.slice(1)
      } approved and unpaused successfully`,
      content,
    });
  } catch (error) {
    next(error);
  }
};

// Reject review (keep content paused)
export const rejectReview = async (req, res, next) => {
  try {
    const { contentId, contentType } = req.params;
    const { notes } = req.body;

    if (!notes || notes.trim() === '') {
      return next(createError(400, 'Rejection reason is required'));
    }

    let content;
    let notificationField;

    if (contentType === 'video') {
      notificationField = 'relatedVideo';
      content = await Video.findById(contentId);

      if (!content) {
        return next(createError(404, 'Video not found'));
      }

      // Keep paused but clear pendingReview flag
      content.pendingReview = false;
      content.lastReviewedBy = req.user.id;
      content.reviewNotes = notes;
      await content.save();
    } else if (contentType === 'article') {
      notificationField = 'relatedArticle';
      content = await Article.findById(contentId);

      if (!content) {
        return next(createError(404, 'Article not found'));
      }

      // Keep paused but clear pendingReview flag
      content.pendingReview = false;
      content.lastReviewedBy = req.user.id;
      content.reviewNotes = notes;
      await content.save();
    } else {
      return next(createError(400, 'Invalid content type'));
    }

    // Notify content owner
    const ownerId = contentType === 'video' ? content.userId : content.author;

    await Notification.create({
      recipient: ownerId,
      sender: req.user.id,
      type: 'review_rejected',
      message: `Your ${contentType} review was not approved. Reason: ${notes}. Please make the necessary changes and resubmit.`,
      [notificationField]: contentId,
      adminReason: notes,
    });

    res.status(200).json({
      success: true,
      message: `${
        contentType.charAt(0).toUpperCase() + contentType.slice(1)
      } review rejected`,
      content,
    });
  } catch (error) {
    next(error);
  }
};
