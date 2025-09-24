import { useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LuUser2 } from 'react-icons/lu';
import { MdOutlineLogout } from 'react-icons/md';
import { logout } from '../../redux/user/userSlice';

const Container = styled.div`
  background-color: var(--secondary-color);
  font-family: var(--primary-fonts);
  font-size: 14px;
  padding: 10px 0;
  border-radius: 2px;
`;

const MenuItem = styled.div`
  padding: 4px 15px;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 15px;
  color: var(--tertiary-color);
`;

const UserMenu = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('user');
  };

  const profileTo = currentUser?.username
    ? `/${currentUser.username}`
    : 'profile';

  return (
    <Container>
      <Link to={profileTo}>
        <MenuItem>
          <LuUser2 />
          Profile
        </MenuItem>
      </Link>

      <Link onClick={handleLogout}>
        <MenuItem>
          <MdOutlineLogout />
          Logout
        </MenuItem>
      </Link>
    </Container>
  );
};
export default UserMenu;
