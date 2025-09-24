import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';
import { IoHeartOutline, IoHeart } from 'react-icons/io5';
import { MdOutlineInsertComment } from 'react-icons/md';
import { IoIosShareAlt } from 'react-icons/io';
import { HiOutlineBookmark } from 'react-icons/hi';
import { useDispatch, useSelector } from 'react-redux';
import { like, unlike } from '../redux/video/videoSlice';

const VideoStats = styled.div``;

const Icon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  font-family: var(--primary-fonts);
  color: var(--secondary-color);

  ${(props) =>
    props.variant === 'home' &&
    css`
      flex-direction: column;
      svg {
        width: 50px;
        height: 50px;
        padding: 12px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.12);
      }
    `}

  ${(props) =>
    props.variant === 'video' &&
    css`
      gap: 5px;
      background-color: rgba(255, 255, 255, 0.04);
      width: 25%;
      border-radius: 8px;
      padding: 10px 15px;

      svg {
        width: 30px;
        height: 30px;
      }
    `}
`;

const StatsWrapper = styled.span`
  font-size: 13px;

  ${({ variant }) =>
    variant === 'home' &&
    css`
      margin-top: 5px;
    `}
`;

const Stats = ({ variant, video }) => {
  const dispatch = useDispatch();
  const { _id, userId, likes } = video;

  const handleLikes = async () => {
    const likeUrl = `${import.meta.env.VITE_API_URL}/api/v1/users/like/${_id}`;
    const unLikeUrl = `${
      import.meta.env.VITE_API_URL
    }/api/v1/users/unlike/${_id}`;

    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
    };

    if (likes?.includes(userId)) {
      await fetch(unLikeUrl, requestOptions);
      dispatch(unlike(userId));
    } else {
      await fetch(likeUrl, requestOptions);
      dispatch(like(userId));
    }
  };

  return (
    <VideoStats>
      <Icon onClick={handleLikes}>
        {_id && likes?.includes(userId) ? (
          <IoHeart style={{ color: 'var(--primary-color)' }} />
        ) : (
          <IoHeartOutline />
        )}
        <StatsWrapper>{likes?.length}</StatsWrapper>
      </Icon>
      <Link to={`/video/`}>
        <Icon variant={variant}>
          <MdOutlineInsertComment />
          <StatsWrapper>{video?.commentsCount ?? 0}</StatsWrapper>
        </Icon>
      </Link>
      <Icon variant={variant}>
        <IoIosShareAlt />
        <StatsWrapper>2K</StatsWrapper>
      </Icon>
      <Icon variant={variant}>
        <HiOutlineBookmark />
      </Icon>
    </VideoStats>
  );
};
export default Stats;
