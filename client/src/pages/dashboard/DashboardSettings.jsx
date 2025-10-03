import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { MdPersonAdd, MdDelete, MdClose } from 'react-icons/md';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
`;

const Section = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AdminList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AdminCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: ${({ theme }) => theme.bg};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.soft};
`;

const AdminInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
`;

const DefaultAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
`;

const AdminDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AdminName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const AdminEmail = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
`;

const Badge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) => (props.$primary ? '#ffd700' : '#4caf50')};
  color: #000;
`;

const RemoveButton = styled.button`
  padding: 8px 16px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #d32f2f;
  }

  &:disabled {
    background: ${({ theme }) => theme.soft};
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const AddAdminForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SearchInput = styled.input`
  padding: 12px 16px;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.soft};
  border-radius: 8px;
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #667eea;
  }

  &::placeholder {
    color: ${({ theme }) => theme.textSoft};
  }
`;

const UserSearchResults = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: ${({ theme }) => theme.bg};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.soft};
`;

const AddButton = styled.button`
  padding: 8px 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: ${({ theme }) => theme.soft};
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
  border-radius: 8px;
  color: #f44336;
  font-size: 14px;
  margin-bottom: 16px;
`;

const SuccessMessage = styled.div`
  padding: 12px 16px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid #4caf50;
  border-radius: 8px;
  color: #4caf50;
  font-size: 14px;
  margin-bottom: 16px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.textSoft};
  font-size: 14px;
`;

const Spinner = styled.div`
  border: 3px solid ${({ theme }) => theme.soft};
  border-top: 3px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 40px auto;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const Modal = styled.div`
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

const ModalContent = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  font-size: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }
`;

const ConfirmButton = styled.button`
  padding: 10px 20px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  margin-top: 16px;

  &:hover {
    background: #d32f2f;
  }
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: ${({ theme }) => theme.soft};
  color: ${({ theme }) => theme.text};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  margin-top: 8px;

  &:hover {
    opacity: 0.8;
  }
`;

const DashboardSettings = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState(null);

  // Redirect if not admin
  if (!currentUser || currentUser.role !== 1) {
    return <Navigate to='/' />;
  }

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/admins`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAdmins(response.data.admins);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    try {
      setSearching(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/admin/users/search?q=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Filter out users who are already admins
      const nonAdminUsers = response.data.users.filter(
        (user) => user.role !== 1
      );
      setSearchResults(nonAdminUsers);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddAdmin = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/promote`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('Admin added successfully!');
      setSearchQuery('');
      setSearchResults([]);
      fetchAdmins();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add admin');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!adminToRemove) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${
          adminToRemove._id
        }/demote`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('Admin removed successfully!');
      setShowRemoveModal(false);
      setAdminToRemove(null);
      fetchAdmins();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove admin');
      setShowRemoveModal(false);
      setAdminToRemove(null);
      setTimeout(() => setError(''), 3000);
    }
  };

  const openRemoveModal = (admin) => {
    setAdminToRemove(admin);
    setShowRemoveModal(true);
  };

  if (loading) {
    return (
      <Container>
        <Spinner />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Admin Settings</Title>
        <Subtitle>Manage admin users and permissions</Subtitle>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <Section>
        <SectionTitle>
          <MdPersonAdd size={24} />
          Add New Admin
        </SectionTitle>
        <AddAdminForm>
          <SearchInput
            type='text'
            placeholder='Search users by name or email...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searching && <Spinner style={{ width: '30px', height: '30px' }} />}
          {searchResults.length > 0 && (
            <UserSearchResults>
              {searchResults.map((user) => (
                <UserCard key={user._id}>
                  <AdminInfo>
                    {user.displayImage ? (
                      <Avatar src={user.displayImage} alt={user.username} />
                    ) : (
                      <DefaultAvatar>
                        {user.username.charAt(0).toUpperCase()}
                      </DefaultAvatar>
                    )}
                    <AdminDetails>
                      <AdminName>{user.displayName || user.username}</AdminName>
                      <AdminEmail>{user.email}</AdminEmail>
                    </AdminDetails>
                  </AdminInfo>
                  <AddButton onClick={() => handleAddAdmin(user._id)}>
                    <MdPersonAdd size={18} />
                    Make Admin
                  </AddButton>
                </UserCard>
              ))}
            </UserSearchResults>
          )}
          {searchQuery.trim().length > 0 &&
            !searching &&
            searchResults.length === 0 && (
              <EmptyState>No users found</EmptyState>
            )}
        </AddAdminForm>
      </Section>

      <Section>
        <SectionTitle>Current Admins ({admins.length})</SectionTitle>
        {admins.length === 0 ? (
          <EmptyState>No admins found</EmptyState>
        ) : (
          <AdminList>
            {admins.map((admin) => (
              <AdminCard key={admin._id}>
                <AdminInfo>
                  {admin.displayImage ? (
                    <Avatar src={admin.displayImage} alt={admin.username} />
                  ) : (
                    <DefaultAvatar>
                      {admin.username.charAt(0).toUpperCase()}
                    </DefaultAvatar>
                  )}
                  <AdminDetails>
                    <AdminName>
                      {admin.displayName || admin.username}
                      {admin._id === currentUser._id && (
                        <Badge $primary style={{ marginLeft: '8px' }}>
                          You
                        </Badge>
                      )}
                    </AdminName>
                    <AdminEmail>{admin.email}</AdminEmail>
                  </AdminDetails>
                </AdminInfo>
                <RemoveButton
                  onClick={() => openRemoveModal(admin)}
                  disabled={admin._id === currentUser._id}
                >
                  <MdDelete size={18} />
                  Remove
                </RemoveButton>
              </AdminCard>
            ))}
          </AdminList>
        )}
      </Section>

      {showRemoveModal && adminToRemove && (
        <Modal onClick={() => setShowRemoveModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Remove Admin</ModalTitle>
              <CloseButton onClick={() => setShowRemoveModal(false)}>
                <MdClose />
              </CloseButton>
            </ModalHeader>
            <p style={{ marginBottom: '16px', color: '#999' }}>
              Are you sure you want to remove admin privileges from{' '}
              <strong>
                {adminToRemove.displayName || adminToRemove.username}
              </strong>
              ? They will be demoted to a regular user.
            </p>
            <ConfirmButton onClick={handleRemoveAdmin}>
              Yes, Remove Admin
            </ConfirmButton>
            <CancelButton onClick={() => setShowRemoveModal(false)}>
              Cancel
            </CancelButton>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default DashboardSettings;
