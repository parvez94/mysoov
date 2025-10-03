import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100';

export const useSSE = (endpoint, onMessage, enabled = true) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);

  const connect = useCallback(() => {
    if (!enabled || !currentUser || eventSourceRef.current) {
      return;
    }

    try {
      const eventSource = new EventSource(`${API_URL}/api/v1/sse/${endpoint}`, {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'heartbeat') {
            // Handle heartbeat
            return;
          }

          if (data.type === 'connected') {
            return;
          }

          // Call the message handler
          if (onMessage) {
            onMessage(data);
          }
        } catch (err) {
          // Silent error handling
        }
      };

      eventSource.onerror = (event) => {
        setIsConnected(false);
        setError('Connection error');

        // Close the connection
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt to reconnect after 5 seconds
        if (enabled && currentUser) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      eventSourceRef.current = eventSource;
    } catch (err) {
      setError(err.message);
    }
  }, [endpoint, onMessage, enabled, currentUser]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
    setError(null);
  }, [endpoint]);

  useEffect(() => {
    if (enabled && currentUser) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, currentUser, connect, disconnect]);

  return {
    isConnected,
    error,
    connect,
    disconnect,
  };
};
