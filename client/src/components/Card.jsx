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
import { like, unlike } from '../redux/video/videoSlice';
import {
  likeVideo,
  unlikeVideo,
  saveVideo,
  unSaveVideo,
} from '../redux/video/actions';
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

  @media (max-width: 768px) {
    width: 100%;
    justify-content: start;
  }
`;

const Video = styled.video`
  max-width: 500px;
  max-height: 600px;
  width: auto;
  height: auto;
  border-radius: 10px;
  object-fit: contain;
  object-position: center;
  background: #000;

  @media (max-width: 768px) {
    max-width: 100%;
    width: 100%;
    max-height: 70vh;
  }
`;

const Image = styled.img`
  max-width: 500px;
  max-height: 600px;
  width: auto;
  height: auto;
  border-radius: 10px;
  object-fit: contain;
  object-position: center;
  background: #000;

  @media (max-width: 768px) {
    max-width: 100%;
    width: 100%;
    max-height: 70vh;
  }
`;

const YouTubeEmbed = styled.iframe`
  width: 500px;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  border: none;
  background: #000;

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
  }
`;

const VideoStats = styled.div`
  @media (max-width: 768px) {
    display: flex;
    flex-direction: row;
    justify-content: start;
    gap: 15px;
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

  svg {
    width: 40px;
    height: 40px;
    padding: 8px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.12);
  }

  @media (max-width: 768px) {
    margin-bottom: 0;
    flex: 1;
    max-width: 60px;

    svg {
      width: 40px;
      height: 40px;
      padding: 8px;
    }
  }
`;

const StatsWrapper = styled.span`
  font-size: 13px;
  margin-top: 5px;

  @media (max-width: 768px) {
    font-size: 11px;
    margin-top: 3px;
  }
`;

const Card = ({ video, onVideoUpdate, onVideoDelete }) => {
  const {
    _id,
    caption,
    userId,
    videoUrl,
    likes,
    saved,
    mediaType,
    storageProvider,
  } = video;
  const { currentUser } = useSelector((state) => state.user);

  const dispatch = useDispatch();

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
    guardOr(() => {
      // Generate the video URL to share - use backend URL so Facebook can crawl meta tags
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5100';
      const videoUrl = `${apiUrl}/video/${_id}`;

      // If Facebook SDK is available, use the Share Dialog
      if (window.FB) {
        FB.ui(
          {
            method: 'share',
            href: videoUrl,
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
          videoUrl
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
              <Image src={videoUrl.url} alt={caption || 'Post image'} />
            ) : isYouTubeVideo ? (
              <YouTubeEmbed
                src={getCleanYouTubeUrl(videoUrl.url)}
                title={caption || 'Video'}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
              />
            ) : (
              <Video src={videoUrl.url} controls />
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
            <Link to={`/video/${_id}`}>
              <Icon>
                <MdOutlineInsertComment />
                <StatsWrapper>{video?.commentsCount ?? 0}</StatsWrapper>
              </Icon>
            </Link>
            <Icon onClick={handleShare}>
              <IoIosShareAlt />
              <StatsWrapper>2K</StatsWrapper>
            </Icon>
            {!isOwnVideo && (
              <Icon onClick={handleBookmark}>
                {isSaved ? (
                  <HiBookmark style={{ color: 'var(--primary-color)' }} />
                ) : (
                  <HiOutlineBookmark />
                )}
              </Icon>
            )}
          </VideoStats>
        </VideoWrapper>
      </Content>
    </Container>
  );
};
export default Card;
