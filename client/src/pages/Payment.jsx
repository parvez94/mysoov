import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MdCheck, MdArrowBack } from 'react-icons/md';
import { useSelector } from 'react-redux';
import axios from 'axios';

const Container = styled.div`
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 24px;
  padding: 8px 0;

  &:hover {
    color: #fff;
  }
`;

const Title = styled.h1`
  font-family: var(--primary-fonts);
  color: #fff;
  font-size: 32px;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 16px;
  margin-bottom: 40px;
`;

const PlanCard = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 2px solid var(--primary-color);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
`;

const PlanHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const PlanName = styled.h2`
  font-family: var(--primary-fonts);
  color: #fff;
  font-size: 28px;
`;

const PlanPrice = styled.div`
  font-family: var(--primary-fonts);
  color: var(--primary-color);
  font-size: 36px;
  font-weight: 700;

  span {
    font-size: 16px;
    color: var(--secondary-color);
    font-weight: 400;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 30px 0;
`;

const Feature = styled.li`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 15px;
  padding: 10px 0;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: var(--primary-color);
    flex-shrink: 0;
  }
`;

const PaymentSection = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 30px;
`;

const SectionTitle = styled.h3`
  font-family: var(--primary-fonts);
  color: #fff;
  font-size: 20px;
  margin-bottom: 20px;
`;

const ComingSoonBadge = styled.div`
  background: rgba(255, 193, 7, 0.15);
  border: 1px solid rgba(255, 193, 7, 0.3);
  color: #ffc107;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
  font-family: var(--secondary-fonts);
  font-size: 16px;
  margin-bottom: 20px;
`;

const InfoText = styled.p`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  flex: 1;
  padding: 14px 24px;
  border-radius: 8px;
  font-family: var(--secondary-fonts);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${(props) =>
    props.primary
      ? `
    background: var(--primary-color);
    color: #fff;
    &:hover {
      background: #cc0000;
    }
  `
      : `
    background: rgba(255, 255, 255, 0.1);
    color: var(--secondary-color);
    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  `}
`;

