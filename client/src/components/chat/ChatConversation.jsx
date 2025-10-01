import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { IoSend, IoArrowBack, IoClose } from 'react-icons/io5';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '../../contexts/SocketContext';
import { useSelector } from 'react-redux';
import { resolveImageUrl } from '../../utils/imageUtils';
import { useChatContext } from '../../contexts/ChatContext';
import { useMessages } from '../../hooks/useMessages';
import Spinner from '../Spinner';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--tertiary-color);
  font-family: var(--secondary-fonts);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: var(--primary-color);
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: var(--secondary-color);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  color: var(--secondary-color);
  font-size: 16px;
`;

const OnlineStatus = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'online',
})`
  font-size: 12px;
  color: ${(props) => (props.online ? '#4CAF50' : '#999')};
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: rgba(255, 255, 255, 0.01);

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
`;

const MessageGroup = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOwn',
})`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.isOwn ? 'flex-end' : 'flex-start')};
  gap: 4px;
`;

const Message = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOwn',
})`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: ${(props) =>
    props.isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  background-color: ${(props) =>
    props.isOwn ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.95)'};
  color: ${(props) => (props.isOwn ? 'white' : '#333')};
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.4;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    ${(props) =>
      props.isOwn ? 'right: -6px; bottom: 4px;' : 'left: -6px; bottom: 4px;'}
    width: 0;
    height: 0;
    border: 6px solid transparent;
    ${(props) =>
      props.isOwn
        ? 'border-left-color: var(--primary-color);'
        : 'border-right-color: rgba(255, 255, 255, 0.95);'}
  }
`;

const MessageTime = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOwn',
})`
  font-size: 11px;
  color: #999;
  margin: ${(props) => (props.isOwn ? '0 8px 0 0' : '0 0 0 8px')};
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
`;

const MessageInput = styled.input`
  flex: 1;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  padding: 12px 18px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    border-color: var(--primary-color);
    background-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
  }
