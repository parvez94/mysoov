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
  width: 280px;
  aspect-ratio: 9 / 16; /* force portrait tile */
  height: auto;
  border-radius: 10px;
  object-fit: contain; /* show full video with letterboxing */
  object-position: center;
  background: #000; /* fallback letterbox color if needed */

  @media (max-width: 768px) {
    width: calc(
      100vw - 90px
    ); /* Account for left sidebar (60px) + padding (30px) */
    max-width: 330px;
    aspect-ratio: 9 / 16;
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
    width: 50px;
    height: 50px;
    padding: 12px;
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
  const { _id, caption, userId, videoUrl, likes, saved } = video;
  const { currentUser } = useSelector((state) => state.user);

  const dispatch = useDispatch();

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
      /* TODO: share flow */
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
            <Video src={videoUrl.url} controls />
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
                <StatsWrapper>{video?.saved?.length || 0}</StatsWrapper>
              </Icon>
            )}
          </VideoStats>
        </VideoWrapper>
      </Content>
    </Container>
  );
};
export default Card;
