import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

const API = import.meta.env.VITE_API_URL;

export const useUsernameCheck = (username, originalUsername = '') => {
  const [status, setStatus] = useState('idle'); // 'idle', 'checking', 'available', 'unavailable', 'error'
  const [message, setMessage] = useState('');
  const [isValid, setIsValid] = useState(true);

  const { currentUser } = useSelector((state) => state.user);

  const checkUsername = useCallback(
    async (usernameToCheck) => {
      // Don't check if username is empty or same as original
      if (!usernameToCheck || usernameToCheck === originalUsername) {
        setStatus('idle');
        setMessage('');
        setIsValid(true);
        return;
      }

      // Basic validation
      if (usernameToCheck.length < 2) {
        setStatus('unavailable');
        setMessage('Username must be at least 2 characters long');
        setIsValid(false);
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(usernameToCheck)) {
        setStatus('unavailable');
        setMessage(
          'Username can only contain letters, numbers, and underscores'
        );
        setIsValid(false);
        return;
      }

      setStatus('checking');
      setMessage('Checking availability...');
      setIsValid(true);

      try {
        const url = `${API}/api/v1/users/check-username/${encodeURIComponent(
          usernameToCheck
        )}${currentUser?._id ? `?currentUserId=${currentUser._id}` : ''}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (data.available) {
          setStatus('available');
          setMessage('Username is available');
          setIsValid(true);
        } else {
          setStatus('unavailable');
          setMessage(data.message || 'Username is not available');
          setIsValid(false);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Error checking username availability');
        setIsValid(false);
        console.error('Username check error:', error);
      }
    },
    [originalUsername, currentUser?._id]
  );

  // Debounced effect to check username
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkUsername(username);
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [username, checkUsername]);

  return {
    status,
    message,
    isValid,
    isChecking: status === 'checking',
    isAvailable: status === 'available',
    isUnavailable: status === 'unavailable',
    hasError: status === 'error',
  };
};
