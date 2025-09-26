import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import axios from 'axios';
import { Link } from 'react-router-dom';
// import ProfileImg from "../assets/avatar/parvez.jpeg"
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

const VideoCard = ({ channel, user, hideFollowButton = false }) => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const channelName = channel.displayName || channel.username;

  // Prevent navigation for guests and open login modal instead
  const guardClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      dispatch(openModal());
    }
  };

  const imageUrl = resolveImageUrl(
    user && channel && String(user._id) === String(channel._id)
      ? user.displayImage
      : channel?.displayImage
  );

  return (
    <CardHeader>
      <HeaderWrapper>
        <Link
          to={`/${channel?.username}`}
          style={{ display: 'block' }}
          onClick={guardClick}
        >
          <Avatar src={imageUrl} />
        </Link>
        <UserInfo>
          <Link
            to={`/${channel?.username}`}
            style={{ textDecoration: 'none' }}
            onClick={guardClick}
          >
            <Name>{channelName}</Name>
          </Link>
          <UserName>@{channel?.username}</UserName>
        </UserInfo>
      </HeaderWrapper>
      {!hideFollowButton &&
      user?._id &&
      channel?._id &&
      String(user._id) !== String(channel._id) ? (
        <FollowButton user={user} channel={channel} />
      ) : null}
    </CardHeader>
  );
};
export default VideoCard;
