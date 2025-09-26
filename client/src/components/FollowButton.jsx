import styled from 'styled-components';
import { following } from '../redux/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';

const API = import.meta.env.VITE_API_URL;

const FollowButton = styled.button`
  font-family: var(--secondary-fonts);
  font-size: 15px;
  font-weight: 500;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  border: 1px solid var(--secondary-color);
  background-color: transparent;
  color: var(--secondary-color);
  border-radius: 3px;
  cursor: pointer;

  @media (max-width: 768px) {
    font-size: 14px;
    font-weight: 400;
    padding: 10px 12px;
  }
`;

const Button = ({ user, channel, onDelta }) => {
  const dispatch = useDispatch();

  // Hide when viewing own channel or when ids are missing
  if (!user?._id || !channel?._id || String(user._id) === String(channel._id)) {
    return null;
  }

  const handleFollow = async () => {
    const followUrl = `${API}/api/v1/users/follow/${channel._id}`;
    const unfollowUrl = `${API}/api/v1/users/unfollow/${channel._id}`;

    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
    };

    const wasFollowing = user?.following?.includes(channel._id);

    try {
      wasFollowing
        ? await fetch(unfollowUrl, requestOptions)
        : await fetch(followUrl, requestOptions);

      // Update current user's following in Redux
      dispatch(following(channel._id));

      // Optimistically adjust the viewed channel's followers count
      if (typeof onDelta === 'function') {
        onDelta(wasFollowing ? -1 : 1);
      }
    } catch (e) {
      // no-op; keep behavior consistent with existing code
    }
  };

  return (
    <FollowButton onClick={handleFollow}>
      {user?.following?.includes(channel._id) ? 'Following' : 'Follow'}
    </FollowButton>
  );
};
export default Button;
