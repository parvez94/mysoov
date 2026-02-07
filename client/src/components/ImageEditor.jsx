import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Cropper from 'react-easy-crop';

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background: #0b0b0b;
`;

const CropContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  min-height: 400px;
  background: #000;
  
  .reactEasyCrop_Container {
    width: 100% !important;
    height: 100% !important;
  }
  
  .reactEasyCrop_CropArea {
    color: rgba(255, 255, 255, 0.5) !important;
  }
`;

const ControlsContainer = styled.div`
  padding: 20px;
  background: #0b0b0b;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ControlSection = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ControlLabel = styled.label`
  display: block;
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  margin-bottom: 8px;
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary-color);
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary-color);
    cursor: pointer;
    border: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ControlButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.active ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)'};
  color: #fff;
  border: 1px solid ${props => props.active ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 4px;
  font-family: var(--secondary-fonts);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.15)'};
  }
`;

const TextOverlaySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TextInput = styled.input`
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const ColorPicker = styled.input`
  width: 50px;
  height: 35px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
`;

const TextPreview = styled.div`
  position: absolute;
  top: ${props => props.y}%;
  left: ${props => props.x}%;
  transform: translate(-50%, -50%);
  font-family: ${props => props.fontFamily};
  font-size: ${props => props.fontSize}px;
  color: ${props => props.color};
  pointer-events: none;
  z-index: 10;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px;
  background: ${props => props.primary ? 'var(--primary-color)' : 'transparent'};
  color: #fff;
  border: 1px solid ${props => props.primary ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 4px;
  font-family: var(--secondary-fonts);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.primary ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)'};
    opacity: ${props => props.primary ? '0.9' : '1'};
  }
`;

const AspectRatioButton = styled(ControlButton)`
  min-width: 60px;
`;

