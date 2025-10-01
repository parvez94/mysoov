import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Store active users and their socket connections
const activeUsers = new Map();

// Socket authentication middleware
export const authenticateSocket = async (socket, next) => {
  let cookieObj = {};

  try {
    // Get token from cookies
    const cookies = socket.handshake.headers.cookie;

    if (!cookies) {
      return next(new Error('Authentication error: No cookies provided'));
    }

    // Parse cookies to get access_token
    cookies.split(';').forEach((cookie) => {
      const [key, value] = cookie.trim().split('=');
      cookieObj[key] = value;
    });

    const token = cookieObj.access_token;

    if (!token) {
      return next(
        new Error('Authentication error: No access token in cookies')
      );
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    console.log('🔌 Socket authentication error:', error.message);
    console.log('🔌 Token:', cookieObj?.access_token ? 'Present' : 'Missing');
    next(new Error(`Authentication error: ${error.message}`));
  }
};

// Handle socket connections
export const handleConnection = (io, socket) => {
  console.log(
    `User ${socket.userId} (${socket.user.username}) connected with socket ${socket.id}`
  );

  // Add user to active users
  activeUsers.set(socket.userId, {
    socketId: socket.id,
    user: socket.user,
    lastSeen: new Date(),
  });

  // Join user to their personal room for notifications
  const roomName = `user_${socket.userId}`;
  socket.join(roomName);
  console.log(`🔌 User ${socket.userId} joined personal room: ${roomName}`);
  console.log(
    '🔌 User ID type:',
    typeof socket.userId,
    'Value:',
    socket.userId
  );

  // Emit online status to all users
  socket.broadcast.emit('userOnline', {
    userId: socket.userId,
    username: socket.user.username,
  });

  // Handle joining conversation rooms
  socket.on('joinConversation', (conversationId) => {
    const roomName = `conversation_${conversationId}`;
    socket.join(roomName);
    console.log(`User ${socket.userId} joined room: ${roomName}`);
  });

  // Handle leaving conversation rooms
  socket.on('leaveConversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  // Handle typing indicators
  socket.on('typing', ({ conversationId, userId }) => {
    socket.to(`conversation_${conversationId}`).emit('userTyping', {
      conversationId,
      userId: socket.userId,
      username: socket.user.username,
    });
  });

  socket.on('stopTyping', ({ conversationId, userId }) => {
    socket.to(`conversation_${conversationId}`).emit('userStoppedTyping', {
      conversationId,
      userId: socket.userId,
      username: socket.user.username,
    });
  });

  // Handle message read status
  socket.on('markMessageRead', ({ messageId, conversationId }) => {
    socket.to(`conversation_${conversationId}`).emit('messageRead', {
      messageId,
      readBy: socket.userId,
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Remove user from active users
    activeUsers.delete(socket.userId);

    // Emit offline status to all users
    socket.broadcast.emit('userOffline', {
      userId: socket.userId,
      username: socket.user.username,
    });
  });
};

// Utility functions
export const getActiveUsers = () => {
  return Array.from(activeUsers.values()).map((user) => ({
    userId: user.user._id,
    username: user.user.username,
    displayName: user.user.displayName,
    displayImage: user.user.displayImage,
    lastSeen: user.lastSeen,
  }));
};

export const isUserOnline = (userId) => {
  return activeUsers.has(userId.toString());
};

export const getUserSocket = (userId) => {
  const user = activeUsers.get(userId.toString());
  return user ? user.socketId : null;
};

export { activeUsers };
