import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { Spinner } from '../../components/index';
import { FaPlay, FaPause, FaTrash, FaEye, FaExchangeAlt } from 'react-icons/fa';

const Container = styled.div`
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Title = styled.h1`
  font-family: var(--secondary-fonts);
  color: var(--primary-color);
  font-size: 32px;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 16px;
  margin-bottom: 30px;
`;

const SearchBar = styled.input`
  width: 100%;
  max-width: 500px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--primary-color);
  font-family: var(--primary-fonts);
  font-size: 14px;
  margin-bottom: 24px;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
  }

  &::placeholder {
    color: var(--secondary-color);
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: var(--primary-fonts);
  min-width: 800px;
`;

const Thead = styled.thead`
  background: rgba(255, 255, 255, 0.08);
`;

const Th = styled.th`
  padding: 16px;
  text-align: left;
  color: var(--primary-color);
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &:not(:last-child) td {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const Td = styled.td`
  padding: 16px;
  color: var(--secondary-color);
  font-size: 14px;
  vertical-align: middle;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
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

const Username = styled.div`
  color: var(--primary-color);
  font-weight: 500;
`;

const Caption = styled.div`
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) =>
    props.status === 'Public'
      ? 'rgba(76, 175, 80, 0.2)'
      : 'rgba(255, 152, 0, 0.2)'};
  color: ${(props) => (props.status === 'Public' ? '#4caf50' : '#ff9800')};
  border: 1px solid
    ${(props) =>
      props.status === 'Public'
        ? 'rgba(76, 175, 80, 0.3)'
        : 'rgba(255, 152, 0, 0.3)'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const IconButton = styled.button`
  padding: 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: ${(props) => props.color || 'var(--secondary-color)'};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: ${(props) => props.color || 'rgba(255, 255, 255, 0.3)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ViewLink = styled(Link)`
  padding: 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: var(--secondary-color);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
`;

const ErrorMessage = styled.div`
  padding: 20px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  color: #f44336;
  font-family: var(--primary-fonts);
  margin-bottom: 20px;
`;

const SuccessMessage = styled.div`
  padding: 20px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  color: #4caf50;
  font-family: var(--primary-fonts);
  margin-bottom: 20px;
`;

const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ConfirmBox = styled.div`
  background: var(--bg-color);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
`;

const ConfirmTitle = styled.h3`
  font-family: var(--secondary-fonts);
  color: var(--primary-color);
  font-size: 20px;
  margin-bottom: 10px;
`;

const ConfirmText = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  margin-bottom: 20px;
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ConfirmButton = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-family: var(--primary-fonts);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) =>
    props.danger ? '#f44336' : 'rgba(255, 255, 255, 0.1)'};
  color: var(--primary-color);

  &:hover {
    background: ${(props) =>
      props.danger ? '#d32f2f' : 'rgba(255, 255, 255, 0.15)'};
  }
`;

const TransferModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const TransferBox = styled.div`
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
`;

const TransferTitle = styled.h3`
  font-family: var(--secondary-fonts);
  color: var(--primary-color);
  font-size: 20px;
  margin-bottom: 20px;
`;

const TransferSearchBar = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--primary-color);
  font-family: var(--primary-fonts);
  font-size: 14px;
  margin-bottom: 20px;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
  }

  &::placeholder {
    color: var(--secondary-color);
  }
`;

const UsersList = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const UserItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const UserItemName = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserDisplayName = styled.div`
  color: var(--primary-color);
  font-family: var(--secondary-fonts);
  font-weight: 500;
  font-size: 14px;
`;

const UserUsernameText = styled.div`
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
  font-size: 12px;
  opacity: 0.7;
`;

const TransferButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-family: var(--primary-fonts);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--primary-color);
  color: white;
  font-weight: 500;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CloseButton = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-family: var(--primary-fonts);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.1);
  color: var(--primary-color);
  width: 100%;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 20px;
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
`;

const PauseReasonDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const PauseReasonBox = styled.div`
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
`;

