import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { Spinner } from '../../components/index';
import {
  FaTrash,
  FaPlus,
  FaTimes,
  FaFilm,
  FaUpload,
  FaPlay,
  FaImage,
  FaFolder,
  FaArrowLeft,
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

const FilmTitle = styled.div`
  color: var(--primary-color);
  font-weight: 500;
  margin-bottom: 4px;
`;

const CodeBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.3);
  font-family: monospace;
  text-transform: uppercase;
`;

const PriceBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
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
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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
  color: var(--secondary-color);
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
  color: #fff;
  font-family: var(--primary-fonts);
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
  }

  &::placeholder {
    color: rgb(113, 118, 123);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
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
    props.$primary ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)'};
  color: var(--secondary-color);

  &:hover {
    background: ${(props) =>
      props.$primary ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.15)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

const TabButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
`;

const TabButton = styled.button`
  padding: 12px 24px;
  background: ${props => props.$active ? 'rgba(102, 126, 234, 0.2)' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#667eea' : 'transparent'};
  color: ${props => props.$active ? '#667eea' : 'var(--secondary-color)'};
  font-family: var(--primary-fonts);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: -2px;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const ImageCard = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DeleteImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 6px;
  background: rgba(244, 67, 54, 0.9);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;

  ${ImageCard}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(244, 67, 54, 1);
    transform: scale(1.1);
  }
`;

const DragDropZone = styled.div`
  border: 2px dashed ${props => props.$isDragging ? '#667eea' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background: ${props => props.$isDragging ? 'rgba(102, 126, 234, 0.05)' : 'rgba(255, 255, 255, 0.02)'};
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }

  input[type="file"] {
    display: none;
  }
`;

const DragDropText = styled.div`
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
  
  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: ${props => props.$isDragging ? '#667eea' : 'var(--secondary-color)'};
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
    color: #667eea;
  }
`;

