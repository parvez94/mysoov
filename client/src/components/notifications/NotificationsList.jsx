import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem';
import Spinner from '../Spinner';

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.2);
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Title = styled.h1`
  font-family: var(--secondary-fonts);
  color: #fff;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
`;

const ActionButton = styled.button`
  background: none;
  border: 1px solid var(--secondary-color);
  color: var(--secondary-color);
  padding: 10px 20px;
  border-radius: 8px;
  font-family: var(--secondary-fonts);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--secondary-color);
    color: var(--tertiary-color);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NotificationsList = styled.div`
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: var(--secondary-color);
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.6;
`;

const EmptyText = styled.p`
  font-family: var(--primary-fonts);
  font-size: 18px;
  margin: 0;
  opacity: 0.8;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
`;

const ErrorMessage = styled.div`
  background-color: rgba(202, 8, 6, 0.1);
  border: 1px solid rgba(202, 8, 6, 0.3);
  color: var(--primary-color);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  text-align: center;
  font-family: var(--primary-fonts);
  font-size: 16px;
`;

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (loading && notifications.length === 0) {
    return (
      <Container>
        <LoadingContainer>
          <Spinner />
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          Notifications
          {unreadCount > 0 && ` (${unreadCount} unread)`}
        </Title>
        <HeaderActions>
          {unreadCount > 0 && (
            <ActionButton onClick={markAllAsRead}>
              Mark all as read
            </ActionButton>
          )}
        </HeaderActions>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {notifications.length === 0 ? (
        <NotificationsList>
          <EmptyState>
            <EmptyIcon>🔔</EmptyIcon>
            <EmptyText>No notifications yet</EmptyText>
          </EmptyState>
        </NotificationsList>
      ) : (
        <NotificationsList>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))}
        </NotificationsList>
      )}
    </Container>
  );
};

export default NotificationsPage;