const PauseReasonTitle = styled.h3`
  font-family: var(--secondary-fonts);
  color: var(--primary-color);
  font-size: 20px;
  margin-bottom: 10px;
`;

const PauseReasonText = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  margin-bottom: 20px;
`;

const PauseReasonInput = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--primary-color);
  font-family: var(--primary-fonts);
  font-size: 14px;
  margin-bottom: 20px;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
  }

  &::placeholder {
    color: var(--secondary-color);
  }
`;

const PauseReasonButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const DashboardPosts = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [transferModal, setTransferModal] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [pauseReasonModal, setPauseReasonModal] = useState(null);
  const [pauseReason, setPauseReason] = useState('');

  // Redirect if not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to='/' replace />;
  }

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVideos(videos);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = videos.filter(
        (video) =>
          (video.caption && video.caption.toLowerCase().includes(query)) ||
          (video.userId?.username &&
            video.userId.username.toLowerCase().includes(query)) ||
          (video.userId?.displayName &&
            video.userId.displayName.toLowerCase().includes(query))
      );
      setFilteredVideos(filtered);
    }
  }, [searchQuery, videos]);

  useEffect(() => {
    if (userSearchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = userSearchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          (user.username && user.username.toLowerCase().includes(query)) ||
          (user.displayName && user.displayName.toLowerCase().includes(query))
      );
      setFilteredUsers(filtered);
    }
  }, [userSearchQuery, users]);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/videos`,
        {
          withCredentials: true,
        }
      );
      setVideos(response.data.videos || []);
      setFilteredVideos(response.data.videos || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err.response?.data?.message || 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePrivacy = async (videoId, reason = '') => {
    try {
      setActionLoading((prev) => ({ ...prev, [videoId]: 'toggle' }));
      setError(null);
      setSuccess(null);

      const response = await axios.put(
        `${
          import.meta.env.VITE_API_URL
        }/api/admin/videos/${videoId}/toggle-privacy`,
        { reason },
        {
          withCredentials: true,
        }
      );

      // Update the video in the local state
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId ? { ...v, privacy: response.data.video.privacy } : v
        )
      );
      setFilteredVideos((prev) =>
        prev.map((v) =>
          v._id === videoId ? { ...v, privacy: response.data.video.privacy } : v
        )
      );

      setSuccess(response.data.message);
      setTimeout(() => setSuccess(null), 3000);

      // Close the pause reason modal if open
      setPauseReasonModal(null);
      setPauseReason('');
    } catch (err) {
      console.error('Error toggling video privacy:', err);
      setError(err.response?.data?.message || 'Failed to update video status');
    } finally {
      setActionLoading((prev) => ({ ...prev, [videoId]: null }));
    }
  };

  const handleOpenPauseDialog = (video) => {
    // If video is currently public (about to be paused), show reason dialog
    if (video.privacy === 'Public') {
      setPauseReasonModal(video);
      setPauseReason('');
    } else {
      // If already paused, just unpause without reason
      handleTogglePrivacy(video._id);
    }
  };

  const handleConfirmPause = () => {
    if (pauseReasonModal) {
      handleTogglePrivacy(pauseReasonModal._id, pauseReason);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [videoId]: 'delete' }));
      setError(null);
      setSuccess(null);

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/videos/${videoId}`,
        {
          withCredentials: true,
        }
      );

      // Remove the video from local state
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      setFilteredVideos((prev) => prev.filter((v) => v._id !== videoId));

      setSuccess('Video deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting video:', err);
      setError(err.response?.data?.message || 'Failed to delete video');
      setConfirmDelete(null);
    } finally {
      setActionLoading((prev) => ({ ...prev, [videoId]: null }));
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/users`,
        {
          withCredentials: true,
        }
      );
      setUsers(response.data.users || []);
      setFilteredUsers(response.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenTransferModal = (video) => {
    setTransferModal(video);
    setUserSearchQuery('');
    fetchUsers();
  };

  const handleTransferVideo = async (targetUserId) => {
    if (!transferModal) return;

    try {
      setActionLoading((prev) => ({
        ...prev,
        [transferModal._id]: 'transfer',
      }));
      setError(null);
      setSuccess(null);

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/videos/${
          transferModal._id
        }/transfer`,
        { targetUserId },
        {
          withCredentials: true,
        }
      );

      // Update the video in local state with new user info
      setVideos((prev) =>
        prev.map((v) =>
          v._id === transferModal._id
            ? { ...v, userId: response.data.video.userId }
            : v
        )
      );
      setFilteredVideos((prev) =>
        prev.map((v) =>
          v._id === transferModal._id
            ? { ...v, userId: response.data.video.userId }
            : v
        )
      );

      setSuccess(response.data.message || 'Video transferred successfully');
      setTimeout(() => setSuccess(null), 3000);
      setTransferModal(null);
    } catch (err) {
      console.error('Error transferring video:', err);
      setError(err.response?.data?.message || 'Failed to transfer video');
    } finally {
      setActionLoading((prev) => ({ ...prev, [transferModal._id]: null }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Container>
        <Spinner />
      </Container>
    );
  }

  return (
    <Container>
      <Title>Posts Management</Title>
      <Subtitle>View and manage all posts (videos & images)</Subtitle>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <SearchBar
        type='text'
        placeholder='Search by caption or username...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {filteredVideos.length === 0 ? (
        <EmptyState>
          {searchQuery
            ? 'No posts found matching your search'
            : 'No posts found'}
        </EmptyState>
      ) : (
        <TableWrapper>
          <Table>
            <Thead>
              <Tr>
                <Th>User</Th>
                <Th>Caption</Th>
                <Th>Uploaded</Th>
                <Th>Status</Th>
                <Th>Likes</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredVideos.map((video) => (
                <Tr key={video._id}>
                  <Td>
                    <UserInfo>
                      {video.userId?.displayImage ? (
                        <Avatar
                          src={video.userId.displayImage}
                          alt={video.userId.username}
                        />
                      ) : (
                        <DefaultAvatar>
                          {(
                            video.userId?.displayName ||
                            video.userId?.username ||
                            'U'
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </DefaultAvatar>
                      )}
                      <Username>
                        {video.userId?.displayName ||
                          video.userId?.username ||
                          'Unknown'}
                      </Username>
                    </UserInfo>
                  </Td>
                  <Td>
                    <Caption title={video.caption}>
                      {video.caption || 'No caption'}
                    </Caption>
                  </Td>
                  <Td>{formatDate(video.createdAt)}</Td>
                  <Td>
                    <StatusBadge status={video.privacy}>
                      {video.privacy === 'Public' ? 'Active' : 'Paused'}
                    </StatusBadge>
                  </Td>
                  <Td>{video.likes?.length || 0}</Td>
                  <Td>
                    <ActionButtons>
                      <ViewLink to={`/video/${video._id}`} title='View post'>
                        <FaEye />
                      </ViewLink>
                      <IconButton
                        onClick={() => handleOpenPauseDialog(video)}
                        disabled={actionLoading[video._id] === 'toggle'}
                        color={
                          video.privacy === 'Public' ? '#ff9800' : '#4caf50'
                        }
                        title={
                          video.privacy === 'Public'
                            ? 'Pause (hide from public)'
                            : 'Unpause (show in public)'
                        }
                      >
                        {video.privacy === 'Public' ? <FaPause /> : <FaPlay />}
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenTransferModal(video)}
                        disabled={actionLoading[video._id] === 'transfer'}
                        color='#2196f3'
                        title='Transfer to another user'
                      >
                        <FaExchangeAlt />
                      </IconButton>
                      <IconButton
                        onClick={() => setConfirmDelete(video)}
                        disabled={actionLoading[video._id] === 'delete'}
                        color='#f44336'
                        title='Delete post'
                      >
                        <FaTrash />
                      </IconButton>
                    </ActionButtons>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableWrapper>
      )}

      {confirmDelete && (
        <ConfirmDialog onClick={() => setConfirmDelete(null)}>
          <ConfirmBox onClick={(e) => e.stopPropagation()}>
            <ConfirmTitle>Delete Post</ConfirmTitle>
            <ConfirmText>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </ConfirmText>
            <ConfirmButtons>
              <ConfirmButton onClick={() => setConfirmDelete(null)}>
                Cancel
              </ConfirmButton>
              <ConfirmButton
                danger
                onClick={() => handleDeleteVideo(confirmDelete._id)}
              >
                Delete
              </ConfirmButton>
            </ConfirmButtons>
          </ConfirmBox>
        </ConfirmDialog>
      )}

      {transferModal && (
        <TransferModal onClick={() => setTransferModal(null)}>
          <TransferBox onClick={(e) => e.stopPropagation()}>
            <TransferTitle>Transfer Post to User</TransferTitle>
            <TransferSearchBar
              type='text'
              placeholder='Search users by name or username...'
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
            />
            <UsersList>
              {loadingUsers ? (
                <LoadingText>Loading users...</LoadingText>
              ) : filteredUsers.length === 0 ? (
                <LoadingText>
                  {userSearchQuery
                    ? 'No users found matching your search'
                    : 'No users available'}
                </LoadingText>
              ) : (
                filteredUsers.map((user) => (
                  <UserItem key={user._id}>
                    <UserItemInfo>
                      {user.displayImage ? (
                        <Avatar src={user.displayImage} alt={user.username} />
                      ) : (
                        <DefaultAvatar>
                          {(user.displayName || user.username || 'U')
                            .charAt(0)
                            .toUpperCase()}
                        </DefaultAvatar>
                      )}
                      <UserItemName>
                        <UserDisplayName>
                          {user.displayName || user.username}
                        </UserDisplayName>
                        <UserUsernameText>@{user.username}</UserUsernameText>
                      </UserItemName>
                    </UserItemInfo>
                    <TransferButton
                      onClick={() => handleTransferVideo(user._id)}
                      disabled={
                        actionLoading[transferModal._id] === 'transfer' ||
                        user._id === transferModal.userId?._id
                      }
                    >
                      {user._id === transferModal.userId?._id
                        ? 'Current Owner'
                        : 'Transfer'}
                    </TransferButton>
                  </UserItem>
                ))
              )}
            </UsersList>
            <CloseButton onClick={() => setTransferModal(null)}>
              Close
            </CloseButton>
          </TransferBox>
        </TransferModal>
      )}

      {pauseReasonModal && (
        <PauseReasonDialog
          onClick={() => {
            setPauseReasonModal(null);
            setPauseReason('');
          }}
        >
          <PauseReasonBox onClick={(e) => e.stopPropagation()}>
            <PauseReasonTitle>Pause Content</PauseReasonTitle>
            <PauseReasonText>
              You are about to pause this{' '}
              {pauseReasonModal.type === 'image' ? 'post' : 'video'}. The user
              will receive a notification. Optionally, you can provide a reason
              for pausing this content.
            </PauseReasonText>
            <PauseReasonInput
              placeholder='Enter reason (optional)...'
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
            />
            <PauseReasonButtons>
              <ConfirmButton
                onClick={() => {
                  setPauseReasonModal(null);
                  setPauseReason('');
                }}
              >
                Cancel
              </ConfirmButton>
              <ConfirmButton
                danger
                onClick={handleConfirmPause}
                disabled={actionLoading[pauseReasonModal._id] === 'toggle'}
              >
                {actionLoading[pauseReasonModal._id] === 'toggle'
                  ? 'Pausing...'
                  : 'Pause Content'}
              </ConfirmButton>
            </PauseReasonButtons>
          </PauseReasonBox>
        </PauseReasonDialog>
      )}
    </Container>
  );
};

export default DashboardPosts;
