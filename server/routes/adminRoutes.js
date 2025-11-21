import express from 'express';
import {
  getAllUsers,
  getAllVideos,
  getDashboardStats,
  updateUser,
  deleteUser,
  deleteVideo,
  toggleVideoPrivacy,
  transferVideo,
  getAllArticles,
  deleteArticle,
  toggleArticlePause,
  getAllAdmins,
  searchUsers,
  promoteToAdmin,
  demoteFromAdmin,
  getPricingPlans,
  updatePricingPlans,
  getStorageSettings,
  updateStorageSettings,
  getStripeSettings,
  updateStripeSettings,
  getPendingReviews,
  approveReview,
  rejectReview,
} from '../controllers/adminCtrl.js';
import {
  getEmailConfig,
  updateEmailConfig,
  sendTestEmail,
} from '../controllers/emailSettingsCtrl.js';
import { verifyToken } from '../utils/verifyToken.js';
import { verifyAdmin } from '../middlewares/adminAuth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(verifyAdmin);

// Dashboard stats
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/search', searchUsers);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// Video management
router.get('/videos', getAllVideos);
router.delete('/videos/:videoId', deleteVideo);
router.put('/videos/:videoId/toggle-privacy', toggleVideoPrivacy);
router.put('/videos/:videoId/transfer', transferVideo);

// Article management
router.get('/articles', getAllArticles);
router.delete('/articles/:articleId', deleteArticle);
router.put('/articles/:articleId/toggle-pause', toggleArticlePause);

// Admin management
router.get('/admins', getAllAdmins);
router.put('/users/:userId/promote', promoteToAdmin);
router.put('/users/:userId/demote', demoteFromAdmin);

// Pricing plans management
router.get('/pricing-plans', getPricingPlans);
router.put('/pricing-plans', updatePricingPlans);

// Storage settings management
router.get('/storage-settings', getStorageSettings);
router.put('/storage-settings', updateStorageSettings);

// Stripe settings management
router.get('/stripe-settings', getStripeSettings);
router.put('/stripe-settings', updateStripeSettings);

// Content review management
router.get('/reviews/pending', getPendingReviews);
router.post('/reviews/:contentType/:contentId/approve', approveReview);
router.post('/reviews/:contentType/:contentId/reject', rejectReview);

// Email settings management
router.get('/email-config', getEmailConfig);
router.put('/email-config', updateEmailConfig);
router.post('/test-email', sendTestEmail);

export default router;
