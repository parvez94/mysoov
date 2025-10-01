import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (currentUser) {
      // Create socket connection - using cookies for authentication
      const newSocket = io(
        import.meta.env.VITE_API_URL || 'http://localhost:5100',
        {
          withCredentials: true, // This will send cookies for authentication
          transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
          timeout: 20000,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
          maxReconnectionAttempts: 5,
        }
      );

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('🔌 ===== SOCKET CONNECTION DEBUG =====');
        console.log('🔌 Socket connected successfully, ID:', newSocket.id);
        console.log('🔌 User ID:', currentUser._id);
        console.log('🔌 Expected room name:', `user_${currentUser._id}`);
        console.log('🔌 Socket transport:', newSocket.io.engine.transport.name);
        console.log('🔌 ===== END SOCKET CONNECTION DEBUG =====');
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.log('Socket connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        setIsConnected(true);
      });

      newSocket.on('reconnect_error', (error) => {
        // Handle reconnection errors silently
      });

      // Global message handler for debugging (removed to avoid confusion)

      // Online users handlers
      newSocket.on('userOnline', (user) => {
        setOnlineUsers((prev) => {
          const exists = prev.find((u) => u.userId === user.userId);
          if (!exists) {
            return [...prev, user];
          }
          return prev;
        });
      });

      newSocket.on('userOffline', (user) => {
        setOnlineUsers((prev) => prev.filter((u) => u.userId !== user.userId));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
      };
    } else {
      // Clean up socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
      }
    }
  }, [currentUser]);

  const value = {
    socket,
    isConnected,
    onlineUsers,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
