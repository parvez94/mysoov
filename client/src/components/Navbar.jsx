import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { openModal } from '../redux/modal/modalSlice';
import { toggleUserMenu, setUserMenu } from '../redux/user/userSlice';
import { useNavbarUserLoading } from '../hooks/useUserDataLoading';
import { NavbarUserLoading } from '../components/loading/UserInfoLoading';
import styled from 'styled-components';
import { IoIosSearch } from 'react-icons/io';
import { AiOutlineUpload } from 'react-icons/ai';
import UserMenu from './modal/UserMenu';

import ClickListener from './ClickListerner';

const Container = styled.div`
  background-color: var(--primary-color);
  padding: 10px 20px;
  min-height: var(--navbar-h);
  position: sticky;
  top: 0;
  z-index: 999;
`;

const ContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h2`
  color: #fff;
  font-family: 'Lobster';
  font-size: 30px;
  display: flex;
  align-items: center;
`;

const Search = styled.div`
  width: 500px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--secondary-color);
  padding: 8px 12px;
  border-radius: 3px;

  svg {
    font-size: 25px;
    color: var(--secondary-color);
    cursor: pointer;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;
const Input = styled.input`
  border: none;
  width: 100%;
  font-size: 16px;
  font-family: var(--primary-fonts);
  font-weight: 300;
  background-color: transparent;
  color: var(--secondary-color);

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: var(--secondary-color);
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;
const UploadButton = styled.button`
  font-family: var(--secondary-fonts);
  font-size: 16px;
  font-weight: 500;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid var(--secondary-color);
  background-color: var(--secondary-color);
  border-radius: 3px;
  cursor: pointer;

  @media (max-width: 768px) {
    padding: 8px;
    font-size: 18px;

    span {
      display: none;
    }
  }
`;

const UserAvatar = styled.div``;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: pointer;
  object-fit: cover; /* crop to fill circle */
  object-position: center; /* center crop */
  display: block; /* avoid baseline gaps */
  flex-shrink: 0;
  aspect-ratio: 1 / 1;
`;

const Button = styled.button`
  font-family: var(--secondary-fonts);
  font-size: 16px;
  font-weight: 500;
  padding: 8px 20px;
  display: flex;
  align-items: center;
  border: 1px solid var(--secondary-color);
  background-color: transparent;
  color: var(--secondary-color);
  border-radius: 3px;
  cursor: pointer;
`;

const MenuBar = styled.div`
  position: absolute;
  width: 120px;
  right: 10px;
  z-index: 999;
`;

const Navbar = () => {
  const [mounted, setMounted] = useState(false);

  const dispatch = useDispatch();
  const { currentUser, showUserMenu } = useSelector((state) => state.user);

  const { isLoading: userLoading, avatarUrl } =
    useNavbarUserLoading(currentUser);

  const handleOpenModal = () => {
    dispatch(openModal());
  };

  const handleShowMenu = () => {
    dispatch(toggleUserMenu());
  };

  // Prevent navigation for guests and open login modal instead
  const guardClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      dispatch(openModal());
    }
  };

  // Ensure menu is closed on refresh/unload
  const handleBeforeUnload = () => {
    if (mounted) {
      dispatch(setUserMenu(false));
    }
  };

  useEffect(() => {
    setMounted(true);

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dispatch]);

  return (
    <>
      <Container>
        <ContentWrapper>
          <Logo>Mysoov.TV</Logo>
          <Search>
            <Input placeholder='Search...' />
            <IoIosSearch />
          </Search>
          <ButtonWrapper>
            <Link to='upload' onClick={guardClick}>
              <UploadButton>
                <AiOutlineUpload />
                <span>Upload</span>
              </UploadButton>
            </Link>

            {currentUser ? (
              <ClickListener>
                <UserAvatar onClick={handleShowMenu}>
                  {userLoading ? (
                    <NavbarUserLoading />
                  ) : (
                    <Avatar src={avatarUrl} alt='User avatar' />
                  )}
                </UserAvatar>
              </ClickListener>
            ) : (
              <Button onClick={handleOpenModal}>Log in</Button>
            )}
          </ButtonWrapper>
        </ContentWrapper>
        {currentUser && showUserMenu && (
          <MenuBar>
            <UserMenu />
          </MenuBar>
        )}
      </Container>
    </>
  );
};
export default Navbar;
