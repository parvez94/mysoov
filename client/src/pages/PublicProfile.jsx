import { useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import { IoClose, IoCamera } from 'react-icons/io5';
import { loginSuccess } from '../redux/user/userSlice';
import {
  FollowButton,
  PostCard,
  ArticleCard,
  VerifiedBadge,
} from '../components';
import { resolveImageUrl } from '../utils/imageUtils';
import { useUsernameCheck } from '../hooks/useUsernameCheck';
import UsernameAvailabilityIndicator from '../components/UsernameAvailabilityIndicator';
import UserListModal from '../components/modal/UserListModal';
import NotFound from './NotFound';

const API = import.meta.env.VITE_API_URL;

const Container = styled.div`
  padding: 20px 50px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const CoverImageWrapper = styled.div`
  position: relative;
  width: calc(100% + 100px);
  margin-left: -50px;
  margin-top: -20px;
  margin-bottom: 20px;
  height: 250px;
  background: ${(props) =>
    props.$src ? `url(${props.$src})` : 'rgba(255, 255, 255, 0.1)'};
  background-size: cover;
  background-position: center ${(props) => props.$position || 50}%;
  border-radius: 0;
  overflow: hidden;
  cursor: ${(props) => (props.$isDraggable ? 'grab' : 'default')};

  &:active {
    cursor: ${(props) => (props.$isDraggable ? 'grabbing' : 'default')};
  }

  @media (max-width: 768px) {
    width: calc(100% + 32px);
    margin-left: -16px;
    margin-top: -16px;
    height: 180px;
  }
`;

const CoverUploadButton = styled.button`
  position: absolute;
  bottom: 16px;
  right: 16px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.85);
    border-color: rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 13px;
  }
`;

const SavePositionButton = styled.button`
  position: absolute;
  bottom: 16px;
  right: 180px; // Position to the left of Change Cover button
  padding: 10px 16px;
  background: rgba(0, 150, 0, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 6px;
  color: white;
  font-family: var(--secondary-fonts);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 180, 0, 0.9);
    border-color: rgba(0, 255, 0, 0.5);
  }

  @media (max-width: 768px) {
    right: 150px; // Adjust for mobile
    padding: 8px 12px;
    font-size: 13px;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const InfoWrapper = styled.div`
  position: relative;
`;

const ProfileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  min-height: 70px;

  @media (max-width: 768px) {
    min-height: 50px;
  }
`;

const UserImage = styled.img`
  width: 140px;
  height: 140px;
  display: block;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  aspect-ratio: 1 / 1;
  border: 4px solid var(--primary-color);
  background: var(--primary-color);
  margin-top: -70px;
  position: relative;
  z-index: 10;

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    margin-top: -50px;
    border-width: 3px;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  padding-top: 12px;
`;

const UserInfo = styled.div`
  margin-top: 12px;
`;

const DisplayName = styled.h3`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 24px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const UserName = styled.h5`
  font-family: var(--secondary-fonts);
  color: rgba(255, 255, 255, 0.6);
  font-size: 15px;
  margin-bottom: 16px;
`;

const ActionButton = styled.button`
  font-family: var(--secondary-fonts);
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--secondary-color);
  background-color: transparent;
  color: var(--secondary-color);
  border-radius: 3px;
  cursor: pointer;
`;

const UserStats = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  margin-bottom: 12px;
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
`;

const Stat = styled.span`
  color: var(--secondary-color);
`;

const ClickableStat = styled.span`
  color: var(--secondary-color);
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const Dot = styled.span`
  opacity: 0.6;
`;

const UserBio = styled.div`
  margin-top: 8px;
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  white-space: pre-wrap;
`;

const VideosWrapper = styled.div`
  margin-top: 40px;
`;

const Navbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
`;

const Tab = styled.div`
  padding: 6px 15px;
  flex: 1;
  cursor: pointer;
  background-color: ${(p) =>
    p.$active ? 'rgba(255, 255, 255, 0.12)' : 'transparent'};
`;

const VideosContainer = styled.div`
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

// Saved list UI (author header + video)
const SavedCard = styled.div``;
const SavedHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
`;
const SavedAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background: #222;
  display: block;
  flex-shrink: 0;
  aspect-ratio: 1 / 1;
`;
const SavedNames = styled.div``;
const SavedDisplayName = styled.div`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
`;
const SavedUsername = styled.div`
  font-family: var(--secondary-fonts);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
`;

// Modal styles (reused here to avoid navigating away)
const ModalWrapper = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2147483647;
  padding: 16px;
  overflow: auto;
`;

const ModalContent = styled.div`
  position: relative;
  background-color: var(--tertiary-color);
  width: min(480px, 100%);
  max-height: 90dvh;
  border-radius: 10px;
  overflow: auto;
  padding: 20px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: var(--secondary-color);
  cursor: pointer;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Label = styled.label`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  min-height: 90px;
  resize: vertical;
`;

const AvatarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Avatar = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  background: #222;
  display: block;
  flex-shrink: 0;
  aspect-ratio: 1 / 1;
`;

const Small = styled.small`
  color: rgba(255, 255, 255, 0.7);
  font-family: var(--secondary-fonts);
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
`;

const SecondaryBtn = styled(ActionButton)`
  opacity: 0.9;
`;

const PrimaryBtn = styled(ActionButton)`
  background: var(--secondary-color);
  color: #111;
  border-color: var(--secondary-color);
`;

const LoadingContainer = styled.div`
  padding: 20px 50px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const LoadingUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    gap: 20px;
    margin-bottom: 24px;
  }
