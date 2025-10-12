import { useState, useEffect, useCallback } from 'react';
import { globalEventEmitter, EVENTS } from '../utils/eventEmitter';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100';

export const useNotifications = (isAuthenticated = false) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      // Silent error handling
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
      // Silent error handling
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
      // Silent error handling
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
        // Silent error handling
      }
    },
    [notifications]
  );

  // Fetch unread count on mount and set up periodic polling
  useEffect(() => {
    // Only fetch if user is authenticated
    if (!isAuthenticated) {
      return;
    }

    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const pollInterval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30 seconds

    // Refresh count when page becomes visible (user switches tabs or navigates)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchUnreadCount, isAuthenticated]);

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

    const handleNotificationCreated = () => {
      // Refresh unread count when a new notification is created
      fetchUnreadCount();
    };

    const handleUnreadCountUpdated = () => {
      // Refresh unread count when explicitly requested
      fetchUnreadCount();
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
    globalEventEmitter.on(
      EVENTS.NOTIFICATION_CREATED,
      handleNotificationCreated
    );
    globalEventEmitter.on(
      EVENTS.UNREAD_COUNT_UPDATED,
      handleUnreadCountUpdated
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
      globalEventEmitter.off(
        EVENTS.NOTIFICATION_CREATED,
        handleNotificationCreated
      );
      globalEventEmitter.off(
        EVENTS.UNREAD_COUNT_UPDATED,
        handleUnreadCountUpdated
      );
    };
  }, [fetchUnreadCount]);

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
