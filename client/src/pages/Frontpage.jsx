import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { openModal } from '../redux/modal/modalSlice';
import {
  FaHeart,
  FaStar,
  FaFire,
  FaRocket,
  FaCrown,
  FaGem,
  FaTrophy,
  FaGift,
  FaBolt,
  FaMagic,
  FaSmile,
  FaThumbsUp,
  FaCheck,
  FaUser,
  FaUsers,
  FaUserFriends,
  FaPlay,
  FaFilm,
  FaCamera,
  FaMusic,
  FaHeadphones,
} from 'react-icons/fa';
import { MdClose } from 'react-icons/md';

const Container = styled.div`
  font-family: 'IBM Plex Sans', sans-serif;
  width: 100%;
  min-height: 100vh;
  background-color: var(--tertiary-color);
  overflow-x: hidden;
`;

// Section 1: Slider
const SliderSection = styled.section`
  width: 100%;
  height: auto;
  position: relative;
  overflow: hidden;
`;

const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  height: auto;
  overflow: hidden;
`;

const Slide = styled.div`
  width: 100%;
  opacity: ${(props) => (props.$active ? 1 : 0)};
  transition: opacity 0.5s ease-in-out;
  ${(props) => !props.$active && 'position: absolute; top: 0; left: 0;'}

  img,
  video {
    width: 100%;
    height: auto;
    display: block;
  }
`;

const SliderDots = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.$active ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.5)'};
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${(props) =>
      props.$active ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.8)'};
  }
`;

// Section 2: Happy Views
const HappyViewsSection = styled.section`
  background-color: ${(props) => props.$bgColor || '#FF8C00'};
  color: ${(props) => props.$textColor || '#ffffff'};
  padding: 20px 20px 35px 20px;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const SectionHeading = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${(props) => props.$color || 'inherit'};
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: ${(props) => {
    if (props.$textAlign === 'left') return 'flex-start';
    if (props.$textAlign === 'right') return 'flex-end';
    return 'center';
  }};
  text-align: ${(props) => props.$textAlign || 'center'};
  gap: 15px;
  ${(props) =>
    props.$strokeWidth &&
    props.$strokeWidth > 0 &&
    `
    -webkit-text-stroke: ${props.$strokeWidth}px ${
      props.$strokeColor || '#000000'
    };
    text-stroke: ${props.$strokeWidth}px ${props.$strokeColor || '#000000'};
    paint-order: stroke fill;
  `}

  @media (max-width: 768px) {
    font-size: 1.6rem;
    gap: 10px;
  }
`;

const HeadingIcon = styled.span`
  font-size: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  img {
    width: 6rem;
    height: 6rem;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    font-size: 2rem;

    img {
      width: 5rem;
      height: 5rem;
    }
  }
`;

const SectionDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #000;
  margin-bottom: 40px;
  text-align: ${(props) => props.$textAlign || 'center'};

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0;
  }
`;

const CodeSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  margin-top: 30px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin-top: 15px;
  }
`;

const CodeLabel = styled.label`
  font-size: 1.8rem;
  font-weight: 600;
  color: #000;
  margin: 0;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CodeFormContainer = styled.div`
  display: flex;
  align-items: stretch;
  gap: 10px;
  background: white;
  padding: 8px;
  border-radius: 50px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    background: transparent;
    padding: 0;
    gap: 5px;
    box-shadow: none;
  }
