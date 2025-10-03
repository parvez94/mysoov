import React from 'react';
import { usePollingConfig } from '../hooks/usePollingConfig';

const PollingModeIndicator = () => {
  const { isPollingMode } = usePollingConfig();

  if (!isPollingMode) return null;

  return (
    <div className='fixed bottom-4 right-4 bg-blue-100 border border-blue-300 text-blue-800 px-3 py-2 rounded-lg shadow-sm text-sm z-50'>
      <div className='flex items-center gap-2'>
        <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
        <span>Polling mode active</span>
        <div className='text-xs text-blue-600'>(Updates every 15-30s)</div>
      </div>
    </div>
  );
};

export default PollingModeIndicator;
