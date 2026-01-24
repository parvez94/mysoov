import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import {
  FaUpload,
  FaImage,
  FaTrash,
  FaClock,
  FaCheck,
  FaTimes,
  FaUser,
  FaEnvelope,
} from 'react-icons/fa';
import { MdClose } from 'react-icons/md';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
  font-family: var(--secondary-fonts);
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
  letter-spacing: -0.02em;
`;

const UploadButton = styled.button`
  padding: 12px 28px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #0056b3 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  font-weight: 600;
  font-family: var(--secondary-fonts);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ContentCard = styled.div`
  background-color: var(--tertiary-color);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

const MediaPreview = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, rgba(0, 123, 255, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &::after {
    content: 'Click to view full size';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    color: white;
    font-size: 0.85rem;
    text-align: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ContentInfo = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ContentTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 10px;
  word-break: break-word;
  font-family: var(--primary-fonts);
  line-height: 1.4;
`;

const ContentDescription = styled.p`
  font-size: 0.95rem;
  color: var(--secondary-color);
  opacity: 0.7;
  margin-bottom: 16px;
  word-break: break-word;
  font-family: var(--secondary-fonts);
  line-height: 1.6;
`;

const MetaInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  margin-bottom: 16px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);

  strong {
    font-weight: 600;
    color: var(--secondary-color);
    opacity: 0.9;
  }

  span {
    opacity: 0.8;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background-color: rgba(0, 123, 255, 0.08);
  border-radius: 8px;
  margin-bottom: 16px;
  border-left: 3px solid var(--primary-color);
`;

const UserInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);

  svg {
    color: var(--primary-color);
    flex-shrink: 0;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: var(--secondary-fonts);
  align-self: flex-start;
  margin-bottom: auto;

  ${(props) => {
    if (props.$status === 'pending') {
      return `
        background: linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 152, 0, 0.2) 100%);
        color: #ffc107;
        border: 1px solid rgba(255, 193, 7, 0.3);
      `;
    } else if (props.$status === 'approved') {
      return `
        background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(56, 142, 60, 0.2) 100%);
        color: #4caf50;
        border: 1px solid rgba(76, 175, 80, 0.3);
      `;
    } else {
      return `
        background: linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(211, 47, 47, 0.2) 100%);
        color: #f44336;
        border: 1px solid rgba(244, 67, 54, 0.3);
      `;
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
`;

const DeleteButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  background-color: rgba(244, 67, 54, 0.12);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: var(--secondary-fonts);
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(244, 67, 54, 0.2);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const UploadModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background-color: var(--tertiary-color);
  padding: 32px;
  border-radius: 16px;
  width: 90%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalTitle = styled.h2`
  color: var(--secondary-color);
  margin-bottom: 24px;
  font-family: var(--primary-fonts);
  font-size: 1.75rem;
  font-weight: 700;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: var(--secondary-color);
  font-size: 0.95rem;
  font-weight: 600;
  font-family: var(--secondary-fonts);
`;

const Helper = styled.p`
  color: var(--secondary-color);
  opacity: 0.7;
  font-size: 0.85rem;
  font-family: var(--secondary-fonts);
  margin: 0;
`;

const Input = styled.input`
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  font-size: 0.95rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const TextArea = styled.textarea`
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--secondary-color);
  min-height: 100px;
  resize: vertical;
  font-family: var(--secondary-fonts);
  font-size: 0.95rem;
  line-height: 1.6;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Select = styled.select`
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  option {
    background-color: var(--tertiary-color);
    color: var(--secondary-color);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  font-family: var(--secondary-fonts);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;

  ${(props) =>
    props.$variant === 'cancel'
      ? `
    background-color: rgba(255, 255, 255, 0.08);
    color: var(--secondary-color);
    border: 1px solid rgba(255, 255, 255, 0.12);

    &:hover {
      background-color: rgba(255, 255, 255, 0.12);
    }
  `
      : `
    background: linear-gradient(135deg, var(--primary-color) 0%, #0056b3 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.25);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 123, 255, 0.35);
    }

    &:active {
      transform: translateY(0);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);

  svg {
    font-size: 5rem;
    margin-bottom: 24px;
    opacity: 0.3;
  }

  h3 {
    font-size: 1.75rem;
    margin-bottom: 12px;
    font-family: var(--primary-fonts);
    font-weight: 600;
    opacity: 0.9;
  }

  p {
    opacity: 0.6;
    font-size: 1.05rem;
  }
