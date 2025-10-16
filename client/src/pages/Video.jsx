import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { IoHeartOutline, IoHeart } from 'react-icons/io5';
import { MdOutlineInsertComment } from 'react-icons/md';
import { IoIosShareAlt } from 'react-icons/io';
import { HiOutlineBookmark, HiBookmark } from 'react-icons/hi';
import { MdLock } from 'react-icons/md';
import { PostCard, VideoSidebar, Comments } from '../components/index';
import {
  getVideo,
  getVideoSuccess,
  getVideoFailed,
  like,
  unlike,
} from '../redux/video/videoSlice';

import {
  likeVideo,
  unlikeVideo,
  saveVideo,
  unSaveVideo,
} from '../redux/video/actions';
import { openModal } from '../redux/modal/modalSlice';

const Container = styled.div`
  padding: 20px 20px 0 20px;
  display: flex;

  @media (max-width: 768px) {
    padding: 20px;
    flex-direction: column;
  }
`;
const Main = styled.div`
  flex: 1;
  width: 100%;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const VideoWrapper = styled.div`
  width: 100%;
  max-width: 700px;
  height: ${(props) => (props.$isImage ? 'auto' : '400px')};
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
  }
`;
const VideoPlayer = styled.video`
  width: 100%;
  height: 100%;
  border-radius: 4px;
  object-fit: contain;

  @media (max-width: 768px) {
    border-radius: 8px;
  }
`;

const YouTubePlayer = styled.iframe`
  width: 100%;
  height: 100%;
  border-radius: 4px;
  border: none;

  @media (max-width: 768px) {
    border-radius: 8px;
  }
`;

const ImagePlayer = styled.img`
  width: 100%;
  border-radius: 4px;
  object-fit: contain;

  @media (max-width: 768px) {
    border-radius: 8px;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  max-width: 700px;
  padding: 20px 0;

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 15px 0;
  }
