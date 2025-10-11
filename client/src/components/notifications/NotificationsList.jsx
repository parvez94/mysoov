import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem';
import Spinner from '../Spinner';

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h1`
  font-family: var(--secondary-fonts);
  color: #fff;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
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
        <Title>Notifications</Title>
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
