import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { VideoCard, VideoText } from '../components/index';

const Card = styled.div`
  background-color: rgba(255, 255, 255, 0.04);
  padding: 10px;
  border-radius: 8px;
`;

const Video = styled.video`
  width: 100%;
  aspect-ratio: 9 / 16;
  height: auto;
  border-radius: 8px;
  object-fit: contain;
  object-position: center;
  background: #000;
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

  const videoContent = (
    <>
      <VideoText video={video} />
      {showVideo && src ? <Video src={src} controls playsInline /> : null}
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
