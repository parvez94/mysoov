import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { MdPersonAdd, MdDelete, MdClose, MdSave } from 'react-icons/md';
import ThreeDotsLoader from '../../components/loading/ThreeDotsLoader';

const ButtonLoader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  & > div > div {
    background-color: white !important;
  }
`;

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
  min-height: 42px;
  margin-top: 20px;

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

const BrandingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const BrandingCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
`;

const BrandingTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 16px;
  font-family: var(--primary-fonts);
`;

const ImagePreview = styled.div`
  width: 100%;
  min-height: 120px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  overflow: hidden;
  position: relative;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 120px;
  object-fit: contain;
`;

const PreviewText = styled.p`
  color: #999;
  font-size: 14px;
  text-align: center;
  font-family: var(--secondary-fonts);
`;

const FileInputLabel = styled.label`
  display: inline-block;
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  font-family: var(--secondary-fonts);
  margin-bottom: 12px;

  &:hover {
    background: #5568d3;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const RemoveImageButton = styled.button`
  padding: 8px 16px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  font-family: var(--secondary-fonts);
  margin-top: 8px;

  &:hover {
    background: #d32f2f;
  }
`;

const UploadingText = styled.p`
  color: #667eea;
  font-size: 14px;
  margin-top: 8px;
  font-family: var(--secondary-fonts);
`;

const StorageProviderBox = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
  max-width: 600px;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid
    ${(props) => (props.$selected ? '#667eea' : 'rgba(255, 255, 255, 0.1)')};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${(props) =>
      props.$selected ? '#667eea' : 'rgba(255, 255, 255, 0.2)'};
    background: rgba(255, 255, 255, 0.05);
  }

  ${(props) =>
    props.$disabled &&
    `
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      border-color: rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.03);
    }
  `}
`;

const RadioInput = styled.input`
  margin-top: 4px;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
`;

const RadioContent = styled.div`
  flex: 1;
`;

const RadioTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 4px;
  font-family: var(--primary-fonts);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RadioDescription = styled.p`
  font-size: 14px;
  color: #999;
  line-height: 1.5;
  font-family: var(--secondary-fonts);
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) =>
    props.$configured ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)'};
  color: ${(props) => (props.$configured ? '#4caf50' : '#ff9800')};
`;

const SetupInstructions = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 8px;
`;

const InstructionsTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #ff9800;
  margin-bottom: 12px;
  font-family: var(--primary-fonts);
`;

