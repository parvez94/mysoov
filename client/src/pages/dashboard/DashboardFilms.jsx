import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { Spinner } from '../../components/index';
import {
  FaFolder,
  FaFolderOpen,
  FaTrash,
  FaPlus,
  FaTimes,
  FaFilm,
  FaCheck,
  FaUpload,
  FaPlay,
} from 'react-icons/fa';

const Container = styled.div`
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
`;

const TitleSection = styled.div``;

const Title = styled.h1`
  font-family: var(--secondary-fonts);
  color: var(--primary-color);
  font-size: 32px;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 16px;
`;

const UploadButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-family: var(--primary-fonts);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
`;

const StatLabel = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  margin-bottom: 8px;
`;

const StatValue = styled.h2`
  font-family: var(--secondary-fonts);
  color: var(--primary-color);
  font-size: 28px;
  font-weight: 600;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: var(--primary-fonts);
  min-width: 800px;
`;

const Thead = styled.thead`
  background: rgba(255, 255, 255, 0.08);
`;

const Th = styled.th`
  padding: 16px;
  text-align: left;
  color: var(--primary-color);
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  transition: background 0.2s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &:not(:last-child) td {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const Td = styled.td`
  padding: 16px;
  color: var(--secondary-color);
  font-size: 14px;
  vertical-align: middle;
`;

const FolderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FolderIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
`;

const FolderName = styled.div`
  color: var(--primary-color);
  font-weight: 500;
`;

const CodeBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.3);
  font-family: monospace;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) =>
    props.$redeemed ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)'};
  color: ${(props) => (props.$redeemed ? '#4caf50' : '#ff9800')};
  border: 1px solid
    ${(props) =>
      props.$redeemed ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.3)'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const IconButton = styled.button`
  padding: 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: ${(props) => props.color || 'var(--secondary-color)'};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: ${(props) => props.color || 'rgba(255, 255, 255, 0.3)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyText = styled.p`
  font-size: 16px;
  margin-bottom: 8px;
`;

const EmptySubtext = styled.p`
  font-size: 14px;
  opacity: 0.7;
`;

const ErrorMessage = styled.div`
  padding: 20px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  color: #f44336;
  font-family: var(--primary-fonts);
  margin-bottom: 20px;
`;

const SuccessMessage = styled.div`
  padding: 20px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  color: #4caf50;
  font-family: var(--primary-fonts);
  margin-bottom: 20px;
`;

// Modal Styles
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalBox = styled.div`
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  font-family: var(--secondary-fonts);
  color: var(--primary-color);
  font-size: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--secondary-color);
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--primary-color);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-family: var(--primary-fonts);
  color: var(--primary-color);
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--primary-color);
  font-family: var(--primary-fonts);
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
  }

  &::placeholder {
    color: var(--secondary-color);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--primary-color);
  font-family: var(--primary-fonts);
  font-size: 14px;
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
  }

  &::placeholder {
    color: var(--secondary-color);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-family: var(--primary-fonts);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) =>
    props.$primary
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'rgba(255, 255, 255, 0.1)'};
  color: var(--primary-color);

  &:hover {
    background: ${(props) =>
      props.$primary
        ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
        : 'rgba(255, 255, 255, 0.15)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Films List Modal
const FilmsListModal = styled(Modal)``;

const FilmsListBox = styled(ModalBox)`
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
`;

const FilmItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 12px;
  position: relative;
`;

const FilmActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const FilmThumbnail = styled.div`
  width: 80px;
  height: 60px;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  flex-shrink: 0;
`;

const FilmInfo = styled.div`
  flex: 1;
`;

const FilmCaption = styled.div`
  color: var(--primary-color);
  font-size: 14px;
  margin-bottom: 4px;
  font-family: var(--primary-fonts);
  font-weight: 500;
`;

const FilmMeta = styled.div`
  color: var(--secondary-color);
  font-size: 12px;
  font-family: var(--primary-fonts);
`;

// Upload Modal Styles
const UploadModalBox = styled(ModalBox)`
  max-width: 600px;
`;

const DragUploadArea = styled.label`
  padding: 40px 20px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 20px;

  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.02);
  }
