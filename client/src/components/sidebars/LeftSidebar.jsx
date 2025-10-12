import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { IoIosHome } from 'react-icons/io';
import { RiUserFollowLine } from 'react-icons/ri';
import {
  MdOutlineExplore,
  MdOutlineNotificationsNone,
  MdDashboard,
} from 'react-icons/md';
import { LuUser2 } from 'react-icons/lu';
import { AiOutlineUpload } from 'react-icons/ai';
import { HiOutlineNewspaper } from 'react-icons/hi2';

import { openModal } from '../../redux/modal/modalSlice';
import { useNotifications } from '../../hooks/useNotifications';

const Container = styled.div`
  position: sticky;
  top: var(--navbar-h);
  padding: 20px 50px 20px 20px;
  height: calc(var(--vh, 1vh) * 100 - var(--navbar-h));
  overflow: auto;
  display: flex;
  flex-direction: column;
  flex: 2;
  border-right: 0.5px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    padding: 20px 10px;
    flex: 0 0 60px;
    min-width: 60px;
  }
`;
const Nav = styled.nav`
  padding-bottom: 60px;
`;
const NavItem = styled.div`
  font-family: var(--secondary-fonts);
  font-weight: 600;
  font-size: 18px;
  padding: 12px 5px;
  color: var(--secondary-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;

  @media (max-width: 768px) {
    justify-content: center;
    padding: 15px 5px;

    span {
      display: none;
    }

    svg {
      font-size: 24px;
    }
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 18px;
  background-color: #ff4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  min-width: 20px;

  @media (max-width: 768px) {
    top: 8px;
    left: 28px;
    width: 16px;
    height: 16px;
    font-size: 10px;
  }
`;

const Wrapper = styled.div`
  border-top: 0.5px solid rgba(255, 255, 255, 0.2);
  padding: 20px 0;

  @media (max-width: 768px) {
    display: none;
  }
`;
const Text = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
`;
const Button = styled.button`
  font-family: var(--secondary-fonts);
  background-color: transparent;
  border: 2px solid var(--secondary-color);
  color: var(--secondary-color);
  margin-top: 20px;
  display: block;
  width: 100%;
  padding: 10px;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.6px;
  cursor: pointer;
  border-radius: 3px;
`;

const Footer = styled.div`
  margin-top: auto; /* push footer to the bottom within flex column */
  padding-top: 20px;

  @media (max-width: 768px) {
    display: none;
  }
`;
const FooterText = styled.p`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
`;

const LeftSidebar = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();

  // Get notification count (only fetch if user is authenticated)
  const { unreadCount: notificationCount, fetchUnreadCount } = useNotifications(
    !!currentUser
  );

  // Refresh notification count when navigating between pages
  useEffect(() => {
    if (currentUser) {
      fetchUnreadCount();
    }
  }, [location.pathname, currentUser, fetchUnreadCount]);

  // Prevent navigation for guests and open login modal instead
  const guardClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      dispatch(openModal());
    }
  };

  const handleOpenModal = () => dispatch(openModal());

  // Check if user is admin (role === 'admin')
  const isAdmin = currentUser?.role === 'admin';

  return (
    <Container>
      <Nav>
        <Link to='/'>
          <NavItem>
            <IoIosHome />
            <span>Home</span>
          </NavItem>
        </Link>
        <Link to='notifications' onClick={guardClick}>
          <NavItem>
            <MdOutlineNotificationsNone />
            <span>Notifications</span>
            {currentUser && notificationCount > 0 && (
              <NotificationBadge>
                {notificationCount > 99 ? '99+' : notificationCount}
              </NotificationBadge>
            )}
          </NavItem>
        </Link>
        <Link to='explore' onClick={guardClick}>
          <NavItem>
            <MdOutlineExplore />
            <span>Explore</span>
          </NavItem>
        </Link>
        {currentUser && (
          <Link to='upload'>
            <NavItem>
              <AiOutlineUpload />
              <span>Upload</span>
            </NavItem>
          </Link>
        )}
        {currentUser ? (
          <Link to={`/${currentUser.username}`}>
            <NavItem>
              <LuUser2 />
              <span>Profile</span>
            </NavItem>
          </Link>
        ) : (
          <Link to='profile' onClick={guardClick}>
            <NavItem>
              <LuUser2 />
              <span>Profile</span>
            </NavItem>
          </Link>
        )}

        {/* Blog Menu */}
        <Link to='/blog'>
          <NavItem>
            <HiOutlineNewspaper />
            <span>Blog</span>
          </NavItem>
        </Link>

        {/* Admin Dashboard Menu */}
        {isAdmin && (
          <Link to='/dashboard'>
            <NavItem>
              <MdDashboard />
              <span>Dashboard</span>
            </NavItem>
          </Link>
        )}
      </Nav>
      {!currentUser && (
        <Wrapper>
          <Text>Log in to upload videos, like and view comments.</Text>
          <Button onClick={handleOpenModal}>Log in</Button>
        </Wrapper>
      )}

      <Footer>
        <FooterText>&copy; 2025 Mysoov.TV</FooterText>
      </Footer>
    </Container>
  );
};
export default LeftSidebar;
