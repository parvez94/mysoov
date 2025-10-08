import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { VideoCard, VideoText } from '../components/index';
import { MdLock } from 'react-icons/md';

const Card = styled.div`
  background-color: rgba(255, 255, 255, 0.04);
  padding: 10px;
  border-radius: 8px;
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Video = styled.video`
  width: 100%;
  aspect-ratio: 9 / 16;
  max-height: 300px;
  height: auto;
  border-radius: 8px;
  object-fit: contain;
  object-position: center;
  background: #000;
`;

const YouTubeEmbed = styled.iframe`
  width: 100%;
  aspect-ratio: 9 / 16;
  max-height: 300px;
  height: auto;
  border-radius: 8px;
  border: none;
  background: #000;
`;

const Image = styled.img`
  width: 100%;
  aspect-ratio: 9 / 16;
  max-height: 300px;
  height: auto;
  border-radius: 8px;
  object-fit: contain;
  object-position: center;
  background: #000;
`;

const PrivacyBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  padding: 6px 10px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #9ca3af;
  font-family: var(--secondary-fonts);
  font-size: 13px;
  font-weight: 500;
  z-index: 1;
`;

const ClickableContent = styled.div`
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const PostCard = ({
  channel,
  video,
  user,
  showVideo = true,
  hideFollowButton = false,
  onVideoUpdate,
  onVideoDelete,
  enableVideoLink = false,
}) => {
  const src = video?.videoUrl?.url;
  const isPrivate = video?.privacy === 'Private';
  const mediaType = video?.mediaType || 'video';

  // Check if video is from YouTube
  const isYouTubeVideo =
    video?.videoUrl?.provider === 'youtube' ||
    video?.storageProvider === 'youtube' ||
    src?.includes('youtube.com/embed');

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

  // Debug logging
  if (src?.includes('youtube.com')) {
    console.log('YouTube Video Debug:', {
      videoId: video?._id,
      src,
      'videoUrl.provider': video?.videoUrl?.provider,
      storageProvider: video?.storageProvider,
      isYouTubeVideo,
      mediaType,
      willRenderAs: isYouTubeVideo ? 'IFRAME' : 'VIDEO TAG',
    });
  }

  const videoContent = (
    <>
      <VideoText video={video} />
      {showVideo && src ? (
        <VideoWrapper>
          {isPrivate && (
            <PrivacyBadge>
              <MdLock size={16} />
              Private
            </PrivacyBadge>
          )}
          {mediaType === 'image' ? (
            <Image src={src} alt={video?.caption || 'Post image'} />
          ) : isYouTubeVideo ? (
            <YouTubeEmbed
              src={getCleanYouTubeUrl(src)}
              title={video?.caption || 'Video'}
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
            />
          ) : (
            <Video src={src} controls playsInline />
          )}
        </VideoWrapper>
      ) : null}
    </>
  );

  return (
    <Card>
      <VideoCard
        channel={channel}
        user={user}
        video={video}
        hideFollowButton={hideFollowButton}
        onVideoUpdate={onVideoUpdate}
        onVideoDelete={onVideoDelete}
      />
      {enableVideoLink ? (
        <Link
          to={`/video/${video._id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <ClickableContent>{videoContent}</ClickableContent>
        </Link>
      ) : (
        videoContent
      )}
    </Card>
  );
};
export default PostCard;
