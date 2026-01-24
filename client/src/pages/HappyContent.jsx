import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import axios from 'axios';
import { FaLock, FaUnlock } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: var(--secondary-fonts);
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
  text-align: center;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  text-align: center;
  color: var(--secondary-color);
  opacity: 0.8;
  font-size: 1.1rem;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ContentCard = styled.div`
  background-color: var(--tertiary-color);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const MediaPreview = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Watermark = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 72px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: bold;
  pointer-events: none;
  user-select: none;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  font-family: var(--primary-fonts);

  @media (max-width: 768px) {
    font-size: 48px;
  }
`;

const LockOverlay = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 8px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
`;

const ContentInfo = styled.div`
  padding: 15px;
`;

const ContentTitle = styled.h3`
  font-size: 1.1rem;
  color: var(--secondary-color);
  margin-bottom: 8px;
  word-break: break-word;
  font-family: var(--primary-fonts);
`;

const ContentDescription = styled.p`
  font-size: 0.9rem;
  color: var(--secondary-color);
  opacity: 0.8;
  margin-bottom: 12px;
  word-break: break-word;
`;

const PriceTag = styled.div`
  font-size: 1.2rem;
  color: var(--primary-color);
  font-weight: bold;
  margin-bottom: 10px;
`;

const RedeemButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  font-family: var(--secondary-fonts);
  transition: all 0.3s;

  &:hover {
    opacity: 0.9;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background-color: var(--tertiary-color);
  padding: 30px;
  border-radius: 10px;
  max-width: 500px;
  width: 100%;
`;

const ModalTitle = styled.h2`
  color: var(--secondary-color);
  margin-bottom: 20px;
  font-family: var(--primary-fonts);
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  font-family: var(--secondary-fonts);
  transition: all 0.3s;

  ${(props) =>
    props.$variant === 'cancel'
      ? `
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--secondary-color);
  `
      : `
    background-color: var(--primary-color);
    color: white;
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
`;

const MediaModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
`;

const MediaModalContent = styled.div`
  max-width: 90vw;
  max-height: 90vh;
  position: relative;

  img,
  video {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
  }
`;

const MediaWithWatermark = styled.div`
  position: relative;
  display: inline-block;
`;

const CloseButton = styled.button`
  position: absolute;
  top: -40px;
  right: 0;
  background: transparent;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 10px;
  
  &:hover {
    opacity: 0.7;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: var(--secondary-color);
  opacity: 0.7;

  h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    font-family: var(--primary-fonts);
  }
`;

const AlbumNavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.$direction === 'left' ? 'left: 20px;' : 'right: 20px;'}
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  z-index: 10;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const AlbumCounter = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
`;

const HappyContent = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/happy-team/approved`
      );
      setContent(res.data);
    } catch (err) {
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupContentByType = () => {
    const videos = content.filter(item => item.type === 'video');
    const images = content.filter(item => item.type === 'image');
    
    const imageAlbums = images.reduce((acc, image) => {
      const code = image.code;
      if (!acc[code]) {
        acc[code] = {
          type: 'album',
          code: code,
          title: image.title || 'Image Album',
          price: image.price,
          images: [],
          purchasedBy: image.purchasedBy,
        };
      }
      acc[code].images.push(image);
      return acc;
    }, {});
    
    return [...videos, ...Object.values(imageAlbums)];
  };

  const handleRedeemSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('Please log in to redeem content');
      return;
    }

    if (!redeemCode.trim()) {
      alert('Please enter a code');
      return;
    }

    setRedeeming(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/happy-team/redeem`,
        { code: redeemCode },
        { withCredentials: true }
      );

      alert('Content redeemed successfully!');
      setShowRedeemModal(false);
      setRedeemCode('');
      fetchContent();
    } catch (err) {
      console.error('Error redeeming:', err);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Error redeeming content'
      );
    } finally {
      setRedeeming(false);
    }
  };

  const isUnlocked = (item) => {
    if (!currentUser) return false;
    if (item.type === 'album') {
      return item.images.some(img => img.purchasedBy?.some(id => id === currentUser._id));
    }
    return item.purchasedBy?.some((id) => id === currentUser._id);
  };

  const handleMediaClick = (item) => {
    if (item.type === 'album') {
      if (isUnlocked(item)) {
        setSelectedAlbum(item);
        setCurrentImageIndex(0);
      } else {
        setShowRedeemModal(true);
      }
    } else {
      if (isUnlocked(item)) {
        setSelectedMedia(item);
      } else {
        setShowRedeemModal(true);
      }
    }
  };

  const handleNextImage = () => {
    if (selectedAlbum && currentImageIndex < selectedAlbum.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (selectedAlbum && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleCloseAlbum = () => {
    setSelectedAlbum(null);
    setCurrentImageIndex(0);
  };

  const getMediaUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`;
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>Loading...</Title>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Happy Team Content</Title>
        <Subtitle>Premium content from our creative team</Subtitle>
      </Header>

      {!currentUser && (
        <div
          style={{
            textAlign: 'center',
            padding: '20px',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            borderRadius: '8px',
            marginBottom: '30px',
            color: 'var(--secondary-color)',
          }}
        >
          <p style={{ margin: 0 }}>
            Please <strong>log in</strong> to purchase and access content
          </p>
        </div>
      )}

      {content.length === 0 ? (
        <EmptyState>
          <h3>No content available yet</h3>
          <p>Check back later for new content!</p>
        </EmptyState>
      ) : (
        <ContentGrid>
          {groupContentByType().map((item) => {
            const unlocked = isUnlocked(item);
            const isAlbum = item.type === 'album';
            const firstImage = isAlbum ? item.images[0] : null;
            
            return (
              <ContentCard key={isAlbum ? item.code : item._id} onClick={() => handleMediaClick(item)}>
                <MediaPreview>
                  {isAlbum ? (
                    <>
                      <img 
                        src={getMediaUrl(unlocked ? firstImage.fileUrl : (firstImage.watermarkedUrl || firstImage.fileUrl))} 
                        alt={item.title} 
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        color: 'white',
                        fontSize: '0.9rem'
                      }}>
                        📸 {item.images.length} {item.images.length === 1 ? 'image' : 'images'}
                      </div>
                    </>
                  ) : item.type === 'image' ? (
                    <img src={getMediaUrl(unlocked ? item.fileUrl : (item.watermarkedUrl || item.fileUrl))} alt={item.title} />
                  ) : (
                    <video
                      src={getMediaUrl(item.fileUrl)}
                      muted
                      onMouseEnter={(e) => e.target.play()}
                      onMouseLeave={(e) => {
                        e.target.pause();
                        e.target.currentTime = 0;
                      }}
                    />
                  )}
                  <LockOverlay>
                    {unlocked ? (
                      <>
                        <FaUnlock /> Unlocked
                      </>
                    ) : (
                      <>
                        <FaLock /> Locked
                      </>
                    )}
                  </LockOverlay>
                </MediaPreview>
                <ContentInfo>
                  <ContentTitle>{item.title || 'Untitled'}</ContentTitle>
                  {item.description && !isAlbum && (
                    <ContentDescription>{item.description}</ContentDescription>
                  )}
                  {isAlbum && (
                    <ContentDescription>
                      {unlocked ? 'Click to view all images' : `Album with ${item.images.length} images`}
                    </ContentDescription>
                  )}
                  {!unlocked && (
                    <>
                      <PriceTag>${item.price?.toFixed(2)}</PriceTag>
                      <RedeemButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRedeemModal(true);
                        }}
                      >
                        Redeem Code
                      </RedeemButton>
                    </>
                  )}
                  {unlocked && (
                    <div
                      style={{
                        color: 'var(--primary-color)',
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                    >
                      ✓ You own this content
                    </div>
                  )}
                </ContentInfo>
              </ContentCard>
            );
          })}
        </ContentGrid>
      )}

      {showRedeemModal && (
        <Modal onClick={() => setShowRedeemModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Redeem Content</ModalTitle>
            <Form onSubmit={handleRedeemSubmit}>
              <Input
                type='text'
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
                placeholder='Enter your access code'
                autoFocus
              />
              <ButtonGroup>
                <Button
                  type='button'
                  $variant='cancel'
                  onClick={() => setShowRedeemModal(false)}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={redeeming}>
                  {redeeming ? 'Redeeming...' : 'Redeem'}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {selectedAlbum && (
        <MediaModal onClick={handleCloseAlbum}>
          <MediaModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={handleCloseAlbum}>
              <MdClose />
            </CloseButton>
            <MediaWithWatermark>
              <img
                src={getMediaUrl(selectedAlbum.images[currentImageIndex].fileUrl)}
                alt={selectedAlbum.images[currentImageIndex].title}
              />
            </MediaWithWatermark>
            {selectedAlbum.images.length > 1 && (
              <>
                <AlbumNavButton 
                  $direction="left" 
                  onClick={handlePrevImage}
                  disabled={currentImageIndex === 0}
                >
                  ←
                </AlbumNavButton>
                <AlbumNavButton 
                  $direction="right" 
                  onClick={handleNextImage}
                  disabled={currentImageIndex === selectedAlbum.images.length - 1}
                >
                  →
                </AlbumNavButton>
                <AlbumCounter>
                  {currentImageIndex + 1} / {selectedAlbum.images.length}
                </AlbumCounter>
              </>
            )}
          </MediaModalContent>
        </MediaModal>
      )}

      {selectedMedia && (
        <MediaModal onClick={() => setSelectedMedia(null)}>
          <MediaModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setSelectedMedia(null)}>
              <MdClose />
            </CloseButton>
            <MediaWithWatermark>
              {selectedMedia.type === 'image' ? (
                <img
                  src={getMediaUrl(selectedMedia.fileUrl)}
                  alt={selectedMedia.title}
                />
              ) : (
                <video
                  src={getMediaUrl(selectedMedia.fileUrl)}
                  controls
                  controlsList='nodownload'
                  disablePictureInPicture
                  autoPlay
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}
            </MediaWithWatermark>
          </MediaModalContent>
        </MediaModal>
      )}
    </Container>
  );
};

export default HappyContent;
