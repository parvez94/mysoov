import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import { createError } from '../utils/error.js';

// Helper function to generate conversation ID
const generateConversationId = (userId1, userId2) => {
  const sortedIds = [userId1, userId2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

// Get or create conversation
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { recipientId } = req.params;
    const senderId = req.user.id;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return next(createError(404, 'User not found'));
    }

    const conversationId = generateConversationId(senderId, recipientId);

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    })
      .populate('participants', 'username displayName displayImage')
      .populate('lastMessage');

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        unreadCount: new Map([
          [senderId, 0],
          [recipientId, 0],
        ]),
      });
      await conversation.save();
      await conversation.populate(
        'participants',
        'username displayName displayImage'
      );
    }

    res.status(200).json({
      success: true,
      conversation,
      conversationId,
    });
  } catch (error) {
    next(error);
  }
};

// Get user conversations
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'username displayName displayImage')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalConversations = await Conversation.countDocuments({
      participants: userId,
    });

    res.status(200).json({
      success: true,
      conversations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalConversations / limit),
        totalConversations,
        hasNextPage: page < Math.ceil(totalConversations / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Send message
export const sendMessage = async (req, res, next) => {
  try {
    const { recipientId } = req.params;
    const { content, messageType = 'text' } = req.body;
    const senderId = req.user.id;

    if (!content || content.trim() === '') {
      return next(createError(400, 'Message content is required'));
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return next(createError(404, 'Recipient not found'));
    }

    const conversationId = generateConversationId(senderId, recipientId);

    // Create message
    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content: content.trim(),
      messageType,
      conversationId,
    });

    await message.save();
    await message.populate('sender', 'username displayName displayImage');
    await message.populate('recipient', 'username displayName displayImage');

    // Update or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessage: message._id,
        lastMessageAt: new Date(),
        unreadCount: new Map([
          [senderId, 0],
          [recipientId, 1],
        ]),
      });
    } else {
      conversation.lastMessage = message._id;
      conversation.lastMessageAt = new Date();

      // Increment unread count for recipient
      const currentUnreadCount = conversation.unreadCount.get(recipientId) || 0;
      conversation.unreadCount.set(recipientId, currentUnreadCount + 1);
    }

    await conversation.save();

    // Emit real-time message if socket.io is available
    if (global.io) {
      const messageData = {
        _id: message._id,
        sender: message.sender,
        recipient: message.recipient,
        content: message.content,
        createdAt: message.createdAt,
        conversationId: message.conversationId, // Use the string conversationId from message, not the MongoDB ObjectId
      };

      console.log('Emitting message to rooms:', {
        recipientRoom: `user_${recipientId}`,
        conversationRoom: `conversation_${conversation._id}`,
        messageData,
      });

      // Send to recipient's personal room (for notifications)
      global.io.to(`user_${recipientId}`).emit('newMessage', messageData);

      // Send to conversation room (for real-time chat updates)
      // This will include both sender and recipient if they're in the conversation
      global.io
        .to(`conversation_${conversation._id}`)
        .emit('messageReceived', messageData);
    }

    res.status(201).json({
      success: true,
      message,
      conversationId,
    });
  } catch (error) {
    next(error);
  }
};

// Get messages in a conversation
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return next(createError(403, 'Access denied to this conversation'));
    }

    // Generate the string conversationId used in messages
    const participants = conversation.participants
      .map((p) => p.toString())
      .sort();
    const stringConversationId = `${participants[0]}_${participants[1]}`;

    const messages = await Message.find({
      conversationId: stringConversationId,
    })
      .populate('sender', 'username displayName displayImage')
      .populate('recipient', 'username displayName displayImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalMessages = await Message.countDocuments({
      conversationId: stringConversationId,
    });

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId: stringConversationId,
        recipient: userId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    // Reset unread count for this user
    if (conversation) {
      conversation.unreadCount.set(userId, 0);
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasNextPage: page < Math.ceil(totalMessages / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete message
export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findOneAndDelete({
      _id: messageId,
      sender: userId,
    });

    if (!message) {
      return next(createError(404, 'Message not found or access denied'));
    }

    // Emit real-time message deletion if socket.io is available
    if (global.io) {
      global.io
        .to(`conversation_${message.conversationId}`)
        .emit('messageDeleted', {
          messageId,
          conversationId: message.conversationId,
        });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get unread message count
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId,
    });

    let totalUnreadCount = 0;
    conversations.forEach((conversation) => {
      const unreadCount = conversation.unreadCount.get(userId) || 0;
      console.log(
        `Conversation ${conversation._id} - unread count for user ${userId}:`,
        unreadCount
      );
      totalUnreadCount += unreadCount;
    });

    console.log('Total unread count for user:', totalUnreadCount);
    res.status(200).json({
      success: true,
      unreadCount: totalUnreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// Mark conversation as read
export const markConversationAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    // Find the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return next(createError(403, 'Access denied to this conversation'));
    }

    // Generate the string conversationId used in messages
    const participants = conversation.participants
      .map((p) => p.toString())
      .sort();
    const stringConversationId = `${participants[0]}_${participants[1]}`;

    // Mark all messages in this conversation as read for this user
    await Message.updateMany(
      {
        conversationId: stringConversationId,
        recipient: userId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    // Reset unread count for this user in this conversation
    console.log(
      'Before reset - unreadCount for user:',
      conversation.unreadCount.get(userId)
    );
    conversation.unreadCount.set(userId, 0);
    await conversation.save();
    console.log(
      'After reset - unreadCount for user:',
      conversation.unreadCount.get(userId)
    );

    res.status(200).json({
      success: true,
      message: 'Conversation marked as read',
    });
  } catch (error) {
    next(error);
  }
};
