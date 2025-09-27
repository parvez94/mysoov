import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';
import { loginSuccess } from '../redux/user/userSlice';
import { FollowButton, PostCard } from '../components';
import { resolveImageUrl } from '../utils/imageUtils';

const API = import.meta.env.VITE_API_URL;

const Container = styled.div`
  padding: 20px 50px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const InfoWrapper = styled.div``;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    gap: 20px;
    margin-bottom: 24px;
  }
`;

const UserImage = styled.img`
  width: 120px;
  height: 120px;
  display: block;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  aspect-ratio: 1 / 1;

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
`;

const UserNames = styled.div``;

const DisplayName = styled.h3`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 26px;
  margin-bottom: 5px;

  @media (max-width: 768px) {
    font-size: 22px;
  }
`;

const UserName = styled.h5`
  font-family: var(--secondary-fonts);
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
  margin-bottom: 12px;
`;

const Actions = styled.div`
  margin-top: 8px;
`;

const ActionButton = styled.button`
  font-family: var(--secondary-fonts);
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--secondary-color);
  background-color: transparent;
  color: var(--secondary-color);
  border-radius: 3px;
  cursor: pointer;
`;

const UserStats = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
`;

const Stat = styled.span`
  color: var(--secondary-color);
`;

const Dot = styled.span`
  opacity: 0.6;
`;

const UserBio = styled.div`
  margin-top: 20px;
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  white-space: pre-wrap;
`;

const VideosWrapper = styled.div`
  margin-top: 40px;
`;

const Navbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
`;

const Tab = styled.div`
  padding: 6px 15px;
  flex: 1;
  cursor: pointer;
  background-color: ${(p) =>
    p.$active ? 'rgba(255, 255, 255, 0.12)' : 'transparent'};
`;

const VideosContainer = styled.div`
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const VideoPlayer = styled.video`
  width: 100%;
  aspect-ratio: 9 / 16;
  height: auto;
  border-radius: 8px;
  object-fit: contain;
  object-position: center;
  background: #000;
`;

// Saved list UI (author header + video)
const SavedCard = styled.div``;
const SavedHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
`;
const SavedAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background: #222;
  display: block;
  flex-shrink: 0;
  aspect-ratio: 1 / 1;
`;
const SavedNames = styled.div``;
const SavedDisplayName = styled.div`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
`;
const SavedUsername = styled.div`
  font-family: var(--secondary-fonts);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
`;

// Modal styles (reused here to avoid navigating away)
const ModalWrapper = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2147483647;
  padding: 16px;
  overflow: auto;
`;

const ModalContent = styled.div`
  position: relative;
  background-color: var(--tertiary-color);
  width: min(480px, 100%);
  max-height: 90dvh;
  border-radius: 10px;
  overflow: auto;
  padding: 20px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: var(--secondary-color);
  cursor: pointer;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Label = styled.label`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  min-height: 90px;
  resize: vertical;
`;

const AvatarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Avatar = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  background: #222;
  display: block;
  flex-shrink: 0;
  aspect-ratio: 1 / 1;
`;

const Small = styled.small`
  color: rgba(255, 255, 255, 0.7);
  font-family: var(--secondary-fonts);
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
`;

const SecondaryBtn = styled(ActionButton)`
  opacity: 0.9;
`;