const ImageEditor = ({ imageUrl, onSave, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [aspect, setAspect] = useState(4 / 3);
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(32);
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [fontFamily, setFontFamily] = useState('Arial');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cropperReady, setCropperReady] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setCropperReady(false);
    
    // Give the panel time to slide in and render
    const timer = setTimeout(() => {
      setCropperReady(true);
    }, 400);
    
    return () => clearTimeout(timer);
  }, [imageUrl]);

  useEffect(() => {
  }, [croppedAreaPixels]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    
    if (croppedAreaPixels && 
        !isNaN(croppedAreaPixels.width) && 
        !isNaN(croppedAreaPixels.height) &&
        !isNaN(croppedAreaPixels.x) &&
        !isNaN(croppedAreaPixels.y)) {
      setCroppedAreaPixels(croppedAreaPixels);
    } else {
      console.warn('⚠️ Invalid crop area received:', croppedAreaPixels);
    }
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
        image.crossOrigin = 'anonymous';
      } else if (!url.startsWith('data:') && !url.startsWith('blob:')) {
        image.crossOrigin = 'anonymous';
      }
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0, text = null, textConfig = {}) => {
    const image = await createImage(imageSrc);
    

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    const rotRad = (rotation * Math.PI) / 180;

    const bBoxWidth = Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height);
    const bBoxHeight = Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height);

    const canvasWidth = Math.max(1, Math.floor(bBoxWidth));
    const canvasHeight = Math.max(1, Math.floor(bBoxHeight));

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;


    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);

    ctx.drawImage(image, 0, 0);

    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');

    if (!croppedCtx) {
      throw new Error('Could not get cropped canvas context');
    }

    const cropWidth = Math.max(1, Math.floor(pixelCrop.width));
    const cropHeight = Math.max(1, Math.floor(pixelCrop.height));


    if (cropWidth > 10000 || cropHeight > 10000) {
      throw new Error('Crop dimensions too large');
    }

    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    croppedCtx.drawImage(
      canvas,
      Math.floor(pixelCrop.x),
      Math.floor(pixelCrop.y),
      Math.floor(pixelCrop.width),
      Math.floor(pixelCrop.height),
      0,
      0,
      cropWidth,
      cropHeight
    );

    if (text && text.trim()) {
      croppedCtx.font = `${textConfig.fontSize}px ${textConfig.fontFamily}`;
      croppedCtx.fillStyle = textConfig.color;
      croppedCtx.textAlign = 'center';
      croppedCtx.textBaseline = 'middle';
      croppedCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      croppedCtx.shadowBlur = 4;
      croppedCtx.shadowOffsetX = 2;
      croppedCtx.shadowOffsetY = 2;
      const textX = (cropWidth * textConfig.position.x) / 100;
      const textY = (cropHeight * textConfig.position.y) / 100;
      croppedCtx.fillText(text, textX, textY);
    }

    return new Promise((resolve, reject) => {
      try {
        croppedCanvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            console.error('toBlob returned null');
            reject(new Error('Canvas toBlob returned null'));
          }
        }, 'image/jpeg', 0.95);
      } catch (err) {
        console.error('toBlob threw error:', err);
        reject(err);
      }
    });
  };

  const handleSave = async () => {
    try {
      console.log('Cropped area:', {
        width: croppedAreaPixels?.width,
        height: croppedAreaPixels?.height,
        x: croppedAreaPixels?.x,
        y: croppedAreaPixels?.y
      });
      
      if (!croppedAreaPixels || 
          isNaN(croppedAreaPixels.width) || 
          isNaN(croppedAreaPixels.height) ||
          isNaN(croppedAreaPixels.x) ||
          isNaN(croppedAreaPixels.y)) {
        console.error('❌ Invalid crop area in handleSave');
        alert('Please wait for the crop area to be calculated. Try moving the image slightly.');
        return;
      }
      

      const croppedImageBlob = await getCroppedImg(
        imageUrl,
        croppedAreaPixels,
        rotation,
        text,
        {
          fontSize: textSize,
          fontFamily: fontFamily,
          color: textColor,
          position: textPosition
        }
      );

      if (!croppedImageBlob) {
        throw new Error('Failed to create image blob');
      }

      const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
      onSave(croppedImageBlob, croppedImageUrl);
    } catch (e) {
      console.error('Error editing image:', e);
      alert('Failed to process image. Please try again.');
    }
  };

  return (
    <EditorContainer>
      <CropContainer>
        {imageUrl && cropperReady ? (
          <Cropper
            key={imageUrl}
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            restrictPosition={true}
            showGrid={true}
            onMediaLoaded={(mediaSize) => {
              setImageLoaded(true);
            }}
            style={{
              containerStyle: {
                width: '100%',
                height: '400px',
              }
            }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#fff' }}>
            Loading editor...
          </div>
        )}
        {text && (
          <TextPreview
            x={textPosition.x}
            y={textPosition.y}
            fontSize={textSize}
            color={textColor}
            fontFamily={fontFamily}
          >
            {text}
          </TextPreview>
        )}
      </CropContainer>

      <ControlsContainer>
        <ControlSection>
          <ControlLabel>Aspect Ratio</ControlLabel>
          <ButtonGroup>
            <AspectRatioButton active={aspect === 16/9} onClick={() => setAspect(16/9)}>16:9</AspectRatioButton>
            <AspectRatioButton active={aspect === 4/3} onClick={() => setAspect(4/3)}>4:3</AspectRatioButton>
            <AspectRatioButton active={aspect === 1} onClick={() => setAspect(1)}>1:1</AspectRatioButton>
            <AspectRatioButton active={aspect === 3/4} onClick={() => setAspect(3/4)}>3:4</AspectRatioButton>
            <AspectRatioButton active={aspect === 9/16} onClick={() => setAspect(9/16)}>9:16</AspectRatioButton>
          </ButtonGroup>
        </ControlSection>

        <ControlSection>
          <ControlLabel>Zoom: {zoom.toFixed(1)}x</ControlLabel>
          <Slider
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
          />
        </ControlSection>

        <ControlSection>
          <ControlLabel>Rotation: {rotation}°</ControlLabel>
          <Slider
            type="range"
            value={rotation}
            min={0}
            max={360}
            step={1}
            onChange={(e) => setRotation(parseInt(e.target.value))}
          />
          <ButtonGroup style={{ marginTop: '8px' }}>
            <ControlButton onClick={() => setRotation((rotation + 90) % 360)}>↻ 90°</ControlButton>
            <ControlButton onClick={() => setRotation((rotation - 90 + 360) % 360)}>↺ 90°</ControlButton>
            <ControlButton onClick={() => setRotation(0)}>Reset</ControlButton>
          </ButtonGroup>
        </ControlSection>

        <ControlSection>
          <ControlLabel>Add Text</ControlLabel>
          <TextOverlaySection>
            <TextInput
              type="text"
              placeholder="Enter text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <ControlLabel style={{ marginBottom: '4px' }}>Font Size</ControlLabel>
                <Slider
                  type="range"
                  value={textSize}
                  min={16}
                  max={72}
                  step={2}
                  onChange={(e) => setTextSize(parseInt(e.target.value))}
                />
              </div>
              <div>
                <ControlLabel style={{ marginBottom: '4px' }}>Color</ControlLabel>
                <ColorPicker
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                />
              </div>
            </div>
            <div>
              <ControlLabel>Font Family</ControlLabel>
              <ButtonGroup>
                <ControlButton active={fontFamily === 'Arial'} onClick={() => setFontFamily('Arial')}>Arial</ControlButton>
                <ControlButton active={fontFamily === 'Georgia'} onClick={() => setFontFamily('Georgia')}>Georgia</ControlButton>
                <ControlButton active={fontFamily === 'Impact'} onClick={() => setFontFamily('Impact')}>Impact</ControlButton>
                <ControlButton active={fontFamily === 'Courier New'} onClick={() => setFontFamily('Courier New')}>Mono</ControlButton>
              </ButtonGroup>
            </div>
          </TextOverlaySection>
        </ControlSection>

        <ActionButtons>
          <ActionButton onClick={onCancel}>Cancel</ActionButton>
          <ActionButton 
            primary 
            onClick={handleSave}
            disabled={!cropperReady || !imageLoaded || !croppedAreaPixels}
            style={{ opacity: (!cropperReady || !imageLoaded || !croppedAreaPixels) ? 0.5 : 1 }}
          >
            {!cropperReady ? 'Loading editor...' : !imageLoaded ? 'Loading image...' : !croppedAreaPixels ? 'Initializing...' : 'Apply Changes'}
          </ActionButton>
        </ActionButtons>
      </ControlsContainer>
    </EditorContainer>
  );
};

export default ImageEditor;
