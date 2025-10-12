import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { resolveImageUrl } from '../../utils/imageUtils';

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.1);
  background-color: ${(props) =>
    props.read ? 'transparent' : 'rgba(255, 255, 255, 0.03)'};

  &:last-child {
    border-bottom: none;
  }
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.1);
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Message = styled.p`
  font-family: var(--primary-fonts);
  color: #fff;
  font-size: 15px;
  line-height: 1.5;
  margin: 0 0 8px 0;
  font-weight: 400;
`;

const Time = styled.span`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 13px;
  opacity: 0.8;
`;

const AdminReason = styled.div`
  margin-top: 8px;
  padding: 10px;
  background-color: rgba(202, 8, 6, 0.1);
  border-left: 3px solid var(--primary-color);
  border-radius: 4px;
  font-family: var(--secondary-fonts);
  font-size: 13px;
  color: var(--secondary-color);
  line-height: 1.4;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
`;

const ActionButton = styled.button`
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--secondary-color);
  font-size: 13px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  font-family: var(--secondary-fonts);
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`;

const UnreadDot = styled.div`
  width: 10px;
  height: 10px;
  background-color: var(--primary-color);
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 8px;
  box-shadow: 0 0 8px rgba(202, 8, 6, 0.5);
`;

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const handleDelete = () => {
    onDelete(notification._id);
  };

  const handleView = () => {
    // Mark as read when clicking View
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }
  };

  const getNotificationLink = () => {
    switch (notification.type) {
      case 'follow':
        return `/${notification.sender.username}`;
      case 'like':
      case 'comment':
      case 'reply':
        return notification.relatedVideo
          ? `/video/${notification.relatedVideo._id}`
          : '#';
      case 'content_paused':
      case 'content_unpaused':
        // For paused/unpaused content, link to the appropriate content
        if (notification.relatedVideo) {
          return `/video/${notification.relatedVideo._id}`;
        } else if (notification.relatedArticle) {
          return `/blog/${notification.relatedArticle.slug}`;
        }
        return '#';
      case 'review_requested':
        // For review requests, admin should go to dashboard to review the post
        if (notification.relatedVideo) {
          return `/dashboard/posts?highlight=${
            notification.relatedVideo._id || notification.relatedVideo
          }`;
        } else if (notification.relatedArticle) {
          return `/dashboard/articles?highlight=${
            notification.relatedArticle._id || notification.relatedArticle
          }`;
        }
        return '/dashboard/posts';
      case 'review_approved':
      case 'review_rejected':
        // For review responses, user should see their content
        if (notification.relatedVideo) {
          return `/video/${
            notification.relatedVideo._id || notification.relatedVideo
          }`;
        } else if (notification.relatedArticle) {
          return `/blog/${
            notification.relatedArticle.slug || notification.relatedArticle
          }`;
        }
        return '#';
      default:
        return '#';
    }
  };

  return (
    <Container read={notification.read}>
      <Link to={`/${notification.sender.username}`}>
        <Avatar
          src={resolveImageUrl(notification.sender.displayImage)}
          alt={notification.sender.displayName || notification.sender.username}
        />
      </Link>

      <Content>
        <Message>{notification.message}</Message>
        <Time>
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </Time>

        {notification.adminReason && (
          <AdminReason>
            <strong>Admin Note:</strong> {notification.adminReason}
          </AdminReason>
        )}

        <Actions>
          <Link to={getNotificationLink()} onClick={handleView}>
            <ActionButton>View</ActionButton>
          </Link>
          <ActionButton onClick={handleDelete}>Delete</ActionButton>
        </Actions>
      </Content>

      {!notification.read && <UnreadDot />}
    </Container>
  );
};

export default NotificationItem;
