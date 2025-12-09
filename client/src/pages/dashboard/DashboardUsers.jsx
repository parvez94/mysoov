import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { Spinner, VerifiedBadge } from '../../components/index';

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

const Table = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr 200px 150px 150px 180px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-family: var(--secondary-fonts);
  font-weight: 600;
  color: var(--primary-color);
  font-size: 14px;

  @media (max-width: 1024px) {
    grid-template-columns: 60px 1fr 150px 180px;

    & > div:nth-child(4),
    & > div:nth-child(5) {
      display: none;
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 50px 1fr 120px;

    & > div:nth-child(3),
    & > div:nth-child(4),
    & > div:nth-child(5) {
      display: none;
    }
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr 200px 150px 150px 180px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  align-items: center;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 60px 1fr 150px 180px;

    & > div:nth-child(4),
    & > div:nth-child(5) {
      display: none;
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 50px 1fr 120px;

    & > div:nth-child(3),
    & > div:nth-child(4),
    & > div:nth-child(5) {
      display: none;
    }
  }
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
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.p`
  font-family: var(--secondary-fonts);
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const UserEmail = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 12px;
`;

const Badge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-family: var(--primary-fonts);
  font-size: 12px;
  font-weight: 500;
  background: ${(props) =>
    props.$type === 'admin'
      ? 'rgba(255, 193, 7, 0.2)'
      : 'rgba(76, 175, 80, 0.2)'};
  color: ${(props) => (props.$type === 'admin' ? '#ffc107' : '#4caf50')};
  display: inline-block;
`;

const Text = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 13px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &.delete {
    color: #f44336;
    border-color: rgba(244, 67, 54, 0.3);

    &:hover {
      background: rgba(244, 67, 54, 0.1);
      border-color: rgba(244, 67, 54, 0.5);
    }
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

const DashboardUsers = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to='/' replace />;
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          (user.displayName && user.displayName.toLowerCase().includes(query))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/users`,
        {
          withCredentials: true,
        }
      );      setUsers(response.data.users || []);
      setFilteredUsers(response.data.users || []);
    } catch (err) {      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
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

  const handleDeleteUser = async (userId, username) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user "${username}"? This action cannot be undone and will also delete all their content.`
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`,
        {
          withCredentials: true,
        }
      );
      alert('User deleted successfully');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
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
      <Title>User Management</Title>
      <Subtitle>View and manage all registered users</Subtitle>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <SearchBar
        type='text'
        placeholder='Search by username, email, or display name...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <Table>
        <TableHeader>
          <div></div>
          <div>User</div>
          <div>Role</div>
          <div>Videos</div>
          <div>Joined</div>
          <div>Actions</div>
        </TableHeader>

        {filteredUsers.length === 0 ? (
          <EmptyState>
            {searchQuery
              ? 'No users found matching your search'
              : 'No users found'}
          </EmptyState>
        ) : (
          filteredUsers.map((user) => (
            <TableRow key={user._id}>
              <div>
                {user.displayImage ? (
                  <Avatar src={user.displayImage} alt={user.username} />
                ) : (
                  <DefaultAvatar>
                    {(user.displayName || user.username)
                      .charAt(0)
                      .toUpperCase()}
                  </DefaultAvatar>
                )}
              </div>
              <UserInfo>
                <UserName>
                  {user.displayName || user.username}
                  <VerifiedBadge user={user} size={14} />
                </UserName>
                <UserEmail>@{user.username}</UserEmail>
              </UserInfo>
              <div>
                <Badge $type={user.role === 'admin' ? 'admin' : 'user'}>
                  {user.role === 'admin' ? 'Admin' : 'User'}
                </Badge>
              </div>
              <Text>{user.videos?.length || 0}</Text>
              <Text>{formatDate(user.createdAt)}</Text>
              <div style={{ display: 'flex', gap: '8px' }}>
                <ActionButton onClick={() => navigate(`/${user.username}`)}>
                  View
                </ActionButton>
                <ActionButton
                  className='delete'
                  onClick={() => handleDeleteUser(user._id, user.username)}
                >
                  Delete
                </ActionButton>
              </div>
            </TableRow>
          ))
        )}
      </Table>
    </Container>
  );
};

export default DashboardUsers;
