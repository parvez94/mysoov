import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import axios from 'axios';

const Container = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
  margin: 20px;
  max-width: 500px;
`;

const Title = styled.h3`
  color: #fff;
  margin-bottom: 16px;
  font-family: var(--primary-fonts);
`;

const Input = styled.input`
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 8px 12px;
  color: #fff;
  margin-bottom: 12px;
  font-family: var(--secondary-fonts);

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  cursor: pointer;
  font-family: var(--secondary-fonts);
  font-weight: 500;
  margin-right: 8px;

  &:hover {
    background-color: var(--primary-color-hover, #1976d2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Result = styled.div`
  margin-top: 16px;
  padding: 12px;
  border-radius: 4px;
  font-family: var(--secondary-fonts);
  font-size: 14px;

  &.success {
    background-color: rgba(76, 175, 80, 0.1);
    border: 1px solid rgba(76, 175, 80, 0.3);
    color: #4caf50;
  }

  &.error {
    background-color: rgba(244, 67, 54, 0.1);
    border: 1px solid rgba(244, 67, 54, 0.3);
    color: #f44336;
  }
`;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100';

const NotificationTest = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [targetUserId, setTargetUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const sendTestNotification = async () => {
    if (!targetUserId.trim()) {
      setResult({ type: 'error', message: 'Please enter a target user ID' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/v1/notifications/test`,
        { targetUserId: targetUserId.trim() },
        { withCredentials: true }
      );

      setResult({
        type: 'success',
        message: `Test notification sent successfully! Notification ID: ${
          response.data.notification?._id || 'undefined'
        }`,
      });
    } catch (error) {
      setResult({
        type: 'error',
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to send test notification',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>🔔 Notification Test</Title>
      {currentUser && (
        <div
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '12px',
            fontSize: '14px',
          }}
        >
          Your User ID:{' '}
          <strong style={{ color: '#fff' }}>{currentUser._id}</strong>
        </div>
      )}
      <Input
        type='text'
        placeholder='Enter target user ID'
        value={targetUserId}
        onChange={(e) => setTargetUserId(e.target.value)}
      />
      <Button onClick={sendTestNotification} disabled={loading}>
        {loading ? 'Sending...' : 'Send Test Notification'}
      </Button>

      {result && <Result className={result.type}>{result.message}</Result>}
    </Container>
  );
};

export default NotificationTest;