const InstructionsList = styled.ol`
  margin: 0;
  padding-left: 20px;
  color: #999;
  font-size: 14px;
  line-height: 1.8;
  font-family: var(--secondary-fonts);

  li {
    margin-bottom: 8px;
  }

  code {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #667eea;
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

  const [freeStorageLimit, setFreeStorageLimit] = useState(100);

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
      totalStorageLimit: 1024,
      additionalStorageLimit: 1024,
      description: 'Great for casual creators',
      features: [
        '1GB additional storage',
        'HD video quality',
        'Priority support',
        'No ads',
      ],
    },
    pro: {
      name: 'Pro',
      price: 19.99,
      totalStorageLimit: 5120,
      additionalStorageLimit: 5120,
      description: 'For professional content creators',
      features: [
        '5GB additional storage',
        '4K video quality',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
      ],
    },
    premium: {
      name: 'Premium',
      price: 29.99,
      totalStorageLimit: 10240,
      additionalStorageLimit: 10240,
      description: 'Ultimate plan for power users',
      features: [
        '10GB additional storage',
        '4K video quality',
        'Advanced analytics',
        'Dedicated support',
        'Custom branding',
        'API access',
      ],
    },
  });
  const [savingPricing, setSavingPricing] = useState(false);
  const [savingFreeUpload, setSavingFreeUpload] = useState(false);

  // Branding state
  const [branding, setBranding] = useState({
    logo: null,
    favicon: null,
    siteName: 'Mysoov.TV',
    siteTitle: 'Mysoov.TV - Social Media Platform',
    metaDescription:
      'Connect, share, and discover amazing content on Mysoov.TV',
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);

  // Storage Settings state
  const [storageSettings, setStorageSettings] = useState({
    storageProvider: 'local',
    youtubeConfigured: false,
    localStorageEnabled: true,
    localStorageUsed: 0,
    localStorageMax: 75,
  });
  const [savingStorage, setSavingStorage] = useState(false);

  // Stripe Settings state
  const [stripeSettings, setStripeSettings] = useState({
    enabled: false,
    mode: 'test',
    testPublishableKey: '',
    testSecretKey: '',
    livePublishableKey: '',
    liveSecretKey: '',
    webhookSecret: '',
    currency: 'usd',
    hasTestSecretKey: false,
    hasLiveSecretKey: false,
  });
  const [savingStripe, setSavingStripe] = useState(false);
  const [showTestSecretKey, setShowTestSecretKey] = useState(false);
  const [showLiveSecretKey, setShowLiveSecretKey] = useState(false);

  // Redirect if not admin (role 'admin' = admin)
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to='/' />;
  }

  useEffect(() => {
    fetchAdmins();
    fetchPricingPlans();
    fetchBranding();
    fetchStorageSettings();
    fetchStripeSettings();
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
        if (free?.totalStorageLimit) {
          setFreeStorageLimit(free.totalStorageLimit);
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
      // If fetch fails, try to load from localStorage
      const savedPlans = localStorage.getItem('pricingPlans');
      if (savedPlans) {
        try {
          const parsed = JSON.parse(savedPlans);
          const { free, ...paidPlans } = parsed;
          setPricingPlans(paidPlans);
          if (free?.totalStorageLimit) {
            setFreeStorageLimit(free.totalStorageLimit);
          }
        } catch (parseErr) {}
      }
      const savedConfig = localStorage.getItem('pricingConfig');
      if (savedConfig) {
        try {
          setPricingConfig(JSON.parse(savedConfig));
        } catch (parseErr) {}
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

  // Branding functions
  const fetchBranding = () => {
    try {
      const savedBranding = localStorage.getItem('siteBranding');
      if (savedBranding) {
        const parsed = JSON.parse(savedBranding);
        setBranding(parsed);
      }
    } catch (err) {}
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file for logo');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/upload`,
        formData,
        {
          withCredentials: true,
        }
      );

      setBranding((prev) => ({
        ...prev,
        logo: response.data.url,
      }));

      setSuccess('Logo uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload logo');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file for favicon');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setUploadingFavicon(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/upload`,
        formData,
        {
          withCredentials: true,
        }
      );

      setBranding((prev) => ({
        ...prev,
        favicon: response.data.url,
      }));

      setSuccess('Favicon uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload favicon');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleRemoveLogo = () => {
    setBranding((prev) => ({
      ...prev,
      logo: null,
    }));
  };

  const handleRemoveFavicon = () => {
    setBranding((prev) => ({
      ...prev,
      favicon: null,
    }));
  };

  const handleSaveBranding = async () => {
    try {
      setSavingBranding(true);
      // Save to localStorage
      localStorage.setItem('siteBranding', JSON.stringify(branding));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('brandingUpdated'));
      // Update favicon dynamically
      if (branding.favicon) {
        const link =
          document.querySelector("link[rel*='icon']") ||
          document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = branding.favicon;
        document.getElementsByTagName('head')[0].appendChild(link);
      }

      // Update document title dynamically
      if (branding.siteTitle) {
        document.title = branding.siteTitle;
      }

      // Update meta description dynamically
      if (branding.metaDescription) {
        let metaDescription = document.querySelector(
          'meta[name="description"]'
        );
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.name = 'description';
          document.getElementsByTagName('head')[0].appendChild(metaDescription);
        }
        metaDescription.content = branding.metaDescription;
      }

      setSuccess('Branding saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save branding');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSavingBranding(false);
    }
  };

  // Storage Settings functions
  const fetchStorageSettings = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/admin/storage-settings`,
        {
          withCredentials: true,
        }
      );
      setStorageSettings({
        storageProvider: response.data.storageProvider || 'local',
        youtubeConfigured: response.data.youtubeConfigured || false,
        localStorageEnabled: response.data.localStorageConfig?.enabled || true,
        localStorageUsed:
          response.data.localStorageConfig?.diskSpace?.usedGB || 0,
        localStorageMax: response.data.localStorageConfig?.maxSizeGB || 75,
      });
    } catch (err) {}
  };

  const handleStorageProviderChange = (provider) => {
    // If YouTube is selected but not configured, show error
    if (provider === 'youtube' && !storageSettings.youtubeConfigured) {
      setError(
        'YouTube is not configured. Please set up YouTube API credentials first.'
      );
      setTimeout(() => setError(''), 5000);
      return;
    }
    setStorageSettings((prev) => ({
      ...prev,
      storageProvider: provider,
    }));
  };

  const handleSaveStorageSettings = async () => {
    try {
      setSavingStorage(true);

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/v1/admin/storage-settings`,
        {
          storageProvider: storageSettings.storageProvider,
        },
        {
          withCredentials: true,
        }
      );

      setSuccess('Storage settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save storage settings'
      );
      setTimeout(() => setError(''), 3000);
    } finally {
      setSavingStorage(false);
    }
  };

  // Stripe Settings functions
  const fetchStripeSettings = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/admin/stripe-settings`,
        { withCredentials: true }
      );
      setStripeSettings(response.data.stripeConfig);
    } catch (err) {
      console.error('Failed to fetch Stripe settings:', err);
    }
  };

  const handleSaveStripeSettings = async () => {
    try {
      setSavingStripe(true);

      const payload = {
        stripeConfig: {
          enabled: stripeSettings.enabled,
          mode: stripeSettings.mode,
          currency: stripeSettings.currency,
          testPublishableKey: stripeSettings.testPublishableKey,
          livePublishableKey: stripeSettings.livePublishableKey,
          webhookSecret: stripeSettings.webhookSecret,
        },
      };

      // Only include secret keys if they were entered (not empty)
      if (stripeSettings.testSecretKey) {
        payload.stripeConfig.testSecretKey = stripeSettings.testSecretKey;
      }
      if (stripeSettings.liveSecretKey) {
        payload.stripeConfig.liveSecretKey = stripeSettings.liveSecretKey;
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/v1/admin/stripe-settings`,
        payload,
        {
          withCredentials: true,
        }
      );

      setSuccess('Stripe settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);

      // Refresh to get updated hasSecretKey flags
      fetchStripeSettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save Stripe settings');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSavingStripe(false);
    }
  };

  const handlePricingChange = (planId, field, value) => {
    setPricingPlans((prev) => {
      const updated = {
        ...prev,
        [planId]: {
          ...prev[planId],
          [field]:
            field === 'price' || field === 'totalStorageLimit'
              ? parseFloat(value) || 0
              : field === 'name' || field === 'description'
              ? value
              : field === 'features'
              ? value
              : value,
        },
      };
      return updated;
    });
  };

  const handleSaveFreeStorage = async () => {
    try {
      setSavingFreeUpload(true);

      const storageLimit = parseFloat(freeStorageLimit);
      if (isNaN(storageLimit) || storageLimit < 1) {
        setError('Please enter a valid storage limit (minimum 1 MB)');
        setTimeout(() => setError(''), 3000);
        setSavingFreeUpload(false);
        return;
      }

      const savedPlans = localStorage.getItem('pricingPlans');
      let existingPlans = pricingPlans;

      if (savedPlans) {
        try {
          const parsed = JSON.parse(savedPlans);
          const { free, ...paidPlans } = parsed;
          existingPlans = paidPlans;
        } catch (err) {}
      }

      const allPlans = {
        free: {
          name: 'Free',
          price: 0,
          totalStorageLimit: storageLimit,
          additionalStorageLimit: 0,
          description: 'Perfect for getting started',
          features: [
            `${storageLimit}MB storage`,
            'Basic features',
            'Community support',
          ],
        },
        ...existingPlans,
      };

      // Save to server
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/pricing-plans`,
        { pricingPlans: allPlans, pricingConfig },
        {
          withCredentials: true,
        }
      );

      // Also save to localStorage for immediate client-side access
      localStorage.setItem('pricingPlans', JSON.stringify(allPlans));

      // Dispatch custom event to notify other components
      window.dispatchEvent(
        new CustomEvent('pricingUpdated', {
          detail: { pricingPlans: allPlans, pricingConfig },
        })
      );

      setFreeStorageLimit(storageLimit);

      setSuccess('Free storage limit updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save free storage limit'
      );
      setTimeout(() => setError(''), 3000);
    } finally {
      setSavingFreeUpload(false);
    }
  };

  const handleSavePricing = async () => {
    try {
      setSavingPricing(true);
      const allPlans = {
        free: {
          name: 'Free',
          price: 0,
          totalStorageLimit: freeStorageLimit,
          additionalStorageLimit: 0,
          description: 'Perfect for getting started',
          features: [
            `${freeStorageLimit}MB storage`,
            'Basic features',
            'Community support',
          ],
        },
        ...pricingPlans,
      };
      // Save to server
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/pricing-plans`,
        { pricingPlans: allPlans, pricingConfig },
        {
          withCredentials: true,
        }
      );
      // Also save to localStorage for immediate client-side access
      localStorage.setItem('pricingPlans', JSON.stringify(allPlans));
      localStorage.setItem('pricingConfig', JSON.stringify(pricingConfig));
      // Dispatch custom event to notify other components in the same tab
      window.dispatchEvent(
        new CustomEvent('pricingUpdated', {
          detail: { pricingPlans: allPlans, pricingConfig },
        })
      );
      setSuccess('Pricing plans updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
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

        if (free?.totalStorageLimit) {
          setFreeStorageLimit(free.totalStorageLimit);
        }

        const validatedPlans = Object.entries(paidPlans).reduce(
          (acc, [key, plan]) => {
            acc[key] = {
              name: plan.name || key.charAt(0).toUpperCase() + key.slice(1),
              price: plan.price || 0,
              totalStorageLimit: plan.totalStorageLimit || 100,
              description: plan.description || '',
              features: Array.isArray(plan.features) ? plan.features : [],
            };
            return acc;
          },
          {}
        );
        setPricingPlans(validatedPlans);
      } catch (err) {}
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
        <SectionTitle>Free Storage Configuration</SectionTitle>
        <p
          style={{
            color: '#999',
            marginBottom: '24px',
            fontFamily: 'var(--secondary-fonts)',
          }}
        >
          Set the total storage limit for users without a subscription plan.
        </p>

        <FreeUploadBox>
          <FormGroup>
            <Label>Free Storage Limit (MB)</Label>
            <Input
              type='number'
              min='1'
              value={freeStorageLimit}
              onChange={(e) => {
                const value = e.target.value;
                setFreeStorageLimit(value === '' ? '' : parseFloat(value) || 0);
              }}
              placeholder='Enter storage limit in MB'
            />
          </FormGroup>
          <p
            style={{
              color: '#999',
              fontSize: '13px',
              marginTop: '8px',
              marginBottom: '16px',
              fontFamily: 'var(--secondary-fonts)',
            }}
          >
            This applies to all users who don't have an active subscription.
          </p>
          <SaveButton
            onClick={handleSaveFreeStorage}
            disabled={savingFreeUpload}
          >
            {savingFreeUpload ? (
              <ButtonLoader>
                <ThreeDotsLoader />
              </ButtonLoader>
            ) : (
              <>
                <MdSave size={18} />
                Save Storage Limit
              </>
            )}
          </SaveButton>
        </FreeUploadBox>
      </Section>

      <Section>
        <SectionTitle>Site Branding</SectionTitle>
        <p
          style={{
            color: '#999',
            marginBottom: '24px',
            fontFamily: 'var(--secondary-fonts)',
          }}
        >
          Customize your site's logo, favicon, and name. Changes will be
          reflected across the entire application.
        </p>

        <BrandingGrid>
          <BrandingCard>
            <BrandingTitle>Logo</BrandingTitle>
            <ImagePreview>
              {branding.logo ? (
                <PreviewImage src={branding.logo} alt='Site logo' />
              ) : (
                <PreviewText>No logo uploaded</PreviewText>
              )}
            </ImagePreview>
            <FileInputLabel htmlFor='logo-upload'>
              {uploadingLogo ? 'Uploading...' : 'Choose Logo'}
            </FileInputLabel>
            <HiddenFileInput
              id='logo-upload'
              type='file'
              accept='image/*'
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
            />
            {uploadingLogo && <UploadingText>Uploading logo...</UploadingText>}
            {branding.logo && (
              <RemoveImageButton onClick={handleRemoveLogo}>
                Remove Logo
              </RemoveImageButton>
            )}
            <p
              style={{
                color: '#999',
                fontSize: '12px',
                marginTop: '12px',
                fontFamily: 'var(--secondary-fonts)',
              }}
            >
              Recommended: PNG or SVG format, transparent background
            </p>
          </BrandingCard>

          <BrandingCard>
            <BrandingTitle>Favicon</BrandingTitle>
            <ImagePreview>
              {branding.favicon ? (
                <PreviewImage src={branding.favicon} alt='Site favicon' />
              ) : (
                <PreviewText>No favicon uploaded</PreviewText>
              )}
            </ImagePreview>
            <FileInputLabel htmlFor='favicon-upload'>
              {uploadingFavicon ? 'Uploading...' : 'Choose Favicon'}
            </FileInputLabel>
            <HiddenFileInput
              id='favicon-upload'
              type='file'
              accept='image/*'
              onChange={handleFaviconUpload}
              disabled={uploadingFavicon}
            />
            {uploadingFavicon && (
              <UploadingText>Uploading favicon...</UploadingText>
            )}
            {branding.favicon && (
              <RemoveImageButton onClick={handleRemoveFavicon}>
                Remove Favicon
              </RemoveImageButton>
            )}
            <p
              style={{
                color: '#999',
                fontSize: '12px',
                marginTop: '12px',
                fontFamily: 'var(--secondary-fonts)',
              }}
            >
              Recommended: 32x32 or 64x64 pixels, ICO or PNG format
            </p>
          </BrandingCard>

          <BrandingCard>
            <BrandingTitle>Site Name</BrandingTitle>
            <FormGroup>
              <Label>Site Name</Label>
              <Input
                type='text'
                value={branding.siteName}
                onChange={(e) =>
                  setBranding((prev) => ({
                    ...prev,
                    siteName: e.target.value,
                  }))
                }
                placeholder='Enter site name'
              />
            </FormGroup>
            <p
              style={{
                color: '#999',
                fontSize: '12px',
                marginTop: '12px',
                fontFamily: 'var(--secondary-fonts)',
              }}
            >
              This will be displayed in the navigation bar
            </p>
          </BrandingCard>
        </BrandingGrid>

        {/* SEO Settings Section */}
        <div
          style={{
            marginTop: '32px',
            padding: '24px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--secondary-color)',
              marginBottom: '16px',
              fontFamily: 'var(--primary-fonts)',
            }}
          >
            SEO Settings
          </h3>
          <p
            style={{
              color: '#999',
              fontSize: '14px',
              marginBottom: '20px',
              fontFamily: 'var(--secondary-fonts)',
            }}
          >
            Configure your site's title and meta description for search engines
            and social media sharing.
          </p>

          <FormGroup>
            <Label>Site Title</Label>
            <Input
              type='text'
              value={branding.siteTitle}
              onChange={(e) =>
                setBranding((prev) => ({
                  ...prev,
                  siteTitle: e.target.value,
                }))
              }
              placeholder='Enter site title (e.g., Mysoov.TV - Social Media Platform)'
              maxLength={60}
            />
            <p
              style={{
                color: '#999',
                fontSize: '12px',
                marginTop: '8px',
                fontFamily: 'var(--secondary-fonts)',
              }}
            >
              Recommended: 50-60 characters. This appears in browser tabs and
              search results.
            </p>
          </FormGroup>

          <FormGroup style={{ marginTop: '20px' }}>
            <Label>Meta Description</Label>
            <Textarea
              value={branding.metaDescription}
              onChange={(e) =>
                setBranding((prev) => ({
                  ...prev,
                  metaDescription: e.target.value,
                }))
              }
              placeholder='Enter a brief description of your site for search engines'
              rows={4}
              maxLength={160}
            />
            <p
              style={{
                color: '#999',
                fontSize: '12px',
                marginTop: '8px',
                fontFamily: 'var(--secondary-fonts)',
              }}
            >
              Recommended: 150-160 characters. This appears in search engine
              results below your site title.
            </p>
          </FormGroup>
        </div>

        <SaveButton
          onClick={handleSaveBranding}
          disabled={savingBranding}
          style={{ marginTop: '20px' }}
        >
          {savingBranding ? (
            <ButtonLoader>
              <ThreeDotsLoader />
            </ButtonLoader>
          ) : (
            <>
              <MdSave size={18} />
              Save Branding Settings
            </>
          )}
        </SaveButton>
      </Section>

      <Section>
        <SectionTitle>Storage Provider</SectionTitle>
        <p
          style={{
            color: '#999',
            marginBottom: '24px',
            fontFamily: 'var(--secondary-fonts)',
          }}
        >
          Choose where to store uploaded videos and images.
        </p>

        <StorageProviderBox>
          <RadioGroup>
            <RadioOption
              $selected={storageSettings.storageProvider === 'local'}
              onClick={() => handleStorageProviderChange('local')}
            >
              <RadioInput
                type='radio'
                name='storageProvider'
                value='local'
                checked={storageSettings.storageProvider === 'local'}
                onChange={() => handleStorageProviderChange('local')}
              />
              <RadioContent>
                <RadioTitle>
                  Local VPS Storage
                  <StatusBadge $configured={true}>Default</StatusBadge>
                </RadioTitle>
                <RadioDescription>
                  Store files directly on your VPS server. Fast access, no
                  external costs, full control.
                  {storageSettings.localStorageEnabled && (
                    <div
                      style={{
                        marginTop: '8px',
                        fontSize: '13px',
                        color: '#4caf50',
                      }}
                    >
                      💾 {storageSettings.localStorageUsed.toFixed(2)} GB /{' '}
                      {storageSettings.localStorageMax} GB used
                    </div>
                  )}
                </RadioDescription>
              </RadioContent>
            </RadioOption>

            <RadioOption
              $selected={storageSettings.storageProvider === 'cloudinary'}
              onClick={() => handleStorageProviderChange('cloudinary')}
            >
              <RadioInput
                type='radio'
                name='storageProvider'
                value='cloudinary'
                checked={storageSettings.storageProvider === 'cloudinary'}
                onChange={() => handleStorageProviderChange('cloudinary')}
              />
              <RadioContent>
                <RadioTitle>
                  Cloudinary
                  <StatusBadge $configured={true}>Always Available</StatusBadge>
                </RadioTitle>
                <RadioDescription>
                  Store videos on Cloudinary. Reliable CDN delivery with
                  automatic optimization and transformations. Best for smaller
                  video libraries.
                </RadioDescription>
              </RadioContent>
            </RadioOption>

            <RadioOption
              $selected={storageSettings.storageProvider === 'youtube'}
              $disabled={!storageSettings.youtubeConfigured}
              onClick={() => handleStorageProviderChange('youtube')}
            >
              <RadioInput
                type='radio'
                name='storageProvider'
                value='youtube'
                checked={storageSettings.storageProvider === 'youtube'}
                onChange={() => handleStorageProviderChange('youtube')}
                disabled={!storageSettings.youtubeConfigured}
              />
              <RadioContent>
                <RadioTitle>
                  YouTube
                  <StatusBadge $configured={storageSettings.youtubeConfigured}>
                    {storageSettings.youtubeConfigured
                      ? 'Configured'
                      : 'Not Configured'}
                  </StatusBadge>
                </RadioTitle>
                <RadioDescription>
                  Store videos on YouTube as unlisted videos. Unlimited storage
                  with YouTube's infrastructure. Videos are embedded on your
                  site but hosted on YouTube. Ideal for large video libraries.
                </RadioDescription>
              </RadioContent>
            </RadioOption>
          </RadioGroup>

          {!storageSettings.youtubeConfigured && (
            <SetupInstructions>
              <InstructionsTitle>
                📝 YouTube Setup Instructions
              </InstructionsTitle>
              <InstructionsList>
                <li>
                  Create a Google Cloud Project and enable the YouTube Data API
                  v3
                </li>
                <li>
                  Create OAuth 2.0 credentials and add them to your{' '}
                  <code>.env</code> file:
                  <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                    <li>
                      <code>YOUTUBE_CLIENT_ID</code>
                    </li>
                    <li>
                      <code>YOUTUBE_CLIENT_SECRET</code>
                    </li>
                    <li>
                      <code>YOUTUBE_REDIRECT_URI</code>
                    </li>
                  </ul>
                </li>
                <li>
                  Run the setup script:{' '}
                  <code>node server/scripts/setupYouTube.js</code>
                </li>
                <li>
                  Follow the authorization flow and add the{' '}
                  <code>YOUTUBE_REFRESH_TOKEN</code> to your <code>.env</code>{' '}
                  file
                </li>
                <li>Restart your server to apply the changes</li>
              </InstructionsList>
            </SetupInstructions>
          )}

          <SaveButton
            onClick={handleSaveStorageSettings}
            disabled={savingStorage}
            style={{ marginTop: '20px' }}
          >
            {savingStorage ? (
              <ButtonLoader>
                <ThreeDotsLoader />
              </ButtonLoader>
            ) : (
              <>
                <MdSave size={18} />
                Save Storage Settings
              </>
            )}
          </SaveButton>
        </StorageProviderBox>
      </Section>

      {/* Stripe Settings Section */}
      <Section>
        <SectionTitle>💳 Stripe Payment Settings</SectionTitle>
        <p
          style={{
            color: '#999',
            marginBottom: '24px',
            fontFamily: 'var(--secondary-fonts)',
          }}
        >
          Configure Stripe to accept payments for films and premium content. Get
          your API keys from the{' '}
          <a
            href='https://dashboard.stripe.com/apikeys'
            target='_blank'
            rel='noopener noreferrer'
            style={{ color: '#667eea', textDecoration: 'underline' }}
          >
            Stripe Dashboard
          </a>
          .
        </p>

        <StorageProviderBox>
          {/* Enable/Disable Stripe */}
          <div
            style={{
              marginBottom: '24px',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h4
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--secondary-color)',
                  marginBottom: '4px',
                  fontFamily: 'var(--primary-fonts)',
                }}
              >
                Enable Stripe Payments
              </h4>
              <p
                style={{
                  fontSize: '13px',
                  color: '#999',
                  fontFamily: 'var(--secondary-fonts)',
                }}
              >
                Allow users to purchase films and premium content
              </p>
            </div>
            <label
              style={{
                position: 'relative',
                display: 'inline-block',
                width: '50px',
                height: '26px',
                cursor: 'pointer',
              }}
            >
              <input
                type='checkbox'
                checked={stripeSettings.enabled}
                onChange={(e) =>
                  setStripeSettings((prev) => ({
                    ...prev,
                    enabled: e.target.checked,
                  }))
                }
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: stripeSettings.enabled
                    ? '#4caf50'
                    : 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '26px',
                  transition: '0.3s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    content: '',
                    height: '18px',
                    width: '18px',
                    left: stripeSettings.enabled ? '28px' : '4px',
                    bottom: '4px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.3s',
                  }}
                />
              </span>
            </label>
          </div>

          {/* Payment Mode */}
          <FormGroup>
            <Label>Payment Mode</Label>
            <Input
              as='select'
              value={stripeSettings.mode}
              onChange={(e) =>
                setStripeSettings((prev) => ({
                  ...prev,
                  mode: e.target.value,
                }))
              }
            >
              <option value='test'>Test Mode</option>
              <option value='live'>Live Mode</option>
            </Input>
            <p
              style={{
                color: '#999',
                fontSize: '12px',
                marginTop: '8px',
                fontFamily: 'var(--secondary-fonts)',
              }}
            >
              {stripeSettings.mode === 'test'
                ? '⚠️ Test mode - Use test cards for testing payments'
                : '🔴 Live mode - Real payments will be processed'}
            </p>
          </FormGroup>

          {/* Currency */}
          <FormGroup>
            <Label>Currency</Label>
            <Input
              as='select'
              value={stripeSettings.currency}
              onChange={(e) =>
                setStripeSettings((prev) => ({
                  ...prev,
                  currency: e.target.value,
                }))
              }
            >
              <option value='usd'>USD - US Dollar</option>
              <option value='eur'>EUR - Euro</option>
              <option value='gbp'>GBP - British Pound</option>
              <option value='cad'>CAD - Canadian Dollar</option>
              <option value='aud'>AUD - Australian Dollar</option>
              <option value='inr'>INR - Indian Rupee</option>
              <option value='jpy'>JPY - Japanese Yen</option>
            </Input>
          </FormGroup>

          {/* Test Mode API Keys */}
          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '8px',
            }}
          >
            <h4
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--secondary-color)',
                marginBottom: '16px',
                fontFamily: 'var(--primary-fonts)',
              }}
            >
              🧪 Test Mode API Keys
            </h4>

            <FormGroup>
              <Label>Test Publishable Key</Label>
              <Input
                type='text'
                value={stripeSettings.testPublishableKey}
                onChange={(e) =>
                  setStripeSettings((prev) => ({
                    ...prev,
                    testPublishableKey: e.target.value,
                  }))
                }
                placeholder='pk_test_...'
              />
              <p
                style={{
                  color: '#999',
                  fontSize: '12px',
                  marginTop: '8px',
                  fontFamily: 'var(--secondary-fonts)',
                }}
              >
                This key is public and can be safely shared
              </p>
            </FormGroup>

            <FormGroup>
              <Label>Test Secret Key</Label>
              <div style={{ position: 'relative' }}>
                <Input
                  type={showTestSecretKey ? 'text' : 'password'}
                  value={stripeSettings.testSecretKey}
                  onChange={(e) =>
                    setStripeSettings((prev) => ({
                      ...prev,
                      testSecretKey: e.target.value,
                    }))
                  }
                  placeholder={
                    stripeSettings.hasTestSecretKey
                      ? '••••••••••••••••••••••••'
                      : 'sk_test_...'
                  }
                />
                <button
                  type='button'
                  onClick={() => setShowTestSecretKey(!showTestSecretKey)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontFamily: 'var(--secondary-fonts)',
                  }}
                >
                  {showTestSecretKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <p
                style={{
                  color: '#999',
                  fontSize: '12px',
                  marginTop: '8px',
                  fontFamily: 'var(--secondary-fonts)',
                }}
              >
                {stripeSettings.hasTestSecretKey
                  ? '✓ Secret key is set. Leave empty to keep current key.'
                  : '⚠️ Keep this key secure and never share it publicly'}
              </p>
            </FormGroup>
          </div>

          {/* Live Mode API Keys */}
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              background: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              borderRadius: '8px',
            }}
          >
            <h4
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--secondary-color)',
                marginBottom: '16px',
                fontFamily: 'var(--primary-fonts)',
              }}
            >
              🔴 Live Mode API Keys
            </h4>

            <FormGroup>
              <Label>Live Publishable Key</Label>
              <Input
                type='text'
                value={stripeSettings.livePublishableKey}
                onChange={(e) =>
                  setStripeSettings((prev) => ({
                    ...prev,
                    livePublishableKey: e.target.value,
                  }))
                }
                placeholder='pk_live_...'
              />
            </FormGroup>

            <FormGroup>
              <Label>Live Secret Key</Label>
              <div style={{ position: 'relative' }}>
                <Input
                  type={showLiveSecretKey ? 'text' : 'password'}
                  value={stripeSettings.liveSecretKey}
                  onChange={(e) =>
                    setStripeSettings((prev) => ({
                      ...prev,
                      liveSecretKey: e.target.value,
                    }))
                  }
                  placeholder={
                    stripeSettings.hasLiveSecretKey
                      ? '••••••••••••••••••••••••'
                      : 'sk_live_...'
                  }
                />
                <button
                  type='button'
                  onClick={() => setShowLiveSecretKey(!showLiveSecretKey)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontFamily: 'var(--secondary-fonts)',
                  }}
                >
                  {showLiveSecretKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <p
                style={{
                  color: '#999',
                  fontSize: '12px',
                  marginTop: '8px',
                  fontFamily: 'var(--secondary-fonts)',
                }}
              >
                {stripeSettings.hasLiveSecretKey
                  ? '✓ Secret key is set. Leave empty to keep current key.'
                  : '⚠️ CRITICAL: This processes real payments. Keep secure!'}
              </p>
            </FormGroup>
          </div>

          {/* Webhook Secret */}
          <FormGroup style={{ marginTop: '16px' }}>
            <Label>Webhook Signing Secret</Label>
            <Input
              type='password'
              value={stripeSettings.webhookSecret}
              onChange={(e) =>
                setStripeSettings((prev) => ({
                  ...prev,
                  webhookSecret: e.target.value,
                }))
              }
              placeholder='whsec_...'
            />
            <p
              style={{
                color: '#999',
                fontSize: '12px',
                marginTop: '8px',
                fontFamily: 'var(--secondary-fonts)',
              }}
            >
              Optional: Used to verify webhook events from Stripe. Get this from
              your Stripe webhook settings.
            </p>
          </FormGroup>

          {/* Setup Instructions */}
          <SetupInstructions style={{ marginTop: '16px' }}>
            <InstructionsTitle>📝 Setup Instructions</InstructionsTitle>
            <InstructionsList>
              <li>
                Create a Stripe account at{' '}
                <a
                  href='https://dashboard.stripe.com/register'
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{ color: '#667eea', textDecoration: 'underline' }}
                >
                  stripe.com
                </a>
              </li>
              <li>
                Get your API keys from the{' '}
                <a
                  href='https://dashboard.stripe.com/apikeys'
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{ color: '#667eea', textDecoration: 'underline' }}
                >
                  API Keys page
                </a>
              </li>
              <li>
                Start with <strong>Test Mode</strong> to test payments without
                real money
              </li>
              <li>
                Use test card <code>4242 4242 4242 4242</code> with any future
                expiry and CVC
              </li>
              <li>
                Set up webhooks (optional but recommended) from{' '}
                <a
                  href='https://dashboard.stripe.com/webhooks'
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{ color: '#667eea', textDecoration: 'underline' }}
                >
                  Stripe Webhooks
                </a>
              </li>
              <li>
                Switch to <strong>Live Mode</strong> when you're ready to accept
                real payments
              </li>
            </InstructionsList>
          </SetupInstructions>

          <SaveButton
            onClick={handleSaveStripeSettings}
            disabled={savingStripe}
            style={{ marginTop: '20px' }}
          >
            {savingStripe ? (
              <ButtonLoader>
                <ThreeDotsLoader />
              </ButtonLoader>
            ) : (
              <>
                <MdSave size={18} />
                Save Stripe Settings
              </>
            )}
          </SaveButton>
        </StorageProviderBox>
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
                <Label>Total Storage Limit (MB)</Label>
                <Input
                  type='number'
                  min='1'
                  value={plan.totalStorageLimit}
                  onChange={(e) =>
                    handlePricingChange(
                      planId,
                      'totalStorageLimit',
                      e.target.value
                    )
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
          {savingPricing ? (
            <ButtonLoader>
              <ThreeDotsLoader />
            </ButtonLoader>
          ) : (
            <>
              <MdSave size={18} />
              Save Pricing Configuration
            </>
          )}
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
