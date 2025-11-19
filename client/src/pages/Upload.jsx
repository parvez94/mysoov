import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ProgressBar } from '../components';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import PricingModal from '../components/modal/PricingModal';

const Container = styled.div`
  padding: 20px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Title = styled.h2`
  font-family: var(--primary-fonts);
  color: var(--primary-color);
  line-height: 1.6em;
`;

const Subtitle = styled.p`
  font-family: var(--secondary-fonts);
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
`;

const ContentWrapper = styled.div`
  display: flex;
  margin-top: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const VideoWrapper = styled.div`
  flex: 3;
  overflow: hidden;

  @media (max-width: 768px) {
    flex: 1;
    width: 100%;
  }
`;

const DragVideo = styled.label`
  padding: 20px;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  height: 300px;
  font-family: var(--primary-fonts);
`;

const DragInput = styled.input`
  display: none;
`;

const Helper = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-family: var(--secondary-fonts);
  font-size: 14px;
`;

const Caption = styled.textarea`
  background-color: transparent;
  margin-top: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 12px 48px 48px 12px; /* bottom padding to make space for emoji toggle */
  width: 100%;
  color: var(--secondary-color);
  resize: none;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;

  &:focus {
    outline: 0;
  }

  &::placeholder {
    font-family: var(--primary-fonts);
    color: rgba(255, 255, 255, 0.1);
  }
`;

// Emoji picker UI
const CaptionWrapper = styled.div`
  position: relative;
  margin-top: 10px;
`;

const EmojiToggle = styled.button`
  position: absolute;
  right: 10px;
  top: auto;
  bottom: 10px;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
`;

const EmojiPopover = styled.div`
  position: absolute;
  right: 0;
  top: auto;
  bottom: calc(100% + 8px);
  z-index: 20;

  /* Let emoji-mart handle its own styling and dimensions */
  & > div {
    border-radius: 8px !important;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35) !important;
  }

  /* Ensure header elements are visible */
  & [role='tablist'],
  & [role='searchbox'],
  & .search,
  & nav,
  & .nav,
  & .category,
  & .categories {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }

  /* Ensure category tabs are visible */
  & [role='tablist'],
  & .nav,
  & .categories {
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
  }

  /* Ensure search input is visible */
  & input[type='search'],
  & .search input {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }

  /* Force header section to be visible */
  & > div:first-child,
  & .header {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }

  /* Ensure proper emoji rendering within the picker */
  & em-emoji {
    font-size: 20px !important;
    line-height: 1 !important;
    display: inline-block !important;
    width: auto !important;
    height: auto !important;
  }

  /* Fix emoji button sizing */
  & button[data-emoji] {
    width: 32px !important;
    height: 32px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    border-radius: 6px !important;
  }
`;

const Label = styled.h4`
  margin-top: 10px;
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
`;

const OptionWrapper = styled.div``;

const Select = styled.select`
  margin-top: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 8px;
  border-radius: 4px;
  background-color: transparent;
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  width: 100%;

  &:focus {
    outline: 0;
  }
`;

const Option = styled.option``;

const ButtonsWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const DiscardBtn = styled.button`
  border: 1px solid var(--secondary-color);
  padding: 12px 30px;
  font-size: 15px;
  font-family: var(--secondary-fonts);
  border-radius: 3px;
  font-weight: 500;
  background-color: transparent;
  color: #fff;
  cursor: pointer;
`;

const CancelBtn = styled.button`
  border: 1px solid #ef4444;
  padding: 12px 18px;
  font-size: 15px;
  font-family: var(--secondary-fonts);
  border-radius: 3px;
  font-weight: 500;
  background-color: transparent;
  color: #ef4444;
  cursor: pointer;
`;

const PostBtn = styled.button`
  border: 1px solid var(--primary-color);
  padding: 12px 30px;
  font-size: 15px;
  font-family: var(--secondary-fonts);
  border-radius: 3px;
  font-weight: 500;
  background-color: var(--primary-color);
  color: #fff;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
`;

const MusicWrapper = styled.div`
  flex: 2;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
  margin-left: 20px;
  padding: 0 10px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Message = styled.p`
  font-size: 16px;
  color: #555555;
`;

// Preview UI shown after upload succeeds
const PreviewBox = styled.div`
  position: relative;
  padding: 0;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  height: auto;
  min-height: 300px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0b0b0b;
`;

const VideoPreview = styled.video`
  width: 100%;
  max-height: 420px;
  object-fit: contain;
  background: #000;
`;

