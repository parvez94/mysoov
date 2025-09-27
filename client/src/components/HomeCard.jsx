import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FollowButton, VideoOptionsMenu } from './index';
import { openModal } from '../redux/modal/modalSlice';
import { useVideoCardUserLoading } from '../hooks/useUserDataLoading';
import { VideoCardUserLoading } from './loading/UserInfoLoading';

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 768px) {
    gap: 15px;
  }
`;
const Avatar = styled.img`
  width: 56px;
  height: 56px;
  display: block;
  object-fit: cover;
  border-radius: 50%;
  flex-shrink: 0;
  aspect-ratio: 1 / 1;

  @media (max-width: 768px) {
    width: 45px;
    height: 45px;
  }
`;
const UserInfo = styled.div``;

const Name = styled.h4`
  font-family: var(--primary-fonts);
  color: #fff;
`;
const UserName = styled.p`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 13px;
`;

const HomeCard = ({ id, video, onVideoUpdate, onVideoDelete }) => {
  const [user, setUser] = useState(null);

  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const {
    isLoading: userLoading,
    avatarUrl,
    displayName,
    username,
  } = useVideoCardUserLoading(null, user);

  // Prevent navigation for guests and open login modal instead
  const guardClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      dispatch(openModal());
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/users/${id}`
      );
      setUser(res.data);
    };
    fetchUser();
  }, [id]);

  return (
    <CardHeader>
      {userLoading ? (
        <VideoCardUserLoading />
      ) : (
        <HeaderWrapper>
          <Link
            to={`/${username}`}
            style={{ display: 'block' }}
            onClick={guardClick}
          >
            <Avatar src={avatarUrl} />
          </Link>
          <UserInfo>
            <Link
              to={`/${username}`}
              style={{ textDecoration: 'none' }}
              onClick={guardClick}
            >
              <Name>{displayName}</Name>
            </Link>
            <UserName>@{username}</UserName>
          </UserInfo>
        </HeaderWrapper>
      )}
      {currentUser &&
        user?._id &&
        (currentUser._id !== user._id ? (
          <FollowButton user={currentUser} channel={user} />
        ) : video ? (
          <VideoOptionsMenu
            video={video}
            onVideoUpdate={onVideoUpdate}
            onVideoDelete={onVideoDelete}
          />
        ) : null)}
    </CardHeader>
  );
};
export default HomeCard;