`;

const SendButton = styled.button`
  background-color: var(--primary-color);
  border: none;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);

  &:hover {
    background-color: #c82333;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    background-color: #666;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
`;

const TypingIndicator = styled.div`
  padding: 8px 16px;
  color: #999;
  font-size: 12px;
  font-style: italic;
`;

const ChatConversation = ({
  conversation,
  onBack,
  onClose,
  hideHeader = false,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { currentUser } = useSelector((state) => state.user);
  const { socket, onlineUsers } = useSocket();
  const { closeChat } = useChatContext();
  const { markConversationAsRead } = useMessages();

  console.log('Current user in ChatConversation:', currentUser);

  const otherParticipant = conversation.participants.find(
    (p) => p._id !== currentUser._id
  );

  const isOnline = onlineUsers.includes(otherParticipant?._id);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages for this conversation
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || 'http://localhost:5100'
          }/api/v1/messages/conversation/${conversation._id}`,
          { credentials: 'include' }
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);

          // Mark conversation as read when messages are loaded
          markConversationAsRead(conversation._id);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (conversation._id) {
      loadMessages();
    }
  }, [conversation._id]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Join conversation room
    socket.emit('joinConversation', conversation._id);

    // Listen for real-time messages in conversation (not notifications)
    const handleMessageReceived = (message) => {
      console.log('Received messageReceived via socket:', message);
      console.log('Current conversation ID:', conversation._id);
      console.log('Message conversation ID:', message.conversationId);

      // Generate the string conversationId for comparison
      const participants = conversation.participants.map((p) => p._id).sort();
      const stringConversationId = `${participants[0]}_${participants[1]}`;

      console.log('Generated string conversation ID:', stringConversationId);

      if (message.conversationId === stringConversationId) {
        // Avoid duplicate messages by checking if message already exists
        setMessages((prev) => {
          const exists = prev.find((m) => m._id === message._id);
          if (exists) {
            console.log('Message already exists, skipping');
            return prev;
          }
          console.log('Adding new message to state via socket');
          return [...prev, message];
        });
        scrollToBottom();
      } else {
        console.log('Message not for this conversation, ignoring');
      }
    };

    // Listen for typing indicators
    const handleTypingStart = (data) => {
      // Generate the string conversationId for comparison
      const participants = conversation.participants.map((p) => p._id).sort();
      const stringConversationId = `${participants[0]}_${participants[1]}`;

      if (
        data.conversationId === stringConversationId &&
        data.userId !== currentUser._id
      ) {
        setOtherUserTyping(true);
      }
    };

    const handleTypingStop = (data) => {
      // Generate the string conversationId for comparison
      const participants = conversation.participants.map((p) => p._id).sort();
      const stringConversationId = `${participants[0]}_${participants[1]}`;

      if (
        data.conversationId === stringConversationId &&
        data.userId !== currentUser._id
      ) {
        setOtherUserTyping(false);
      }
    };

    // Test response handler
    socket.on('testResponse', (data) => {
      console.log('Received test response from server:', data);
    });

    socket.on('messageReceived', handleMessageReceived);
    socket.on('userTyping', handleTypingStart);
    socket.on('userStoppedTyping', handleTypingStop);

    return () => {
      socket.off('testResponse');
      socket.off('messageReceived', handleMessageReceived);
      socket.off('userTyping', handleTypingStart);
      socket.off('userStoppedTyping', handleTypingStop);
      socket.emit('leaveConversation', conversation._id);
    };
  }, [socket, conversation._id, currentUser._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator
  const handleTyping = () => {
    // Generate the string conversationId for typing events
    const participants = conversation.participants.map((p) => p._id).sort();
    const stringConversationId = `${participants[0]}_${participants[1]}`;

    if (!typing) {
      setTyping(true);
      socket?.emit('typing', {
        conversationId: stringConversationId,
        userId: currentUser._id,
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socket?.emit('stopTyping', {
        conversationId: stringConversationId,
        userId: currentUser._id,
      });
    }, 1000);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    const messageData = {
      conversationId: conversation._id,
      content: newMessage.trim(),
      recipientId: otherParticipant._id,
    };

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || 'http://localhost:5100'
        }/api/v1/messages/send/${otherParticipant._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(messageData),
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        console.log('Message sent successfully:', responseData);

        // Add the message to local state immediately for better UX
        // The socket will also broadcast this message, but our duplicate check will handle it
        const newMessageObj = {
          _id: responseData.message._id,
          sender: {
            _id: currentUser._id,
            username: currentUser.username,
            displayName: currentUser.displayName,
          },
          content: newMessage.trim(),
          createdAt: new Date().toISOString(),
          conversationId: conversation._id,
        };

        setMessages((prev) => {
          // Check if message already exists (in case socket was faster)
          const exists = prev.find((m) => m._id === newMessageObj._id);
          if (exists) {
            console.log(
              'Message already exists from socket, not adding duplicate'
            );
            return prev;
          }
          console.log('Adding sent message to local state');
          return [...prev, newMessageObj];
        });

        setNewMessage('');
        // Stop typing indicator
        if (typing) {
          setTyping(false);
          // Generate the string conversationId for typing events
          const participants = conversation.participants
            .map((p) => p._id)
            .sort();
          const stringConversationId = `${participants[0]}_${participants[1]}`;

          socket?.emit('stopTyping', {
            conversationId: stringConversationId,
            userId: currentUser._id,
          });
        }
      } else {
        console.error(
          'Failed to send message:',
          response.status,
          response.statusText
        );
        const errorData = await response.text();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  if (loading) {
    return (
      <Container>
        {!hideHeader && (
          <Header>
            {onBack && (
              <BackButton onClick={onBack}>
                <IoArrowBack />
              </BackButton>
            )}
            <Avatar
              src={resolveImageUrl(otherParticipant?.displayImage)}
              alt={otherParticipant?.displayName || otherParticipant?.username}
            />
            <UserInfo>
              <UserName>
                {otherParticipant?.displayName || otherParticipant?.username}
              </UserName>
              <OnlineStatus online={isOnline}>
                {isOnline ? 'Online' : 'Offline'}
              </OnlineStatus>
            </UserInfo>
            {!onBack && (
              <BackButton onClick={onClose || closeChat}>
                <IoClose />
              </BackButton>
            )}
          </Header>
        )}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spinner size={32} color='var(--primary-color)' />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {!hideHeader && (
        <Header>
          {onBack && (
            <BackButton onClick={onBack}>
              <IoArrowBack />
            </BackButton>
          )}
          <Avatar
            src={resolveImageUrl(otherParticipant?.displayImage)}
            alt={otherParticipant?.displayName || otherParticipant?.username}
          />
          <UserInfo>
            <UserName>
              {otherParticipant?.displayName || otherParticipant?.username}
            </UserName>
            <OnlineStatus online={isOnline}>
              {isOnline ? 'Online' : 'Offline'}
            </OnlineStatus>
          </UserInfo>
          {!onBack && (
            <BackButton onClick={onClose || closeChat}>
              <IoClose />
            </BackButton>
          )}
        </Header>
      )}

      <MessagesContainer>
        {messages.length === 0 ? (
          <EmptyState>No messages yet. Start the conversation!</EmptyState>
        ) : (
          messages.map((message) => {
            // Standard messaging pattern:
            // - Current user's messages = right side (red)
            // - Other user's messages = left side (white)
            const isOwn = message.sender._id === currentUser._id;

            return (
              <MessageGroup key={message._id} isOwn={isOwn}>
                <Message isOwn={isOwn}>{message.content}</Message>
                <MessageTime isOwn={isOwn}>
                  {formatDistanceToNow(new Date(message.createdAt), {
                    addSuffix: true,
                  })}
                </MessageTime>
              </MessageGroup>
            );
          })
        )}
        {otherUserTyping && (
          <TypingIndicator>
            {otherParticipant?.displayName || otherParticipant?.username} is
            typing...
          </TypingIndicator>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <form onSubmit={handleSendMessage}>
        <InputContainer>
          <MessageInput
            type='text'
            placeholder='Type a message...'
            value={newMessage}
            onChange={handleInputChange}
          />
          <SendButton type='submit' disabled={!newMessage.trim()}>
            <IoSend />
          </SendButton>
        </InputContainer>
      </form>
    </Container>
  );
};

export default ChatConversation;