const ImagePreview = styled.img`
  width: 100%;
  max-height: 420px;
  object-fit: contain;
  background: #000;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  font-size: 20px;
  line-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Upload = () => {
  const currentUser = useSelector((state) => state.user.currentUser);

  const [videoFile, setVideoFile] = useState(null); // server-returned {public_id, url}
  const [images, setImages] = useState([]); // Array of uploaded images for multi-image posts
  const [fileName, setFileName] = useState('');
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error' | 'indeterminate' | 'canceled'
  const [mediaType, setMediaType] = useState('video'); // 'video' | 'image'

  // Pricing modal state
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingError, setPricingError] = useState(null);

  // Emoji picker state
  const [showEmojis, setShowEmojis] = useState(false);
  const captionRef = useRef(null);
  const wrapperRef = useRef(null);

  const controllerRef = useRef(null);
  const isSubmittedRef = useRef(false); // Track if form was successfully submitted
  const videoFileRef = useRef(null); // Track current uploaded file for cleanup
  const imagesRef = useRef([]); // Track current uploaded images for cleanup

  // Keep refs in sync with state
  useEffect(() => {
    videoFileRef.current = videoFile;
  }, [videoFile]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const abortIfRunning = () => {
    try {
      controllerRef.current?.abort();
    } catch (_) {}
    controllerRef.current = null;
  };

  const resetForm = () => {
    abortIfRunning();
    setVideoFile(null);
    setImages([]);
    setCaption('');
    setPrivacy('');
    setFileName('');
    setUploading(false);
    setUploadProgress(0);
    setStatus('idle');
    setMediaType('video');
  };

  // Remove current uploaded video and allow choosing another
  const removeUploadedVideo = async () => {
    // Delete file from server before removing from state
    if (videoFile?.public_id && videoFile?.provider) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/upload`, {
          data: {
            publicId: videoFile.public_id,
            provider: videoFile.provider,
          },
          withCredentials: true,
        });
        console.log('✅ File deleted from server:', videoFile.public_id);
      } catch (err) {
        console.error('Failed to delete file from server:', err);
        // Continue with local cleanup even if server delete fails
      }
    }

    // Delete all images from server
    if (images.length > 0) {
      for (const image of images) {
        if (image?.public_id && image?.provider) {
          try {
            await axios.delete(
              `${import.meta.env.VITE_API_URL}/api/v1/upload`,
              {
                data: {
                  publicId: image.public_id,
                  provider: image.provider,
                },
                withCredentials: true,
              }
            );
            console.log('✅ Image deleted from server:', image.public_id);
          } catch (err) {
            console.error('Failed to delete image from server:', err);
          }
        }
      }
    }

    setVideoFile(null);
    setImages([]);
    setFileName('');
    setUploadProgress(0);
    setStatus('idle');
  };

  // Remove a specific image from the array
  const removeImage = async (index) => {
    const imageToRemove = images[index];

    // Delete image from server before removing from state
    if (imageToRemove?.public_id && imageToRemove?.provider) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/upload`, {
          data: {
            publicId: imageToRemove.public_id,
            provider: imageToRemove.provider,
          },
          withCredentials: true,
        });
        console.log('✅ Image deleted from server:', imageToRemove.public_id);
      } catch (err) {
        console.error('Failed to delete image from server:', err);
        // Continue with local removal even if server delete fails
      }
    }

    setImages((prev) => prev.filter((_, i) => i !== index));
    if (images.length === 1) {
      setVideoFile(null);
      setStatus('idle');
    }
  };

  const handleUpload = async (e) => {
    try {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const firstFile = files[0];
      const isImage = firstFile.type.startsWith('image/');
      const isVideo = firstFile.type.startsWith('video/');

      if (!isImage && !isVideo) {
        return alert('Please select a valid image or video file');
      }

      // Videos can only be uploaded one at a time
      if (isVideo && files.length > 1) {
        return alert('You can only upload one video at a time');
      }

      // Handle multiple image uploads
      if (isImage && files.length > 1) {
        await uploadMultipleImages(files);
        return;
      }

      // Handle single file upload (video or single image)
      const file = firstFile;
      const detectedMediaType = isImage ? 'image' : 'video';
      setMediaType(detectedMediaType);
      setFileName(file.name);

      setUploading(true);
      setUploadProgress(0);
      setStatus('uploading');

      // Setup AbortController for cancel support
      const controller = new AbortController();
      controllerRef.current = controller;

      // Upload via server (respects storage provider settings)
      const formData = new FormData();
      if (detectedMediaType === 'video') {
        formData.append('video', file);
      } else {
        formData.append('image', file);
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/upload`,
        formData,
        {
          withCredentials: true,
          signal: controller.signal,
          onUploadProgress: (evt) => {
            if (evt.total) {
              const percent = Math.round((evt.loaded / evt.total) * 100);
              // Avoid showing 100% before the request actually completes
              setUploadProgress(Math.min(95, percent));
            } else {
              // Fallback for chunked encoding without total length
              setStatus('indeterminate');
            }
          },
        }
      );

      const data = {
        public_id: res.data.public_id,
        url: res.data.url,
        provider: res.data.provider || 'local',
      };

      setVideoFile(data);
      setStatus('success');
      setUploading(false);
      setUploadProgress((prev) => (prev < 100 ? 100 : prev));
      controllerRef.current = null;
    } catch (err) {
      if (err?.code === 'ERR_CANCELED') {
        setStatus('canceled');
        setUploadProgress(0);
      } else if (
        err?.response?.status === 403 &&
        err?.response?.data?.exceedsLimit
      ) {
        // File size exceeds user's plan limit - show pricing modal
        setPricingError({
          fileSize: err.response.data.fileSize,
          maxSize: err.response.data.maxSize,
          currentPlan: err.response.data.currentPlan,
        });
        setShowPricingModal(true);
        setStatus('error');
      } else {
        setStatus('error');
        alert(
          err?.response?.data?.msg ||
            err?.response?.data?.error?.message ||
            'Upload failed. Please try again.'
        );
      }
      setUploading(false);
      controllerRef.current = null;
    }
  };

  // Upload multiple images
  const uploadMultipleImages = async (files) => {
    try {
      setMediaType('image');
      setFileName(`${files.length} images selected`);
      setUploading(true);
      setUploadProgress(0);
      setStatus('uploading');

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/upload/images`,
        formData,
        {
          withCredentials: true,
          onUploadProgress: (evt) => {
            if (evt.total) {
              const percent = Math.round((evt.loaded / evt.total) * 100);
              setUploadProgress(Math.min(95, percent));
            } else {
              setStatus('indeterminate');
            }
          },
        }
      );

      setImages(res.data.images);
      // Set first image as videoFile for backward compatibility
      if (res.data.images.length > 0) {
        setVideoFile(res.data.images[0]);
      }
      setStatus('success');
      setUploadProgress(100);
      setUploading(false);
    } catch (err) {
      if (err?.response?.status === 403 && err?.response?.data?.exceedsLimit) {
        setPricingError({
          fileSize: err.response.data.fileSize,
          maxSize: err.response.data.maxSize,
          currentPlan: err.response.data.currentPlan,
        });
        setShowPricingModal(true);
        setStatus('error');
      } else {
        setStatus('error');
        alert(
          err?.response?.data?.msg ||
            err?.response?.data?.error?.message ||
            'Upload failed. Please try again.'
        );
      }
      setUploading(false);
    }
  };

  const handleCancel = () => {
    abortIfRunning();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile && images.length === 0) {
      return alert('Please upload a media file first.');
    }

    const addUrl = `${import.meta.env.VITE_API_URL}/api/v1/videos`;

    try {
      const requestBody = {
        caption: caption,
        videoUrl: videoFile,
        mediaType: mediaType,
        privacy: privacy || 'Public',
        storageProvider: videoFile?.provider || 'cloudinary',
      };

      // If multiple images, include them
      if (images.length > 0) {
        requestBody.images = images;
      }

      const response = await fetch(addUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const result = await response.json();
      const videoId = result.video?._id;

      // Mark as submitted so cleanup won't delete files
      isSubmittedRef.current = true;

      window.location.href = '/feeds';
    } catch (error) {
      alert('Failed to create post. Please try again.');
    }
  };

  // A fuller emoji set by categories (compact but broad coverage)
  const EMOJI_CATEGORIES = [
    {
      name: 'Smileys',
      emojis: [
        '😀',
        '😁',
        '😂',
        '🤣',
        '😃',
        '😄',
        '😅',
        '😆',
        '😉',
        '😊',
        '😋',
        '😎',
        '😍',
        '😘',
        '🥰',
        '😗',
        '😙',
        '😚',
        '🙂',
        '🤗',
        '🤩',
        '🤔',
        '🤨',
        '😐',
        '😑',
        '😶',
        '🙄',
        '😏',
        '😣',
        '😥',
        '😮',
        '🤐',
        '😯',
        '😪',
        '😫',
        '🥱',
        '😴',
        '😌',
        '😛',
        '😜',
        '🤪',
        '😝',
        '🤤',
        '😒',
        '😓',
        '😔',
        '😕',
        '🙃',
        '🫠',
        '🫡',
        '😲',
        '☹️',
        '🙁',
        '😖',
        '😞',
        '😟',
        '😤',
        '😢',
        '😭',
        '😦',
        '😧',
        '😨',
        '😩',
        '🤯',
        '😬',
        '😰',
        '😱',
        '🥵',
        '🥶',
        '😳',
        '🤒',
        '🤕',
        '🤢',
        '🤮',
        '🤧',
        '🥴',
        '😵',
        '🤠',
        '🥳',
        '😇',
      ],
    },
    {
      name: 'Gestures',
      emojis: [
        '👍',
        '👎',
        '👊',
        '✊',
        '🤛',
        '🤜',
        '👏',
        '🙌',
        '👐',
        '🤲',
        '🙏',
        '🤝',
        '✌️',
        '🤘',
        '👌',
        '🤌',
        '🤏',
        '👈',
        '👉',
        '👆',
        '👇',
        '☝️',
        '✍️',
        '💪',
      ],
    },
    {
      name: 'Hearts & Symbols',
      emojis: [
        '❤️',
        '🧡',
        '💛',
        '💚',
        '💙',
        '💜',
        '🖤',
        '🤍',
        '🤎',
        '💔',
        '❣️',
        '💕',
        '💞',
        '💓',
        '💗',
        '💖',
        '💘',
        '💝',
        '💟',
        '✨',
        '💫',
        '⭐',
        '🌟',
        '⚡',
        '🔥',
        '💯',
      ],
    },
    {
      name: 'Food & Drink',
      emojis: [
        '🍎',
        '🍊',
        '🍌',
        '🍉',
        '🍇',
        '🍓',
        '🍒',
        '🍑',
        '🥭',
        '🍍',
        '🥥',
        '🥝',
        '🍅',
        '🥑',
        '🍆',
        '🥕',
        '🌽',
        '🥔',
        '🍞',
        '🥐',
        '🥖',
        '🥨',
        '🧀',
        '🍗',
        '🍔',
        '🍟',
        '🌭',
        '🍕',
        '🥪',
        '🌮',
        '🌯',
        '🥙',
        '🍜',
        '🍝',
        '🍣',
        '🍱',
        '🥟',
        '🍤',
        '🍪',
        '🍩',
        '🍰',
        '🍫',
        '🍬',
        '🍭',
        '🍮',
        '🍯',
        '☕',
        '🍵',
        '🧋',
        '🥤',
        '🍺',
        '🍷',
        '🍸',
        '🍹',
      ],
    },
    {
      name: 'Animals',
      emojis: [
        '🐶',
        '🐱',
        '🐭',
        '🐹',
        '🐰',
        '🦊',
        '🐻',
        '🐼',
        '🐨',
        '🐯',
        '🦁',
        '🐮',
        '🐷',
        '🐸',
        '🐵',
        '🐔',
        '🐧',
        '🐦',
        '🐤',
        '🐣',
        '🐥',
        '🦆',
        '🦉',
        '🦇',
        '🐺',
      ],
    },
  ];

  const insertEmoji = (emoji) => {
    const native = emoji?.native || emoji;
    if (!captionRef.current || !native) return;
    const el = captionRef.current;
    const start = el.selectionStart ?? caption.length;
    const end = el.selectionEnd ?? caption.length;
    const newValue = caption.slice(0, start) + native + caption.slice(end);
    setCaption(newValue);

    // Close the picker after selecting an emoji
    setShowEmojis(false);

    // Move caret after inserted emoji and keep focus on caption
    requestAnimationFrame(() => {
      const target = captionRef.current;
      if (!target) return;
      target.focus();
      const pos = start + native.length;
      target.setSelectionRange(pos, pos);
    });
  };

  // Close picker on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!showEmojis) return;
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowEmojis(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showEmojis]);

  // Cleanup uploaded files when component unmounts (user navigates away without submitting)
  useEffect(() => {
    return () => {
      // Don't delete if user successfully submitted the form
      if (isSubmittedRef.current) {
        console.log('✅ Form submitted - keeping uploaded files');
        return;
      }

      // Get current file values from refs
      const currentVideoFile = videoFileRef.current;
      const currentImages = imagesRef.current;

      // Delete uploaded files from server if user navigates away without publishing
      if (currentVideoFile?.public_id && currentVideoFile?.provider) {
        axios
          .delete(`${import.meta.env.VITE_API_URL}/api/v1/upload`, {
            data: {
              publicId: currentVideoFile.public_id,
              provider: currentVideoFile.provider,
            },
            withCredentials: true,
          })
          .then(() => {
            console.log(
              '🗑️ Cleaned up orphaned file on unmount:',
              currentVideoFile.public_id
            );
          })
          .catch(() => {
            // Silent fail - component is unmounting anyway
          });
      }

      // Delete all uploaded images
      if (currentImages && currentImages.length > 0) {
        currentImages.forEach((image) => {
          if (image?.public_id && image?.provider) {
            axios
              .delete(`${import.meta.env.VITE_API_URL}/api/v1/upload`, {
                data: {
                  publicId: image.public_id,
                  provider: image.provider,
                },
                withCredentials: true,
              })
              .then(() => {
                console.log(
                  '🗑️ Cleaned up orphaned image on unmount:',
                  image.public_id
                );
              })
              .catch(() => {
                // Silent fail - component is unmounting anyway
              });
          }
        });
      }
    };
  }, []); // Only run on mount/unmount

  const labelMap = {
    idle: '',
    uploading: fileName ? `Uploading ${fileName}` : `Uploading ${mediaType}`,
    indeterminate: fileName
      ? `Uploading ${fileName}`
      : `Uploading ${mediaType}`,
    success: 'Upload complete',
    error: 'Upload failed',
    canceled: 'Upload canceled',
  };

  const showProgress = status !== 'idle';

  return (
    <Container>
      <Title>Upload Media</Title>
      <Subtitle>Post a video or image to your account</Subtitle>
      <ContentWrapper>
        <VideoWrapper>
          {showProgress && (
            <ProgressBar
              value={uploadProgress}
              status={status}
              label={labelMap[status]}
              size='lg'
            />
          )}

          {videoFile?.url || images.length > 0 ? (
            <>
              {/* Show multiple image previews */}
              {images.length > 1 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '10px',
                    marginBottom: '10px',
                  }}
                >
                  {images.map((img, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <ImagePreview
                        src={img.url}
                        alt={`Preview ${index + 1}`}
                        style={{
                          maxHeight: '150px',
                          width: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <RemoveButton
                        onClick={() => removeImage(index)}
                        aria-label={`Remove image ${index + 1}`}
                        style={{
                          top: '5px',
                          right: '5px',
                          width: '24px',
                          height: '24px',
                          fontSize: '16px',
                        }}
                      >
                        ×
                      </RemoveButton>
                    </div>
                  ))}
                </div>
              ) : (
                /* Single file preview */
                <PreviewBox>
                  {mediaType === 'video' ? (
                    <VideoPreview src={videoFile.url} controls playsInline />
                  ) : (
                    <ImagePreview src={videoFile.url} alt='Preview' />
                  )}
                  <RemoveButton
                    onClick={removeUploadedVideo}
                    aria-label='Remove media'
                  >
                    ×
                  </RemoveButton>
                </PreviewBox>
              )}
            </>
          ) : (
            <DragVideo htmlFor='media-input'>
              <Helper>
                {fileName ||
                  'Click to select a video or image file (multiple images allowed)'}
              </Helper>
              <DragInput
                id='media-input'
                type='file'
                accept='video/*,image/*'
                multiple
                onChange={handleUpload}
              />
            </DragVideo>
          )}

          <CaptionWrapper ref={wrapperRef}>
            <Caption
              ref={captionRef}
              placeholder='Title'
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <EmojiToggle
              type='button'
              title='Add emoji'
              aria-label='Add emoji'
              onClick={() => setShowEmojis((s) => !s)}
            >
              🙂
            </EmojiToggle>

            {showEmojis && (
              <EmojiPopover role='dialog' aria-label='Emoji picker'>
                <Picker
                  data={data}
                  theme='dark'
                  previewPosition='none'
                  searchPosition='sticky'
                  navPosition='top'
                  skinTonePosition='none'
                  onEmojiSelect={insertEmoji}
                />
              </EmojiPopover>
            )}
          </CaptionWrapper>

          <OptionWrapper>
            <Label>Who can see this post</Label>
            <Select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
            >
              <Option value='Public'>Public</Option>
              <Option value='Private'>Private</Option>
            </Select>
          </OptionWrapper>

          <ButtonsWrapper>
            <DiscardBtn type='button' onClick={resetForm} disabled={uploading}>
              Discard
            </DiscardBtn>
            {uploading && (
              <CancelBtn type='button' onClick={handleCancel}>
                Cancel upload
              </CancelBtn>
            )}
            <PostBtn
              onClick={handleSubmit}
              disabled={uploading || (!videoFile && images.length === 0)}
            >
              Post Now
            </PostBtn>
          </ButtonsWrapper>
        </VideoWrapper>
        <MusicWrapper>Music</MusicWrapper>
      </ContentWrapper>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => {
          setShowPricingModal(false);
          setPricingError(null);
        }}
        errorInfo={pricingError}
      />
    </Container>
  );
};

export default Upload;
