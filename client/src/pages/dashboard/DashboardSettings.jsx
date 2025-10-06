import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { MdPersonAdd, MdDelete, MdClose, MdSave } from 'react-icons/md';

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
  color: var(--secondary-color);
  margin-bottom: 10px;
  font-family: var(--primary-fonts);
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #999;
  font-family: var(--secondary-fonts);
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--primary-fonts);
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
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  font-family: var(--primary-fonts);
`;

const AdminDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AdminName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
`;

const AdminEmail = styled.div`
  font-size: 14px;
  color: #999;
  font-family: var(--secondary-fonts);
`;

const Badge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) => (props.$primary ? '#ffd700' : '#4caf50')};
  color: #000;
  font-family: var(--secondary-fonts);
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
  font-family: var(--secondary-fonts);

  &:hover {
    background: #d32f2f;
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--secondary-color);
  font-size: 14px;
  outline: none;
  font-family: var(--secondary-fonts);

  &:focus {
    border-color: #667eea;
  }

  &::placeholder {
    color: #999;
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
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  font-family: var(--secondary-fonts);

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
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
  font-family: var(--secondary-fonts);
`;

const SuccessMessage = styled.div`
  padding: 12px 16px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid #4caf50;
  border-radius: 8px;
  color: #4caf50;
  font-size: 14px;
  margin-bottom: 16px;
  font-family: var(--secondary-fonts);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
  font-family: var(--secondary-fonts);
`;

const Spinner = styled.div`
  border: 3px solid rgba(255, 255, 255, 0.1);
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
  background: rgba(255, 255, 255, 0.03);
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
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--secondary-color);
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
  font-family: var(--secondary-fonts);

  &:hover {
    background: #d32f2f;
  }
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--secondary-color);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  margin-top: 8px;
  font-family: var(--secondary-fonts);

  &:hover {
    opacity: 0.8;
  }
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const PlanCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
`;

const PlanName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 16px;
  font-family: var(--primary-fonts);
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
  font-family: var(--secondary-fonts);
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--secondary-color);
  font-size: 14px;
  outline: none;
  font-family: var(--secondary-fonts);

  &:focus {
    border-color: #667eea;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--secondary-color);
  font-size: 14px;
  font-family: var(--secondary-fonts);
  resize: vertical;
  outline: none;

  &:focus {
    border-color: #667eea;
  }

  &::placeholder {
    color: #999;
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 10px 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  font-family: var(--secondary-fonts);

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const FreeUploadBox = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
  max-width: 400px;
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

  // Free upload size state (for non-subscribed users)
  const [freeUploadSize, setFreeUploadSize] = useState(5);

  // Pricing config state
  const [pricingConfig, setPricingConfig] = useState({
    recommendedPlan: 'pro',
    footerText: 'All plans include a 7-day free trial. Cancel anytime.',
    paymentEnabled: false,
    supportEmail: 'support@mysoov.com',
    comingSoonMessage: '🚀 Payment Integration Coming Soon!',
    comingSoonDescription:
      "We're currently setting up secure payment processing. In the meantime, please contact our support team to upgrade your account manually.",
    upgradeInstructions:
      "Include your username and desired plan in your message, and we'll upgrade your account within 24 hours.",
  });

  // Pricing plans state (only paid plans)
  const [pricingPlans, setPricingPlans] = useState({
    basic: {
      name: 'Basic',
      price: 9.99,
      maxUploadSize: 50,
      description: 'Great for casual creators',
      features: [
        '50MB upload limit',
        'HD video quality',
        'Priority support',
        'No ads',
      ],
    },
    pro: {
      name: 'Pro',
      price: 19.99,
      maxUploadSize: 200,
      description: 'For professional content creators',
      features: [
        '200MB upload limit',
        '4K video quality',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
      ],
    },
    premium: {
      name: 'Premium',
      price: 29.99,
      maxUploadSize: 500,
      description: 'Ultimate plan for power users',
      features: [
        '500MB upload limit',
        '4K video quality',
        'Advanced analytics',
        'Dedicated support',
        'Custom branding',
        'API access',
      ],
    },
  });
  const [savingPricing, setSavingPricing] = useState(false);

  // Redirect if not admin (role 'admin' = admin)
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to='/' />;
  }

  useEffect(() => {
    fetchAdmins();
    fetchPricingPlans();
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
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/admins`,
        {
          withCredentials: true,
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

  const fetchPricingPlans = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/pricing-plans`,
        {
          withCredentials: true,
        }
      );
      if (response.data.pricingPlans) {
        const { free, ...paidPlans } = response.data.pricingPlans;
        setPricingPlans(paidPlans);
        if (free?.maxUploadSize) {
          setFreeUploadSize(free.maxUploadSize);
        }
        // Also save to localStorage for client-side access
        localStorage.setItem(
          'pricingPlans',
          JSON.stringify(response.data.pricingPlans)
        );
      }
      if (response.data.pricingConfig) {
        setPricingConfig(response.data.pricingConfig);
        localStorage.setItem(
          'pricingConfig',
          JSON.stringify(response.data.pricingConfig)
        );
      }
    } catch (err) {
      console.error('Failed to fetch pricing plans:', err);
      // If fetch fails, try to load from localStorage
      const savedPlans = localStorage.getItem('pricingPlans');
      if (savedPlans) {
        try {
          const parsed = JSON.parse(savedPlans);
          const { free, ...paidPlans } = parsed;
          setPricingPlans(paidPlans);
          if (free?.maxUploadSize) {
            setFreeUploadSize(free.maxUploadSize);
          }
        } catch (parseErr) {
          console.error('Failed to parse saved pricing plans:', parseErr);
        }
      }
      const savedConfig = localStorage.getItem('pricingConfig');
      if (savedConfig) {
        try {
          setPricingConfig(JSON.parse(savedConfig));
        } catch (parseErr) {
          console.error('Failed to parse saved pricing config:', parseErr);
        }
      }
    }
  };

  const searchUsers = async () => {
    try {
      setSearching(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/admin/users/search?q=${searchQuery}`,
        {
          withCredentials: true,
        }
      );
      // Filter out users who are already admins (role 'admin' = admin)
      const nonAdminUsers = response.data.users.filter(
        (user) => user.role !== 'admin'
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
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/promote`,
        {},
        {
          withCredentials: true,
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
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${
          adminToRemove._id
        }/demote`,
        {},
        {
          withCredentials: true,
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

  const handlePricingChange = (planId, field, value) => {
    console.log('DashboardSettings - handlePricingChange:', {
      planId,
      field,
      value,
      parsedValue:
        field === 'price' || field === 'maxUploadSize'
          ? parseFloat(value) || 0
          : value,
    });
    setPricingPlans((prev) => {
      const updated = {
        ...prev,
        [planId]: {
          ...prev[planId],
          [field]:
            field === 'price' || field === 'maxUploadSize'
              ? parseFloat(value) || 0
              : field === 'name' || field === 'description'
              ? value
              : field === 'features'
              ? value
              : value,
        },
      };
      console.log('DashboardSettings - Updated pricingPlans state:', updated);
      return updated;
    });
  };

  const handleSavePricing = async () => {
    try {
      setSavingPricing(true);

      console.log('DashboardSettings - handleSavePricing - Current state:', {
        pricingPlans,
        freeUploadSize,
        pricingConfig,
      });

      // Combine free upload size with paid plans
      const allPlans = {
        free: {
          name: 'Free',
          price: 0,
          maxUploadSize: freeUploadSize,
          description: 'Perfect for getting started',
          features: [
            `${freeUploadSize}MB upload limit`,
            'Basic features',
            'Community support',
          ],
        },
        ...pricingPlans,
      };

      console.log('DashboardSettings - About to save allPlans:', allPlans);

      // Save to server
      console.log(
        'DashboardSettings - Making API call to:',
        `${import.meta.env.VITE_API_URL}/api/admin/pricing-plans`
      );
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/pricing-plans`,
        { pricingPlans: allPlans, pricingConfig },
        {
          withCredentials: true,
        }
      );
      console.log('DashboardSettings - API response:', response.data);

      // Also save to localStorage for immediate client-side access
      localStorage.setItem('pricingPlans', JSON.stringify(allPlans));
      localStorage.setItem('pricingConfig', JSON.stringify(pricingConfig));
      console.log('DashboardSettings - Saved to localStorage:', {
        allPlans,
        pricingConfig,
      });
      console.log(
        'DashboardSettings - Verify localStorage:',
        JSON.parse(localStorage.getItem('pricingPlans'))
      );

      // Dispatch custom event to notify other components in the same tab
      window.dispatchEvent(
        new CustomEvent('pricingUpdated', {
          detail: { pricingPlans: allPlans, pricingConfig },
        })
      );
      console.log('DashboardSettings - Dispatched pricingUpdated event');

      setSuccess('Pricing plans updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('DashboardSettings - ERROR in handleSavePricing:', err);
      console.error('DashboardSettings - Error response:', err.response);
      console.error('DashboardSettings - Error message:', err.message);
      setError(err.response?.data?.message || 'Failed to save pricing plans');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSavingPricing(false);
    }
  };

  // Load pricing plans from localStorage on mount
  useEffect(() => {
    const savedPlans = localStorage.getItem('pricingPlans');
    if (savedPlans) {
      try {
        const parsed = JSON.parse(savedPlans);
        // Separate free plan from paid plans
        const { free, ...paidPlans } = parsed;

        if (free?.maxUploadSize) {
          setFreeUploadSize(free.maxUploadSize);
        }

        // Ensure all paid plans have required fields
        const validatedPlans = Object.entries(paidPlans).reduce(
          (acc, [key, plan]) => {
            acc[key] = {
              name: plan.name || key.charAt(0).toUpperCase() + key.slice(1),
              price: plan.price || 0,
              maxUploadSize: plan.maxUploadSize || 5,
              description: plan.description || '',
              features: Array.isArray(plan.features) ? plan.features : [],
            };
            return acc;
          },
          {}
        );
        setPricingPlans(validatedPlans);
      } catch (err) {
        console.error('Failed to load pricing plans:', err);
      }
    }
  }, []);

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

      <Section>
        <SectionTitle>Free Upload Size Configuration</SectionTitle>
        <p
          style={{
            color: '#999',
            marginBottom: '24px',
            fontFamily: 'var(--secondary-fonts)',
          }}
        >
          Set the maximum upload size for users without a subscription plan.
        </p>

        <FreeUploadBox>
          <FormGroup>
            <Label>Free Upload Size (MB)</Label>
            <Input
              type='number'
              min='1'
              value={freeUploadSize}
              onChange={(e) =>
                setFreeUploadSize(parseFloat(e.target.value) || 5)
              }
              placeholder='Enter size in MB'
            />
          </FormGroup>
          <p
            style={{
              color: '#999',
              fontSize: '13px',
              marginTop: '8px',
              fontFamily: 'var(--secondary-fonts)',
            }}
          >
            This applies to all users who don't have an active subscription.
          </p>
        </FreeUploadBox>
      </Section>

      <Section>
        <SectionTitle>Pricing Page Configuration</SectionTitle>
        <p
          style={{
            color: '#999',
            marginBottom: '24px',
            fontFamily: 'var(--secondary-fonts)',
          }}
        >
          Customize the pricing page content, footer text, and payment settings.
        </p>

        <PricingGrid>
          <PlanCard>
            <PlanName>General Settings</PlanName>

            <FormGroup>
              <Label>Recommended Plan</Label>
              <Input
                as='select'
                value={pricingConfig.recommendedPlan}
                onChange={(e) =>
                  setPricingConfig({
                    ...pricingConfig,
                    recommendedPlan: e.target.value,
                  })
                }
              >
                <option value='basic'>Basic</option>
                <option value='pro'>Pro</option>
                <option value='premium'>Premium</option>
              </Input>
            </FormGroup>

            <FormGroup>
              <Label>Footer Text</Label>
              <Input
                type='text'
                value={pricingConfig.footerText}
                onChange={(e) =>
                  setPricingConfig({
                    ...pricingConfig,
                    footerText: e.target.value,
                  })
                }
                placeholder='e.g., All plans include a 7-day free trial'
              />
            </FormGroup>

            <FormGroup>
              <Label>Support Email</Label>
              <Input
                type='email'
                value={pricingConfig.supportEmail}
                onChange={(e) =>
                  setPricingConfig({
                    ...pricingConfig,
                    supportEmail: e.target.value,
                  })
                }
                placeholder='support@example.com'
              />
            </FormGroup>
          </PlanCard>

          <PlanCard>
            <PlanName>Payment Page Content</PlanName>

            <FormGroup>
              <Label>Coming Soon Message</Label>
              <Input
                type='text'
                value={pricingConfig.comingSoonMessage}
                onChange={(e) =>
                  setPricingConfig({
                    ...pricingConfig,
                    comingSoonMessage: e.target.value,
                  })
                }
                placeholder='e.g., 🚀 Payment Integration Coming Soon!'
              />
            </FormGroup>

            <FormGroup>
              <Label>Coming Soon Description</Label>
              <Textarea
                value={pricingConfig.comingSoonDescription}
                onChange={(e) =>
                  setPricingConfig({
                    ...pricingConfig,
                    comingSoonDescription: e.target.value,
                  })
                }
                placeholder='Explain why payment is not available yet'
              />
            </FormGroup>

            <FormGroup>
              <Label>Upgrade Instructions</Label>
              <Textarea
                value={pricingConfig.upgradeInstructions}
                onChange={(e) =>
                  setPricingConfig({
                    ...pricingConfig,
                    upgradeInstructions: e.target.value,
                  })
                }
                placeholder='Instructions for manual upgrade'
              />
            </FormGroup>
          </PlanCard>
        </PricingGrid>
      </Section>

      <Section>
        <SectionTitle>Pricing Plans Configuration</SectionTitle>
        <p
          style={{
            color: '#999',
            marginBottom: '24px',
            fontFamily: 'var(--secondary-fonts)',
          }}
        >
          Configure upload limits, pricing, and features for each subscription
          tier. Changes will affect all users on these plans.
        </p>

        <PricingGrid>
          {Object.entries(pricingPlans).map(([planId, plan]) => (
            <PlanCard key={planId}>
              <PlanName>{plan.name}</PlanName>

              <FormGroup>
                <Label>Plan Name</Label>
                <Input
                  type='text'
                  value={plan.name}
                  onChange={(e) =>
                    handlePricingChange(planId, 'name', e.target.value)
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <Input
                  type='text'
                  value={plan.description}
                  onChange={(e) =>
                    handlePricingChange(planId, 'description', e.target.value)
                  }
                  placeholder='Short description of the plan'
                />
              </FormGroup>

              <FormGroup>
                <Label>Price ($/month)</Label>
                <Input
                  type='number'
                  step='0.01'
                  min='0'
                  value={plan.price}
                  onChange={(e) =>
                    handlePricingChange(planId, 'price', e.target.value)
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>Max Upload Size (MB)</Label>
                <Input
                  type='number'
                  min='1'
                  value={plan.maxUploadSize}
                  onChange={(e) =>
                    handlePricingChange(planId, 'maxUploadSize', e.target.value)
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>Features (one per line)</Label>
                <Textarea
                  value={plan.features?.join('\n') || ''}
                  onChange={(e) =>
                    handlePricingChange(
                      planId,
                      'features',
                      e.target.value.split('\n')
                    )
                  }
                  placeholder='Enter features, one per line'
                />
              </FormGroup>
            </PlanCard>
          ))}
        </PricingGrid>

        <SaveButton onClick={handleSavePricing} disabled={savingPricing}>
          <MdSave size={18} />
          {savingPricing ? 'Saving...' : 'Save Pricing Configuration'}
        </SaveButton>
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
