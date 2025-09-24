import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserMenu } from '../redux/user/userSlice';

const ClickListener = ({ children }) => {
  const dispatch = useDispatch();
  const { showUserMenu } = useSelector((state) => state.user);
  const userAvatarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close the user menu if clicking outside of the avatar/menu area
      if (
        showUserMenu &&
        userAvatarRef.current &&
        !userAvatarRef.current.contains(event.target)
      ) {
        dispatch(setUserMenu(false));
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dispatch, showUserMenu]);

  return (
    <div>
      {/* This div serves as a reference for the UserAvatar component */}
      <div ref={userAvatarRef}>{children}</div>
    </div>
  );
};

export default ClickListener;
