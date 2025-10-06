import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MdClose, MdCheck } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: #1a1a1a;
  border-radius: 16px;
  max-width: 1000px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 40px 30px;

  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h2`
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
  margin-bottom: 8px;
`;

const ErrorMessage = styled.p`
  font-family: var(--secondary-fonts);
  color: #ff6b6b;
  font-size: 14px;
  background: rgba(255, 107, 107, 0.1);
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PlanCard = styled.div`
  background: ${(props) =>
    props.$recommended
      ? 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 0, 0, 0.05))'
      : 'rgba(255, 255, 255, 0.04)'};
  border: 2px solid
    ${(props) =>
      props.$recommended ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  padding: 30px 24px;
  position: relative;
  transition: transform 0.2s, border-color 0.2s;

  &:hover {
    transform: translateY(-4px);
    border-color: ${(props) =>
      props.$recommended ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const RecommendedBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-color);
  color: #fff;
  padding: 4px 16px;
  border-radius: 20px;
  font-family: var(--secondary-fonts);
  font-size: 12px;
  font-weight: 600;
`;

const PlanName = styled.h3`
  font-family: var(--primary-fonts);
  color: #fff;
  font-size: 24px;
  margin-bottom: 12px;
`;

const PlanPrice = styled.div`
  margin-bottom: 20px;
`;

const Price = styled.span`
  font-family: var(--primary-fonts);
  color: #fff;
  font-size: 36px;
  font-weight: 700;
`;

const PriceUnit = styled.span`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 16px;
  margin-left: 4px;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
`;

const Feature = styled.li`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: var(--primary-color);
    flex-shrink: 0;
  }
`;

const SelectButton = styled.button`
  width: 100%;
  background: ${(props) =>
    props.$recommended ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)'};
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: var(--secondary-fonts);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;

  &:hover {
    background: ${(props) =>
      props.$recommended ? '#cc0000' : 'rgba(255, 255, 255, 0.15)'};
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Footer = styled.div`
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const FooterText = styled.p`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
`;

// Default pricing plans (fallback if admin hasn't configured)
const defaultPricingPlans = [
  {
    id: 'basic',
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
    recommended: false,
  },
  {
    id: 'pro',
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
    recommended: true,
  },
  {
    id: 'premium',
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
    recommended: false,
  },
];

// Fetch pricing plans from API
const fetchPricingPlans = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/public/pricing-plans`
    );

    if (response.data.success) {
      const { pricingPlans, pricingConfig } = response.data;

      // Convert object to array and exclude free plan
      const plansArray = Object.entries(pricingPlans)
        .filter(([key]) => key !== 'free')
        .map(([id, plan]) => ({
          id,
          name: plan.name,
          price: plan.price,
          maxUploadSize: plan.maxUploadSize,
          description: plan.description || '',
          features: plan.features || [],
          recommended: id === pricingConfig?.recommendedPlan,
        }));

      return {
        plans: plansArray.length > 0 ? plansArray : defaultPricingPlans,
        config: pricingConfig || {
          recommendedPlan: 'pro',
          footerText: 'All plans include a 7-day free trial. Cancel anytime.',
        },
      };
    }
  } catch (err) {
    console.error('Failed to fetch pricing plans from API:', err);
  }

  // Return defaults if API fails
  return {
    plans: defaultPricingPlans,
    config: {
      recommendedPlan: 'pro',
      footerText: 'All plans include a 7-day free trial. Cancel anytime.',
    },
  };
};

const PricingModal = ({ isOpen, onClose, errorInfo }) => {
  const navigate = useNavigate();

  // Use state to hold pricing data so it can be updated
  // Initialize with default plans to ensure modal always has content
  const [pricingPlans, setPricingPlans] = useState(defaultPricingPlans);
  const [pricingConfig, setPricingConfig] = useState({
    recommendedPlan: 'pro',
    footerText: 'All plans include a 7-day free trial. Cancel anytime.',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch pricing data from API when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadPricingData = async () => {
        setIsLoading(true);
        const { plans, config } = await fetchPricingPlans();
        setPricingPlans(plans);
        setPricingConfig(config);
        setIsLoading(false);
      };
      loadPricingData();
    }
  }, [isOpen]);

  // Listen for custom event when admin updates pricing (for real-time updates)
  useEffect(() => {
    const handlePricingUpdate = async () => {
      console.log(
        'PricingModal - Received pricingUpdated event, refetching...'
      );
      const { plans, config } = await fetchPricingPlans();
      setPricingPlans(plans);
      setPricingConfig(config);
    };

    window.addEventListener('pricingUpdated', handlePricingUpdate);

    return () => {
      window.removeEventListener('pricingUpdated', handlePricingUpdate);
    };
  }, []);

  if (!isOpen) return null;

  const handleSelectPlan = (planId) => {
    // Navigate to payment page with selected plan
    navigate(`/payment?plan=${planId}`);
    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <MdClose size={24} />
        </CloseButton>

        <Header>
          <Title>Upgrade Your Plan</Title>
          <Subtitle>
            {isLoading
              ? 'Loading pricing plans...'
              : 'Choose a plan that fits your needs and unlock more features'}
          </Subtitle>
          {errorInfo && (
            <ErrorMessage>
              Your file ({errorInfo.fileSize}MB) exceeds the {errorInfo.maxSize}
              MB limit for {errorInfo.currentPlan} users. Please upgrade to
              upload larger files.
            </ErrorMessage>
          )}
        </Header>

        <PlansGrid>
          {pricingPlans.map((plan) => (
            <PlanCard key={plan.id} $recommended={plan.recommended}>
              {plan.recommended && <RecommendedBadge>POPULAR</RecommendedBadge>}
              <PlanName>{plan.name}</PlanName>
              <PlanPrice>
                <Price>${plan.price}</Price>
                <PriceUnit>/month</PriceUnit>
              </PlanPrice>
              <FeatureList>
                {plan.features.map((feature, index) => (
                  <Feature key={index}>
                    <MdCheck size={20} />
                    {feature}
                  </Feature>
                ))}
              </FeatureList>
              <SelectButton
                $recommended={plan.recommended}
                onClick={() => handleSelectPlan(plan.id)}
              >
                Choose {plan.name}
              </SelectButton>
            </PlanCard>
          ))}
        </PlansGrid>

        <Footer>
          <FooterText>{pricingConfig.footerText}</FooterText>
        </Footer>
      </ModalContainer>
    </Overlay>
  );
};

export default PricingModal;
