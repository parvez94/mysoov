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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5100';

      // Create socket connection - using cookies for authentication
      const newSocket = io(apiUrl, {
        withCredentials: true, // This will send cookies for authentication
        transports: ['websocket'], // Use websocket only
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 5,
        maxReconnectionAttempts: 5,
        forceNew: true,
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ Socket.IO connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error.message);
        setIsConnected(false);

        // If it's a WebSocket error on production, disable further attempts
        if (isProduction && error.message.includes('websocket')) {
          newSocket.disconnect();
          setSocket(null);
        }
      });

      newSocket.on('reconnect', (attemptNumber) => {
        setIsConnected(true);
      });

      newSocket.on('reconnect_error', (error) => {
        // Silent error handling
      });

      newSocket.on('reconnect_failed', () => {
        setIsConnected(false);
        setSocket(null);
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
