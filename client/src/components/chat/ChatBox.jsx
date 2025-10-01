import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useMessages } from '../../hooks/useMessages';
import { useSocket } from '../../contexts/SocketContext';
import { useChatContext } from '../../contexts/ChatContext';
import { useSelector } from 'react-redux';
import { resolveImageUrl } from '../../utils/imageUtils';
import { formatDistanceToNow } from 'date-fns';
import { IoClose, IoSend } from 'react-icons/io5';
import { BsChatDots } from 'react-icons/bs';
import ChatConversation from './ChatConversation';
import Spinner from '../Spinner';

const ChatContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOpen',
})`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  height: ${(props) => (props.isOpen ? '500px' : '60px')};
  background-color: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  transition: height 0.3s ease;
  z-index: 1000;
  overflow: hidden;

  @media (max-width: 768px) {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
    height: ${(props) => (props.isOpen ? '70vh' : '60px')};
  }
`;

const ChatHeader = styled.div`
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 16px !important;
  background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%) !important;
  background-color: #d32f2f !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  cursor: pointer !important;
  min-height: 60px !important;
  width: 100% !important;
  box-sizing: border-box !important;

  /* Force red background with fallback and higher specificity */
  &,
  &:before,
  &:after {
    background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%) !important;
    background-color: #d32f2f !important;
  }

  /* Debug border to see if element is there */
  border: 2px solid #ff0000 !important;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ChatIcon = styled.div`
  color: #fff;
  font-size: 20px;
`;

const HeaderTitle = styled.h3`
  font-family: var(--secondary-fonts);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #fff;
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ConversationsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  background-color: #1a1a1a;
`;

const ConversationItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const ConversationInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-family: var(--secondary-fonts);
  color: var(--text-color);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
`;

const LastMessage = styled.div`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MessageTime = styled.div`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 11px;
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--secondary-color);
  text-align: center;
  padding: 20px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyText = styled.p`
  font-family: var(--primary-fonts);
  font-size: 14px;
  margin: 0;
`;

const UnreadBadge = styled.div`
  background-color: #1976d2;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  margin-left: auto;
`;

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const {
    conversations,
    unreadCount,
    fetchConversations,
    getOrCreateConversation,
  } = useMessages();
  const { isConnected } = useSocket();
  const { currentUser } = useSelector((state) => state.user);
  const {
    isChatVisible,
    targetUser,
    activeConversation,
    closeChat,
    setActiveConversation,
  } = useChatContext();

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen, fetchConversations]);

  // Handle when chat is triggered from outside (Message button)
  useEffect(() => {
    if (isChatVisible) {
      setIsOpen(true);
    }
  }, [isChatVisible]);

  // Handle when a target user is set (create or find conversation)
  useEffect(() => {
    if (targetUser && getOrCreateConversation) {
      const handleTargetUser = async () => {
        try {
          console.log('Creating/getting conversation for user:', targetUser);
          const result = await getOrCreateConversation(targetUser._id);
          console.log('Conversation result:', result);
          if (result && result.conversation) {
            setSelectedConversation(result.conversation);
            setActiveConversation(result.conversation);
            setIsOpen(true); // Ensure chat is open
          }
        } catch (error) {
          console.error('Error creating/getting conversation:', error);
        }
      };
      handleTargetUser();
    }
  }, [targetUser, getOrCreateConversation, setActiveConversation]);

  // Handle when an active conversation is set directly
  useEffect(() => {
    if (activeConversation) {
      setSelectedConversation(activeConversation);
    }
  }, [activeConversation]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const closeChatHandler = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    setSelectedConversation(null);
    closeChat();
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const backToConversations = () => {
    setSelectedConversation(null);
  };

  const getOtherParticipant = (conversation, currentUserId) => {
    return conversation.participants.find((p) => p._id !== currentUserId);
  };

  // Don't render if chat is not visible and not minimized
  if (!isChatVisible && !isOpen) {
    return null;
  }

  return (
    <ChatContainer isOpen={isOpen || isChatVisible}>
      {selectedConversation ? (
        <ChatConversation
          conversation={selectedConversation}
          onBack={null} // Remove back button completely
          onClose={closeChatHandler} // Add close handler
        />
      ) : targetUser ? (
        // When targetUser is set, show loading state
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Spinner size={32} color='var(--primary-color)' />
        </div>
      ) : null}
    </ChatContainer>
  );
};

export default ChatBox;