const BackButton = styled.button`
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  margin-bottom: 20px;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const DashboardFilms = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [films, setFilms] = useState([]);
  const [directories, setDirectories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currency, setCurrency] = useState('usd');
  const [activeTab, setActiveTab] = useState('films');

  // Upload form state
  const [uploadFile, setUploadFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    price: 0,
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const abortControllerRef = useRef(null);

  // Image gallery state
  const [selectedDirectory, setSelectedDirectory] = useState(null);
  const [directoryImages, setDirectoryImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);
  
  // Directory creation state
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);
  const [directoryFormData, setDirectoryFormData] = useState({
    folderName: '',
    description: '',
    price: 0,
  });

  // Redirect if not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to='/' replace />;
  }

  const getCurrencySymbol = (currencyCode) => {
    const symbols = {
      usd: '$',
      eur: '€',
      gbp: '£',
      jpy: '¥',
      cad: 'CA$',
      aud: 'A$',
      chf: 'CHF',
      cny: '¥',
      inr: '₹',
    };
    return symbols[currencyCode?.toLowerCase()] || '$';
  };

  useEffect(() => {
    if (activeTab === 'films') {
      fetchFilms();
    } else if (activeTab === 'galleries') {
      fetchDirectories();
    }
    fetchCurrency();
  }, [activeTab]);

  const fetchCurrency = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/admin/stripe-settings`,
        { withCredentials: true }
      );
      setCurrency(response.data.stripeConfig?.currency || 'usd');
    } catch (err) {
      console.error('Failed to fetch currency:', err);
    }
  };

  const fetchFilms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/films/admin/films`,
        {
          withCredentials: true,
        }
      );
      setFilms(response.data.films || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load films');
    } finally {
      setIsLoading(false);
    }
  };

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
      setDirectories(response.data.directories || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load directories');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDirectoryImages = async (directoryId) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/films/admin/directories/${directoryId}/images`,
        {
          withCredentials: true,
        }
      );
      setDirectoryImages(response.data.images || []);
      setSelectedDirectory(response.data.directory);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleRemoveFile = () => {
    // Cancel ongoing upload if there is one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setUploadFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setError(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleUploadFilm = async () => {
    if (!uploadFile || !formData.title || !formData.code) {
      setError('Please fill in all fields and select a video file');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      // Create AbortController for cancellation support
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Step 1: Upload video to server (respects storage provider settings)
      const uploadFormData = new FormData();
      uploadFormData.append('video', uploadFile);

      const uploadResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/upload`,
        uploadFormData,
        {
          withCredentials: true,
          signal: controller.signal,
          timeout: 3600000, // 1 hour timeout for large files
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(Math.min(95, percentCompleted));
            }
          },
        }
      );

      const uploadResult = {
        url: uploadResponse.data.url,
        public_id: uploadResponse.data.public_id,
        provider: uploadResponse.data.provider || 'local',
      };

      // Include thumbnailUrl if server generated one
      if (uploadResponse.data.thumbnailUrl) {
        uploadResult.thumbnailUrl = uploadResponse.data.thumbnailUrl;
      }

      // Step 2: Create the film entry
      const filmData = {
        caption: formData.title,
        customerCode: formData.code,
        purchasePrice: isNaN(parseFloat(formData.price)) ? 0 : parseFloat(formData.price),
        videoUrl: uploadResult,
        thumbnail: uploadResult.thumbnailUrl || '',
        storageProvider: uploadResult.provider,
        fileSize: uploadResult.fileSize || 0,
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/films/admin/films`,
        filmData,
        { withCredentials: true }
      );

      setSuccess('Film uploaded successfully!');
      setShowUploadModal(false);
      setUploadFile(null);
      setFormData({ title: '', code: '', price: 0 });
      setUploadProgress(100);
      abortControllerRef.current = null;

      // Fetch updated films
      await fetchFilms();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      // Handle cancellation
      if (err.code === 'ERR_CANCELED' || err.name === 'CanceledError') {
        setError('Upload cancelled');
        setUploadProgress(0);
      } else {
        setError(
          err.response?.data?.msg ||
            err.response?.data?.message ||
            err.response?.data?.error?.message ||
            'Failed to upload film'
        );
      }
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  };

  const handleDeleteFilm = async (filmId) => {
    if (!window.confirm('Are you sure you want to delete this film?')) {
      return;
    }

    try {
      setError(null);
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/v1/films/admin/films/${filmId}`,
        { withCredentials: true }
      );
      setSuccess('Film deleted successfully!');
      await fetchFilms();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete film');
    }
  };

  const handleWatchVideo = (filmId) => {
    window.open(`/post/${filmId}`, '_blank');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
      handleImageFiles(e.dataTransfer.files);
    }
  };

  const handleImageInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageFiles(e.target.files);
    }
  };

  const handleImageFiles = (fileList) => {
    const filesArray = Array.from(fileList);
    const imageFiles = filesArray.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setError('Please select valid image files');
      return;
    }

    setSelectedImages(prev => [...prev, ...imageFiles]);
  };

  const removeSelectedImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadImages = async () => {
    if (!selectedDirectory || selectedImages.length === 0) {
      setError('Please select images to upload');
      return;
    }

    try {
      setUploadingImages(true);
      setError(null);
      setUploadProgress(0);

      const uploadedImageData = [];

      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];
        
        setUploadProgress(Math.floor((i / selectedImages.length) * 90));

        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        const uploadResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/upload`,
          uploadFormData,
          {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        uploadedImageData.push({
          url: uploadResponse.data.url,
          publicId: uploadResponse.data.public_id,
          provider: uploadResponse.data.provider || 'local',
          fileSize: uploadResponse.data.fileSize || 0,
        });
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/films/admin/directories/${selectedDirectory._id}/images`,
        { images: uploadedImageData },
        { withCredentials: true }
      );

      setSuccess(`${selectedImages.length} image(s) uploaded successfully!`);
      setSelectedImages([]);
      setUploadProgress(100);
      await fetchDirectoryImages(selectedDirectory._id);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      setError(null);
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/v1/films/admin/images/${imageId}`,
        { withCredentials: true }
      );
      setSuccess('Image deleted successfully!');
      await fetchDirectoryImages(selectedDirectory._id);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete image');
    }
  };

  const handleViewGallery = (directory) => {
    fetchDirectoryImages(directory._id);
  };

  const handleBackToDirectories = () => {
    setSelectedDirectory(null);
    setDirectoryImages([]);
    setSelectedImages([]);
  };

  const handleCreateDirectory = async () => {
    if (!directoryFormData.folderName) {
      setError('Folder name is required');
      return;
    }

    try {
      setError(null);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/films/admin/directories`,
        directoryFormData,
        { withCredentials: true }
      );
      setSuccess('Directory created successfully!');
      setShowDirectoryModal(false);
      setDirectoryFormData({ folderName: '', description: '', price: 0 });
      await fetchDirectories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create directory');
    }
  };

  const handleDeleteDirectory = async (directoryId) => {
    if (!window.confirm('Are you sure you want to delete this directory? All images in it will be deleted.')) {
      return;
    }

    try {
      setError(null);
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/v1/films/admin/directories/${directoryId}`,
        { withCredentials: true }
      );
      setSuccess('Directory deleted successfully!');
      await fetchDirectories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete directory');
    }
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
          <Title>Films Management</Title>
          <Subtitle>
            {activeTab === 'films' 
              ? 'Upload videos with customer codes for frontpage redemption'
              : 'Manage image galleries for film directories'}
          </Subtitle>
        </TitleSection>
        {activeTab === 'films' ? (
          <UploadButton onClick={() => setShowUploadModal(true)}>
            <FaPlus />
            Upload New Film
          </UploadButton>
        ) : !selectedDirectory && (
          <UploadButton onClick={() => setShowDirectoryModal(true)}>
            <FaPlus />
            Create Directory
          </UploadButton>
        )}
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      {!selectedDirectory && (
        <TabButtons>
          <TabButton 
            $active={activeTab === 'films'} 
            onClick={() => setActiveTab('films')}
          >
            <FaFilm /> Films
          </TabButton>
          <TabButton 
            $active={activeTab === 'galleries'} 
            onClick={() => setActiveTab('galleries')}
          >
            <FaFolder /> Image Galleries
          </TabButton>
        </TabButtons>
      )}

      {activeTab === 'films' ? (
        <>
          <StatsGrid>
            <StatCard>
              <StatLabel>Total Films</StatLabel>
              <StatValue>{films.length}</StatValue>
            </StatCard>
          </StatsGrid>

          <TableWrapper>
            <Table>
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>Customer Code</Th>
              <Th>Price</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {films.length === 0 ? (
              <tr>
                <td colSpan='5'>
                  <EmptyState>
                    <EmptyIcon>
                      <FaFilm />
                    </EmptyIcon>
                    <EmptyText>No films yet</EmptyText>
                    <EmptySubtext>
                      Click "Upload New Film" to get started
                    </EmptySubtext>
                  </EmptyState>
                </td>
              </tr>
            ) : (
              films.map((film) => (
                <Tr key={film._id}>
                  <Td>
                    <FilmTitle>{film.caption || 'Untitled'}</FilmTitle>
                  </Td>
                  <Td>
                    <CodeBadge>{film.customerCode}</CodeBadge>
                  </Td>
                  <Td>
                    <PriceBadge>
                      {getCurrencySymbol(currency)}
                      {film.purchasePrice?.toFixed(2) || '0.00'}
                    </PriceBadge>
                  </Td>
                  <Td>{formatDate(film.createdAt)}</Td>
                  <Td>
                    <ActionButtons>
                      <IconButton
                        color='#667eea'
                        onClick={() => handleWatchVideo(film._id)}
                        title='Watch Video'
                      >
                        <FaPlay />
                      </IconButton>
                      <IconButton
                        color='#f44336'
                        onClick={() => handleDeleteFilm(film._id)}
                        title='Delete Film'
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
        </>
      ) : selectedDirectory ? (
        <>
          <BackButton onClick={handleBackToDirectories}>
            <FaArrowLeft /> Back to Directories
          </BackButton>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '8px' }}>
              {selectedDirectory.folderName}
            </h3>
            <p style={{ color: 'var(--secondary-color)', fontSize: '14px' }}>
              {selectedDirectory.description || 'No description'}
            </p>
          </div>

          <DragDropZone
            $isDragging={dragActive}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageInput}
            />
            <DragDropText $isDragging={dragActive}>
              <div className="icon">
                <FaImage />
              </div>
              <h4>Drag & Drop Images Here</h4>
              <p>or click to browse</p>
              <p>Multiple images supported</p>
            </DragDropText>
          </DragDropZone>

          {selectedImages.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '12px' 
              }}>
                <p style={{ color: 'var(--secondary-color)' }}>
                  {selectedImages.length} image(s) selected
                </p>
                <Button 
                  $primary 
                  onClick={handleUploadImages}
                  disabled={uploadingImages}
                >
                  {uploadingImages ? 'Uploading...' : 'Upload Images'}
                </Button>
              </div>

              {uploadingImages && (
                <UploadProgress>
                  <ProgressBarContainer>
                    <ProgressBarFill $progress={uploadProgress} />
                  </ProgressBarContainer>
                  <ProgressText>Uploading... {uploadProgress}%</ProgressText>
                </UploadProgress>
              )}

              <GalleryGrid>
                {selectedImages.map((file, index) => (
                  <ImageCard key={index}>
                    <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} />
                    <DeleteImageButton onClick={() => removeSelectedImage(index)}>
                      <FaTimes />
                    </DeleteImageButton>
                  </ImageCard>
                ))}
              </GalleryGrid>
            </div>
          )}

          <div style={{ marginTop: '30px' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '16px' }}>
              Uploaded Images ({directoryImages.length})
            </h4>
            {directoryImages.length === 0 ? (
              <EmptyState>
                <EmptyIcon><FaImage /></EmptyIcon>
                <EmptyText>No images yet</EmptyText>
                <EmptySubtext>Upload images to get started</EmptySubtext>
              </EmptyState>
            ) : (
              <GalleryGrid>
                {directoryImages.map((image) => (
                  <ImageCard key={image._id}>
                    <img 
                      src={image.imageUrl?.startsWith('http') 
                        ? image.imageUrl 
                        : `${import.meta.env.VITE_API_URL}${image.imageUrl}`
                      } 
                      alt={image.title || 'Image'} 
                    />
                    <DeleteImageButton onClick={() => handleDeleteImage(image._id)}>
                      <FaTrash />
                    </DeleteImageButton>
                  </ImageCard>
                ))}
              </GalleryGrid>
            )}
          </div>
        </>
      ) : (
        <>
          <StatsGrid>
            <StatCard>
              <StatLabel>Total Directories</StatLabel>
              <StatValue>{directories.length}</StatValue>
            </StatCard>
          </StatsGrid>

          <TableWrapper>
            <Table>
              <Thead>
                <Tr>
                  <Th>Folder Name (Access Code)</Th>
                  <Th>Description</Th>
                  <Th>Price</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {directories.length === 0 ? (
                  <tr>
                    <td colSpan='4'>
                      <EmptyState>
                        <EmptyIcon><FaFolder /></EmptyIcon>
                        <EmptyText>No directories yet</EmptyText>
                        <EmptySubtext>
                          Create a directory first to upload images
                        </EmptySubtext>
                      </EmptyState>
                    </td>
                  </tr>
                ) : (
                  directories.map((directory) => (
                    <Tr key={directory._id}>
                      <Td>
                        <CodeBadge>{directory.folderName}</CodeBadge>
                      </Td>
                      <Td>{directory.description || 'No description'}</Td>
                      <Td>
                        <PriceBadge>
                          {getCurrencySymbol(currency)}
                          {directory.price?.toFixed(2) || '0.00'}
                        </PriceBadge>
                      </Td>
                      <Td>
                        <ActionButtons>
                          <IconButton
                            color='#667eea'
                            onClick={() => handleViewGallery(directory)}
                            title='Manage Images'
                          >
                            <FaFolder />
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
        </>
      )}

      {/* Create Directory Modal */}
      {showDirectoryModal && (
        <Modal onClick={() => setShowDirectoryModal(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Create New Directory</ModalTitle>
              <CloseButton onClick={() => setShowDirectoryModal(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <FormGroup>
              <Label>Folder Name (Access Code) *</Label>
              <Input
                type='text'
                placeholder='e.g., WEDDING2024'
                value={directoryFormData.folderName}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    folderName: e.target.value.toUpperCase(),
                  })
                }
                style={{ textTransform: 'uppercase' }}
              />
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <Input
                type='text'
                placeholder='Enter description'
                value={directoryFormData.description}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    description: e.target.value,
                  })
                }
              />
            </FormGroup>

            <FormGroup>
              <Label>Price ($)</Label>
              <Input
                type='number'
                placeholder='0.00'
                min='0'
                step='0.01'
                value={directoryFormData.price}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    price: e.target.value,
                  })
                }
              />
            </FormGroup>

            <ModalButtons>
              <Button onClick={() => setShowDirectoryModal(false)}>
                Cancel
              </Button>
              <Button
                $primary
                onClick={handleCreateDirectory}
                disabled={!directoryFormData.folderName}
              >
                Create Directory
              </Button>
            </ModalButtons>
          </ModalBox>
        </Modal>
      )}

      {/* Upload Film Modal */}
      {showUploadModal && (
        <Modal onClick={() => !isUploading && setShowUploadModal(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Upload New Film</ModalTitle>
              <CloseButton
                onClick={() => setShowUploadModal(false)}
                disabled={isUploading}
              >
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            {!uploadFile ? (
              <DragUploadArea>
                <HiddenInput
                  type='file'
                  accept='video/*,.mkv'
                  onChange={handleFileSelect}
                />
                <UploadIcon>
                  <FaUpload />
                </UploadIcon>
                <UploadText>Click to select video</UploadText>
                <UploadSubtext>MP4, MOV, AVI, MKV supported</UploadSubtext>
              </DragUploadArea>
            ) : (
              <SelectedFile>
                <FileIcon>
                  <FaFilm />
                </FileIcon>
                <FileInfo>
                  <FileName>{uploadFile.name}</FileName>
                  <FileSize>{formatFileSize(uploadFile.size)}</FileSize>
                </FileInfo>
                <RemoveFileButton
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                >
                  Remove
                </RemoveFileButton>
              </SelectedFile>
            )}

            {isUploading && (
              <UploadProgress>
                <ProgressBarContainer>
                  <ProgressBarFill $progress={uploadProgress} />
                </ProgressBarContainer>
                <ProgressText>Uploading... {uploadProgress}%</ProgressText>
              </UploadProgress>
            )}

            <FormGroup>
              <Label>Title *</Label>
              <Input
                type='text'
                placeholder='Enter film title'
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                disabled={isUploading}
              />
            </FormGroup>

            <FormGroup>
              <Label>Customer Code *</Label>
              <Input
                type='text'
                placeholder='e.g., SUMMER2024'
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                disabled={isUploading}
                style={{ textTransform: 'uppercase' }}
              />
            </FormGroup>

            <FormGroup>
              <Label>Price ($)</Label>
              <Input
                type='number'
                placeholder='0.00'
                min='0'
                step='0.01'
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                disabled={isUploading}
              />
            </FormGroup>

            <ModalButtons>
              <Button
                onClick={() => setShowUploadModal(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                $primary
                onClick={handleUploadFilm}
                disabled={
                  isUploading ||
                  !uploadFile ||
                  !formData.title ||
                  !formData.code
                }
              >
                {isUploading ? 'Uploading...' : 'Upload Film'}
              </Button>
            </ModalButtons>
          </ModalBox>
        </Modal>
      )}
    </Container>
  );
};

export default DashboardFilms;