// Default pricing plans (fallback if admin hasn't configured)
const defaultPricingPlans = {
  basic: {
    name: 'Basic',
    price: 9.99,
    maxUploadSize: 50,
    description: 'Great for casual creators',
    features: [
      'Upload up to 50MB',
      'Verified badge',
      'HD quality',
      'Priority support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 19.99,
    maxUploadSize: 200,
    description: 'For professional content creators',
    features: [
      'Upload up to 200MB',
      'Verified badge',
      '4K quality',
      'Priority support',
      'Advanced analytics',
    ],
  },
  premium: {
    name: 'Premium',
    price: 29.99,
    maxUploadSize: 500,
    description: 'Ultimate plan for power users',
    features: [
      'Upload up to 500MB',
      'Verified badge',
      '4K quality',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
    ],
  },
};

// Load pricing config from localStorage
const loadPricingConfig = () => {
  try {
    const savedConfig = localStorage.getItem('pricingConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch (err) {
    // Silent fail
  }
  return {
    supportEmail: 'support@mysoov.com',
    comingSoonMessage: '🚀 Payment Integration Coming Soon!',
    comingSoonDescription:
      "We're currently setting up secure payment processing. In the meantime, please contact our support team to upgrade your account manually.",
    upgradeInstructions:
      "Include your username and desired plan in your message, and we'll upgrade your account within 24 hours.",
  };
};

// Load pricing plans from localStorage (set by admin) or use defaults
const loadPricingPlans = () => {
  try {
    const savedPlans = localStorage.getItem('pricingPlans');
    if (savedPlans) {
      const parsed = JSON.parse(savedPlans);
      // Only return paid plans (exclude free)
      const { free, ...paidPlans } = parsed;
      return paidPlans;
    }
  } catch (err) {
    // Silent fail
  }
  return defaultPricingPlans;
};

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get('plan') || 'basic';
  const type = searchParams.get('type'); // 'film' or undefined
  const filmId = searchParams.get('filmId');
  const directoryId = searchParams.get('directoryId');
  const filmName = searchParams.get('filmName');
  const filmPrice = parseFloat(searchParams.get('price')) || 9.99;

  // Use state to hold pricing data so it can be updated
  const [pricingPlans, setPricingPlans] = useState(defaultPricingPlans);
  const [pricingConfig, setPricingConfig] = useState({
    supportEmail: 'support@mysoov.com',
    comingSoonMessage: '🚀 Payment Integration Coming Soon!',
    comingSoonDescription:
      "We're currently setting up secure payment processing. In the meantime, please contact our support team to upgrade your account manually.",
    upgradeInstructions:
      "Include your username and desired plan in your message, and we'll upgrade your account within 24 hours.",
  });
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { currentUser } = useSelector((state) => state.user);

  // Load pricing data on mount and when localStorage changes
  useEffect(() => {
    setPricingPlans(loadPricingPlans());
    setPricingConfig(loadPricingConfig());
  }, []);

  // Listen for storage events and custom events to update when admin changes settings
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'pricingPlans' || e.key === 'pricingConfig') {
        setPricingPlans(loadPricingPlans());
        setPricingConfig(loadPricingConfig());
      }
    };

    const handlePricingUpdate = () => {
      setPricingPlans(loadPricingPlans());
      setPricingConfig(loadPricingConfig());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('pricingUpdated', handlePricingUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pricingUpdated', handlePricingUpdate);
    };
  }, []);

  const plan = pricingPlans[planId] || pricingPlans.basic;

  // Handle film purchase (simulate payment completion)
  const handlePurchaseFilm = async () => {
    if (!filmId || !directoryId) {
      setError('Invalid film information');
      return;
    }

    try {
      setPurchasing(true);
      setError(null);

      // In production, this would happen after payment is completed
      // For now, we'll simulate the purchase
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/films/purchase`,
        { filmId, directoryId },
        { withCredentials: true }
      );

      setSuccess(response.data.message || 'Film purchased successfully!');

      // Trigger download if downloadUrl is provided
      if (response.data.downloadUrl) {
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = filmName || 'film.mp4';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        navigate(`/${currentUser?.username || 'profile'}`);
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to purchase film. Please try again.'
      );
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>
        <MdArrowBack size={20} />
        Back
      </BackButton>

      <Title>
        {type === 'film'
          ? `Buy Complete Ownership: ${filmName || 'Film'}`
          : 'Complete Your Purchase'}
      </Title>
      <Subtitle>
        {type === 'film'
          ? `Purchase full ownership of this film for $${filmPrice.toFixed(
              2
            )} - Yours permanently!`
          : 'Upgrade your account and unlock premium features'}
      </Subtitle>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(255,0,0,0.1)',
            border: '1px solid rgba(255,0,0,0.3)',
            borderRadius: '8px',
            color: '#ff6b6b',
            marginBottom: '20px',
            fontFamily: 'var(--primary-fonts)',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(0,255,0,0.1)',
            border: '1px solid rgba(0,255,0,0.3)',
            borderRadius: '8px',
            color: '#51cf66',
            marginBottom: '20px',
            fontFamily: 'var(--primary-fonts)',
          }}
        >
          {success}
        </div>
      )}

      {type === 'film' ? (
        <PlanCard>
          <PlanHeader>
            <PlanName>{filmName || 'Film Purchase'}</PlanName>
            <PlanPrice>
              $9.99
              <span>/one-time</span>
            </PlanPrice>
          </PlanHeader>

          <FeatureList>
            <Feature>
              <MdCheck size={20} />
              Permanent ownership
            </Feature>
            <Feature>
              <MdCheck size={20} />
              Added to your profile
            </Feature>
            <Feature>
              <MdCheck size={20} />
              HD quality playback
            </Feature>
            <Feature>
              <MdCheck size={20} />
              Download anytime
            </Feature>
          </FeatureList>
        </PlanCard>
      ) : (
        <PlanCard>
          <PlanHeader>
            <PlanName>{plan.name} Plan</PlanName>
            <PlanPrice>
              ${plan.price}
              <span>/month</span>
            </PlanPrice>
          </PlanHeader>

          <FeatureList>
            {plan.features.map((feature, index) => (
              <Feature key={index}>
                <MdCheck size={20} />
                {feature}
              </Feature>
            ))}
          </FeatureList>
        </PlanCard>
      )}

      <PaymentSection>
        <SectionTitle>Payment Method</SectionTitle>

        {type === 'film' ? (
          <>
            <ComingSoonBadge>🎬 Film Purchase Available!</ComingSoonBadge>
            <InfoText>
              Click the button below to complete your purchase and add this film
              to your profile.
            </InfoText>
            <InfoText style={{ fontSize: '12px', opacity: 0.7 }}>
              Note: This is a demo. In production, payment processing would be
              integrated here.
            </InfoText>
            <ButtonGroup>
              <Button onClick={() => navigate(-1)}>Cancel</Button>
              <Button
                primary
                onClick={handlePurchaseFilm}
                disabled={purchasing}
              >
                {purchasing
                  ? 'Processing...'
                  : `Buy Complete Ownership - $${filmPrice.toFixed(2)}`}
              </Button>
            </ButtonGroup>
          </>
        ) : (
          <>
            <ComingSoonBadge>{pricingConfig.comingSoonMessage}</ComingSoonBadge>
            <InfoText>{pricingConfig.comingSoonDescription}</InfoText>
            <InfoText>
              <strong>Email:</strong> {pricingConfig.supportEmail}
            </InfoText>
            <InfoText>{pricingConfig.upgradeInstructions}</InfoText>
            <ButtonGroup>
              <Button onClick={() => navigate(-1)}>Go Back</Button>
              <Button
                primary
                onClick={() => {
                  window.location.href = `mailto:${pricingConfig.supportEmail}?subject=Upgrade Request`;
                }}
              >
                Contact Support
              </Button>
            </ButtonGroup>
          </>
        )}
      </PaymentSection>
    </Container>
  );
};

export default Payment;
