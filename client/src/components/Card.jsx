import { useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { IoHeartOutline, IoHeart } from 'react-icons/io5';
import { MdOutlineInsertComment } from 'react-icons/md';
import { IoIosShareAlt } from 'react-icons/io';
import { HiOutlineBookmark } from 'react-icons/hi';
import { HiBookmark } from 'react-icons/hi2';
import { HomeCard, HomeText, Stats } from '../components/index';
import ImageSlider from './ImageSlider';
import { like, unlike } from '../redux/video/videoSlice';
import {
  likeVideo,
  unlikeVideo,
  saveVideo,
  unSaveVideo,
} from '../redux/video/actions';
import {
  incrementShareInFeed,
  updateShareInFeed,
} from '../redux/video/feedSlice';
import { openModal } from '../redux/modal/modalSlice';

const Container = styled.div`
  padding-bottom: 40px;
  margin-bottom: 40px;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.2);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  @media (max-width: 768px) {
    padding-bottom: 20px;
    margin-bottom: 20px;
  }
`;
const Content = styled.div`
  margin-left: 70px;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const VideoWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 20px;
  position: relative;
  top: 0;
  transition: top 0.3s ease-out;
  z-index: 1;

  &.sticky {
    position: fixed;
    top: 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 0;
    width: 100%;
  }
`;

const VideoContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
  overflow: hidden;

  @media (max-width: 768px) {
    justify-content: start;
  }
`;

const Video = styled.video`
  width: 100%;
  max-width: 100%;
  max-height: 400px;
  height: auto;
  border-radius: 10px;
  object-fit: contain;
  object-position: center;
  background: #000;

  @media (max-width: 768px) {
    max-height: 70vh;
  }
`;

const Image = styled.img`
  width: 100%;
  max-width: 100%;
  max-height: 400px;
  height: auto;
  border-radius: 10px;
  object-fit: contain;
  object-position: center;
  background: #000;

  @media (max-width: 768px) {
    max-height: 70vh;
  }
`;

const YouTubeEmbed = styled.iframe`
  width: 100%;
  max-width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 400px;
  border-radius: 10px;
  border: none;
  background: #000;
`;

const WatermarkOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &::before {
    content: 'MYSOOV.TV';
    font-size: 42px;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 6px;
    font-family: var(--secondary-fonts);
    text-shadow: 2px 2px 12px rgba(0, 0, 0, 0.6);
  }

  @media (max-width: 768px) {
    &::before {
      font-size: 28px;
      letter-spacing: 4px;
    }
  }
`;

const VideoStats = styled.div`
  @media (max-width: 768px) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    width: 100%;
    margin-top: 10px;
    padding: 0 10px;
  }
`;

const Icon = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  cursor: pointer;
  position: relative;

  svg {
    width: 35px;
    height: 35px;
    padding: 8px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.12);
  }

  @media (max-width: 768px) {
    margin-bottom: 0;
    flex: 1;
    flex-direction: row;
    gap: 5px;
    background-color: rgba(255, 255, 255, 0.04);
    border-radius: 8px;
    padding: 8px 12px;
    max-width: none;
    width: auto;
    height: auto;
    position: relative;

    svg {
      width: 24px;
      height: 24px;
      padding: 0;
      border-radius: 0;
      background-color: transparent;
    }
  }
`;

const StatsWrapper = styled.span`
  font-size: 13px;
  font-weight: 500;
  margin-top: 5px;

  @media (max-width: 768px) {
    font-size: 12px;
    font-weight: 500;
    margin-top: 0;
  }
`;

const MobileOnlyStats = styled.span`
  font-size: 10px;
  font-weight: 600;
  margin-top: 2px;
  display: none;

  @media (max-width: 768px) {
    display: block;
    font-size: 12px;
    font-weight: 500;
    margin-top: 0;
  }
`;

const StatsLink = styled(Link)`
  text-decoration: none;
  color: inherit;

  @media (max-width: 768px) {
    flex: 1;
  }
