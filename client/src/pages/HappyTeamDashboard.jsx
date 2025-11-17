import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import {
  FaUpload,
  FaImage,
  FaVideo,
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
  padding: 20px;
  font-family: var(--secondary-fonts);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
`;

const UploadButton = styled.button`
  padding: 12px 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  font-family: var(--secondary-fonts);
  transition: all 0.3s;

  &:hover {
    opacity: 0.9;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ContentCard = styled.div`
  background-color: var(--tertiary-color);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const MediaPreview = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.8;
  }

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ContentInfo = styled.div`
  padding: 15px;
`;

const ContentTitle = styled.h3`
  font-size: 1.1rem;
  color: var(--secondary-color);
  margin-bottom: 8px;
  word-break: break-word;
  font-family: var(--primary-fonts);
`;

const ContentDescription = styled.p`
  font-size: 0.9rem;
  color: var(--secondary-color);
  opacity: 0.8;
  margin-bottom: 12px;
  word-break: break-word;
  font-family: var(--secondary-fonts);
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: var(--secondary-fonts);

  ${(props) => {
    if (props.$status === 'pending') {
      return `
        background-color: rgba(255, 193, 7, 0.2);
        color: #ffc107;
      `;
    } else if (props.$status === 'approved') {
      return `
        background-color: rgba(76, 175, 80, 0.2);
        color: #4caf50;
      `;
    } else {
      return `
        background-color: rgba(244, 67, 54, 0.2);
        color: #f44336;
      `;
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const DeleteButton = styled.button`
  flex: 1;
  padding: 6px 12px;
  background-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 0.85rem;
  font-family: var(--secondary-fonts);

  &:hover {
    background-color: rgba(244, 67, 54, 0.3);
  }
`;

const UploadModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--tertiary-color);
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  color: var(--secondary-color);
  margin-bottom: 20px;
  font-family: var(--primary-fonts);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  color: var(--secondary-color);
  font-size: 0.9rem;
  font-family: var(--secondary-fonts);
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--secondary-color);
  min-height: 80px;
  resize: vertical;
  font-family: var(--secondary-fonts);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Select = styled.select`
  padding: 10px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const Button = styled.button`
  flex: 1;
  padding: 6px 12px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  font-family: var(--secondary-fonts);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  ${(props) =>
    props.$variant === 'cancel'
      ? `
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--secondary-color);
  `
      : `
    background-color: var(--primary-color);
    color: white;
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--secondary-color);
  opacity: 0.7;
  font-family: var(--secondary-fonts);

  svg {
    font-size: 4rem;
    margin-bottom: 20px;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    font-family: var(--primary-fonts);
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

  const [formData, setFormData] = useState({
    type: 'image',
    file: null,
    title: '',
    description: '',
    code: '',
    price: '',
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
        code: formData.code,
        price: parseFloat(formData.price),
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/happy-team/upload`,
        contentData,
        { withCredentials: true }
      );

      alert('Content uploaded successfully! Waiting for admin approval.');
      setShowUploadModal(false);
      setFormData({ type: 'image', file: null, title: '', description: '', code: '', price: '' });
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
            ? '🎉 Happy Team - Admin View'
            : '🎉 My Happy Team Content'}
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
          <h3>No content yet</h3>
          <p>Start uploading images and videos to share with the team!</p>
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
                <div style={{ fontSize: '0.9rem', color: 'var(--secondary-color)', marginBottom: '10px' }}>
                  <div style={{ marginBottom: '5px' }}>
                    <strong>Code:</strong> {item.code}
                  </div>
                  <div>
                    <strong>Price:</strong> ${item.price?.toFixed(2)}
                  </div>
                </div>
                {currentUser.role === 'admin' && (
                  <div style={{ fontSize: '0.85rem', opacity: 0.8, color: 'white', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                      <FaUser />
                      <span>
                        {item.userId?.displayName}
                        {item.userId?.editorRole && ` (${item.userId.editorRole})`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaEnvelope />
                      <span>{item.userId?.email}</span>
                    </div>
                  </div>
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
                    <Button onClick={() => handleApprove(item._id)}>
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
              <FormGroup>
                <Label>Access Code *</Label>
                <Input
                  type='text'
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder='Unique code for users to redeem'
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Price (USD) *</Label>
                <Input
                  type='number'
                  step='0.01'
                  min='0'
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder='9.99'
                  required
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
    </Container>
  );

  // Admin functions
  async function handleApprove(id) {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/v1/happy-team/${id}/approve`,
        {},
        { withCredentials: true }
      );
      alert('Content approved!');
      fetchContent();
    } catch (err) {
      console.error('Error approving:', err);
      alert('Error approving content');
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
