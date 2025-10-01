import express from 'express';
import { verifyToken } from '../utils/verifyToken.js';
import {
  getOrCreateConversation,
  getConversations,
  sendMessage,
  getMessages,
  deleteMessage,
  getUnreadCount,
  markConversationAsRead,
} from '../controllers/messageCtrl.js';

const router = express.Router();

// Get user conversations
router.get('/conversations', verifyToken, getConversations);

// Get unread message count
router.get('/unread-count', verifyToken, getUnreadCount);

// Get or create conversation with specific user
router.get('/conversations/:recipientId', verifyToken, getOrCreateConversation);

// Send message to user
router.post('/send/:recipientId', verifyToken, sendMessage);

// Get messages in a conversation
router.get('/conversation/:conversationId', verifyToken, getMessages);

// Mark conversation as read
router.put(
  '/conversation/:conversationId/read',
  verifyToken,
  markConversationAsRead
);

// Delete message
router.delete('/:messageId', verifyToken, deleteMessage);

export default router;
