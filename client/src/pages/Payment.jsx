import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MdCheck, MdArrowBack, MdLock, MdClose } from 'react-icons/md';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

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

// Success Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #1a1a1a;
  border: 2px solid var(--primary-color);
  border-radius: 16px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  position: relative;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: var(--secondary-color);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(81, 207, 102, 0.15);
  border: 3px solid #51cf66;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  animation: scaleIn 0.4s ease-out;

  @keyframes scaleIn {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }

  svg {
    color: #51cf66;
  }
`;

const ModalTitle = styled.h2`
  font-family: var(--primary-fonts);
  color: #fff;
  font-size: 28px;
  text-align: center;
  margin-bottom: 12px;
`;

const ModalMessage = styled.p`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 16px;
  text-align: center;
  margin-bottom: 32px;
  line-height: 1.6;
`;

const ModalButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-direction: column;

  @media (min-width: 480px) {
    flex-direction: row;
  }
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
    &:disabled {
      background: #666;
      cursor: not-allowed;
      opacity: 0.6;
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

const CardElementWrapper = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
`;

const SecurePaymentBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  color: #22c55e;
  font-family: var(--secondary-fonts);
  font-size: 14px;
  margin-bottom: 20px;

  svg {
    flex-shrink: 0;
  }
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

// Stripe Card Element styling
const CARD_ELEMENT_OPTIONS = {
  hidePostalCode: true, // No postal code needed for digital products
  style: {
    base: {
      color: '#fff',
      fontFamily: 'var(--secondary-fonts)',
      fontSize: '16px',
      '::placeholder': {
        color: '#aaa',
      },
      iconColor: '#fff',
    },
    invalid: {
      color: '#ff6b6b',
      iconColor: '#ff6b6b',
    },
  },
};

