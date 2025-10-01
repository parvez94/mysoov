import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { globalEventEmitter, EVENTS } from '../utils/eventEmitter';
import { playNotificationSound } from '../utils/soundUtils';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { socket } = useSocket();

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_URL}/api/v1/notifications?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/notifications/unread-count`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/v1/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        // Emit event to notify other hook instances
        globalEventEmitter.emit(EVENTS.NOTIFICATION_READ, { notificationId });
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/v1/notifications/mark-all-read`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, read: true }))
        );
        setUnreadCount(0);

        // Emit event to notify other hook instances
        globalEventEmitter.emit(EVENTS.NOTIFICATION_ALL_READ);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId) => {
      try {
        const response = await axios.delete(
          `${API_URL}/api/v1/notifications/${notificationId}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          // Update unread count if the deleted notification was unread
          const deletedNotif = notifications.find(
            (n) => n._id === notificationId
          );
          const wasUnread = deletedNotif && !deletedNotif.read;

          setNotifications((prev) =>
            prev.filter((notif) => notif._id !== notificationId)
          );

          if (wasUnread) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }

          // Emit event to notify other hook instances
          globalEventEmitter.emit(EVENTS.NOTIFICATION_DELETED, {
            notificationId,
            wasUnread,
          });
        }
      } catch (err) {
        console.error('Error deleting notification:', err);
      }
    },
    [notifications]
  );

  // Socket event handlers
  useEffect(() => {
    if (socket) {
      // Listen for new notifications
      socket.on('newNotification', (notification) => {
        console.log('🔔 ===== CLIENT NOTIFICATION RECEIVED =====');
        console.log('🔔 Client: Received new notification:', notification);
        console.log('🔔 Notification type:', notification.type);
        console.log('🔔 Notification message:', notification.message);
        console.log('🔔 Notification sender:', notification.sender);
        console.log('🔔 Notification recipient:', notification.recipient);

        setNotifications((prev) => {
          console.log(
            '🔔 Adding notification to state, current count:',
            prev.length
          );
          return [notification, ...prev];
        });
        setUnreadCount((prev) => {
          console.log('🔔 Incrementing unread count from:', prev);
          return prev + 1;
        });

        // Play notification sound
        console.log('🔔 Attempting to play notification sound...');
        playNotificationSound();

        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          console.log('🔔 Showing browser notification...');
          new Notification('New Notification', {
            body: notification.message,
            icon: '/default-user.png',
          });
        } else {
          console.log(
            '🔔 Browser notification permission:',
            Notification.permission
          );
        }
        console.log('🔔 ===== END CLIENT NOTIFICATION RECEIVED =====');
      });

      return () => {
        socket.off('newNotification');
      };
    }
  }, [socket]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Listen for events from other hook instances
  useEffect(() => {
    const handleNotificationRead = ({ notificationId }) => {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const handleAllNotificationsRead = () => {
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    };

    const handleNotificationDeleted = ({ notificationId, wasUnread }) => {
      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    };

    globalEventEmitter.on(EVENTS.NOTIFICATION_READ, handleNotificationRead);
    globalEventEmitter.on(
      EVENTS.NOTIFICATION_ALL_READ,
      handleAllNotificationsRead
    );
    globalEventEmitter.on(
      EVENTS.NOTIFICATION_DELETED,
      handleNotificationDeleted
    );

    return () => {
      globalEventEmitter.off(EVENTS.NOTIFICATION_READ, handleNotificationRead);
      globalEventEmitter.off(
        EVENTS.NOTIFICATION_ALL_READ,
        handleAllNotificationsRead
      );
      globalEventEmitter.off(
        EVENTS.NOTIFICATION_DELETED,
        handleNotificationDeleted
      );
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
