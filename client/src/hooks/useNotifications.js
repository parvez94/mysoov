import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { globalEventEmitter, EVENTS } from '../utils/eventEmitter';
import { playNotificationSound } from '../utils/soundUtils';
import { usePollingConfig } from './usePollingConfig';
import { useSSE } from './useSSE';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { socket } = useSocket();
  const { config, isPollingMode } = usePollingConfig();

  // SSE message handler
  const handleSSEMessage = useCallback((data) => {
    if (data.type === 'notification') {
      const notification = data.data;

      setNotifications((prev) => {
        return [notification, ...prev];
      });

      setUnreadCount((prev) => {
        return prev + 1;
      });

      // Play notification sound
      playNotificationSound();

      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('New Notification', {
          body: notification.message,
          icon: '/default-user.png',
        });
      }
    }
  }, []);

  // Use SSE when Socket.IO is not available
  const { isConnected: sseConnected } = useSSE(
    'notifications',
    handleSSEMessage,
    !socket && isPollingMode
  );

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

  // Socket event handlers and polling fallback
  useEffect(() => {
    let pollingInterval;

    if (socket) {
      console.log(
        '🔔 Setting up newNotification listener on socket:',
        socket.id
      );

      // Real-time notifications via Socket.IO
      socket.on('newNotification', (notification) => {
        console.log('🔔 Received newNotification event:', notification);
        setNotifications((prev) => {
          return [notification, ...prev];
        });
        setUnreadCount((prev) => {
          return prev + 1;
        });

        // Play notification sound
        console.log('🔔 About to play notification sound...');
        playNotificationSound();
        console.log('🔔 playNotificationSound() called');

        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('New Notification', {
            body: notification.message,
            icon: '/default-user.png',
          });
        }
      });

      return () => {
        console.log('🔔 Removing newNotification listener');
        socket.off('newNotification');
      };
    } else {
      // Fallback: Poll for notifications when Socket.IO is not available
      let lastUnreadCount = unreadCount;

      const pollForNotifications = async () => {
        try {
          const response = await axios.get(
            `${API_URL}/api/v1/notifications/unread-count`,
            { withCredentials: true }
          );

          if (response.data.success) {
            const newUnreadCount = response.data.unreadCount;

            // If unread count increased, fetch latest notifications
            if (newUnreadCount > lastUnreadCount) {
              // Fetch latest notifications to get the new ones
              const notifResponse = await axios.get(
                `${API_URL}/api/v1/notifications?page=1&limit=5`,
                { withCredentials: true }
              );

              if (notifResponse.data.success) {
                const latestNotifications = notifResponse.data.notifications;

                // Find new notifications (ones not in current state)
                const currentIds = new Set(notifications.map((n) => n._id));
                const newNotifications = latestNotifications.filter(
                  (n) => !currentIds.has(n._id)
                );

                if (newNotifications.length > 0) {
                  // Add new notifications to the beginning of the list
                  setNotifications((prev) => [...newNotifications, ...prev]);

                  // Play notification sound for new notifications
                  playNotificationSound();

                  // Show browser notification for the most recent one
                  if (
                    Notification.permission === 'granted' &&
                    newNotifications[0]
                  ) {
                    new Notification('New Notification', {
                      body: newNotifications[0].message,
                      icon: '/default-user.png',
                    });
                  }
                }
              }
            }

            setUnreadCount(newUnreadCount);
            lastUnreadCount = newUnreadCount;
          }
        } catch (err) {
          // Silent error handling
        }
      };

      // Poll using configured interval
      pollingInterval = setInterval(
        pollForNotifications,
        config.notifications.interval
      );

      // Initial poll
      pollForNotifications();

      return () => {
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
      };
    }
  }, [socket, unreadCount, notifications]);

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
