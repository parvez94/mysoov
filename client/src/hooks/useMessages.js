import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useSelector } from 'react-redux';
import { globalEventEmitter, EVENTS } from '../utils/eventEmitter';
import { playMessageSound } from '../utils/soundUtils';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100';

export const useMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const { socket } = useSocket();
  const { currentUser } = useSelector((state) => state.user);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_URL}/api/v1/messages/conversations`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId, page = 1) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/messages/conversation/${conversationId}?page=${page}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessages((prev) => ({
          ...prev,
          [conversationId]: response.data.messages,
        }));
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (recipientId, content, messageType = 'text') => {
      try {
        const response = await axios.post(
          `${API_URL}/api/v1/messages/send/${recipientId}`,
          { content, messageType },
          { withCredentials: true }
        );

        if (response.data.success) {
          const { message, conversationId } = response.data;

          // Add message to local state
          setMessages((prev) => ({
            ...prev,
            [conversationId]: [...(prev[conversationId] || []), message],
          }));

          return { success: true, message, conversationId };
        }
      } catch (err) {
        console.error('Error sending message:', err);
        return {
          success: false,
          error: err.response?.data?.message || 'Failed to send message',
        };
      }
    },
    []
  );

  // Get or create conversation
  const getOrCreateConversation = useCallback(async (recipientId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/messages/conversations/${recipientId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        return response.data;
      }
    } catch (err) {
      console.error('Error getting conversation:', err);
      return null;
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (messageId, conversationId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/v1/messages/${messageId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessages((prev) => ({
          ...prev,
          [conversationId]:
            prev[conversationId]?.filter((msg) => msg._id !== messageId) || [],
        }));
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/messages/unread-count`,
        { withCredentials: true }
      );

      if (response.data.success) {
        console.log('Updated unread count:', response.data.unreadCount);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  // Mark conversation as read
  const markConversationAsRead = useCallback(
    async (conversationId) => {
      try {
        const response = await axios.put(
          `${API_URL}/api/v1/messages/conversation/${conversationId}/read`,
          {},
          { withCredentials: true }
        );

        if (response.data.success) {
          console.log('Conversation marked as read, refreshing counts...');
          // Refresh both conversations and unread count
          fetchConversations();
          fetchUnreadCount();

          // Emit event to notify other hook instances
          globalEventEmitter.emit(EVENTS.MESSAGE_READ, { conversationId });
        }
      } catch (err) {
        console.error('Error marking conversation as read:', err);
      }
    },
    [fetchConversations, fetchUnreadCount]
  );

  // Join conversation room
  const joinConversation = useCallback(
    (conversationId) => {
      if (socket) {
        socket.emit('joinConversation', conversationId);
      }
    },
    [socket]
  );

  // Leave conversation room
  const leaveConversation = useCallback(
    (conversationId) => {
      if (socket) {
        socket.emit('leaveConversation', conversationId);
      }
    },
    [socket]
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (conversationId, isTyping) => {
      if (socket) {
        socket.emit('typing', { conversationId, isTyping });
      }
    },
    [socket]
  );

  // Fetch initial unread count when user is available
  useEffect(() => {
    if (currentUser) {
      console.log('Fetching initial unread count for user:', currentUser._id);
      fetchUnreadCount();
    }
  }, [currentUser, fetchUnreadCount]);

  // Listen for events from other hook instances
  useEffect(() => {
    const handleMessageRead = ({ conversationId }) => {
      console.log(
        'Received message read event for conversation:',
        conversationId
      );
      // Refresh unread count when a conversation is marked as read elsewhere
      fetchUnreadCount();
    };

    globalEventEmitter.on(EVENTS.MESSAGE_READ, handleMessageRead);

    return () => {
      globalEventEmitter.off(EVENTS.MESSAGE_READ, handleMessageRead);
    };
  }, [fetchUnreadCount]);

  // Socket event handlers
  useEffect(() => {
    if (socket) {
      // Listen for new messages (notifications only - for unread count)
      socket.on('newMessage', (message) => {
        console.log('Received newMessage notification:', message);

        // Don't process notifications for messages sent by current user
        if (currentUser && message.sender._id === currentUser._id) {
          console.log('Ignoring notification for own message');
          return;
        }

        // Play message sound for incoming messages
        playMessageSound();

        // Update conversations list to show latest message
        setConversations((prev) => {
          // Find the conversation by generating the string conversationId
          const updatedConversations = prev.map((conv) => {
            // Generate string conversationId for comparison
            const participants = conv.participants.map((p) => p._id).sort();
            const stringConversationId = `${participants[0]}_${participants[1]}`;

            if (stringConversationId === message.conversationId) {
              return {
                ...conv,
                lastMessage: {
                  content: message.content,
                  createdAt: message.createdAt,
                },
                lastMessageAt: message.createdAt,
              };
            }
            return conv;
          });

          // Sort conversations by lastMessageAt (most recent first)
          return updatedConversations.sort(
            (a, b) =>
              new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
          );
        });

        // Only increment unread count for notifications (not for messages in active conversation)
        setUnreadCount((prev) => prev + 1);
      });

      // Listen for message received in conversation (real-time chat updates)
      socket.on('messageReceived', (message) => {
        console.log('Received messageReceived in conversation:', message);
        if (message.conversationId) {
          setMessages((prev) => ({
            ...prev,
            [message.conversationId]: [
              ...(prev[message.conversationId] || []),
              message,
            ],
          }));
        }
      });

      // Listen for message deletion
      socket.on('messageDeleted', ({ messageId, conversationId }) => {
        setMessages((prev) => ({
          ...prev,
          [conversationId]:
            prev[conversationId]?.filter((msg) => msg._id !== messageId) || [],
        }));
      });

      // Listen for typing indicators
      socket.on(
        'userTyping',
        ({ userId, username, isTyping, conversationId }) => {
          setTypingUsers((prev) => ({
            ...prev,
            [conversationId]: isTyping
              ? { ...prev[conversationId], [userId]: username }
              : { ...prev[conversationId], [userId]: undefined },
          }));
        }
      );

      return () => {
        socket.off('newMessage');
        socket.off('messageReceived');
        socket.off('messageDeleted');
        socket.off('userTyping');
      };
    }
  }, [socket]);

  return {
    conversations,
    messages,
    unreadCount,
    loading,
    error,
    typingUsers,
    fetchConversations,
    fetchMessages,
    sendMessage,
    getOrCreateConversation,
    deleteMessage,
    fetchUnreadCount,
    markConversationAsRead,
    joinConversation,
    leaveConversation,
    sendTyping,
  };
};
