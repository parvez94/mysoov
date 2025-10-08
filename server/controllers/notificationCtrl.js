import Notification from '../models/Notification.js';
import { createError } from '../utils/error.js';

// Create a new notification
export const createNotification = async (
  recipientId,
  senderId,
  type,
  message,
  relatedVideo = null,
  relatedComment = null
) => {
  try {
    // Convert to strings for comparison
    const recipientIdStr = recipientId.toString();
    const senderIdStr = senderId.toString();

    // Don't create notification if sender and recipient are the same
    if (recipientIdStr === senderIdStr) {
      return null;
    }

    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      relatedVideo,
      relatedComment,
    });

    await notification.save();

    // Populate sender information
    await notification.populate('sender', 'username displayName displayImage');

    // Send real-time notification via Socket.IO
    if (global.io) {
      const roomName = `user_${recipientIdStr}`;
      global.io.to(roomName).emit('newNotification', notification);
    }

    return notification;
  } catch (error) {
    return null;
  }
};

// Get user notifications
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'username displayName displayImage')
      .populate('relatedVideo', 'title thumbnail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNotifications = await Notification.countDocuments({
      recipient: userId,
    });
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalNotifications / limit),
        totalNotifications,
        hasNextPage: page < Math.ceil(totalNotifications / limit),
        hasPrevPage: page > 1,
      },
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return next(createError(404, 'Notification not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// Delete notification
export const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      return next(createError(404, 'Notification not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};
