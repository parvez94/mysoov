import express from 'express';
import { verifyToken } from '../utils/verifyToken.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from '../controllers/notificationCtrl.js';

const router = express.Router();

// Get user notifications
router.get('/', verifyToken, getNotifications);

// Get unread notification count
router.get('/unread-count', verifyToken, getUnreadCount);

// Mark notification as read
router.patch('/:notificationId/read', verifyToken, markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', verifyToken, markAllAsRead);

// Delete notification
router.delete('/:notificationId', verifyToken, deleteNotification);

export default router;