`;

const CodeInput = styled.input`
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  background: transparent;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #999;
  }

  @media (max-width: 768px) {
    width: 70%;
    padding: 14px 15px;
    font-size: 0.95rem;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CodeSubmitButton = styled.button`
  padding: 14px 32px;
  background-color: ${(props) => props.$bgColor || 'var(--primary-color)'};
  color: ${(props) => props.$textColor || 'white'};
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 30%;
    padding: 14px 20px;
    font-size: 0.95rem;
    border-radius: 5px;
  }
`;

// Section 3: Your Account
const AccountSection = styled.section`
  padding: 30px 20px;
  background-color: ${(props) => props.$bgColor || 'var(--secondary-color)'};
  color: ${(props) => props.$textColor || '#ffffff'};
  width: 100%;
  box-sizing: border-box;
`;

const AccountContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
`;

const AccountText = styled.h3`
  font-size: 1.8rem;
  color: ${(props) => props.$color || 'inherit'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  ${(props) =>
    props.$strokeWidth &&
    props.$strokeWidth > 0 &&
    `
    -webkit-text-stroke: ${props.$strokeWidth}px ${
      props.$strokeColor || '#000000'
    };
    text-stroke: ${props.$strokeWidth}px ${props.$strokeColor || '#000000'};
    paint-order: stroke fill;
  `}

  @media (max-width: 768px) {
    justify-content: center;
    font-size: 1.6rem;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 15px;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const AuthButton = styled.button`
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;

  ${(props) =>
    props.$variant === 'login'
      ? `
    background-color: ${props.$bgColor || 'transparent'};
    color: ${props.$textColor || 'var(--primary-color)'};
    border: 2px solid ${props.$textColor || 'var(--primary-color)'};
    
    &:hover {
      background-color: ${props.$textColor || 'var(--primary-color)'};
      color: ${props.$bgColor || 'white'};
    }
  `
      : `
    background-color: ${props.$bgColor || 'var(--primary-color)'};
    color: ${props.$textColor || 'white'};
    
    &:hover {
      opacity: 0.9;
    }
  `}
`;

// Section 4: Happy Team
const HappyTeamSection = styled.section`
  padding: 20px 20px 35px 20px;
  background-color: ${(props) => props.$bgColor || 'var(--tertiary-color)'};
  color: ${(props) => props.$textColor || '#ffffff'};
  width: 100%;
  box-sizing: border-box;
`;

const TeamContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
`;

const TeamText = styled.h3`
  font-size: 1.8rem;
  color: ${(props) => props.$color || 'inherit'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  ${(props) =>
    props.$strokeWidth &&
    props.$strokeWidth > 0 &&
    `
    -webkit-text-stroke: ${props.$strokeWidth}px ${
      props.$strokeColor || '#000000'
    };
    text-stroke: ${props.$strokeWidth}px ${props.$strokeColor || '#000000'};
    paint-order: stroke fill;
  `}

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const TextIcon = styled.span`
  font-size: 1.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  img {
    width: 5rem;
    height: 5rem;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;

    img {
      width: 4rem;
      height: 4rem;
    }
  }
`;

const RegisterButton = styled.button`
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 600;
  background-color: ${(props) => props.$bgColor || 'var(--primary-color)'};
  color: ${(props) => props.$textColor || 'white'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

// Section 5: Banner
const BannerSection = styled.section`
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    height: 250px;
  }
`;

const BannerImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

// Film Modal Styles
const FilmModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  overflow-y: auto;
`;

const FilmModalContent = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  max-width: 900px;
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
    max-width: 100%;
  }
`;

const FilmModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const FilmModalTitle = styled.h2`
  font-family: var(--primary-fonts);
  color: #fff;
  font-size: 24px;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const FilmCloseButton = styled.button`
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
  font-size: 24px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const FilmModalBody = styled.div`
  padding: 0;
`;

const FilmVideoWrapper = styled.div`
  width: 100%;
  background: #000;
  position: relative;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */

  video,
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

const CopyrightOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.3);
  font-size: 72px;
  font-weight: bold;
  font-family: var(--primary-fonts);
  pointer-events: none;
  z-index: 10;
  text-align: center;
  user-select: none;

  @media (max-width: 768px) {
    font-size: 48px;
  }
`;

const FilmInfoSection = styled.div`
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const FilmPriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const FilmPrice = styled.div`
  font-family: var(--primary-fonts);
  color: var(--primary-color);
  font-size: 32px;
  font-weight: 700;

  span {
    font-size: 16px;
    color: var(--secondary-color);
    font-weight: 400;
    margin-left: 8px;
  }
`;

const FilmBuyButton = styled.button`
  padding: 14px 32px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-family: var(--secondary-fonts);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #cc0000;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const FilmDescription = styled.p`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
`;

const SuccessMessage = styled.div`
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
  padding: 12px 16px;
  border-radius: 8px;
  font-family: var(--secondary-fonts);
  font-size: 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Slider Component
const Slider = ({ items }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [items.length]);

  if (!items || items.length === 0) {
    return (
      <SliderSection>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            background: 'var(--secondary-color)',
            color: 'var(--text-secondary)',
          }}
        >
          No slider items available
        </div>
      </SliderSection>
    );
  }

  return (
    <SliderSection>
      <SliderContainer>
        {items.map((item, index) => (
          <Slide key={index} $active={currentSlide === index}>
            {item.type === 'video' ? (
              <video
                src={item.url}
                autoPlay={currentSlide === index}
                loop
                muted
                playsInline
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : (
              <img src={item.url} alt={item.alt || `Slide ${index + 1}`} />
            )}
          </Slide>
        ))}
        {items.length > 1 && (
          <SliderDots>
            {items.map((_, index) => (
              <Dot
                key={index}
                $active={currentSlide === index}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </SliderDots>
        )}
      </SliderContainer>
    </SliderSection>
  );
};

// Icon mapping for FontAwesome icons
const ICON_MAP = {
  heart: FaHeart,
  star: FaStar,
  fire: FaFire,
  rocket: FaRocket,
  crown: FaCrown,
  gem: FaGem,
  trophy: FaTrophy,
  gift: FaGift,
  bolt: FaBolt,
  magic: FaMagic,
  smile: FaSmile,
  'thumbs-up': FaThumbsUp,
  check: FaCheck,
  user: FaUser,
  users: FaUsers,
  'user-friends': FaUserFriends,
  play: FaPlay,
  film: FaFilm,
  camera: FaCamera,
  music: FaMusic,
  headphones: FaHeadphones,
};

// Helper component to render FontAwesome icon
const IconDisplay = ({ icon, IconComponent }) => {
  if (!icon || icon === 'none') return null;

  const FAIcon = ICON_MAP[icon];
  if (FAIcon) {
    return (
      <IconComponent>
        <FAIcon />
      </IconComponent>
    );
  }

  if (
    typeof icon === 'string' &&
    (icon.startsWith('http') || icon.startsWith('/') || icon.includes('.'))
  ) {
    return (
      <IconComponent>
        <img src={icon} alt='Icon' />
      </IconComponent>
    );
  }

  return null;
};

const Frontpage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codeInput, setCodeInput] = useState('');
  const [showFilmModal, setShowFilmModal] = useState(false);
  const [redeemedFilm, setRedeemedFilm] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/frontpage/settings`
        );
        setSettings(res.data);
      } catch (err) {
        console.error('Error fetching frontpage settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Auto-redeem pending code after login/signup
  useEffect(() => {
    const redeemPendingCode = async () => {
      const pendingCode = localStorage.getItem('pendingRedeemCode');

      if (currentUser && pendingCode) {
        // Clear the pending code immediately to avoid re-triggering
        localStorage.removeItem('pendingRedeemCode');

        try {
          const res = await axios.post(
            `${
              import.meta.env.VITE_API_URL
            }/api/v1/films/redeem/${pendingCode}`,
            {},
            { withCredentials: true }
          );

          // Show the film modal with the redeemed film
          setRedeemedFilm(res.data.film);
          setShowFilmModal(true);
        } catch (err) {
          alert(
            err.response?.data?.message ||
              'Error redeeming code. Please check the code and try again.'
          );
        }
      }
    };

    redeemPendingCode();
  }, [currentUser]);

  const handleCodeSubmit = async (e) => {
    e.preventDefault();

    // Check if user is logged in
    if (!currentUser) {
      if (codeInput.trim()) {
        // Store the code for after login/signup
        localStorage.setItem('pendingRedeemCode', codeInput.trim());
        setCodeInput('');

        // Open signup modal - user can switch to login if needed
        dispatch(openModal({ modalType: 'register' }));
      }
      return;
    }

    if (codeInput.trim()) {
      try {
        const res = await axios.post(
          `${
            import.meta.env.VITE_API_URL
          }/api/v1/films/redeem/${codeInput.trim()}`,
          {},
          { withCredentials: true }
        );

        // Show the film modal with the redeemed film
        setRedeemedFilm(res.data.film);
        setShowFilmModal(true);
        setCodeInput('');
      } catch (err) {
        alert(
          err.response?.data?.message ||
            'Error redeeming code. Please check the code and try again.'
        );
      }
    }
  };

  const handleAuthAction = (action) => {
    if (action === 'login') {
      dispatch(openModal({ modalType: 'login' }));
    } else if (action === 'signup' || action === 'register') {
      dispatch(openModal({ modalType: 'register' }));
    } else if (action === 'happy-team') {
      dispatch(openModal({ modalType: 'register-editor' }));
    } else if (action === 'happy-team-login') {
      dispatch(openModal({ modalType: 'happy-team-login' }));
    }
  };

  const handleCloseFilmModal = () => {
    setShowFilmModal(false);
    setRedeemedFilm(null);
  };

  const handleBuyFilm = () => {
    if (!redeemedFilm) return;

    const filmId = redeemedFilm.sourceFilmId || redeemedFilm._id;
    const price = redeemedFilm.purchasePrice || 0;
    const filmName = encodeURIComponent(redeemedFilm.caption || 'Film');

    navigate(
      `/payment?type=film&filmId=${filmId}&directoryId=new-system&price=${price}&filmName=${filmName}`
    );
  };

  // Helper function to get video URL
  const getVideoUrl = (video) => {
    if (!video?.videoUrl) return null;
    if (typeof video.videoUrl === 'string') return video.videoUrl;
    if (typeof video.videoUrl === 'object' && video.videoUrl.url) {
      return video.videoUrl.url;
    }
    return null;
  };

  if (loading) {
    return (
      <Container>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          Loading...
        </div>
      </Container>
    );
  }

  if (!settings) {
    return (
      <Container>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
          }}
        >
          <h2>Welcome</h2>
          <p>Frontpage is not configured yet.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {/* Section 1: Slider */}
      {settings.slider?.enabled && (
        <Slider items={settings.slider.items || []} />
      )}

      {/* Section 2: Happy Views */}
      {settings.happyViewsSection?.enabled && (
        <HappyViewsSection
          $bgColor={settings.happyViewsSection.backgroundColor}
          $textColor={settings.happyViewsSection.textColor}
        >
          <SectionContainer>
            <SectionHeading
              $color={settings.happyViewsSection.headingColor}
              $strokeColor={settings.happyViewsSection.headingStrokeColor}
              $strokeWidth={settings.happyViewsSection.headingStrokeWidth}
              $textAlign={settings.happyViewsSection.textAlign}
            >
              <IconDisplay
                icon={settings.happyViewsSection.icon}
                IconComponent={HeadingIcon}
              />
              {settings.happyViewsSection.heading}
            </SectionHeading>

            {settings.happyViewsSection.description && (
              <SectionDescription
                $textAlign={settings.happyViewsSection.textAlign}
              >
                {settings.happyViewsSection.description}
              </SectionDescription>
            )}

            <CodeSectionContainer>
              <CodeLabel>
                {settings.happyViewsSection.codeInput?.label}
              </CodeLabel>
              <CodeFormContainer as='form' onSubmit={handleCodeSubmit}>
                <CodeInput
                  type='text'
                  placeholder={
                    settings.happyViewsSection.codeInput?.placeholder
                  }
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                />
                <CodeSubmitButton
                  type='submit'
                  $bgColor={settings.happyViewsSection.buttonBackgroundColor}
                  $textColor={settings.happyViewsSection.buttonTextColor}
                >
                  Send
                </CodeSubmitButton>
              </CodeFormContainer>
            </CodeSectionContainer>
          </SectionContainer>
        </HappyViewsSection>
      )}

      {/* Section 3: Your Account */}
      {settings.accountSection?.enabled && !currentUser && (
        <AccountSection
          $bgColor={settings.accountSection.backgroundColor}
          $textColor={settings.accountSection.textColor}
        >
          <AccountContainer>
            <AccountText
              $color={settings.accountSection.headingColor}
              $strokeColor={settings.accountSection.headingStrokeColor}
              $strokeWidth={settings.accountSection.headingStrokeWidth}
            >
              <IconDisplay
                icon={settings.accountSection.icon}
                IconComponent={TextIcon}
              />
              {settings.accountSection.leftText}
            </AccountText>
            <AuthButtons>
              <AuthButton
                $variant='login'
                $bgColor={settings.accountSection.loginButtonBackgroundColor}
                $textColor={settings.accountSection.loginButtonTextColor}
                onClick={() => handleAuthAction('login')}
              >
                {settings.accountSection.loginText}
              </AuthButton>
              <AuthButton
                $variant='signup'
                $bgColor={settings.accountSection.signupButtonBackgroundColor}
                $textColor={settings.accountSection.signupButtonTextColor}
                onClick={() => handleAuthAction('signup')}
              >
                {settings.accountSection.signupText}
              </AuthButton>
            </AuthButtons>
          </AccountContainer>
        </AccountSection>
      )}

      {/* Section 4: Happy Team */}
      {settings.happyTeamSection?.enabled && (
        <HappyTeamSection
          $bgColor={settings.happyTeamSection.backgroundColor}
          $textColor={settings.happyTeamSection.textColor}
        >
          <SectionContainer>
            <SectionHeading
              $color={settings.happyTeamSection.headingColor}
              $strokeColor={settings.happyTeamSection.headingStrokeColor}
              $strokeWidth={settings.happyTeamSection.headingStrokeWidth}
              $textAlign={settings.happyTeamSection.textAlign}
            >
              <IconDisplay
                icon={settings.happyTeamSection.icon}
                IconComponent={HeadingIcon}
              />
              {settings.happyTeamSection.leftText}
            </SectionHeading>

            {settings.happyTeamSection.description && (
              <SectionDescription
                $textAlign={settings.happyTeamSection.textAlign}
              >
                {settings.happyTeamSection.description}
              </SectionDescription>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '15px',
                marginTop: '15px',
                flexWrap: 'wrap',
              }}
            >
              <RegisterButton
                $bgColor={settings.happyTeamSection.loginButtonBackgroundColor}
                $textColor={settings.happyTeamSection.loginButtonTextColor}
                onClick={() => handleAuthAction('happy-team-login')}
              >
                {settings.happyTeamSection.loginText || 'Login'}
              </RegisterButton>
              <RegisterButton
                $bgColor={settings.happyTeamSection.signupButtonBackgroundColor}
                $textColor={settings.happyTeamSection.signupButtonTextColor}
                onClick={() => handleAuthAction('happy-team')}
              >
                {settings.happyTeamSection.signupText || 'Signup'}
              </RegisterButton>
            </div>
          </SectionContainer>
        </HappyTeamSection>
      )}

      {/* Section 5: Banner */}
      {settings.bannerSection?.enabled && settings.bannerSection.imageUrl && (
        <BannerSection>
          <BannerImage
            src={settings.bannerSection.imageUrl}
            alt={settings.bannerSection.alt}
          />
        </BannerSection>
      )}

      {/* Film Modal */}
      {showFilmModal && redeemedFilm && (
        <FilmModalOverlay onClick={handleCloseFilmModal}>
          <FilmModalContent onClick={(e) => e.stopPropagation()}>
            <FilmModalHeader>
              <FilmModalTitle>{redeemedFilm.caption || 'Film'}</FilmModalTitle>
              <FilmCloseButton onClick={handleCloseFilmModal}>
                <MdClose />
              </FilmCloseButton>
            </FilmModalHeader>

            <FilmModalBody>
              <FilmVideoWrapper>
                {getVideoUrl(redeemedFilm) && (
                  <>
                    <video
                      src={getVideoUrl(redeemedFilm)}
                      controls
                      controlsList='nodownload'
                      disablePictureInPicture
                      autoPlay
                      style={{ width: '100%', height: '100%' }}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    <CopyrightOverlay>MYSOOV.TV</CopyrightOverlay>
                  </>
                )}
              </FilmVideoWrapper>

              <FilmInfoSection>
                <SuccessMessage>
                  <FaCheck />
                  Film successfully added to your profile!
                </SuccessMessage>

                <FilmPriceRow>
                  <FilmPrice>
                    ${redeemedFilm.purchasePrice?.toFixed(2) || '0.00'}
                    <span>Purchase Price</span>
                  </FilmPrice>
                  <FilmBuyButton onClick={handleBuyFilm}>
                    <FaPlay />
                    Buy Now
                  </FilmBuyButton>
                </FilmPriceRow>

                <FilmDescription>
                  This film has been added to your profile for free. If you'd
                  like to support the creator or unlock additional features, you
                  can purchase it using the button above.
                </FilmDescription>
              </FilmInfoSection>
            </FilmModalBody>
          </FilmModalContent>
        </FilmModalOverlay>
      )}
    </Container>
  );
};

export default Frontpage;