`;

const UploadIcon = styled.div`
  font-size: 48px;
  color: var(--secondary-color);
  margin-bottom: 12px;
`;

const UploadText = styled.p`
  font-family: var(--primary-fonts);
  color: var(--primary-color);
  font-size: 16px;
  margin-bottom: 4px;
`;

const UploadSubtext = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const SelectedFile = styled.div`
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FileIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  color: var(--primary-color);
  font-size: 14px;
  margin-bottom: 4px;
  font-family: var(--primary-fonts);
`;

const FileSize = styled.div`
  color: var(--secondary-color);
  font-size: 12px;
  font-family: var(--primary-fonts);
`;

const RemoveFileButton = styled.button`
  padding: 6px 12px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 6px;
  color: #f44336;
  font-family: var(--primary-fonts);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(244, 67, 54, 0.2);
  }
`;

const UploadProgress = styled.div`
  margin-bottom: 20px;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
  width: ${(props) => props.$progress || 0}%;
`;

const ProgressText = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 12px;
  text-align: center;
`;

const RedButton = styled(Button)`
  background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 20px auto 0;
  padding: 12px 24px;

  &:hover {
    background: linear-gradient(135deg, #e91e63 0%, #f44336 100%);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const DeleteVideoButton = styled.button`
  padding: 6px 10px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 6px;
  color: #f44336;
  font-family: var(--primary-fonts);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: rgba(244, 67, 54, 0.2);
    border-color: rgba(244, 67, 54, 0.5);
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

