import { useState, useEffect } from 'react';

// Configuration for polling intervals
const POLLING_CONFIG = {
  notifications: {
    interval: 30000, // 30 seconds
    enabled: true,
  },
  messages: {
    interval: 15000, // 15 seconds
    enabled: true,
  },
  // Can be extended for other features
};

export const usePollingConfig = () => {
  const [isPollingMode, setIsPollingMode] = useState(false);

  useEffect(() => {
    // Check if we're in polling mode (Socket.IO disabled)
    const isSocketDisabled = import.meta.env.VITE_DISABLE_SOCKET_IO === 'true';
    const isProduction = import.meta.env.PROD;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5100';
    const isVercelBackend = apiUrl.includes('vercel.app');

    const pollingMode = isSocketDisabled || (isProduction && isVercelBackend);
    setIsPollingMode(pollingMode);
  }, []);

  return {
    isPollingMode,
    config: POLLING_CONFIG,
  };
};
