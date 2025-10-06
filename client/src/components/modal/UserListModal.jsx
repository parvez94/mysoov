import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { IoClose } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import { FollowButton, VerifiedBadge } from '../index';
import { resolveImageUrl } from '../../utils/imageUtils';

const API = import.meta.env.VITE_API_URL;

const ModalWrapper = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2147483647;
  padding: 16px;
  overflow: auto;
`;

const ModalContent = styled.div`
  position: relative;
  background-color: var(--tertiary-color);
  width: min(400px, 100%);
  max-height: 80dvh;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 18px;
  margin: 0;
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: var(--secondary-color);
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const UserList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-bottom: none;
  }
`;

const UserAvatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  background: #222;
  flex-shrink: 0;
  aspect-ratio: 1 / 1;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const DisplayName = styled.div`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Username = styled.div`
  font-family: var(--secondary-fonts);
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
`;

const FollowButtonWrapper = styled.div`
  flex-shrink: 0;
`;

const LoadingContainer = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-family: var(--secondary-fonts);
`;

const EmptyContainer = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-family: var(--secondary-fonts);
`;

const ErrorContainer = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #ff6b6b;
  font-family: var(--secondary-fonts);
`;

const UserListModal = ({ isOpen, onClose, userId, type, title }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const endpoint = type === 'followers' ? 'followers' : 'following';
        const response = await fetch(
          `${API}/api/v1/users/${endpoint}/${userId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userId, type]);

  if (!isOpen) return null;

  const modalContent = (
    <ModalWrapper onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{title}</Title>
          <CloseButton onClick={onClose}>
            <IoClose size={18} />
          </CloseButton>
        </Header>

        <UserList>
          {loading && <LoadingContainer>Loading...</LoadingContainer>}

          {error && <ErrorContainer>{error}</ErrorContainer>}

          {!loading && !error && users.length === 0 && (
            <EmptyContainer>
              {type === 'followers'
                ? 'No followers yet'
                : 'Not following anyone yet'}
            </EmptyContainer>
          )}

          {!loading &&
            !error &&
            users.length > 0 &&
            users.map((user) => (
              <UserItem key={user._id}>
                <UserAvatar
                  src={resolveImageUrl(user.displayImage)}
                  alt={user.displayName || user.username}
                />
                <UserInfo>
                  <DisplayName>
                    {user.displayName || user.username}
                    <VerifiedBadge user={user} size={14} />
                  </DisplayName>
                  <Username>@{user.username}</Username>
                </UserInfo>
                {currentUser && currentUser._id !== user._id && (
                  <FollowButtonWrapper>
                    <FollowButton
                      user={currentUser}
                      channel={user}
                      onDelta={(delta) => {
                        // Update the follower count if needed
                        // This is optional since we're in a modal
                      }}
                    />
                  </FollowButtonWrapper>
                )}
              </UserItem>
            ))}
        </UserList>
      </ModalContent>
    </ModalWrapper>
  );

  return createPortal(modalContent, document.body);
};

export default UserListModal;