`;

const MediaModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const MediaModalContent = styled.div`
  max-width: 900px;
  width: 100%;
  background: var(--tertiary-color);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: grid;
  grid-template-columns: 1fr 400px;
  max-height: 85vh;
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    max-width: 700px;
  }
`;

const MediaPreviewSection = styled.div`
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 400px;
  
  img,
  video {
    max-width: 100%;
    max-height: 85vh;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  @media (max-width: 1024px) {
    max-height: 50vh;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: rotate(90deg);
  }
`;

const MediaInfoBar = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  
  @media (max-width: 1024px) {
    max-height: none;
  }
`;

const MediaHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const MediaTitle = styled.h3`
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
  font-size: 1.4rem;
  margin: 0;
  font-weight: 700;
  line-height: 1.3;
`;

const MediaDescription = styled.p`
  color: var(--secondary-color);
  opacity: 0.75;
  font-family: var(--secondary-fonts);
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.6;
`;

const MediaMetaSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MediaMetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
`;

const MediaMetaLabel = styled.span`
  color: var(--secondary-color);
  opacity: 0.7;
  font-family: var(--secondary-fonts);
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MediaMetaValue = styled.span`
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MediaActionButtons = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const MediaActionButton = styled.button`
  flex: 1;
  padding: 14px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  font-family: var(--secondary-fonts);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  ${props => props.$variant === 'approve' ? `
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.25);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(76, 175, 80, 0.35);
    }
  ` : `
    background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(244, 67, 54, 0.25);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(244, 67, 54, 0.35);
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
`;

const DragDropZone = styled.div`
  border: 2px dashed ${props => props.$isDragging ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background: ${props => props.$isDragging ? 'rgba(0, 123, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: var(--primary-color);
    background: rgba(0, 123, 255, 0.05);
  }

  input[type="file"] {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    cursor: pointer;
  }
`;

const DragDropText = styled.div`
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  
  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: ${props => props.$isDragging ? 'var(--primary-color)' : 'var(--secondary-color)'};
  }

  p {
    font-size: 0.9rem;
    opacity: 0.7;
    margin-bottom: 4px;
  }

  .icon {
    font-size: 3rem;
    margin-bottom: 16px;
    opacity: 0.5;
    color: var(--primary-color);
  }
`;

const FilePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 16px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
`;

const FilePreviewItem = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveFileButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(244, 67, 54, 0.9);
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(244, 67, 54, 1);
    transform: scale(1.1);
  }
`;

const FileCount = styled.div`
  margin-top: 12px;
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  font-size: 0.9rem;
  opacity: 0.8;
  strong {
    color: var(--primary-color);
  }
`;

const UploadProgressContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: rgba(0, 123, 255, 0.05);
  border: 1px solid rgba(0, 123, 255, 0.2);
  border-radius: 8px;
`;

const ProgressText = styled.div`
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  font-size: 0.9rem;
  margin-bottom: 10px;
  
  strong {
    color: var(--primary-color);
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color) 0%, #0056b3 100%);
  transition: width 0.3s ease;
  width: ${props => props.$progress}%;
`;

const CurrentFileText = styled.div`
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  font-size: 0.85rem;
  opacity: 0.7;
  margin-top: 4px;
`;

const TableContainer = styled.div`
  background-color: var(--tertiary-color);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const BulkActionBar = styled.div`
  padding: 16px 24px;
  background: rgba(0, 123, 255, 0.08);
  border-bottom: 1px solid rgba(0, 123, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const BulkActionText = styled.div`
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  font-size: 0.95rem;
  
  strong {
    color: var(--primary-color);
    font-weight: 600;
  }
`;

const BulkActionButtons = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const BulkButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  font-family: var(--secondary-fonts);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  ${props => 
    props.$variant === 'approve' ? `
      background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.25);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.35);
      }
    ` : props.$variant === 'delete' ? `
      background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(244, 67, 54, 0.25);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(244, 67, 54, 0.35);
      }
    ` : `
      background: rgba(255, 255, 255, 0.08);
      color: var(--secondary-color);
      border: 1px solid rgba(255, 255, 255, 0.12);
      
      &:hover {
        background: rgba(255, 255, 255, 0.12);
      }
    `
  }
  
  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const Th = styled.th`
  padding: 16px;
  text-align: left;
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
  
  &:first-child {
    width: 40px;
  }
  
  &:last-child {
    width: 100px;
    text-align: center;
  }
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }
  
  ${props => props.$selected && `
    background: rgba(0, 123, 255, 0.08);
    
    &:hover {
      background: rgba(0, 123, 255, 0.12);
    }
  `}
