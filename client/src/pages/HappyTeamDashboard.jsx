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
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const MediaModalContent = styled.div`
  max-width: 90vw;
  max-height: 90vh;
  position: relative;

  img,
  video {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: -40px;
  right: 0;
  background: transparent;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 10px;
  
  &:hover {
    opacity: 0.7;
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
    file: null,
    title: '',
    description: '',
  });

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
    } catch (err) {
      console.error('Error fetching content:', err);
      alert('Error loading content');
    } finally {
      setLoading(false);
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

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      alert('Please select a file');
      return;
    }

    setUploading(true);

    try {
      // First upload the file
      const uploadFormData = new FormData();
      // Upload endpoint expects 'video' or 'image' as the field name
      const fieldName = formData.type === 'video' ? 'video' : 'image';
      uploadFormData.append(fieldName, formData.file);

      const uploadRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/upload`,
        uploadFormData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const fileUrl = uploadRes.data.url;

      // Then create the content entry
      const contentData = {
        type: formData.type,
        fileUrl,
        title: formData.title,
        description: formData.description,
        code: `TEMP-${Date.now()}`,
        price: 0,
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/happy-team/upload`,
        contentData,
        { withCredentials: true }
      );

      alert('Content uploaded successfully! Waiting for admin approval.');
      setShowUploadModal(false);
      setFormData({ type: 'image', file: null, title: '', description: '' });
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
                {currentUser.role === 'admin' && (
                  <MetaInfo>
                    <MetaItem>
                      <strong>Access Code:</strong> <span>{item.code}</span>
                    </MetaItem>
                    <MetaItem>
                      <strong>Price:</strong> <span>${item.price?.toFixed(2)}</span>
                    </MetaItem>
                  </MetaInfo>
                )}
                {currentUser.role === 'admin' && (
                  <UserInfo>
                    <UserInfoItem>
                      <FaUser />
                      <span>
                        {item.userId?.displayName}
                        {item.userId?.editorRole && ` (${item.userId.editorRole})`}
                      </span>
                    </UserInfoItem>
                    <UserInfoItem>
                      <FaEnvelope />
                      <span>{item.userId?.email}</span>
                    </UserInfoItem>
                  </UserInfo>
                )}
                <StatusBadge $status={item.status}>
                  {getStatusIcon(item.status)}
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </StatusBadge>
                {item.status === 'pending' && currentUser.role === 'editor' && (
                  <ActionButtons>
                    <DeleteButton onClick={() => handleDelete(item._id)}>
                      <FaTrash /> Delete
                    </DeleteButton>
                  </ActionButtons>
                )}
                {currentUser.role === 'admin' && item.status === 'pending' && (
                  <ActionButtons>
                    <Button onClick={() => openApprovalModal(item._id)}>
                      <FaCheck /> Approve
                    </Button>
                    <DeleteButton onClick={() => handleReject(item._id)}>
                      <FaTimes /> Reject
                    </DeleteButton>
                  </ActionButtons>
                )}
                {currentUser.role === 'admin' && item.status === 'approved' && (
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
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value='image'>Image</option>
                  <option value='video'>Video</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>File</Label>
                <Input
                  type='file'
                  accept={formData.type === 'image' ? 'image/*' : 'video/*'}
                  onChange={(e) =>
                    setFormData({ ...formData, file: e.target.files[0] })
                  }
                  required
                />
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
              <ButtonGroup>
                <Button
                  type='button'
                  $variant='cancel'
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
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
          </MediaModalContent>
        </MediaModal>
      )}

      {showApprovalModal && (
        <UploadModal onClick={() => setShowApprovalModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Set Details & Approve Content</ModalTitle>
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
                  Approve
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
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/v1/happy-team/${approvalContentId}/approve`,
        { 
          price: parseFloat(approvalPrice),
          code: approvalCode.trim().toUpperCase()
        },
        { withCredentials: true }
      );
      alert('Content approved!');
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