`;

const CardStats = styled.div`
  display: flex;
  margin-top: 10px;
  gap: 20px;

  &.mobile-stats {
    display: none;

    @media (max-width: 768px) {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 15px;
    }
  }

  &.desktop-stats {
    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const Icon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  gap: 5px;
  background-color: rgba(255, 255, 255, 0.04);
  width: 25%;
  border-radius: 8px;
  padding: 10px 15px;
  cursor: pointer;

  svg {
    width: 30px;
    height: 30px;
  }

  @media (max-width: 768px) {
    flex: 1;
    width: auto;
    height: auto;
    max-width: none;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.04);
    padding: 8px 12px;
    margin-bottom: 0;
    flex-direction: row;
    gap: 5px;

    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const StatsWrapper = styled.span`
  font-size: 13px;

  @media (max-width: 768px) {
    font-size: 12px;
    font-weight: 500;
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 400px;
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  color: var(--primary-color);
  margin-bottom: 20px;
  opacity: 0.8;
`;

const ErrorTitle = styled.h2`
  font-size: 24px;
  color: var(--text-color);
  margin-bottom: 12px;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  color: var(--secondary-color);
  margin-bottom: 24px;
  max-width: 500px;
  line-height: 1.5;
`;

const ErrorButton = styled.button`
  padding: 12px 32px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Video = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { currentVideo, error, isLoading } = useSelector(
    (state) => state.video
  );
  const { comments: commentsList } = useSelector((state) => state.comments);
  const navigate = useNavigate();

  // Compute visible comments count (reachable from roots) to avoid orphaned replies inflating counts
  const visibleCommentsCount = useMemo(() => {
    if (!Array.isArray(commentsList) || commentsList.length === 0) return 0;
    const byParent = commentsList.reduce((acc, c) => {
      if (c.parentId) {
        (acc[String(c.parentId)] ||= []).push(c);
      }
      return acc;
    }, {});
    const roots = commentsList.filter((c) => !c.parentId);
    let count = 0;
    const stack = [...roots];
    while (stack.length) {
      const node = stack.pop();
      count += 1;
      const kids = byParent[String(node._id)] || [];
      for (const k of kids) stack.push(k);
    }
    return count;
  }, [commentsList]);

  const dispatch = useDispatch();

  const path = useLocation().pathname.split('/')[2];

  const [channel, setChannel] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(getVideo());

        const videoRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/videos/find/${path}`,
          { withCredentials: true }
        );

        const { userId } = videoRes.data;

        const userRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/users/${userId}`
        );
        setChannel(userRes.data);

        dispatch(getVideoSuccess(videoRes.data));
      } catch (err) {
        // Extract only serializable error data for Redux
        const errorPayload = {
          message:
            err.response?.data?.message ||
            err.message ||
            'Failed to load video',
          status: err.response?.status,
          statusText: err.response?.statusText,
        };
        dispatch(getVideoFailed(errorPayload));
      }
    };
    fetchData();
  }, [path, dispatch]);

  const guardOr = (fn) => {
    if (!currentUser) {
      dispatch(openModal());
      return;
    }
    fn();
  };

  const handleLikes = () =>
    guardOr(() => {
      if (!currentVideo?._id || !currentUser?._id) return;
      if (currentVideo?.likes?.includes(currentUser._id)) {
        dispatch(unlikeVideo(currentVideo._id, currentUser._id));
      } else {
        dispatch(likeVideo(currentVideo._id, currentUser._id));
      }
    });

  const handleShare = () =>
    guardOr(() => {
      /* TODO: share flow */
    });
  const handleBookmark = () =>
    guardOr(() => {
      if (!currentVideo?._id || !currentUser?._id) return;
      if (currentVideo?.saved?.includes(currentUser._id)) {
        dispatch(unSaveVideo(currentVideo._id, currentUser._id));
      } else {
        dispatch(saveVideo(currentVideo._id, currentUser._id));
      }
    });

  // Check if this is the user's own video
  const isOwnVideo =
    currentUser?._id &&
    String(currentUser._id) === String(currentVideo?.userId);

  // Handle error states
  if (error) {
    const is403 = error.status === 403;
    const is404 = error.status === 404;

    return (
      <Container>
        <ErrorContainer>
          <ErrorIcon>{is403 ? <MdLock /> : '🎥'}</ErrorIcon>
          <ErrorTitle>
            {is403
              ? 'Private Post'
              : is404
              ? 'Post Not Found'
              : 'Error Loading Post'}
          </ErrorTitle>
          <ErrorMessage>
            {is403
              ? "This post is private and you don't have permission to view it. Only the post owner can access private posts."
              : is404
              ? "The post you're looking for doesn't exist or has been removed."
              : error.message ||
                'Something went wrong while loading the post. Please try again later.'}
          </ErrorMessage>
          <ErrorButton onClick={() => navigate('/')}>Go to Home</ErrorButton>
        </ErrorContainer>
      </Container>
    );
  }

  // Show loading or empty state
  if (isLoading || !currentVideo) {
    return (
      <Container>
        <Main>
          <VideoWrapper>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--secondary-color)',
              }}
            >
              Loading...
            </div>
          </VideoWrapper>
        </Main>
      </Container>
    );
  }

  // Helper function to get video URL (handle both object and string formats)
  const getVideoUrl = () => {
    if (!currentVideo?.videoUrl) return null;

    // If videoUrl is a string, return it directly
    if (typeof currentVideo.videoUrl === 'string') {
      return currentVideo.videoUrl;
    }

    // If videoUrl is an object, return the url property
    if (
      typeof currentVideo.videoUrl === 'object' &&
      currentVideo.videoUrl.url
    ) {
      return currentVideo.videoUrl.url;
    }

    return null;
  };

  // Check if video is from YouTube
  const videoUrl = getVideoUrl();
  const isYouTubeVideo =
    currentVideo?.videoUrl?.provider === 'youtube' ||
    currentVideo?.storageProvider === 'youtube' ||
    videoUrl?.includes('youtube.com/embed') ||
    videoUrl?.includes('youtube.com/watch');

  // Add parameters to YouTube URL to remove overlays
  const getCleanYouTubeUrl = (url) => {
    if (!url || !url.includes('youtube.com')) return url;

    const urlObj = new URL(url);
    // Remove YouTube branding and overlays
    urlObj.searchParams.set('modestbranding', '1'); // Minimal YouTube branding
    urlObj.searchParams.set('rel', '0'); // Don't show related videos
    urlObj.searchParams.set('showinfo', '0'); // Don't show video info
    urlObj.searchParams.set('iv_load_policy', '3'); // Don't show annotations
    urlObj.searchParams.set('controls', '1'); // Show player controls
    urlObj.searchParams.set('disablekb', '0'); // Enable keyboard controls
    urlObj.searchParams.set('fs', '1'); // Allow fullscreen

    return urlObj.toString();
  };

  return (
    <Container>
      <Main>
        <VideoWrapper $isImage={currentVideo?.mediaType === 'image'}>
          {!videoUrl ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--secondary-color)',
              }}
            >
              Video URL not found
            </div>
          ) : currentVideo?.mediaType === 'image' ? (
            <ImagePlayer
              src={videoUrl}
              alt={currentVideo?.caption || 'Post image'}
            />
          ) : isYouTubeVideo ? (
            <YouTubePlayer
              src={getCleanYouTubeUrl(videoUrl)}
              title={currentVideo?.caption || 'Video'}
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
            />
          ) : (
            <VideoPlayer src={videoUrl} controls />
          )}
        </VideoWrapper>
        <ContentWrapper>
          <PostCard
            channel={channel}
            video={currentVideo}
            user={currentUser}
            showVideo={false}
          />
          {/* Mobile stats after avatar section */}
          <CardStats className='mobile-stats'>
            <Icon onClick={handleLikes}>
              {currentVideo &&
              currentUser &&
              currentVideo?.likes?.includes(currentUser._id) ? (
                <IoHeart style={{ color: 'var(--primary-color)' }} />
              ) : (
                <IoHeartOutline />
              )}
              <StatsWrapper>{currentVideo?.likes?.length}</StatsWrapper>
            </Icon>
            <Icon>
              <MdOutlineInsertComment />
              <StatsWrapper>
                {Array.isArray(commentsList)
                  ? visibleCommentsCount
                  : typeof currentVideo?.commentsCount === 'number'
                  ? currentVideo.commentsCount
                  : Array.isArray(currentVideo?.comments)
                  ? currentVideo.comments.length
                  : 0}
              </StatsWrapper>
            </Icon>
            {!isOwnVideo && (
              <Icon onClick={handleBookmark}>
                {currentVideo &&
                currentUser &&
                currentVideo?.saved?.includes(currentUser._id) ? (
                  <HiBookmark style={{ color: 'var(--primary-color)' }} />
                ) : (
                  <HiOutlineBookmark />
                )}
                <StatsWrapper>{currentVideo?.saved?.length || 0}</StatsWrapper>
              </Icon>
            )}
            <Icon onClick={handleShare}>
              <IoIosShareAlt />
              <StatsWrapper>2K</StatsWrapper>
            </Icon>
          </CardStats>
          {/* Desktop stats */}
          <CardStats className='desktop-stats'>
            <Icon onClick={handleLikes}>
              {currentVideo &&
              currentUser &&
              currentVideo?.likes?.includes(currentUser._id) ? (
                <IoHeart style={{ color: 'var(--primary-color)' }} />
              ) : (
                <IoHeartOutline />
              )}
              <StatsWrapper>{currentVideo?.likes?.length}</StatsWrapper>
            </Icon>
            <Icon>
              <MdOutlineInsertComment />
              <StatsWrapper>
                {Array.isArray(commentsList)
                  ? visibleCommentsCount
                  : typeof currentVideo?.commentsCount === 'number'
                  ? currentVideo.commentsCount
                  : Array.isArray(currentVideo?.comments)
                  ? currentVideo.comments.length
                  : 0}
              </StatsWrapper>
            </Icon>
            {!isOwnVideo && (
              <Icon onClick={handleBookmark}>
                {currentVideo &&
                currentUser &&
                currentVideo?.saved?.includes(currentUser._id) ? (
                  <HiBookmark style={{ color: 'var(--primary-color)' }} />
                ) : (
                  <HiOutlineBookmark />
                )}
                <StatsWrapper>{currentVideo?.saved?.length || 0}</StatsWrapper>
              </Icon>
            )}
            <Icon onClick={handleShare}>
              <IoIosShareAlt />
              <StatsWrapper>2K</StatsWrapper>
            </Icon>
          </CardStats>
          <Comments />
        </ContentWrapper>
      </Main>
      <VideoSidebar />
    </Container>
  );
};
export default Video;
