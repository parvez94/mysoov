import styled from 'styled-components';
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

const PostCard = ({
  channel,
  video,
  user,
  showVideo = true,
  hideFollowButton = false,
}) => {
  const src = video?.videoUrl?.url;
  return (
    <Card>
      <VideoCard
        channel={channel}
        user={user}
        hideFollowButton={hideFollowButton}
      />
      <VideoText video={video} />
      {showVideo && src ? <Video src={src} controls playsInline /> : null}
    </Card>
  );
};
export default PostCard;
