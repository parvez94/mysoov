import express from 'express';
import {
  getAllUsers,
  getAllVideos,
  getDashboardStats,
  updateUser,
  deleteUser,
  deleteVideo,
  getAllAdmins,
  searchUsers,
  promoteToAdmin,
  demoteFromAdmin,
} from '../controllers/adminCtrl.js';
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

// Admin management
router.get('/admins', getAllAdmins);
router.put('/users/:userId/promote', promoteToAdmin);
router.put('/users/:userId/demote', demoteFromAdmin);

export default router;
