import React from 'react';
import styled from 'styled-components';
import ImageEditor from './ImageEditor';
import VideoEditor from './VideoEditor';

const PanelContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 480px;
  height: 100vh;
  background: #0f0f0f;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease-in-out;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PanelHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0b0b0b;
`;

const Title = styled.h3`
  font-family: var(--primary-fonts);
  color: var(--primary-color);
  font-size: 18px;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 20px;
  line-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
  opacity: ${props => props.isOpen ? '1' : '0'};
  pointer-events: ${props => props.isOpen ? 'auto' : 'none'};
  transition: opacity 0.3s ease-in-out;
`;

const EditPanel = ({ isOpen, onClose, mediaType, mediaUrl, onSave }) => {
  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} />
      <PanelContainer isOpen={isOpen}>
        <PanelHeader>
          <Title>{mediaType === 'image' ? '📸 Edit Image' : '🎬 Edit Video'}</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </PanelHeader>
        <PanelContent>
          {mediaType === 'image' ? (
            <ImageEditor
              imageUrl={mediaUrl}
              onSave={onSave}
              onCancel={onClose}
            />
          ) : (
            <VideoEditor
              videoUrl={mediaUrl}
              onSave={onSave}
              onCancel={onClose}
            />
          )}
        </PanelContent>
      </PanelContainer>
    </>
  );
};

export default EditPanel;
