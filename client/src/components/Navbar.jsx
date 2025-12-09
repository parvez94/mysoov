import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { openModal } from '../redux/modal/modalSlice';
import { toggleUserMenu, setUserMenu } from '../redux/user/userSlice';
import { useNavbarUserLoading } from '../hooks/useUserDataLoading';
import { NavbarUserLoading } from '../components/loading/UserInfoLoading';
import styled from 'styled-components';
import { IoIosSearch } from 'react-icons/io';
import { AiOutlineUpload } from 'react-icons/ai';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import UserMenu from './modal/UserMenu';
import axios from 'axios';

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
  font-family: var(--secondary-fonts);
  font-size: 30px;
  font-weight: 600;
  display: flex;
  align-items: center;
`;

const LogoImage = styled.img`
  height: 40px;
  max-width: 200px;
  object-fit: contain;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 500px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Search = styled.div`
  width: 100%;
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

const SearchDropdown = styled.div`
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const SearchSection = styled.div`
  padding: 12px 0;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const SectionTitle = styled.div`
  font-family: var(--secondary-fonts);
  font-size: 12px;
  color: var(--secondary-color);
  text-transform: uppercase;
  padding: 0 16px 8px;
  font-weight: 600;
`;

const SearchItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  color: var(--secondary-color);
  text-decoration: none;
  transition: background 0.2s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SearchItemAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const DefaultAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: var(--secondary-fonts);
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
`;

const SearchItemThumbnail = styled.img`
  width: 60px;
  height: 45px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
`;

const SearchItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SearchItemTitle = styled.div`
  font-family: var(--primary-fonts);
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SearchItemSubtitle = styled.div`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EmptySearch = styled.div`
  padding: 20px 16px;
  text-align: center;
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
  font-size: 14px;
`;

const LoadingSearch = styled.div`
  padding: 20px 16px;
  text-align: center;
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
  font-size: 14px;
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

const ArticleButton = styled.button`
  font-family: var(--secondary-fonts);
  font-size: 16px;
  font-weight: 500;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid var(--secondary-color);
  background-color: transparent;
  color: var(--secondary-color);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [branding, setBranding] = useState({
    logo: null,
    favicon: null,
    siteName: 'Mysoov.TV',
  });

  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, showUserMenu } = useSelector((state) => state.user);

  const { isLoading: userLoading, avatarUrl } =
    useNavbarUserLoading(currentUser);

  const handleOpenModal = () => {
    dispatch(openModal());
  };

  const handleShowMenu = () => {
    dispatch(toggleUserMenu());
  };

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({ users: [], posts: [] });
      setShowSearchDropdown(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/public/search`,
        {
          params: { q: query },
        }
      );
      setSearchResults({
        users: response.data.users || [],
        posts: response.data.posts || [],
      });
      setShowSearchDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ users: [], posts: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleSearchItemClick = () => {
    setSearchQuery('');
    setShowSearchDropdown(false);
    setSearchResults({ users: [], posts: [] });
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

    // Load branding from localStorage
    const loadBranding = () => {
      try {
        const savedBranding = localStorage.getItem('siteBranding');
        if (savedBranding) {
          const parsed = JSON.parse(savedBranding);
          setBranding(parsed);

          // Update favicon if available
          if (parsed.favicon) {
            const link =
              document.querySelector("link[rel*='icon']") ||
              document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = parsed.favicon;
            document.getElementsByTagName('head')[0].appendChild(link);
          }

          // Update page title if site name is available
          if (parsed.siteName) {
            document.title = parsed.siteName;
          }
        }
      } catch (err) {
        // Silent fail
      }
    };

    loadBranding();

    // Listen for branding updates
    const handleBrandingUpdate = () => {
      loadBranding();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('brandingUpdated', handleBrandingUpdate);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('brandingUpdated', handleBrandingUpdate);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <Container>
        <ContentWrapper>
          <Link to='/'>
            <Logo>
              {branding.logo ? (
                <LogoImage
                  src={branding.logo}
                  alt={branding.siteName || 'Logo'}
                />
              ) : (
                branding.siteName || 'Mysoov.TV'
              )}
            </Logo>
          </Link>
          <SearchContainer ref={searchRef}>
            <Search>
              <Input
                placeholder='Search'
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <IoIosSearch style={{ cursor: 'pointer' }} />
            </Search>
            {showSearchDropdown && (
              <SearchDropdown>
                {isSearching ? (
                  <LoadingSearch>Searching...</LoadingSearch>
                ) : searchResults.users.length === 0 &&
                  searchResults.posts.length === 0 ? (
                  <EmptySearch>No results found</EmptySearch>
                ) : (
                  <>
                    {searchResults.users.length > 0 && (
                      <SearchSection>
                        <SectionTitle>Users</SectionTitle>
                        {searchResults.users.map((user) => (
                          <SearchItem
                            key={user._id}
                            to={`/${user.username}`}
                            onClick={handleSearchItemClick}
                          >
                            {user.displayImage ? (
                              <SearchItemAvatar
                                src={user.displayImage}
                                alt={user.username}
                              />
                            ) : (
                              <DefaultAvatar>
                                {(user.displayName || user.username || 'U')
                                  .charAt(0)
                                  .toUpperCase()}
                              </DefaultAvatar>
                            )}
                            <SearchItemInfo>
                              <SearchItemTitle>
                                {user.displayName || user.username}
                              </SearchItemTitle>
                              <SearchItemSubtitle>
                                @{user.username}
                              </SearchItemSubtitle>
                            </SearchItemInfo>
                          </SearchItem>
                        ))}
                      </SearchSection>
                    )}
                    {searchResults.posts.length > 0 && (
                      <SearchSection>
                        <SectionTitle>Posts</SectionTitle>
                        {searchResults.posts.map((post) => (
                          <SearchItem
                            key={post._id}
                            to={`/post/${post._id}`}
                            onClick={handleSearchItemClick}
                          >
                            {post.thumbnailPath && (
                              <SearchItemThumbnail
                                src={post.thumbnailPath}
                                alt={post.caption || 'Post'}
                              />
                            )}
                            <SearchItemInfo>
                              <SearchItemTitle>
                                {post.caption || 'No caption'}
                              </SearchItemTitle>
                              {post.user && (
                                <SearchItemSubtitle>
                                  by @{post.user.username}
                                </SearchItemSubtitle>
                              )}
                            </SearchItemInfo>
                          </SearchItem>
                        ))}
                      </SearchSection>
                    )}
                  </>
                )}
              </SearchDropdown>
            )}
          </SearchContainer>
          <ButtonWrapper>
            {currentUser && (
              <>
                <Link to='/upload'>
                  <UploadButton>
                    <AiOutlineUpload />
                    <span>Upload</span>
                  </UploadButton>
                </Link>
                <Link to='/article/new'>
                  <ArticleButton>
                    <HiOutlinePencilAlt />
                    <span>Write</span>
                  </ArticleButton>
                </Link>
              </>
            )}

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
