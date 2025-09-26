import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { IoHeartOutline, IoHeart } from 'react-icons/io5';
import { MdOutlineInsertComment } from 'react-icons/md';
import { IoIosShareAlt } from 'react-icons/io';
import { HiOutlineBookmark, HiBookmark } from 'react-icons/hi';
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
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const VideoWrapper = styled.div`
  flex: 1;
  width: 700px;
  height: 400px;
  position: relative;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    aspect-ratio: 9 / 16;
    max-height: 70vh;
  }
`;
const VideoPlayer = styled.video`
  width: 100%;
  height: 100%;
  border-radius: 4px;

  @media (max-width: 768px) {
    border-radius: 8px;
    object-fit: contain;
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

const Video = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { currentVideo } = useSelector((state) => state.video);
  const { comments: commentsList } = useSelector((state) => state.comments);

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
          `${import.meta.env.VITE_API_URL}/api/v1/videos/find/${path}`
        );

        const { userId } = videoRes.data;

        const userRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/users/${userId}`
        );
        setChannel(userRes.data);

        dispatch(getVideoSuccess(videoRes.data));
      } catch (err) {
        dispatch(getVideoFailed(err));
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

  return (
    <Container>
      <Main>
        <VideoWrapper>
          <VideoPlayer src={currentVideo?.videoUrl.url} controls />
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
