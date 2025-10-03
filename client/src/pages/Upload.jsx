import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { ProgressBar } from '../components';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

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
  const [videoFile, setVideoFile] = useState(null); // server-returned {public_id, url}
  const [fileName, setFileName] = useState('');
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error' | 'indeterminate' | 'canceled'

  // Emoji picker state
  const [showEmojis, setShowEmojis] = useState(false);
  const captionRef = useRef(null);
  const wrapperRef = useRef(null);

  const controllerRef = useRef(null);

  const abortIfRunning = () => {
    try {
      controllerRef.current?.abort();
    } catch (_) {}
    controllerRef.current = null;
  };

  const resetForm = () => {
    abortIfRunning();
    setVideoFile(null);
    setCaption('');
    setPrivacy('');
    setFileName('');
    setUploading(false);
    setUploadProgress(0);
    setStatus('idle');
  };

  // Remove current uploaded video and allow choosing another
  const removeUploadedVideo = () => {
    setVideoFile(null);
    setFileName('');
    setUploadProgress(0);
    setStatus('idle');
  };

  const handleUpload = async (e) => {
    const uploadUrl = `${import.meta.env.VITE_API_URL}/api/v1/upload`;

    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setFileName(file.name);

      if (file.size > 60 * 1024 * 1024)
        return alert('Size too large! (Max 60MB)');

      const formData = new FormData();
      formData.append('video', file);

      setUploading(true);
      setUploadProgress(0);
      setStatus('uploading');

      // Setup AbortController for cancel support
      const controller = new AbortController();
      controllerRef.current = controller;

      const res = await axios.post(uploadUrl, formData, {
        withCredentials: true, // send cookies for auth
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
      });

      const data = await res.data; // { public_id, url }
      setVideoFile(data);
      setStatus('success');
      setUploading(false);
      setUploadProgress((prev) => (prev < 100 ? 100 : prev));
      controllerRef.current = null;
    } catch (err) {
      if (err?.code === 'ERR_CANCELED') {
        setStatus('canceled');
        setUploadProgress(0);
      } else {
        setStatus('error');
      }
      setUploading(false);
      controllerRef.current = null;
    }
  };

  const handleCancel = () => {
    abortIfRunning();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) return alert('Please upload a video first.');

    const addUrl = `${import.meta.env.VITE_API_URL}/api/v1/videos`;

    try {
      const requestBody = {
        caption: caption,
        videoUrl: videoFile,
        privacy: privacy || 'Public',
      };

      const response = await fetch(addUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      await response.json();
      window.location.href = '/';
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

  const labelMap = {
    idle: '',
    uploading: fileName ? `Uploading ${fileName}` : 'Uploading video',
    indeterminate: fileName ? `Uploading ${fileName}` : 'Uploading video',
    success: 'Upload complete',
    error: 'Upload failed',
    canceled: 'Upload canceled',
  };

  const showProgress = status !== 'idle';

  return (
    <Container>
      <Title>Upload Video</Title>
      <Subtitle>Post a video to your account</Subtitle>
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

          {videoFile?.url ? (
            <PreviewBox>
              <VideoPreview src={videoFile.url} controls playsInline />
              <RemoveButton
                onClick={removeUploadedVideo}
                aria-label='Remove video'
              >
                ×
              </RemoveButton>
            </PreviewBox>
          ) : (
            <DragVideo htmlFor='video-input'>
              <Helper>
                {fileName || 'Click to select a video file (MP4, WebM, MOV)'}
              </Helper>
              <DragInput
                id='video-input'
                type='file'
                accept='video/*'
                onChange={handleUpload}
              />
            </DragVideo>
          )}

          <CaptionWrapper ref={wrapperRef}>
            <Caption
              ref={captionRef}
              placeholder='Caption'
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
            <Label>Who can watch this video</Label>
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
            <PostBtn onClick={handleSubmit} disabled={uploading || !videoFile}>
              Post Now
            </PostBtn>
          </ButtonsWrapper>
        </VideoWrapper>
        <MusicWrapper>Music</MusicWrapper>
      </ContentWrapper>
    </Container>
  );
};

export default Upload;
