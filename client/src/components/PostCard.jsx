import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { VideoCard, VideoText, ImageSlider } from '../components/index';
import { MdLock } from 'react-icons/md';

const Card = styled.div`
  background-color: rgba(255, 255, 255, 0.04);
  padding: 10px;
  border-radius: 8px;
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
`;

const Video = styled.video`
  width: 100%;
  max-height: 300px;
  height: auto;
  border-radius: 8px;
  object-fit: contain;
  object-position: center;
  background: #000;
`;

const YouTubeEmbed = styled.iframe`
  width: 100%;
  max-height: 300px;
  height: auto;
  border-radius: 8px;
  border: none;
  background: #000;
`;

const Image = styled.img`
  width: 100%;
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

const WatermarkOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &::before {
    content: 'MYSOOV.TV';
    font-size: 36px;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 5px;
    font-family: var(--secondary-fonts);
    text-shadow: 2px 2px 12px rgba(0, 0, 0, 0.6);
  }

  @media (max-width: 768px) {
    &::before {
      font-size: 24px;
      letter-spacing: 4px;
    }
  }
`;

const ClickableContent = styled.div`
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const BuyButton = styled.button`
  width: 100%;
  margin-top: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-family: var(--primary-fonts);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  }

  &:active {
    transform: translateY(0);
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
  const navigate = useNavigate();
  const src = video?.videoUrl?.url;
  const images = video?.images || [];
  const isPrivate = video?.privacy === 'Private';
  const mediaType = video?.mediaType || 'video';

  // Show buy button for films using TWO different systems:
  // System 1 (OLD): filmDirectoryId exists (folder-based films)
  // System 2 (NEW): sourceFilmId exists with purchasePrice (customerCode films)
  console.log('Video data:', {
    caption: video?.caption,
    filmDirectoryId: video?.filmDirectoryId,
    sourceFilmId: video?.sourceFilmId,
    isFilm: video?.isFilm,
  });
  
  const showBuyButton = 
    !!video?.filmDirectoryId || // Old system: folder-based
    !!(video?.sourceFilmId && video?.sourceFilmId?.purchasePrice); // New system: has price
    
  // Get the purchase price from:
  // 1. sourceFilmId.purchasePrice (new system)
  // 2. filmDirectory.price (old system)
  // 3. video.purchasePrice (fallback)
  // 4. default to 9.99
  const purchasePrice =
    video?.sourceFilmId?.purchasePrice ||
    video?.filmDirectoryId?.price ||
    video?.purchasePrice ||
    9.99;

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

  const handleBuyClick = (e) => {
    // Stop event propagation to prevent Link navigation
    e.preventDefault();
    e.stopPropagation();

    // Determine which film system is being used
    const isNewSystem = video?.sourceFilmId && video?.sourceFilmId?.purchasePrice;
    const isOldSystem = video?.filmDirectoryId;

    if (isNewSystem) {
      // NEW SYSTEM: customerCode films
      const filmId = video?.sourceFilmId?._id || video?.sourceFilmId || video?._id;
      navigate(
        `/payment?type=film&filmId=${filmId}&directoryId=new-system&filmName=${encodeURIComponent(
          video?.caption || 'Film'
        )}&price=${purchasePrice}`
      );
    } else if (isOldSystem) {
      // OLD SYSTEM: folder-based films
      const filmId = video?._id;
      const directoryId = video?.filmDirectoryId?._id || video?.filmDirectoryId;
      
      if (!directoryId) {
        console.error('Cannot purchase: Invalid directory ID');
        return;
      }

      navigate(
        `/payment?type=film&filmId=${filmId}&directoryId=${directoryId}&filmName=${encodeURIComponent(
          video?.caption || 'Film'
        )}&price=${purchasePrice}`
      );
    } else {
      console.error('Cannot purchase: Unknown film system');
    }
  };

  const isUnpurchasedFilm = video?.sourceFilmId != null;

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
            images && images.length > 0 ? (
              <ImageSlider images={images} caption={video?.caption} />
            ) : (
              <Image src={src} alt={video?.caption || 'Post image'} />
            )
          ) : isYouTubeVideo ? (
            <>
              <YouTubeEmbed
                src={getCleanYouTubeUrl(src)}
                title={video?.caption || 'Video'}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
              />
              {isUnpurchasedFilm && <WatermarkOverlay />}
            </>
          ) : (
            <>
              <Video src={src} controls playsInline />
              {isUnpurchasedFilm && <WatermarkOverlay />}
            </>
          )}
        </VideoWrapper>
      ) : null}
      {showBuyButton && (
        <BuyButton onClick={handleBuyClick}>
          Buy Complete Ownership - ${purchasePrice.toFixed(2)}
        </BuyButton>
      )}
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
          to={`/post/${video._id}`}
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