`;

const Td = styled.td`
  padding: 16px;
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  font-size: 0.95rem;
  vertical-align: middle;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary-color);
`;

const ThumbnailCell = styled.div`
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  
  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const TitleCell = styled.div`
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 4px;
`;

const DescriptionCell = styled.div`
  font-size: 0.85rem;
  opacity: 0.7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
`;

const TypeBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => props.$type === 'image' ? `
    background: rgba(156, 39, 176, 0.2);
    color: #ce93d8;
    border: 1px solid rgba(156, 39, 176, 0.3);
  ` : `
    background: rgba(33, 150, 243, 0.2);
    color: #64b5f6;
    border: 1px solid rgba(33, 150, 243, 0.3);
  `}
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 123, 255, 0.12);
  color: var(--primary-color);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: var(--secondary-fonts);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 123, 255, 0.2);
    transform: translateY(-1px);
  }
`;

const HappyTeamDashboard = () => {
  const { currentUser, isLoading: userLoading } = useSelector(
    (state) => state.user
  );
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalContentId, setApprovalContentId] = useState(null);
  const [approvalPrice, setApprovalPrice] = useState('');
  const [approvalCode, setApprovalCode] = useState('');

  const [formData, setFormData] = useState({
    type: 'image',
    files: [],
    title: '',
    description: '',
  });

  const [dragActive, setDragActive] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewingMedia, setViewingMedia] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, currentFile: '' });

  useEffect(() => {
    // Wait for user state to load before checking access
    if (userLoading) {
      return;
    }

    // Check if user is editor or admin
    if (
      !currentUser ||
      (currentUser.role !== 'editor' && currentUser.role !== 'admin')
    ) {
      navigate('/');
      return;
    }

    fetchContent();
  }, [currentUser, userLoading, navigate]);

  const fetchContent = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/happy-team`,
        { withCredentials: true }
      );
      setContent(res.data);
      setSelectedItems([]);
    } catch (err) {
      console.error('Error fetching content:', err);
      alert('Error loading content');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(content.map(item => item._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleBulkApprove = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item to approve');
      return;
    }
    setApprovalContentId(selectedItems);
    setApprovalPrice('');
    setApprovalCode('');
    setShowApprovalModal(true);
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} selected item(s)?`)) {
      return;
    }

    try {
      let successCount = 0;
      let failCount = 0;

      for (const id of selectedItems) {
        try {
          await axios.delete(
            `${import.meta.env.VITE_API_URL}/api/v1/happy-team/${id}`,
            { withCredentials: true }
          );
          successCount++;
        } catch (err) {
          console.error(`Error deleting item ${id}:`, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        alert(`Successfully deleted ${successCount} item(s)${failCount > 0 ? `. Failed to delete ${failCount} item(s).` : ''}`);
        setSelectedItems([]);
        fetchContent();
      } else {
        alert('Failed to delete selected items');
      }
    } catch (err) {
      console.error('Error in bulk delete:', err);
      alert('Error deleting selected items');
    }
  };

  // Show loading while checking user permissions
  if (userLoading || !currentUser) {
    return (
      <Container>
        <Header>
          <Title>Loading...</Title>
        </Header>
      </Container>
    );
  }

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      console.log('Dropped files count:', e.dataTransfer.files.length);
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const filesArray = Array.from(fileList);
    console.log('Total files received:', filesArray.length);
    
    const validFiles = filesArray.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return formData.type === 'image' ? isImage : isVideo;
    });

    console.log('Valid files after filter:', validFiles.length);

    if (validFiles.length === 0) {
      alert(`Please select valid ${formData.type} files`);
      return;
    }

    if (validFiles.length < filesArray.length) {
      alert(`${filesArray.length - validFiles.length} file(s) were skipped (wrong type). ${validFiles.length} valid ${formData.type}(s) added.`);
    }

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (formData.files.length === 0) {
      alert('Please select at least one file');
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: formData.files.length, currentFile: '' });

    try {
      const uploadedContents = [];
      const tempCode = `TEMP-${Date.now()}`;
      
      for (let i = 0; i < formData.files.length; i++) {
        const file = formData.files[i];
        
        setUploadProgress({ 
          current: i + 1, 
          total: formData.files.length, 
          currentFile: file.name 
        });
        
        const uploadFormData = new FormData();
        const fieldName = formData.type === 'video' ? 'video' : 'image';
        uploadFormData.append(fieldName, file);

        const uploadRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/upload`,
          uploadFormData,
          {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        const fileUrl = uploadRes.data.url;

        const contentData = {
          type: formData.type,
          fileUrl,
          title: formData.files.length > 1 ? `${formData.title} (${i + 1})` : formData.title,
          description: formData.description,
          code: tempCode,
          price: 0,
        };

        const contentRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/happy-team/upload`,
          contentData,
          { withCredentials: true }
        );
        
        uploadedContents.push(contentRes.data);
      }

      alert(`${uploadedContents.length} file(s) uploaded successfully! Waiting for admin approval.`);
      setShowUploadModal(false);
      setFormData({ type: 'image', files: [], title: '', description: '' });
      setUploadProgress({ current: 0, total: 0, currentFile: '' });
      fetchContent();
    } catch (err) {
      console.error('Error uploading:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Error uploading content';
      alert(`Upload failed: ${errorMsg}`);
      setUploadProgress({ current: 0, total: 0, currentFile: '' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/v1/happy-team/${id}`,
        { withCredentials: true }
      );
      alert('Content deleted successfully');
      fetchContent();
    } catch (err) {
      console.error('Error deleting:', err);
      alert(err.response?.data?.message || 'Error deleting content');
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'pending') return <FaClock />;
    if (status === 'approved') return <FaCheck />;
    return <FaTimes />;
  };

  if (loading) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container>
      <Header>
        <Title>
          {currentUser.role === 'admin'
            ? 'Happy Team - Admin Dashboard'
            : 'Happy Team Content'}
        </Title>
        {currentUser.role === 'editor' && (
          <UploadButton onClick={() => setShowUploadModal(true)}>
            <FaUpload /> Upload Content
          </UploadButton>
        )}
      </Header>

      {content.length === 0 ? (
        <EmptyState>
          <FaImage />
          <h3>No Content Available</h3>
          <p>
            {currentUser.role === 'admin'
              ? 'No submissions have been uploaded yet.'
              : 'Upload your first content to get started.'}
          </p>
        </EmptyState>
      ) : currentUser.role === 'admin' ? (
        <TableContainer>
          {selectedItems.length > 0 && (
            <BulkActionBar>
              <BulkActionText>
                <strong>{selectedItems.length}</strong> item{selectedItems.length !== 1 ? 's' : ''} selected
              </BulkActionText>
              <BulkActionButtons>
                <BulkButton onClick={handleClearSelection}>
                  <FaTimes /> Clear
                </BulkButton>
                <BulkButton $variant="delete" onClick={handleBulkDelete}>
                  <FaTrash /> Delete Selected
                </BulkButton>
                <BulkButton $variant="approve" onClick={handleBulkApprove}>
                  <FaCheck /> Approve Selected
                </BulkButton>
              </BulkActionButtons>
            </BulkActionBar>
          )}
          <Table>
            <Thead>
              <Tr>
                <Th>
                  <Checkbox
                    type="checkbox"
                    checked={selectedItems.length === content.length && content.length > 0}
                    onChange={handleSelectAll}
                  />
                </Th>
                <Th>Title</Th>
                <Th>Type</Th>
                <Th>Uploader</Th>
                <Th>Status</Th>
                <Th>Code</Th>
                <Th>Price</Th>
                <Th style={{ textAlign: 'center' }}>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {content.map((item) => (
                <Tr key={item._id} $selected={selectedItems.includes(item._id)}>
                  <Td>
                    <Checkbox
                      type="checkbox"
                      checked={selectedItems.includes(item._id)}
                      onChange={() => handleSelectItem(item._id)}
                    />
                  </Td>
                  <Td>
                    <TitleCell>{item.title || 'Untitled'}</TitleCell>
                    {item.description && (
                      <DescriptionCell>{item.description}</DescriptionCell>
                    )}
                  </Td>
                  <Td>
                    <TypeBadge $type={item.type}>{item.type}</TypeBadge>
                  </Td>
                  <Td>
                    <div style={{ fontSize: '0.9rem' }}>
                      <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                        {item.userId?.displayName}
                      </div>
                      <div style={{ fontSize: '0.8rem', opacity: '0.7' }}>
                        {item.userId?.email}
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <StatusBadge $status={item.status}>
                      {getStatusIcon(item.status)}
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {item.code || '-'}
                    </span>
                  </Td>
                  <Td>
                    <span style={{ fontWeight: '600' }}>
                      ${item.price?.toFixed(2) || '0.00'}
                    </span>
                  </Td>
                  <Td style={{ textAlign: 'center' }}>
                    <ActionButton onClick={() => setViewingMedia(item)}>
                      <FaImage /> View
                    </ActionButton>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <ContentGrid>
          {content.map((item) => (
            <ContentCard key={item._id}>
              <MediaPreview onClick={() => setSelectedMedia(item)}>
                {item.type === 'image' ? (
                  <img
                    src={
                      item.fileUrl?.startsWith('http')
                        ? item.fileUrl
                        : `${import.meta.env.VITE_API_URL}${item.fileUrl}`
                    }
                    alt={item.title}
                  />
                ) : (
                  <video
                    src={
                      item.fileUrl?.startsWith('http')
                        ? item.fileUrl
                        : `${import.meta.env.VITE_API_URL}${item.fileUrl}`
                    }
                    controls
                    controlsList="nodownload"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                  />
                )}
              </MediaPreview>
              <ContentInfo>
                <ContentTitle>{item.title || 'Untitled'}</ContentTitle>
                {item.description && (
                  <ContentDescription>{item.description}</ContentDescription>
                )}
                <StatusBadge $status={item.status}>
                  {getStatusIcon(item.status)}
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </StatusBadge>
                {item.status === 'pending' && (
                  <ActionButtons>
                    <DeleteButton onClick={() => handleDelete(item._id)}>
                      <FaTrash /> Delete
                    </DeleteButton>
                  </ActionButtons>
                )}
              </ContentInfo>
            </ContentCard>
          ))}
        </ContentGrid>
      )}

      {showUploadModal && (
        <UploadModal onClick={() => setShowUploadModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Upload Content</ModalTitle>
            <Form onSubmit={handleUploadSubmit}>
              <FormGroup>
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onChange={(e) => {
                    setFormData({ type: e.target.value, files: [], title: formData.title, description: formData.description });
                  }}
                >
                  <option value='image'>Image</option>
                  <option value='video'>Video</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Files (Drag & Drop or Click to Browse)</Label>
                <DragDropZone
                  $isDragging={dragActive}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type='file'
                    accept={formData.type === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleFileInput}
                    multiple
                  />
                  <DragDropText $isDragging={dragActive}>
                    <div className="icon">
                      <FaUpload />
                    </div>
                    <h4>{dragActive ? 'Drop files here' : 'Drag & drop files here'}</h4>
                    <p>or click to browse</p>
                    <p>Multiple {formData.type}s allowed</p>
                  </DragDropText>
                </DragDropZone>
                
                {formData.files.length > 0 && (
                  <>
                    <FileCount>
                      <strong>{formData.files.length}</strong> file{formData.files.length !== 1 ? 's' : ''} selected
                    </FileCount>
                    <FilePreviewGrid>
                      {formData.files.map((file, index) => (
                        <FilePreviewItem key={index}>
                          {formData.type === 'image' ? (
                            <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} />
                          ) : (
                            <video src={URL.createObjectURL(file)} />
                          )}
                          <RemoveFileButton onClick={() => removeFile(index)} type="button">
                            <FaTimes />
                          </RemoveFileButton>
                        </FilePreviewItem>
                      ))}
                    </FilePreviewGrid>
                  </>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Title</Label>
                <Input
                  type='text'
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder='Enter title'
                />
              </FormGroup>
              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder='Enter description'
                />
              </FormGroup>
              
              {uploading && uploadProgress.total > 0 && (
                <UploadProgressContainer>
                  <ProgressText>
                    Uploading <strong>{uploadProgress.current}</strong> of <strong>{uploadProgress.total}</strong> files
                  </ProgressText>
                  <ProgressBarContainer>
                    <ProgressBarFill $progress={(uploadProgress.current / uploadProgress.total) * 100} />
                  </ProgressBarContainer>
                  <CurrentFileText>
                    Current file: {uploadProgress.currentFile}
                  </CurrentFileText>
                </UploadProgressContainer>
              )}
              
              <ButtonGroup>
                <Button
                  type='button'
                  $variant='cancel'
                  onClick={() => {
                    setShowUploadModal(false);
                    setFormData({ type: 'image', files: [], title: '', description: '' });
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={uploading || formData.files.length === 0}>
                  {uploading ? `Uploading...` : 'Upload'}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </UploadModal>
      )}

      {selectedMedia && (
        <MediaModal onClick={() => setSelectedMedia(null)}>
          <MediaModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setSelectedMedia(null)}>
              <MdClose />
            </CloseButton>
            <MediaPreviewSection>
              {selectedMedia.type === 'image' ? (
                <img
                  src={
                    selectedMedia.fileUrl?.startsWith('http')
                      ? selectedMedia.fileUrl
                      : `${import.meta.env.VITE_API_URL}${selectedMedia.fileUrl}`
                  }
                  alt={selectedMedia.title}
                />
              ) : (
                <video
                  src={
                    selectedMedia.fileUrl?.startsWith('http')
                      ? selectedMedia.fileUrl
                      : `${import.meta.env.VITE_API_URL}${selectedMedia.fileUrl}`
                  }
                  controls
                  controlsList="nodownload"
                  disablePictureInPicture
                  autoPlay
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}
            </MediaPreviewSection>
            <MediaInfoBar>
              <MediaHeader>
                <MediaTitle>{selectedMedia.title || 'Untitled'}</MediaTitle>
                {selectedMedia.description && (
                  <MediaDescription>{selectedMedia.description}</MediaDescription>
                )}
              </MediaHeader>
              
              <MediaMetaSection>
                <MediaMetaRow>
                  <MediaMetaLabel>Type</MediaMetaLabel>
                  <MediaMetaValue>
                    <TypeBadge $type={selectedMedia.type}>{selectedMedia.type}</TypeBadge>
                  </MediaMetaValue>
                </MediaMetaRow>
                
                <MediaMetaRow>
                  <MediaMetaLabel>Status</MediaMetaLabel>
                  <MediaMetaValue>
                    <StatusBadge $status={selectedMedia.status}>
                      {getStatusIcon(selectedMedia.status)}
                      {selectedMedia.status.charAt(0).toUpperCase() + selectedMedia.status.slice(1)}
                    </StatusBadge>
                  </MediaMetaValue>
                </MediaMetaRow>
              </MediaMetaSection>
              
              {selectedMedia.status === 'pending' && (
                <MediaActionButtons>
                  <MediaActionButton 
                    $variant="reject"
                    onClick={() => {
                      setSelectedMedia(null);
                      handleDelete(selectedMedia._id);
                    }}
                  >
                    <FaTrash /> Delete
                  </MediaActionButton>
                </MediaActionButtons>
              )}
            </MediaInfoBar>
          </MediaModalContent>
        </MediaModal>
      )}

      {viewingMedia && (
        <MediaModal onClick={() => setViewingMedia(null)}>
          <MediaModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setViewingMedia(null)}>
              <MdClose />
            </CloseButton>
            <MediaPreviewSection>
              {viewingMedia.type === 'image' ? (
                <img
                  src={
                    viewingMedia.fileUrl?.startsWith('http')
                      ? viewingMedia.fileUrl
                      : `${import.meta.env.VITE_API_URL}${viewingMedia.fileUrl}`
                  }
                  alt={viewingMedia.title}
                />
              ) : (
                <video
                  src={
                    viewingMedia.fileUrl?.startsWith('http')
                      ? viewingMedia.fileUrl
                      : `${import.meta.env.VITE_API_URL}${viewingMedia.fileUrl}`
                  }
                  controls
                  controlsList="nodownload"
                  disablePictureInPicture
                  autoPlay
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}
            </MediaPreviewSection>
            <MediaInfoBar>
              <MediaHeader>
                <MediaTitle>{viewingMedia.title || 'Untitled'}</MediaTitle>
                {viewingMedia.description && (
                  <MediaDescription>{viewingMedia.description}</MediaDescription>
                )}
              </MediaHeader>
              
              <MediaMetaSection>
                <MediaMetaRow>
                  <MediaMetaLabel>Type</MediaMetaLabel>
                  <MediaMetaValue>
                    <TypeBadge $type={viewingMedia.type}>{viewingMedia.type}</TypeBadge>
                  </MediaMetaValue>
                </MediaMetaRow>
                
                <MediaMetaRow>
                  <MediaMetaLabel>Status</MediaMetaLabel>
                  <MediaMetaValue>
                    <StatusBadge $status={viewingMedia.status}>
                      {getStatusIcon(viewingMedia.status)}
                      {viewingMedia.status.charAt(0).toUpperCase() + viewingMedia.status.slice(1)}
                    </StatusBadge>
                  </MediaMetaValue>
                </MediaMetaRow>
                
                {currentUser.role === 'admin' && (
                  <>
                    <MediaMetaRow>
                      <MediaMetaLabel>Code</MediaMetaLabel>
                      <MediaMetaValue style={{ fontFamily: 'monospace' }}>
                        {viewingMedia.code || '-'}
                      </MediaMetaValue>
                    </MediaMetaRow>
                    
                    <MediaMetaRow>
                      <MediaMetaLabel>Price</MediaMetaLabel>
                      <MediaMetaValue>
                        ${viewingMedia.price?.toFixed(2) || '0.00'}
                      </MediaMetaValue>
                    </MediaMetaRow>
                  </>
                )}
                
                {viewingMedia.userId && (
                  <MediaMetaRow>
                    <MediaMetaLabel>Uploader</MediaMetaLabel>
                    <MediaMetaValue>
                      <FaUser />
                      {viewingMedia.userId.displayName}
                    </MediaMetaValue>
                  </MediaMetaRow>
                )}
              </MediaMetaSection>
              
              {currentUser.role === 'admin' && viewingMedia.status === 'pending' && (
                <MediaActionButtons>
                  <MediaActionButton 
                    $variant="approve" 
                    onClick={() => {
                      setViewingMedia(null);
                      openApprovalModal(viewingMedia._id);
                    }}
                  >
                    <FaCheck /> Approve
                  </MediaActionButton>
                  <MediaActionButton 
                    $variant="reject"
                    onClick={() => {
                      setViewingMedia(null);
                      handleReject(viewingMedia._id);
                    }}
                  >
                    <FaTimes /> Reject
                  </MediaActionButton>
                </MediaActionButtons>
              )}
              {currentUser.role === 'admin' && viewingMedia.status === 'approved' && (
                <MediaActionButtons>
                  <MediaActionButton 
                    $variant="reject"
                    onClick={() => {
                      setViewingMedia(null);
                      handleDelete(viewingMedia._id);
                    }}
                  >
                    <FaTrash /> Delete
                  </MediaActionButton>
                </MediaActionButtons>
              )}
            </MediaInfoBar>
          </MediaModalContent>
        </MediaModal>
      )}

      {showApprovalModal && (
        <UploadModal onClick={() => setShowApprovalModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>
              {Array.isArray(approvalContentId) 
                ? `Approve ${approvalContentId.length} Items` 
                : 'Set Details & Approve Content'}
            </ModalTitle>
            <Form onSubmit={(e) => { e.preventDefault(); handleApprove(); }}>
              <FormGroup>
                <Label>Access Code *</Label>
                <Input
                  type='text'
                  value={approvalCode}
                  onChange={(e) => setApprovalCode(e.target.value)}
                  placeholder='UNIQUE-CODE'
                  required
                  autoFocus
                />
                {Array.isArray(approvalContentId) && approvalContentId.length > 1 && (
                  <Helper style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                    All items will use the same code: {approvalCode.trim().toUpperCase() || 'UNIQUE-CODE'}
                  </Helper>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Price (USD) *</Label>
                <Input
                  type='number'
                  step='0.01'
                  min='0'
                  value={approvalPrice}
                  onChange={(e) => setApprovalPrice(e.target.value)}
                  placeholder='9.99'
                  required
                />
                {Array.isArray(approvalContentId) && (
                  <Helper style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                    Same price will be applied to all items
                  </Helper>
                )}
              </FormGroup>
              <ButtonGroup>
                <Button
                  type='button'
                  $variant='cancel'
                  onClick={() => setShowApprovalModal(false)}
                >
                  Cancel
                </Button>
                <Button type='submit'>
                  {Array.isArray(approvalContentId) 
                    ? `Approve ${approvalContentId.length} Items` 
                    : 'Approve'}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </UploadModal>
      )}
    </Container>
  );

  // Admin functions
  function openApprovalModal(id) {
    setApprovalContentId(id);
    setApprovalPrice('');
    setApprovalCode('');
    setShowApprovalModal(true);
  }

  async function handleApprove() {
    if (!approvalCode || approvalCode.trim() === '') {
      alert('Please enter an access code');
      return;
    }

    if (!approvalPrice || parseFloat(approvalPrice) < 0) {
      alert('Please enter a valid price');
      return;
    }

    try {
      const isBulk = Array.isArray(approvalContentId);
      
      if (isBulk) {
        let successCount = 0;
        let failedCount = 0;
        const normalizedCode = approvalCode.trim().toUpperCase();
        
        for (let i = 0; i < approvalContentId.length; i++) {
          const contentId = approvalContentId[i];
          
          try {
            await axios.put(
              `${import.meta.env.VITE_API_URL}/api/v1/happy-team/${contentId}/approve`,
              { 
                price: parseFloat(approvalPrice),
                code: normalizedCode
              },
              { withCredentials: true }
            );
            successCount++;
          } catch (err) {
            console.error(`Error approving ${contentId}:`, err);
            failedCount++;
          }
        }
        
        if (successCount > 0) {
          alert(`${successCount} item(s) approved successfully!${failedCount > 0 ? ` ${failedCount} failed.` : ''}`);
        } else {
          alert('Failed to approve items');
        }
      } else {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/v1/happy-team/${approvalContentId}/approve`,
          { 
            price: parseFloat(approvalPrice),
            code: approvalCode.trim().toUpperCase()
          },
          { withCredentials: true }
        );
        alert('Content approved!');
      }
      
      setShowApprovalModal(false);
      setApprovalContentId(null);
      setApprovalPrice('');
      setApprovalCode('');
      fetchContent();
    } catch (err) {
      console.error('Error approving:', err);
      alert(err.response?.data?.message || 'Error approving content');
    }
  }

  async function handleReject(id) {
    const reason = window.prompt('Reason for rejection (optional):');
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/v1/happy-team/${id}/reject`,
        {
          data: { reason },
          withCredentials: true,
        }
      );
      alert('Content rejected and deleted');
      fetchContent();
    } catch (err) {
      console.error('Error rejecting:', err);
      alert('Error rejecting content');
    }
  }
};

export default HappyTeamDashboard;