const WatchVideoButton = styled.button`
  padding: 6px 10px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 6px;
  color: #667eea;
  font-family: var(--primary-fonts);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.5);
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

const DashboardFilms = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [directories, setDirectories] = useState([]);
  const [stats, setStats] = useState({
    totalDirectories: 0,
    redeemedDirectories: 0,
    activeDirectories: 0,
    totalFilms: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilmsModal, setShowFilmsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState(null);
  const [formData, setFormData] = useState({
    folderName: '',
    description: '',
  });

  // Upload modal state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Redirect if not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to='/' replace />;
  }

  useEffect(() => {
    fetchDirectories();
    fetchStats();
  }, []);

  const fetchDirectories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/films/admin/directories`,
        {
          withCredentials: true,
        }
      );
      console.log('📂 Fetched directories:', response.data.directories);
      console.log('📂 Total directories:', response.data.directories?.length);
      response.data.directories?.forEach((dir, index) => {
        console.log(
          `📂 Directory ${index + 1}:`,
          dir.folderName,
          '- Films:',
          dir.films?.length,
          '- Films array:',
          dir.films
        );
      });
      setDirectories(response.data.directories || []);
    } catch (err) {
      console.error('Error fetching directories:', err);
      setError(
        err.response?.data?.message || 'Failed to load film directories'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/films/admin/directories/stats`,
        {
          withCredentials: true,
        }
      );
      setStats(response.data.stats || {});
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/films/admin/directories`,
        formData,
        {
          withCredentials: true,
        }
      );
      setSuccess('Film directory created successfully!');
      setShowCreateModal(false);
      setFormData({ folderName: '', description: '' });
      fetchDirectories();
      fetchStats();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating directory:', err);
      setError(err.response?.data?.message || 'Failed to create directory');
    }
  };

  const handleDeleteDirectory = async (directoryId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this directory? All films will be unmarked.'
      )
    ) {
      return;
    }

    try {
      setError(null);
      await axios.delete(
        `${
          import.meta.env.VITE_API_URL
        }/api/v1/films/admin/directories/${directoryId}`,
        {
          withCredentials: true,
        }
      );
      setSuccess('Directory deleted successfully!');
      fetchDirectories();
      fetchStats();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting directory:', err);
      setError(err.response?.data?.message || 'Failed to delete directory');
    }
  };

  const handleViewFilms = async (directory) => {
    console.log('📁 Opening directory:', directory);
    console.log('📁 Films in directory:', directory.films);
    console.log('📁 Films count:', directory.films?.length);

    // Fetch the directory with populated films to ensure we have the latest data
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/films/admin/directories/${
          directory._id
        }`,
        { withCredentials: true }
      );
      console.log('📁 Fetched directory with films:', response.data.directory);
      console.log('📁 Populated films:', response.data.directory.films);
      setSelectedDirectory(response.data.directory);
    } catch (err) {
      console.error('Error fetching directory:', err);
      // Fallback to the directory from the list
      setSelectedDirectory(directory);
    }

    setShowFilmsModal(true);
  };

  const handleOpenUploadModal = (directory) => {
    setSelectedDirectory(directory);
    setShowFilmsModal(false);
    setShowUploadModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadFile(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleUploadFilm = async () => {
    if (!uploadFile || !selectedDirectory) return;

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      // Step 1: Get Cloudinary signature from server
      const signatureResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/upload/signature`,
        {
          folder: 'videos',
          resourceType: 'video',
        },
        { withCredentials: true }
      );

      const { signature, timestamp, cloudName, apiKey, folder } =
        signatureResponse.data;

      // Step 2: Upload directly to Cloudinary
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', uploadFile);
      cloudinaryFormData.append('signature', signature);
      cloudinaryFormData.append('timestamp', timestamp);
      cloudinaryFormData.append('api_key', apiKey);
      cloudinaryFormData.append('folder', folder);

      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        cloudinaryFormData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      const uploadResult = {
        url: cloudinaryResponse.data.secure_url,
        public_id: cloudinaryResponse.data.public_id,
        provider: 'cloudinary',
      };

      // Step 3: Create the video entry with the uploaded file info
      const videoData = {
        caption: uploadCaption || 'Untitled Film',
        videoUrl: uploadResult, // This is the full response object with { url, public_id, provider }
        mediaType: 'video',
        privacy: 'Private', // Films are private by default (capitalized)
        storageProvider: uploadResult.provider || 'cloudinary',
        isFilm: true, // Mark as film to exclude from regular feeds
        filmDirectoryId: selectedDirectory._id, // Link to directory
      };

      const videoResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/videos`,
        videoData,
        { withCredentials: true }
      );

      const videoId = videoResponse.data.video?._id;

      // Step 4: Assign the video to the film directory
      if (videoId) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/films/admin/directories/${
            selectedDirectory._id
          }/films`,
          { videoId },
          { withCredentials: true }
        );
      }

      setSuccess('Film uploaded successfully!');
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadCaption('');
      setUploadProgress(0);

      // Fetch updated directories
      await fetchDirectories();

      // Update the selectedDirectory with fresh data
      const updatedResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/films/admin/directories/${
          selectedDirectory._id
        }`,
        { withCredentials: true }
      );
      setSelectedDirectory(updatedResponse.data.directory);

      fetchStats();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error uploading film:', err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error?.message ||
          'Failed to upload film'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSyncOrphanedFilms = async () => {
    try {
      setError(null);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/films/admin/sync-orphaned`,
        {},
        { withCredentials: true }
      );
      setSuccess(response.data.message);
      console.log('✅ Sync result:', response.data);
      // Refresh directories after sync
      await fetchDirectories();
      await fetchStats();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error syncing films:', err);
      setError(err.response?.data?.message || 'Failed to sync films');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      setError(null);
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/v1/videos/${videoId}`,
        { withCredentials: true }
      );
      setSuccess('Video deleted successfully!');

      // Refresh the directory data
      if (selectedDirectory) {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/films/admin/directories/${
            selectedDirectory._id
          }`,
          { withCredentials: true }
        );
        setSelectedDirectory(response.data.directory);
      }

      await fetchDirectories();
      await fetchStats();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting video:', err);
      setError(err.response?.data?.message || 'Failed to delete video');
    }
  };

  const handleWatchVideo = (videoId) => {
    // Open video in a new tab
    window.open(`/video/${videoId}`, '_blank');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Container>
        <Spinner />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <TitleSection>
          <Title>Film Directories</Title>
          <Subtitle>
            Manage film folders - folder name is the access code
          </Subtitle>
        </TitleSection>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleSyncOrphanedFilms}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            🔄 Sync Films
          </button>
          <UploadButton onClick={() => setShowCreateModal(true)}>
            <FaPlus />
            Create New Folder
          </UploadButton>
        </div>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <StatsGrid>
        <StatCard>
          <StatLabel>Total Directories</StatLabel>
          <StatValue>{stats.totalDirectories || 0}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Active Directories</StatLabel>
          <StatValue>{stats.activeDirectories || 0}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Redeemed</StatLabel>
          <StatValue>{stats.redeemedDirectories || 0}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Total Films</StatLabel>
          <StatValue>{stats.totalFilms || 0}</StatValue>
        </StatCard>
      </StatsGrid>

      <TableWrapper>
        <Table>
          <Thead>
            <Tr>
              <Th>Folder Name (Access Code)</Th>
              <Th>Films</Th>
              <Th>Status</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {directories.length === 0 ? (
              <tr>
                <td colSpan='5'>
                  <EmptyState>
                    <EmptyIcon>
                      <FaFolder />
                    </EmptyIcon>
                    <EmptyText>No film directories yet</EmptyText>
                    <EmptySubtext>
                      Click "Create New Folder" to get started
                    </EmptySubtext>
                  </EmptyState>
                </td>
              </tr>
            ) : (
              directories.map((directory) => (
                <Tr
                  key={directory._id}
                  onClick={() => handleViewFilms(directory)}
                >
                  <Td>
                    <FolderInfo>
                      <FolderIcon>
                        {directory.isRedeemed ? <FaFolderOpen /> : <FaFolder />}
                      </FolderIcon>
                      <FolderName>{directory.folderName}</FolderName>
                    </FolderInfo>
                  </Td>
                  <Td>
                    <span style={{ color: '#667eea' }}>
                      {directory.films?.length || 0} film(s)
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge $redeemed={directory.isRedeemed}>
                      {directory.isRedeemed ? 'Redeemed' : 'Active'}
                    </StatusBadge>
                  </Td>
                  <Td>{formatDate(directory.createdAt)}</Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <ActionButtons>
                      <IconButton
                        onClick={() => handleViewFilms(directory)}
                        title='View Films'
                      >
                        <FaFolderOpen />
                      </IconButton>
                      <IconButton
                        color='#f44336'
                        onClick={() => handleDeleteDirectory(directory._id)}
                        title='Delete Directory'
                      >
                        <FaTrash />
                      </IconButton>
                    </ActionButtons>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableWrapper>

      {/* Create Folder Modal */}
      {showCreateModal && (
        <Modal onClick={() => setShowCreateModal(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Create New Film Directory</ModalTitle>
              <CloseButton onClick={() => setShowCreateModal(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            <form onSubmit={handleCreateFolder}>
              <FormGroup>
                <Label>Folder Name (This will be the access code) *</Label>
                <Input
                  type='text'
                  placeholder='e.g., JohnDoeFilms2024'
                  value={formData.folderName}
                  onChange={(e) =>
                    setFormData({ ...formData, folderName: e.target.value })
                  }
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Description (Optional)</Label>
                <TextArea
                  placeholder='Add a description for this directory...'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </FormGroup>
              <ModalButtons>
                <Button type='button' onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type='submit' $primary>
                  Create Directory
                </Button>
              </ModalButtons>
            </form>
          </ModalBox>
        </Modal>
      )}

      {/* View Films Modal */}
      {showFilmsModal && selectedDirectory && (
        <FilmsListModal onClick={() => setShowFilmsModal(false)}>
          <FilmsListBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedDirectory.folderName} - Films</ModalTitle>
              <CloseButton onClick={() => setShowFilmsModal(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            {!selectedDirectory.films ||
            selectedDirectory.films.length === 0 ? (
              <EmptyState>
                <EmptyIcon>
                  <FaFilm />
                </EmptyIcon>
                <EmptyText>No films in this directory</EmptyText>
                <EmptySubtext>
                  Click the button below to upload films
                </EmptySubtext>
                <RedButton
                  onClick={() => handleOpenUploadModal(selectedDirectory)}
                >
                  <FaUpload />
                  Upload
                </RedButton>
              </EmptyState>
            ) : (
              <>
                <RedButton
                  onClick={() => handleOpenUploadModal(selectedDirectory)}
                  style={{ marginBottom: '1rem' }}
                >
                  <FaUpload />
                  Upload More Films
                </RedButton>
                {selectedDirectory.films.map((film) => (
                  <FilmItem key={film._id}>
                    <FilmThumbnail>
                      <FaFilm />
                    </FilmThumbnail>
                    <FilmInfo>
                      <FilmCaption>
                        {film.caption || 'Untitled Film'}
                      </FilmCaption>
                      <FilmMeta>
                        {film.mediaType} • {formatDate(film.createdAt)}
                      </FilmMeta>
                    </FilmInfo>
                    <FilmActions>
                      <WatchVideoButton
                        onClick={() => handleWatchVideo(film._id)}
                      >
                        <FaPlay />
                        Watch
                      </WatchVideoButton>
                      <DeleteVideoButton
                        onClick={() => handleDeleteVideo(film._id)}
                      >
                        <FaTrash />
                        Delete
                      </DeleteVideoButton>
                    </FilmActions>
                  </FilmItem>
                ))}
              </>
            )}
          </FilmsListBox>
        </FilmsListModal>
      )}

      {/* Upload Film Modal */}
      {showUploadModal && selectedDirectory && (
        <Modal onClick={() => !isUploading && setShowUploadModal(false)}>
          <UploadModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                Upload Film to {selectedDirectory.folderName}
              </ModalTitle>
              <CloseButton
                onClick={() => !isUploading && setShowUploadModal(false)}
                disabled={isUploading}
              >
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            {!uploadFile ? (
              <DragUploadArea htmlFor='film-upload'>
                <HiddenInput
                  id='film-upload'
                  type='file'
                  accept='video/*'
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                <UploadIcon>
                  <FaUpload />
                </UploadIcon>
                <UploadText>Click to select a video file</UploadText>
                <UploadSubtext>or drag and drop here</UploadSubtext>
              </DragUploadArea>
            ) : (
              <>
                <SelectedFile>
                  <FileIcon>
                    <FaFilm />
                  </FileIcon>
                  <FileInfo>
                    <FileName>{uploadFile.name}</FileName>
                    <FileSize>{formatFileSize(uploadFile.size)}</FileSize>
                  </FileInfo>
                  {!isUploading && (
                    <RemoveFileButton onClick={handleRemoveFile}>
                      Remove
                    </RemoveFileButton>
                  )}
                </SelectedFile>

                <FormGroup>
                  <Label>Title (Optional)</Label>
                  <TextArea
                    placeholder='Add a title for this film...'
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    disabled={isUploading}
                  />
                </FormGroup>

                {isUploading && (
                  <UploadProgress>
                    <ProgressBarContainer>
                      <ProgressBarFill $progress={uploadProgress} />
                    </ProgressBarContainer>
                    <ProgressText>Uploading... {uploadProgress}%</ProgressText>
                  </UploadProgress>
                )}

                <ModalButtons>
                  <Button
                    type='button'
                    onClick={() => setShowUploadModal(false)}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='button'
                    $primary
                    onClick={handleUploadFilm}
                    disabled={isUploading || !uploadFile}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Film'}
                  </Button>
                </ModalButtons>
              </>
            )}
          </UploadModalBox>
        </Modal>
      )}
    </Container>
  );
};

export default DashboardFilms;