`;

const LoadingAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  animation: pulse 1.5s ease-in-out infinite;

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }

  @keyframes pulse {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 0.3;
    }
    100% {
      opacity: 0.6;
    }
  }
`;

const LoadingText = styled.div`
  height: ${(props) => props.height || '20px'};
  width: ${(props) => props.width || '100%'};
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: ${(props) => props.marginBottom || '8px'};
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 0.3;
    }
    100% {
      opacity: 0.6;
    }
  }
`;

const LoadingUserNames = styled.div`
  flex: 1;
`;

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [articles, setArticles] = useState([]);
  const [savedVideos, setSavedVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'videos' | 'articles' | 'bookmarked'
  const [openEdit, setOpenEdit] = useState(false);
  const [displayNameEdit, setDisplayNameEdit] = useState('');
  const [usernameEdit, setUsernameEdit] = useState('');
  const [bioEdit, setBioEdit] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [savedVideosLoading, setSavedVideosLoading] = useState(false);

  // Modal states
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Cover image positioning
  const [coverPosition, setCoverPosition] = useState(50); // Y-axis position percentage
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(50);
  const [showSavePositionButton, setShowSavePositionButton] = useState(false);

  // Refs
  const coverInputRef = useRef(null);
  const coverWrapperRef = useRef(null);

  // Username availability check
  const usernameCheck = useUsernameCheck(usernameEdit, currentUser?.username);

  // Video management handlers
  const handleVideoUpdate = (updatedVideo) => {
    setVideos((prevVideos) =>
      prevVideos.map((video) =>
        video._id === updatedVideo._id ? updatedVideo : video
      )
    );
  };

  const handleVideoDelete = (videoId) => {
    setVideos((prevVideos) =>
      prevVideos.filter((video) => video._id !== videoId)
    );
  };

  const handleArticleDelete = (articleId) => {
    setArticles((prevArticles) =>
      prevArticles.filter((article) => article._id !== articleId)
    );
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoading(true);
        setVideosLoading(true);

        // No endpoint by username; fetch all then match client-side
        const res = await fetch(`${API}/api/v1/users/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        });
        const users = await res.json();
        if (!Array.isArray(users)) {
          if (!cancelled) {
            setChannel(null);
            setIsLoading(false);
            setVideosLoading(false);
          }
          return;
        }
        const u = users.find((x) => x?.username === username);
        if (!cancelled) {
          setChannel(u || null);
          // Set cover position if available
          if (u?.coverImagePosition !== undefined) {
            setCoverPosition(u.coverImagePosition);
          }
          // Only set loading to false for channel data once we have the user
          if (u) {
            setIsLoading(false);
          } else {
            setIsLoading(false);
            setVideosLoading(false);
          }
        }

        // If authenticated and user found, try to load their videos (protected route)
        if (u && currentUser?._id) {
          try {
            const vres = await fetch(`${API}/api/v1/users/profile/${u._id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              credentials: 'include',
            });
            if (vres.ok) {
              const vdata = await vres.json();
              if (!cancelled) {
                setVideos(Array.isArray(vdata) ? vdata : []);
                setVideosLoading(false);
              }
            } else {
              if (!cancelled) {
                setVideos([]);
                setVideosLoading(false);
              }
            }
          } catch (e) {
            if (!cancelled) {
              setVideos([]);
              setVideosLoading(false);
            }
          }
        } else {
          if (!cancelled) {
            setVideos([]);
            setVideosLoading(false);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setChannel(null);
          setIsLoading(false);
          setVideosLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [username, currentUser?._id]);

  const isOwn =
    currentUser &&
    channel?._id &&
    String(currentUser._id) === String(channel._id);

  // Load saved videos when switching to Bookmarked tab on own profile
  useEffect(() => {
    let cancelled = false;
    const loadSaved = async () => {
      if (activeTab !== 'bookmarked') return;
      if (!currentUser?._id) return;
      if (!isOwn) return; // backend also enforces

      setSavedVideosLoading(true);
      try {
        const res = await fetch(
          `${API}/api/v1/users/saved/${currentUser._id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            credentials: 'include',
          }
        );
        if (!cancelled) {
          if (res.ok) {
            const data = await res.json();
            setSavedVideos(Array.isArray(data) ? data : []);
          } else {
            setSavedVideos([]);
          }
          setSavedVideosLoading(false);
        }
      } catch (_) {
        if (!cancelled) {
          setSavedVideos([]);
          setSavedVideosLoading(false);
        }
      }
    };
    loadSaved();
    return () => {
      cancelled = true;
    };
  }, [activeTab, currentUser?._id, isOwn]);

  // Load articles when switching to Articles tab
  useEffect(() => {
    let cancelled = false;
    const loadArticles = async () => {
      if (activeTab !== 'articles') return;
      if (!channel?._id) return;

      setArticlesLoading(true);
      try {
        const res = await fetch(
          `${API}/api/v1/blog/user/${channel._id}/articles`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            credentials: 'include',
          }
        );
        if (!cancelled) {
          if (res.ok) {
            const data = await res.json();
            setArticles(Array.isArray(data) ? data : []);
          } else {
            setArticles([]);
          }
          setArticlesLoading(false);
        }
      } catch (_) {
        if (!cancelled) {
          setArticles([]);
          setArticlesLoading(false);
        }
      }
    };
    loadArticles();
    return () => {
      cancelled = true;
    };
  }, [activeTab, channel?._id]);

  // Keep edit form state in sync with current user when opening
  useEffect(() => {
    if (!isOwn) return;
    if (searchParams.get('edit') === '1') {
      setOpenEdit(true);
      setDisplayNameEdit(currentUser?.displayName || '');
      setUsernameEdit(currentUser?.username || '');
      setBioEdit(currentUser?.bio || '');
      setAvatarPreview('');
      setAvatarFile(null);
    } else {
      setOpenEdit(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('edit'), isOwn, currentUser]);

  const avatarUrl = useMemo(
    () => resolveImageUrl(channel?.displayImage),
    [channel?.displayImage]
  );
  const coverUrl = useMemo(
    () => resolveImageUrl(channel?.coverImage),
    [channel?.coverImage]
  );
  const displayName = channel?.displayName || channel?.username || username;

  const followersCount = channel?.followers || 0;
  const followingCount = Array.isArray(channel?.following)
    ? channel.following.length
    : 0;

  // Edit handlers
  const handleCloseEdit = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('edit');
    navigate({ pathname: `/${username}`, search: params.toString() });
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleCoverUploadClick = () => {
    coverInputRef.current?.click();
  };

  const handleDirectCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?._id) return;

    setUploadingCover(true);
    try {
      // Upload cover image
      const fd = new FormData();
      fd.append('image', file);
      const upRes = await fetch(`${API}/api/v1/upload/image`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      if (!upRes.ok) {
        const errorData = await upRes.json();
        throw new Error(errorData.msg || 'Failed to upload cover image');
      }
      const upData = await upRes.json();

      // Update user profile with new cover image
      const payload = {
        displayName: currentUser.displayName,
        username: currentUser.username,
        bio: currentUser.bio,
        displayImage: currentUser.displayImage,
        coverImage: upData.url,
        coverImagePosition: coverPosition, // Keep current position
      };

      const res = await fetch(`${API}/api/v1/users/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || 'Failed to update profile');
      }
      const updated = await res.json();

      // Update global state and local channel
      dispatch(loginSuccess(updated));
      setChannel(updated);

      // Show save position button after successful upload
      setShowSavePositionButton(true);
    } catch (err) {
      console.error('Cover upload error:', err);
      alert('Failed to upload cover image: ' + err.message);
    } finally {
      setUploadingCover(false);
      // Reset file input
      if (coverInputRef.current) {
        coverInputRef.current.value = '';
      }
    }
  };

  // Drag handlers for cover positioning
  const handleCoverMouseDown = (e) => {
    if (!isOwn || !channel?.coverImage || !showSavePositionButton) return;
    setIsDraggingCover(true);
    setDragStartY(e.clientY);
    setDragStartPosition(coverPosition);
  };

  const handleCoverMouseMove = (e) => {
    if (!isDraggingCover || !coverWrapperRef.current) return;

    const wrapper = coverWrapperRef.current;
    const wrapperHeight = wrapper.offsetHeight;
    const deltaY = e.clientY - dragStartY;
    const deltaPercentage = (deltaY / wrapperHeight) * 100;

    // Calculate new position (inverted because dragging down should move image up)
    const newPosition = Math.max(
      0,
      Math.min(100, dragStartPosition - deltaPercentage)
    );
    setCoverPosition(newPosition);
  };

  const handleCoverMouseUp = () => {
    if (!isDraggingCover) return;
    setIsDraggingCover(false);
    // Don't auto-save anymore - user must click Save Position button
  };

  // Save position handler
  const handleSavePosition = async () => {
    if (!currentUser?._id) return;

    try {
      const payload = {
        displayName: currentUser.displayName,
        username: currentUser.username,
        bio: currentUser.bio,
        displayImage: currentUser.displayImage,
        coverImage: currentUser.coverImage,
        coverImagePosition: coverPosition,
      };

      const res = await fetch(`${API}/api/v1/users/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save position');
      const updated = await res.json();
      dispatch(loginSuccess(updated));
      setChannel(updated);

      // Hide the save button after successful save
      setShowSavePositionButton(false);
    } catch (err) {
      console.error('Failed to save cover position:', err);
      alert('Failed to save position: ' + err.message);
    }
  };

  // Add/remove mouse event listeners for dragging
  useEffect(() => {
    if (isDraggingCover) {
      window.addEventListener('mousemove', handleCoverMouseMove);
      window.addEventListener('mouseup', handleCoverMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleCoverMouseMove);
        window.removeEventListener('mouseup', handleCoverMouseUp);
      };
    }
  }, [isDraggingCover, dragStartY, dragStartPosition, coverPosition]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser?._id) return;

    // Prevent saving if username is not valid
    if (!usernameCheck.isValid && usernameEdit !== currentUser?.username) {
      return;
    }

    setSaving(true);
    try {
      let displayImage = currentUser.displayImage || '';
      let coverImage = currentUser.coverImage || '';

      // 1) Upload avatar if changed
      if (avatarFile) {
        const fd = new FormData();
        fd.append('image', avatarFile);
        const upRes = await fetch(`${API}/api/v1/upload/image`, {
          method: 'POST',
          body: fd,
          credentials: 'include',
        });
        if (!upRes.ok) throw new Error('Failed to upload image');
        const upData = await upRes.json();
        displayImage = upData.url;
      }

      // 2) Send profile update
      const payload = {
        displayName: displayNameEdit,
        username: usernameEdit,
        bio: bioEdit,
        displayImage,
        coverImage,
        coverImagePosition: currentUser.coverImagePosition || 50,
      };

      const res = await fetch(`${API}/api/v1/users/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updated = await res.json();

      // 4) Update global auth state + local channel (so UI reflects immediately)
      dispatch(loginSuccess(updated));
      if (isOwn) setChannel(updated);

      // 5) Close modal and, if username changed, navigate to the new slug
      const params = new URLSearchParams(searchParams);
      params.delete('edit');
      const nextUsername = updated?.username || usernameEdit || username;
      navigate({ pathname: `/${nextUsername}`, search: params.toString() });

      // 6) Reset transient avatar state
      setAvatarPreview('');
      setAvatarFile(null);
    } catch (err) {
      // Silent error handling
    } finally {
      setSaving(false);
    }
  };

  // Show loading state while fetching channel data or if essential data is missing
  if (isLoading || !channel) {
    return (
      <LoadingContainer>
        <LoadingUserInfo>
          <LoadingAvatar />
          <LoadingUserNames>
            <LoadingText height='32px' width='200px' marginBottom='8px' />
            <LoadingText height='20px' width='120px' marginBottom='16px' />
            <LoadingText height='36px' width='100px' marginBottom='0px' />
          </LoadingUserNames>
        </LoadingUserInfo>
        <LoadingText height='20px' width='300px' marginBottom='12px' />
        <LoadingText height='20px' width='250px' marginBottom='40px' />
        <LoadingText height='40px' width='100%' marginBottom='20px' />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
          }}
        >
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <LoadingText height='300px' width='100%' marginBottom='8px' />
              <LoadingText height='16px' width='80%' marginBottom='4px' />
              <LoadingText height='16px' width='60%' marginBottom='0px' />
            </div>
          ))}
        </div>
      </LoadingContainer>
    );
  }

  // Show 404 page if channel is explicitly null after loading
  if (!isLoading && !channel) {
    return <NotFound />;
  }

  return (
    <Container>
      <CoverImageWrapper
        ref={coverWrapperRef}
        $src={coverUrl}
        $position={coverPosition}
        $isDraggable={isOwn && showSavePositionButton}
        onMouseDown={handleCoverMouseDown}
      >
        {isOwn && (
          <>
            <CoverUploadButton
              onClick={handleCoverUploadClick}
              disabled={uploadingCover}
              onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking button
            >
              <IoCamera size={18} />
              {uploadingCover ? 'Uploading...' : 'Change Cover'}
            </CoverUploadButton>
            {showSavePositionButton && (
              <SavePositionButton
                onClick={handleSavePosition}
                onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking button
              >
                Save Position
              </SavePositionButton>
            )}
            <HiddenFileInput
              ref={coverInputRef}
              type='file'
              accept='image/*'
              onChange={handleDirectCoverUpload}
            />
          </>
        )}
      </CoverImageWrapper>
      <InfoWrapper>
        <ProfileHeader>
          <UserImage src={avatarUrl} />
          <Actions>
            {isOwn ? (
              <ActionButton
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set('edit', '1');
                  navigate({
                    pathname: `/${username}`,
                    search: params.toString(),
                  });
                }}
              >
                Edit Profile
              </ActionButton>
            ) : (
              <>
                <FollowButton
                  user={currentUser}
                  channel={channel}
                  onDelta={(d) => {
                    setChannel((prev) =>
                      prev
                        ? {
                            ...prev,
                            followers: Math.max(0, (prev.followers || 0) + d),
                          }
                        : prev
                    );
                  }}
                />
              </>
            )}
          </Actions>
        </ProfileHeader>
        <UserInfo>
          <DisplayName>
            {displayName}
            <VerifiedBadge user={channel} size={22} />
          </DisplayName>
          <UserName>@{channel?.username}</UserName>
        </UserInfo>
        <UserBio>{channel?.bio || ''}</UserBio>
        <UserStats>
          <ClickableStat onClick={() => setFollowersModalOpen(true)}>
            <strong>{followersCount}</strong> Followers
          </ClickableStat>
          <Dot>•</Dot>
          <ClickableStat onClick={() => setFollowingModalOpen(true)}>
            <strong>{followingCount}</strong> Following
          </ClickableStat>
        </UserStats>
      </InfoWrapper>

      <VideosWrapper>
        <Navbar>
          <Tab
            $active={activeTab === 'posts'}
            onClick={() => setActiveTab('posts')}
          >
            Photos
          </Tab>
          <Tab
            $active={activeTab === 'videos'}
            onClick={() => setActiveTab('videos')}
          >
            Videos
          </Tab>
          <Tab
            $active={activeTab === 'articles'}
            onClick={() => setActiveTab('articles')}
          >
            Articles
          </Tab>
          {isOwn && (
            <Tab
              $active={activeTab === 'bookmarked'}
              onClick={() => setActiveTab('bookmarked')}
            >
              Saved
            </Tab>
          )}
        </Navbar>
        <VideosContainer>
          {/* Loading states */}
          {((activeTab === 'posts' && videosLoading) ||
            (activeTab === 'videos' && videosLoading) ||
            (activeTab === 'articles' && articlesLoading) ||
            (activeTab === 'bookmarked' && savedVideosLoading)) &&
            [1, 2, 3].map((i) => (
              <div key={i}>
                <LoadingText height='200px' width='100%' marginBottom='8px' />
                <LoadingText height='16px' width='80%' marginBottom='4px' />
                <LoadingText height='16px' width='60%' marginBottom='0px' />
              </div>
            ))}

          {/* Posts Tab - Image posts only */}
          {activeTab === 'posts' &&
            !videosLoading &&
            (() => {
              const imagePosts = videos.filter((v) => v.mediaType === 'image');
              return imagePosts.length > 0 ? (
                imagePosts.map((v) => (
                  <PostCard
                    key={v._id}
                    channel={channel || {}}
                    video={v}
                    user={currentUser}
                    hideFollowButton={!isOwn}
                    onVideoUpdate={isOwn ? handleVideoUpdate : undefined}
                    onVideoDelete={isOwn ? handleVideoDelete : undefined}
                    enableVideoLink={true}
                  />
                ))
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontFamily: 'var(--secondary-fonts)',
                  }}
                >
                  No photos yet
                </div>
              );
            })()}

          {/* Videos Tab - Video posts only */}
          {activeTab === 'videos' &&
            !videosLoading &&
            (() => {
              const videoPosts = videos.filter((v) => v.mediaType === 'video');
              return videoPosts.length > 0 ? (
                videoPosts.map((v) => (
                  <PostCard
                    key={v._id}
                    channel={channel || {}}
                    video={v}
                    user={currentUser}
                    hideFollowButton={!isOwn}
                    onVideoUpdate={isOwn ? handleVideoUpdate : undefined}
                    onVideoDelete={isOwn ? handleVideoDelete : undefined}
                    enableVideoLink={true}
                  />
                ))
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontFamily: 'var(--secondary-fonts)',
                  }}
                >
                  No videos yet
                </div>
              );
            })()}

          {/* Articles Tab */}
          {activeTab === 'articles' &&
            !articlesLoading &&
            (articles.length > 0 ? (
              articles.map((article) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  isOwner={isOwn}
                  onArticleDelete={handleArticleDelete}
                />
              ))
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontFamily: 'var(--secondary-fonts)',
                }}
              >
                No articles yet
              </div>
            ))}

          {/* Bookmarked Tab */}
          {activeTab === 'bookmarked' &&
            !savedVideosLoading &&
            isOwn &&
            (savedVideos.length > 0 ? (
              savedVideos.map((v) => (
                <PostCard
                  key={v._id}
                  channel={
                    v.author
                      ? {
                          _id: v.author._id,
                          username: v.author.username,
                          displayName: v.author.displayName,
                          displayImage: v.author.displayImage,
                        }
                      : {}
                  }
                  video={v}
                  user={currentUser}
                  hideFollowButton={true}
                  enableVideoLink={true}
                />
              ))
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontFamily: 'var(--secondary-fonts)',
                }}
              >
                No bookmarked posts yet
              </div>
            ))}
        </VideosContainer>
      </VideosWrapper>

      {openEdit &&
        isOwn &&
        createPortal(
          <ModalWrapper
            onClick={handleCloseEdit}
            role='dialog'
            aria-modal='true'
          >
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <CloseButton onClick={handleCloseEdit} aria-label='Close'>
                <IoClose size={22} />
              </CloseButton>
              <h3
                style={{
                  color: 'var(--secondary-color)',
                  fontFamily: 'var(--primary-fonts)',
                }}
              >
                Edit Profile
              </h3>
              <Form onSubmit={handleSave}>
                <AvatarRow>
                  <Avatar src={avatarPreview || avatarUrl} alt='avatar' />
                  <div>
                    <Label htmlFor='avatar'>Profile image</Label>
                    <Input
                      id='avatar'
                      type='file'
                      accept='image/*'
                      onChange={onFileChange}
                    />
                    <Small>
                      PNG/JPG • up to 5MB • will be cropped to a circle
                    </Small>
                  </div>
                </AvatarRow>

                <div>
                  <Label htmlFor='displayName'>Name</Label>
                  <Input
                    id='displayName'
                    value={displayNameEdit}
                    onChange={(e) => setDisplayNameEdit(e.target.value)}
                    placeholder='Your name'
                  />
                </div>

                <div>
                  <Label htmlFor='username'>Username</Label>
                  <Input
                    id='username'
                    value={usernameEdit}
                    onChange={(e) => setUsernameEdit(e.target.value)}
                    placeholder='username'
                    style={{
                      borderColor:
                        usernameEdit && usernameEdit !== currentUser?.username
                          ? usernameCheck.isAvailable
                            ? '#4ade80'
                            : usernameCheck.isUnavailable
                            ? '#f87171'
                            : 'rgba(255, 255, 255, 0.15)'
                          : 'rgba(255, 255, 255, 0.15)',
                    }}
                  />
                  <UsernameAvailabilityIndicator
                    status={usernameCheck.status}
                    message={usernameCheck.message}
                    isVisible={
                      usernameEdit && usernameEdit !== currentUser?.username
                    }
                  />
                </div>

                <div>
                  <Label htmlFor='bio'>Bio</Label>
                  <Textarea
                    id='bio'
                    value={bioEdit}
                    onChange={(e) => setBioEdit(e.target.value)}
                    placeholder='Tell people about yourself'
                  />
                </div>

                <ActionsRow>
                  <SecondaryBtn
                    type='button'
                    onClick={handleCloseEdit}
                    disabled={saving}
                  >
                    Cancel
                  </SecondaryBtn>
                  <PrimaryBtn
                    type='submit'
                    disabled={
                      saving ||
                      (usernameEdit !== currentUser?.username &&
                        (usernameCheck.isUnavailable ||
                          usernameCheck.hasError ||
                          !usernameCheck.isValid))
                    }
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </PrimaryBtn>
                </ActionsRow>
              </Form>
            </ModalContent>
          </ModalWrapper>,
          document.body
        )}

      {/* Followers Modal */}
      <UserListModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        userId={channel?._id}
        type='followers'
        title='Followers'
      />

      {/* Following Modal */}
      <UserListModal
        isOpen={followingModalOpen}
        onClose={() => setFollowingModalOpen(false)}
        userId={channel?._id}
        type='following'
        title='Following'
      />
    </Container>
  );
};

export default PublicProfile;