// Success Modal Component
const SuccessModal = ({
  filmName,
  onClose,
  onViewProfile,
  onViewFilm,
  downloadStatus,
}) => {
  const [canClose, setCanClose] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  const handleClose = () => {
    if (canClose) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {canClose && (
          <CloseButton onClick={onClose}>
            <MdClose size={24} />
          </CloseButton>
        )}

        <SuccessIcon>
          <MdCheck size={48} />
        </SuccessIcon>

        <ModalTitle>Payment Successful! 🎉</ModalTitle>
        <ModalMessage>
          Your purchase of <strong>{filmName}</strong> is complete!
          <br />
          The film has been added to your profile.
        </ModalMessage>

        {/* Download Status */}
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(81, 207, 102, 0.1)',
            border: '1px solid rgba(81, 207, 102, 0.3)',
            borderRadius: '8px',
            color: '#51cf66',
            marginBottom: '20px',
            fontFamily: 'var(--secondary-fonts)',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          {downloadStatus === 'downloading' && '📥 Downloading video...'}
          {downloadStatus === 'complete' && '✅ Download complete!'}
          {downloadStatus === 'error' &&
            '⚠️ Download started (check your browser downloads)'}
        </div>

        {!canClose && (
          <InfoText
            style={{ fontSize: '12px', opacity: 0.6, marginBottom: '20px' }}
          >
            Closing in {countdown} seconds...
          </InfoText>
        )}

        <ModalButtonGroup>
          <Button type='button' onClick={onViewProfile} disabled={!canClose}>
            View My Profile
          </Button>
          <Button
            type='button'
            primary
            onClick={onViewFilm}
            disabled={!canClose}
          >
            Watch Film Now
          </Button>
        </ModalButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

// Stripe Checkout Form Component
const CheckoutForm = ({
  filmId,
  directoryId,
  filmName,
  filmPrice,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchasedFilmUrl, setPurchasedFilmUrl] = useState('');
  const [downloadStatus, setDownloadStatus] = useState('downloading');
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      setProcessing(true);
      onError(null);

      // Step 1: Create payment intent
      const { data: paymentData } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/payment/create-payment-intent`,
        {
          filmId,
          directoryId,
          amount: filmPrice,
          filmName,
        },
        { withCredentials: true }
      );

      // Step 2: Confirm card payment
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        paymentData.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Step 3: Complete purchase (add to profile and get download link)
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/films/purchase`,
          { filmId, directoryId },
          { withCredentials: true }
        );

        // Store the video URL for "Watch Now" button
        if (response.data.film) {
          setPurchasedFilmUrl(`/post/${response.data.film._id}`);
        }

        // Show success modal immediately
        setDownloadStatus('downloading');
        setShowSuccessModal(true);
        onSuccess(response.data.message || 'Payment successful!');

        // Trigger download as file (force download, not open in browser)
        if (response.data.downloadUrl) {
          // Use async download to ensure it downloads as file
          (async () => {
            try {
              // Try to fetch as blob for better download control
              const videoResponse = await fetch(response.data.downloadUrl);

              if (videoResponse.ok) {
                // Download as blob to force file download
                const blob = await videoResponse.blob();
                const blobUrl = window.URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `${filmName || 'film'}.mp4`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up blob URL
                setTimeout(() => {
                  window.URL.revokeObjectURL(blobUrl);
                  setDownloadStatus('complete');
                }, 2000);
              } else {
                // Fallback to direct download if fetch fails (CORS issue)
                const link = document.createElement('a');
                link.href = response.data.downloadUrl;
                link.download = `${filmName || 'film'}.mp4`;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                setTimeout(() => {
                  setDownloadStatus('error'); // Shows "check your browser downloads"
                }, 2000);
              }
            } catch (downloadError) {
              console.error('Download error:', downloadError);

              // Fallback to direct link method
              const link = document.createElement('a');
              link.href = response.data.downloadUrl;
              link.download = `${filmName || 'film'}.mp4`;
              link.target = '_blank';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              // Show error status with instruction
              setTimeout(() => {
                setDownloadStatus('error');
              }, 2000);
            }
          })();
        } else {
          setDownloadStatus('error');
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      onError(
        err.response?.data?.message ||
          err.message ||
          'Payment failed. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <SecurePaymentBadge>
          <MdLock size={18} />
          Secure payment powered by Stripe
        </SecurePaymentBadge>

        <InfoText style={{ marginBottom: '16px' }}>
          Enter your card details below to complete the purchase:
        </InfoText>

        <CardElementWrapper>
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </CardElementWrapper>

        <InfoText
          style={{ fontSize: '12px', opacity: 0.7, marginBottom: '20px' }}
        >
          Your payment is secure and encrypted. We never store your card
          details.
        </InfoText>

        <ButtonGroup>
          <Button type='button' onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type='submit' primary disabled={!stripe || processing}>
            {processing ? 'Processing...' : `Pay $${filmPrice.toFixed(2)}`}
          </Button>
        </ButtonGroup>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          filmName={filmName}
          downloadStatus={downloadStatus}
          onClose={() => setShowSuccessModal(false)}
          onViewProfile={() =>
            navigate(`/${currentUser?.username || 'profile'}`)
          }
          onViewFilm={() => navigate(purchasedFilmUrl)}
        />
      )}
    </>
  );
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
  const [stripePromise, setStripePromise] = useState(null);
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(true);

  const { currentUser } = useSelector((state) => state.user);

  // Load Stripe configuration
  useEffect(() => {
    const initStripe = async () => {
      try {
        // Fetch Stripe config from backend
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/admin/stripe-settings`,
          { withCredentials: true }
        );

        if (data.stripeConfig && data.stripeConfig.enabled) {
          const publishableKey =
            data.stripeConfig.mode === 'test'
              ? data.stripeConfig.testPublishableKey
              : data.stripeConfig.livePublishableKey;

          if (publishableKey) {
            const stripe = await loadStripe(publishableKey);
            setStripePromise(stripe);
            setPaymentEnabled(true);
          }
        }
      } catch (err) {
        console.error('Failed to load Stripe:', err);
      } finally {
        setLoadingStripe(false);
      }
    };

    if (type === 'film') {
      initStripe();
    } else {
      setLoadingStripe(false);
    }
  }, [type]);

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
            {loadingStripe ? (
              <ComingSoonBadge>Loading payment system...</ComingSoonBadge>
            ) : !paymentEnabled ? (
              <>
                <ComingSoonBadge>
                  💳 Payment System Not Configured
                </ComingSoonBadge>
                <InfoText>
                  Payment processing is not currently available. Please contact
                  support to complete your purchase.
                </InfoText>
                <InfoText>
                  <strong>Email:</strong> {pricingConfig.supportEmail}
                </InfoText>
                <ButtonGroup>
                  <Button onClick={() => navigate(-1)}>Go Back</Button>
                  <Button
                    primary
                    onClick={() => {
                      window.location.href = `mailto:${pricingConfig.supportEmail}?subject=Film Purchase Request&body=Film: ${filmName}%0APrice: $${filmPrice}`;
                    }}
                  >
                    Contact Support
                  </Button>
                </ButtonGroup>
              </>
            ) : (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  filmId={filmId}
                  directoryId={directoryId}
                  filmName={filmName}
                  filmPrice={filmPrice}
                  onSuccess={setSuccess}
                  onError={setError}
                />
              </Elements>
            )}
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