const PrimaryBtn = styled(ActionButton)`
  background: var(--secondary-color);
  color: #111;
  border-color: var(--secondary-color);
`;

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [savedVideos, setSavedVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' | 'saved'
  const [openEdit, setOpenEdit] = useState(false);
  const [displayNameEdit, setDisplayNameEdit] = useState('');
  const [usernameEdit, setUsernameEdit] = useState('');
  const [bioEdit, setBioEdit] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);

  // Video management handlers
  const handleVideoUpdate = (updatedVideo) => {
    setVideos((prevVideos) =>
      prevVideos.map((video) =>
        video._id === updatedVideo._id ? updatedVideo : video
      )
    );
  };

  const handleVideoDelete = (videoId) => {
    setVideos((prevVideos) =>
      prevVideos.filter((video) => video._id !== videoId)
    );
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        // No endpoint by username; fetch all then match client-side
        const res = await fetch(`${API}/api/v1/users/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        });
        const users = await res.json();
        if (!Array.isArray(users)) return;
        const u = users.find((x) => x?.username === username);
        if (!cancelled) setChannel(u || null);

        // If authenticated and user found, try to load their videos (protected route)
        if (u && currentUser?._id) {
          try {
            const vres = await fetch(`${API}/api/v1/users/profile/${u._id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              credentials: 'include',
            });
            if (vres.ok) {
              const vdata = await vres.json();
              if (!cancelled) setVideos(Array.isArray(vdata) ? vdata : []);
            } else {
              if (!cancelled) setVideos([]);
            }
          } catch (e) {
            if (!cancelled) setVideos([]);
          }
        } else {
          if (!cancelled) setVideos([]);
        }
      } catch (err) {
        // ignore
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [username, currentUser?._id]);

  // Load saved videos when switching to Bookmarked tab on own profile
  useEffect(() => {
    let cancelled = false;
    const loadSaved = async () => {
      if (activeTab !== 'saved') return;
      if (!currentUser?._id) return;
      if (!isOwn) return; // backend also enforces
      try {
        const res = await fetch(
          `${API}/api/v1/users/saved/${currentUser._id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            credentials: 'include',
          }
        );
        if (!cancelled) {
          if (res.ok) {
            const data = await res.json();
            setSavedVideos(Array.isArray(data) ? data : []);
          } else {
            setSavedVideos([]);
          }
        }
      } catch (_) {
        if (!cancelled) setSavedVideos([]);
      }
    };
    loadSaved();
    return () => {
      cancelled = true;
    };
  }, [activeTab, currentUser?._id]);

  const isOwn =
    currentUser &&
    channel?._id &&
    String(currentUser._id) === String(channel._id);

  // Keep edit form state in sync with current user when opening
  useEffect(() => {
    if (!isOwn) return;
    if (searchParams.get('edit') === '1') {
      setOpenEdit(true);
      setDisplayNameEdit(currentUser?.displayName || '');
      setUsernameEdit(currentUser?.username || '');
      setBioEdit(currentUser?.bio || '');
      setAvatarPreview('');
      setAvatarFile(null);
    } else {
      setOpenEdit(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('edit'), isOwn, currentUser]);

  const avatarUrl = useMemo(
    () => resolveImageUrl(channel?.displayImage),
    [channel?.displayImage]
  );
  const displayName = channel?.displayName || channel?.username || username;

  const followersCount = channel?.followers || 0;
  const followingCount = Array.isArray(channel?.following)
    ? channel.following.length
    : 0;

  // Edit handlers
  const handleCloseEdit = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('edit');
    navigate({ pathname: `/${username}`, search: params.toString() });
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser?._id) return;

    setSaving(true);
    try {
      let displayImage = currentUser.displayImage || '';

      // 1) Upload avatar if changed
      if (avatarFile) {
        const fd = new FormData();
        fd.append('image', avatarFile);
        const upRes = await fetch(`${API}/api/v1/upload/image`, {
          method: 'POST',
          body: fd,
          credentials: 'include',
        });
        if (!upRes.ok) throw new Error('Failed to upload image');
        const upData = await upRes.json();
        displayImage = upData.url;
      }

      // 2) Send profile update
      const payload = {
        displayName: displayNameEdit,
        username: usernameEdit,
        bio: bioEdit,
        displayImage,
      };

      const res = await fetch(`${API}/api/v1/users/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updated = await res.json();

      // 3) Update global auth state + local channel (so UI reflects immediately)
      dispatch(loginSuccess(updated));
      if (isOwn) setChannel(updated);

      // 4) Close modal and, if username changed, navigate to the new slug
      const params = new URLSearchParams(searchParams);
      params.delete('edit');
      const nextUsername = updated?.username || usernameEdit || username;
      navigate({ pathname: `/${nextUsername}`, search: params.toString() });

      // 5) Reset transient avatar state
      setAvatarPreview('');
      setAvatarFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!channel) {
    return (
      <Container>
        <InfoWrapper>
          <DisplayName>Profile</DisplayName>
          <UserName>@{username}</UserName>
          <UserBio>Loading or user not found.</UserBio>
        </InfoWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <InfoWrapper>
        <UserInfo>
          <UserImage src={avatarUrl} />
          <UserNames>
            <DisplayName>{displayName}</DisplayName>
            <UserName>@{channel?.username}</UserName>
            <Actions>
              {isOwn ? (
                <ActionButton
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('edit', '1');
                    navigate({
                      pathname: `/${username}`,
                      search: params.toString(),
                    });
                  }}
                >
                  Edit Profile
                </ActionButton>
              ) : (
                <FollowButton
                  user={currentUser}
                  channel={channel}
                  onDelta={(d) => {
                    setChannel((prev) =>
                      prev
                        ? {
                            ...prev,
                            followers: Math.max(0, (prev.followers || 0) + d),
                          }
                        : prev
                    );
                  }}
                />
              )}
            </Actions>
          </UserNames>
        </UserInfo>
        <UserStats>
          <Stat>
            <strong>{followersCount}</strong> Followers
          </Stat>
          <Dot>•</Dot>
          <Stat>
            <strong>{followingCount}</strong> Following
          </Stat>
        </UserStats>
        <UserBio>{channel?.bio || ''}</UserBio>
      </InfoWrapper>

      <VideosWrapper>
        <Navbar>
          <Tab
            $active={activeTab === 'videos'}
            onClick={() => setActiveTab('videos')}
          >
            Videos
          </Tab>
          {isOwn && (
            <Tab
              $active={activeTab === 'saved'}
              onClick={() => setActiveTab('saved')}
            >
              Bookmarked
            </Tab>
          )}
        </Navbar>
        <VideosContainer>
          {activeTab === 'saved' && isOwn
            ? savedVideos.map((v) => (
                <PostCard
                  key={v._id}
                  channel={
                    v.author
                      ? {
                          _id: v.author._id,
                          username: v.author.username,
                          displayName: v.author.displayName,
                          displayImage: v.author.displayImage,
                        }
                      : {}
                  }
                  video={v}
                  user={currentUser}
                  hideFollowButton={true}
                  enableVideoLink={true}
                />
              ))
            : videos.map((v) => (
                <PostCard
                  key={v._id}
                  channel={channel || {}}
                  video={v}
                  user={currentUser}
                  hideFollowButton={!isOwn}
                  onVideoUpdate={isOwn ? handleVideoUpdate : undefined}
                  onVideoDelete={isOwn ? handleVideoDelete : undefined}
                  enableVideoLink={true}
                />
              ))}
        </VideosContainer>
      </VideosWrapper>

      {openEdit &&
        isOwn &&
        createPortal(
          <ModalWrapper
            onClick={handleCloseEdit}
            role='dialog'
            aria-modal='true'
          >
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <CloseButton onClick={handleCloseEdit} aria-label='Close'>
                <IoClose size={22} />
              </CloseButton>
              <h3
                style={{
                  color: 'var(--secondary-color)',
                  fontFamily: 'var(--primary-fonts)',
                }}
              >
                Edit Profile
              </h3>
              <Form onSubmit={handleSave}>
                <AvatarRow>
                  <Avatar src={avatarPreview || avatarUrl} alt='avatar' />
                  <div>
                    <Label htmlFor='avatar'>Profile image</Label>
                    <Input
                      id='avatar'
                      type='file'
                      accept='image/*'
                      onChange={onFileChange}
                    />
                    <Small>
                      PNG/JPG • up to 5MB • will be cropped to a circle
                    </Small>
                  </div>
                </AvatarRow>

                <div>
                  <Label htmlFor='displayName'>Name</Label>
                  <Input
                    id='displayName'
                    value={displayNameEdit}
                    onChange={(e) => setDisplayNameEdit(e.target.value)}
                    placeholder='Your name'
                  />
                </div>

                <div>
                  <Label htmlFor='username'>Username</Label>
                  <Input
                    id='username'
                    value={usernameEdit}
                    onChange={(e) => setUsernameEdit(e.target.value)}
                    placeholder='username'
                  />
                </div>

                <div>
                  <Label htmlFor='bio'>Bio</Label>
                  <Textarea
                    id='bio'
                    value={bioEdit}
                    onChange={(e) => setBioEdit(e.target.value)}
                    placeholder='Tell people about yourself'
                  />
                </div>

                <ActionsRow>
                  <SecondaryBtn
                    type='button'
                    onClick={handleCloseEdit}
                    disabled={saving}
                  >
                    Cancel
                  </SecondaryBtn>
                  <PrimaryBtn type='submit' disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </PrimaryBtn>
                </ActionsRow>
              </Form>
            </ModalContent>
          </ModalWrapper>,
          document.body
        )}
    </Container>
  );
};

export default PublicProfile;
