import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useMessages } from '../hooks/useMessages';
import { useSocket } from '../contexts/SocketContext';
import { useSelector } from 'react-redux';
import { resolveImageUrl } from '../utils/imageUtils';
import { formatDistanceToNow } from 'date-fns';
import Spinner from '../components/Spinner';
import ChatConversation from '../components/chat/ChatConversation';

const Container = styled.div`
  display: flex;
  height: calc(100vh - var(--navbar-h));
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--tertiary-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ConversationsList = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'selectedConversation',
})`
  width: 350px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.03);
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 768px) {
    width: 100%;
    display: ${(props) => (props.selectedConversation ? 'none' : 'block')};
  }
`;

const ConversationsHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.02);
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-family: var(--secondary-fonts);
  color: var(--text-color);
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
`;

const ConversationItem = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${(props) =>
    props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border-left: ${(props) =>
    props.active ? '3px solid var(--primary-color)' : '3px solid transparent'};

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    transform: translateX(2px);
  }
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.2s ease;

  ${ConversationItem}:hover & {
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const ConversationInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-family: var(--secondary-fonts);
  color: var(--text-color);
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
`;

const LastMessage = styled.div`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MessageTime = styled.div`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 12px;
  flex-shrink: 0;
`;

const ChatArea = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'selectedConversation',
})`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.01);

  @media (max-width: 768px) {
    display: ${(props) => (props.selectedConversation ? 'flex' : 'none')};
  }
`;

const BackButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 18px;
  padding: 10px;
  cursor: pointer;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    display: flex;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const ChatHeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const ChatAvatar = styled.img`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
`;

const ChatUserName = styled.div`
  font-family: var(--secondary-fonts);
  color: var(--text-color);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.3px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--secondary-color);
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const EmptyText = styled.p`
  font-family: var(--primary-fonts);
  font-size: 18px;
  margin: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const { socket, isConnected } = useSocket();
  const {
    conversations,
    loading,
    error,
    fetchConversations,
    markConversationAsRead,
  } = useMessages();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Listen for real-time conversation updates
  useEffect(() => {
    if (socket && isConnected) {
      const handleNewMessage = (message) => {
        console.log('New message received in Messages page:', message);
        // The useMessages hook will handle updating the conversations list
        // We just need to refresh if we're not in the specific conversation
        if (
          !selectedConversation ||
          selectedConversation._id !== message.conversationId
        ) {
          // Optionally refresh conversations to get updated unread counts
          fetchConversations();
        }
      };

      socket.on('newMessage', handleNewMessage);

      return () => {
        socket.off('newMessage', handleNewMessage);
      };
    }
  }, [socket, isConnected, selectedConversation, fetchConversations]);

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find((p) => p._id !== currentUser._id);
  };

  if (loading && conversations.length === 0) {
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
      <ConversationsList selectedConversation={selectedConversation}>
        <ConversationsHeader>
          <Title>Messages</Title>
        </ConversationsHeader>

        {conversations.length === 0 ? (
          <EmptyState>
            <EmptyIcon>💬</EmptyIcon>
            <EmptyText>No conversations yet</EmptyText>
          </EmptyState>
        ) : (
          conversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            const unreadCount =
              (conversation.unreadCount instanceof Map
                ? conversation.unreadCount.get(currentUser._id)
                : conversation.unreadCount?.[currentUser._id]) || 0;

            return (
              <ConversationItem
                key={conversation._id}
                active={selectedConversation?._id === conversation._id}
                onClick={() => {
                  setSelectedConversation(conversation);
                  markConversationAsRead(conversation._id);
                }}
              >
                <Avatar
                  src={resolveImageUrl(otherParticipant?.displayImage)}
                  alt={
                    otherParticipant?.displayName || otherParticipant?.username
                  }
                />
                <ConversationInfo>
                  <UserName>
                    {otherParticipant?.displayName ||
                      otherParticipant?.username}
                  </UserName>
                  <LastMessage>
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </LastMessage>
                </ConversationInfo>
                <div>
                  {conversation.lastMessageAt && (
                    <MessageTime>
                      {formatDistanceToNow(
                        new Date(conversation.lastMessageAt),
                        { addSuffix: true }
                      )}
                    </MessageTime>
                  )}
                </div>
              </ConversationItem>
            );
          })
        )}
      </ConversationsList>

      <ChatArea selectedConversation={selectedConversation}>
        {selectedConversation ? (
          <>
            <ChatHeader>
              <BackButton onClick={() => setSelectedConversation(null)}>
                ← Back
              </BackButton>
              <ChatHeaderInfo>
                <ChatAvatar
                  src={resolveImageUrl(
                    getOtherParticipant(selectedConversation)?.displayImage
                  )}
                  alt={
                    getOtherParticipant(selectedConversation)?.displayName ||
                    getOtherParticipant(selectedConversation)?.username
                  }
                />
                <ChatUserName>
                  {getOtherParticipant(selectedConversation)?.displayName ||
                    getOtherParticipant(selectedConversation)?.username}
                </ChatUserName>
              </ChatHeaderInfo>
            </ChatHeader>
            <ChatConversation
              conversation={selectedConversation}
              currentUser={currentUser}
              hideHeader={true}
            />
          </>
        ) : (
          <EmptyState>
            <EmptyIcon>💬</EmptyIcon>
            <EmptyText>Select a conversation to start messaging</EmptyText>
          </EmptyState>
        )}
      </ChatArea>
    </Container>
  );
};

export default Messages;
