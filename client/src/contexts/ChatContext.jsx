import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);

  const openChatWithUser = (user) => {
    setTargetUser(user);
    setIsChatVisible(true);
    setActiveConversation(null); // Will be set when conversation is found/created
  };

  const openChatWithConversation = (conversation) => {
    setActiveConversation(conversation);
    setTargetUser(null);
    setIsChatVisible(true);
  };

  const closeChat = () => {
    setIsChatVisible(false);
    setTargetUser(null);
    setActiveConversation(null);
  };

  const minimizeChat = () => {
    // Keep the chat data but hide the UI
    setIsChatVisible(false);
  };

  return (
    <ChatContext.Provider
      value={{
        isChatVisible,
        targetUser,
        activeConversation,
        openChatWithUser,
        openChatWithConversation,
        closeChat,
        minimizeChat,
        setActiveConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
