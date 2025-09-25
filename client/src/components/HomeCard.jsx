import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FollowButton } from './index';
import { openModal } from '../redux/modal/modalSlice';
import { resolveImageUrl } from '../utils/imageUtils';

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
`;
const Avatar = styled.img`
  width: 56px;
  height: 56px;
  display: block;
  object-fit: cover;
  border-radius: 50%;
  flex-shrink: 0;
  aspect-ratio: 1 / 1;
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

const HomeCard = ({ id }) => {
  const [user, setUser] = useState({});

  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const dpName = user.displayName || user.username;

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

  const imageUrl = resolveImageUrl(
    currentUser && user && String(currentUser._id) === String(user._id)
      ? currentUser.displayImage
      : user?.displayImage
  );

  return (
    <CardHeader>
      <HeaderWrapper>
        <Link
          to={`/${user.username}`}
          style={{ display: 'block' }}
          onClick={guardClick}
        >
          <Avatar src={imageUrl} />
        </Link>
        <UserInfo>
          <Link
            to={`/${user.username}`}
            style={{ textDecoration: 'none' }}
            onClick={guardClick}
          >
            <Name>{dpName}</Name>
          </Link>
          <UserName>@{user.username}</UserName>
        </UserInfo>
      </HeaderWrapper>
      {currentUser && user?._id && currentUser._id !== user._id && (
        <FollowButton user={currentUser} channel={user} />
      )}
    </CardHeader>
  );
};
export default HomeCard;
