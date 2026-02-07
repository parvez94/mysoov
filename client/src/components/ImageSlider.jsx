import { useState } from 'react';
import styled from 'styled-components';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  border-radius: 10px;
  background: #000;
`;

const SliderWrapper = styled.div`
  display: flex;
  transition: transform 0.3s ease-in-out;
  transform: ${(props) => `translateX(-${props.$currentIndex * 100}%)`};
`;

const Slide = styled.div`
  min-width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Image = styled.img`
  width: 100%;
  max-width: 100%;
  max-height: 400px;
  height: auto;
  object-fit: contain;
  object-position: center;

  @media (max-width: 768px) {
    max-height: 70vh;
  }
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${(props) => (props.direction === 'left' ? 'left: 10px;' : 'right: 10px;')}
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: white;
  z-index: 10;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const ImageCounter = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-family: var(--primary-fonts);
  z-index: 10;
`;

const ImageTitle = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-family: var(--primary-fonts);
  font-weight: 600;
  z-index: 10;
  max-width: 60%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ImageSlider = ({ images, caption }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aspectRatios, setAspectRatios] = useState({});

  if (!images || images.length === 0) return null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));
  };

  const handleImageLoad = (e, index) => {
    const img = e.target;
    const { naturalWidth, naturalHeight } = img;
    if (naturalWidth && naturalHeight) {
      const ratio = naturalWidth / naturalHeight;
      const aspectRatio =
        ratio < 1 ? 'portrait' : ratio > 1 ? 'landscape' : 'square';
      setAspectRatios((prev) => ({
        ...prev,
        [index]: aspectRatio,
      }));
    }
  };

  const currentImage = images[currentIndex];
  const imageTitle = currentImage?.title || currentImage?.name || '';

  return (
    <SliderContainer>
      {imageTitle && (
        <ImageTitle>{imageTitle}</ImageTitle>
      )}
      
      {images.length > 1 && (
        <ImageCounter>
          {currentIndex + 1} / {images.length}
        </ImageCounter>
      )}

      <SliderWrapper $currentIndex={currentIndex}>
        {images.map((image, index) => (
          <Slide key={index}>
            <Image
              src={image.url}
              alt={caption || `Image ${index + 1}`}
              onLoad={(e) => handleImageLoad(e, index)}
              data-aspect-ratio={aspectRatios[index]}
            />
          </Slide>
        ))}
      </SliderWrapper>

      {images.length > 1 && (
        <>
          <NavButton
            direction='left'
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <IoChevronBack />
          </NavButton>
          <NavButton
            direction='right'
            onClick={handleNext}
            disabled={currentIndex === images.length - 1}
          >
            <IoChevronForward />
          </NavButton>
        </>
      )}
    </SliderContainer>
  );
};

export default ImageSlider;