`;

const Card = ({ video, onVideoUpdate, onVideoDelete }) => {
  const {
    _id,
    caption,
    userId,
    videoUrl,
    images,
    likes,
    saved,
    mediaType,
    storageProvider,
  } = video;
  const { currentUser } = useSelector((state) => state.user);
  const [aspectRatio, setAspectRatio] = useState(null);

  const dispatch = useDispatch();

  // Handle video metadata loading to detect aspect ratio
  const handleVideoLoadedMetadata = (e) => {
    const video = e.target;
    const { videoWidth, videoHeight } = video;
    if (videoWidth && videoHeight) {
      const ratio = videoWidth / videoHeight;
      setAspectRatio(
        ratio < 1 ? 'portrait' : ratio > 1 ? 'landscape' : 'square'
      );
    }
  };

  // Handle image loading to detect aspect ratio
  const handleImageLoad = (e) => {
    const img = e.target;
    const { naturalWidth, naturalHeight } = img;
    if (naturalWidth && naturalHeight) {
      const ratio = naturalWidth / naturalHeight;
      setAspectRatio(
        ratio < 1 ? 'portrait' : ratio > 1 ? 'landscape' : 'square'
      );
    }
  };

  // Check if video is from YouTube
  const isYouTubeVideo =
    videoUrl?.provider === 'youtube' ||
    storageProvider === 'youtube' ||
    videoUrl?.url?.includes('youtube.com/embed');

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

  const guardOr = (fn) => {
    if (!currentUser) {
      dispatch(openModal());
      return;
    }
    fn();
  };

  const handleLikes = () =>
    guardOr(() => {
      const loggedInUserId = currentUser?._id;
      if (!loggedInUserId) return;
      if (likes?.includes(loggedInUserId)) {
        dispatch(unlikeVideo(_id, loggedInUserId));
      } else {
        dispatch(likeVideo(_id, loggedInUserId));
      }
    });

  const handleShare = () =>
    guardOr(async () => {
      // Generate the post URL to share - use frontend URL
      const postUrl = `${window.location.origin}/post/${_id}`;

      // Track share count in backend
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/videos/share/${_id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          // Update share count in Redux (for feed) with the exact value from DB
          dispatch(updateShareInFeed({ videoId: _id, share: data.share }));
        } else {
          console.error('Failed to increment share');
        }
      } catch (error) {
        console.error('Failed to track share:', error);
      }

      // If Facebook SDK is available, use the Share Dialog
      if (window.FB) {
        FB.ui(
          {
            method: 'share',
            href: postUrl,
            hashtag: '#Mysoov',
            quote: caption || 'Check out this amazing content on Mysoov!',
          },
          function (response) {
            // Share completed
          }
        );
      } else {
        // Fallback: Open Facebook share dialog in a new window
        const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          postUrl
        )}&quote=${encodeURIComponent(
          caption || 'Check out this amazing content on Mysoov!'
        )}`;

        window.open(
          facebookShareUrl,
          'facebook-share-dialog',
          'width=800,height=600'
        );
      }
    });

  const isOwnVideo =
    currentUser?._id && String(currentUser._id) === String(userId);
  const isSaved =
    currentUser?._id && Array.isArray(saved) && saved.includes(currentUser._id);

  const handleBookmark = () =>
    guardOr(() => {
      const uid = currentUser?._id;
      if (!uid) return;
      if (isSaved) {
        dispatch(unSaveVideo(_id, uid));
      } else {
        dispatch(saveVideo(_id, uid));
      }
    });

  const isUnpurchasedFilm = video?.sourceFilmId != null;

  return (
    <Container>
      <HomeCard
        id={userId}
        video={video}
        onVideoUpdate={onVideoUpdate}
        onVideoDelete={onVideoDelete}
      />
      <Content>
        <HomeText caption={caption} />
        <VideoWrapper>
          <VideoContainer>
            {!videoUrl || !videoUrl.url ? (
              <div
                style={{
                  padding: '20px',
                  background: 'rgba(255, 0, 0, 0.1)',
                  borderRadius: '10px',
                  color: '#ff4444',
                  textAlign: 'center',
                }}
              >
                ⚠️ Video URL is missing or corrupted
                <br />
                <small>Video ID: {_id}</small>
              </div>
            ) : mediaType === 'image' ? (
              // Check if there are multiple images
              images && images.length > 0 ? (
                <ImageSlider images={images} caption={caption} />
              ) : (
                <Image
                  src={videoUrl.url}
                  alt={caption || 'Post image'}
                  onLoad={handleImageLoad}
                  data-aspect-ratio={aspectRatio}
                />
              )
            ) : isYouTubeVideo ? (
              <>
                <YouTubeEmbed
                  src={getCleanYouTubeUrl(videoUrl.url)}
                  title={caption || 'Video'}
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                />
                {isUnpurchasedFilm && <WatermarkOverlay />}
              </>
            ) : (
              <>
                <Video
                  src={videoUrl.url}
                  controls
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  data-aspect-ratio={aspectRatio}
                />
                {isUnpurchasedFilm && <WatermarkOverlay />}
              </>
            )}
          </VideoContainer>
          {/* <Stats variant="home" video={video} /> */}
          <VideoStats>
            <Icon onClick={handleLikes}>
              {_id && currentUser?._id && likes?.includes(currentUser._id) ? (
                <IoHeart style={{ color: 'var(--primary-color)' }} />
              ) : (
                <IoHeartOutline />
              )}
              <StatsWrapper>{likes?.length}</StatsWrapper>
            </Icon>
            <StatsLink to={`/post/${_id}`}>
              <Icon>
                <MdOutlineInsertComment />
                <StatsWrapper>{video?.commentsCount ?? 0}</StatsWrapper>
              </Icon>
            </StatsLink>
            <Icon onClick={handleShare}>
              <IoIosShareAlt />
              <StatsWrapper>{video?.share ?? 0}</StatsWrapper>
            </Icon>
            {!isOwnVideo && (
              <Icon onClick={handleBookmark}>
                {isSaved ? (
                  <HiBookmark style={{ color: 'var(--primary-color)' }} />
                ) : (
                  <HiOutlineBookmark />
                )}
                <MobileOnlyStats>{saved?.length ?? 0}</MobileOnlyStats>
              </Icon>
            )}
          </VideoStats>
        </VideoWrapper>
      </Content>
    </Container>
  );
};
export default Card;
