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
    next(new Error(`Authentication error: ${error.message}`));
  }
};

// Handle socket connections
export const handleConnection = (io, socket) => {
  // Add user to active users
  activeUsers.set(socket.userId, {
    socketId: socket.id,
    user: socket.user,
    lastSeen: new Date(),
  });

  // Join user to their personal room for notifications
  const roomName = `user_${socket.userId}`;
  socket.join(roomName);

  // Emit online status to all users
  socket.broadcast.emit('userOnline', {
    userId: socket.userId,
    username: socket.user.username,
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
