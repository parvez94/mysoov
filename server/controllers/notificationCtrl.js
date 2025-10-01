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
    console.log('🔔 Creating notification with params:', {
      recipientId: recipientId.toString(),
      senderId: senderId.toString(),
      type,
      message,
    });

    // Convert to strings for comparison
    const recipientIdStr = recipientId.toString();
    const senderIdStr = senderId.toString();

    // Don't create notification if sender and recipient are the same
    if (recipientIdStr === senderIdStr) {
      console.log(
        '🔔 Skipping notification - sender and recipient are the same'
      );
      console.log('🔔 Sender ID:', senderIdStr);
      console.log('🔔 Recipient ID:', recipientIdStr);
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

    console.log('🔔 Saving notification to database...');
    await notification.save();
    console.log(
      '🔔 Notification saved successfully with ID:',
      notification._id
    );

    // Populate sender information
    await notification.populate('sender', 'username displayName displayImage');

    // Emit real-time notification if socket.io is available
    if (global.io) {
      const roomName = `user_${recipientIdStr}`;
      console.log('🔔 ===== SOCKET EMISSION DEBUG =====');
      console.log('🔔 Emitting notification to user room:', roomName);
      console.log('🔔 Recipient ID:', recipientIdStr);
      console.log('🔔 Notification type:', notification.type);
      console.log('🔔 Notification message:', notification.message);

      // Get all rooms to see what's available
      const rooms = global.io.sockets.adapter.rooms;
      console.log('🔔 Available rooms:', Array.from(rooms.keys()));

      // Check if the target room exists
      const targetRoom = rooms.get(roomName);
      console.log('🔔 Target room exists:', !!targetRoom);
      if (targetRoom) {
        console.log('🔔 Target room size:', targetRoom.size);
        console.log('🔔 Target room sockets:', Array.from(targetRoom));
      }

      // Get connected sockets count
      console.log(
        '🔔 Total connected sockets:',
        global.io.sockets.sockets.size
      );

      // Emit the notification
      const emitResult = global.io
        .to(roomName)
        .emit('newNotification', notification);
      console.log('🔔 Notification emitted successfully, result:', emitResult);
      console.log('🔔 ===== END SOCKET EMISSION DEBUG =====');
    } else {
      console.log('🔔 Socket.io not available for real-time notification');
    }

    console.log('🔔 Returning notification object:', {
      id: notification._id,
      type: notification.type,
      message: notification.message,
      recipient: notification.recipient,
      sender: notification.sender,
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
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
