import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0b0b0b;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
`;

const Video = styled.video`
  width: 100%;
  max-height: 400px;
  object-fit: contain;
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

const TimelineContainer = styled.div`
  position: relative;
  width: 100%;
  height: 60px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin-top: 10px;
  overflow: hidden;
`;

const Timeline = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.15) 50%, 
    rgba(255, 255, 255, 0.1) 100%
  );
`;

const TrimHandle = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 12px;
  background: var(--primary-color);
  cursor: ew-resize;
  z-index: 2;
  
  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 3px;
    height: 30px;
    background: #fff;
    border-radius: 2px;
  }
  
  ${props => props.start && `
    left: ${props.position}%;
    border-radius: 4px 0 0 4px;
  `}
  
  ${props => props.end && `
    left: ${props.position}%;
    border-radius: 0 4px 4px 0;
  `}
`;

const TrimmedArea = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${props => props.start}%;
  right: ${props => 100 - props.end}%;
  background: rgba(var(--primary-color-rgb, 168, 85, 247), 0.2);
  border-left: 2px solid var(--primary-color);
  border-right: 2px solid var(--primary-color);
  pointer-events: none;
`;

const Playhead = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${props => props.position}%;
  width: 2px;
  background: #fff;
  z-index: 3;
  pointer-events: none;
  
  &:before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid #fff;
  }
`;

const TimeDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-family: var(--secondary-fonts);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileLabel = styled.label`
  display: inline-block;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-family: var(--secondary-fonts);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
`;

const Slider = styled.input`
  flex: 1;
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

const MusicFileName = styled.div`
  font-family: var(--secondary-fonts);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
`;

const VideoEditor = ({ videoUrl, onSave, onCancel }) => {
  const videoRef = useRef(null);
  const timelineRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [originalVolume, setOriginalVolume] = useState(1);
  const audioRef = useRef(null);
  const isDraggingRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
      };
      
      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
        
        const startTime = (trimStart / 100) * duration;
        const endTime = (trimEnd / 100) * duration;
        
        if (video.currentTime >= endTime) {
          video.currentTime = startTime;
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }
        }
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [trimStart, trimEnd, duration]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = originalVolume;
    }
  }, [originalVolume]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      video.play();
      if (audioRef.current) {
        audioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleMusicUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      setBackgroundMusic({ file, url, name: file.name });
    } else {
      alert('Please select a valid audio file');
    }
  };

  const handleTrimDrag = (e, handle) => {
    if (!isDraggingRef.current) return;
    
    const timeline = timelineRef.current;
    const rect = timeline.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    if (handle === 'start') {
      setTrimStart(Math.min(percentage, trimEnd - 1));
    } else if (handle === 'end') {
      setTrimEnd(Math.max(percentage, trimStart + 1));
    }
  };

  const handleMouseDown = (handle) => {
    isDraggingRef.current = handle;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = null;
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDraggingRef.current) {
        handleTrimDrag(e, isDraggingRef.current);
      }
    };
    
    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [trimStart, trimEnd]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    const startTime = (trimStart / 100) * duration;
    const endTime = (trimEnd / 100) * duration;
    
    onSave({
      trimStart: startTime,
      trimEnd: endTime,
      backgroundMusic: backgroundMusic ? backgroundMusic.file : null,
      musicVolume,
      originalVolume
    });
  };

  const playheadPosition = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <EditorContainer>
      <VideoContainer>
        <Video ref={videoRef} src={videoUrl} />
      </VideoContainer>
      
      {backgroundMusic && (
        <audio ref={audioRef} src={backgroundMusic.url} loop />
      )}

      <ControlsContainer>
        <ControlSection>
          <ControlLabel>Playback</ControlLabel>
          <ButtonGroup>
            <ControlButton onClick={handlePlayPause}>
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </ControlButton>
            <ControlButton onClick={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = (trimStart / 100) * duration;
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                }
              }
            }}>
              ⏮ Go to Start
            </ControlButton>
          </ButtonGroup>
        </ControlSection>

        <ControlSection>
          <ControlLabel>Trim Video</ControlLabel>
          <TimelineContainer ref={timelineRef}>
            <Timeline>
              <TrimmedArea start={trimStart} end={trimEnd} />
              <TrimHandle 
                start 
                position={trimStart}
                onMouseDown={() => handleMouseDown('start')}
              />
              <TrimHandle 
                end 
                position={trimEnd}
                onMouseDown={() => handleMouseDown('end')}
              />
              <Playhead position={playheadPosition} />
            </Timeline>
          </TimelineContainer>
          <TimeDisplay>
            <span>Start: {formatTime((trimStart / 100) * duration)}</span>
            <span>Duration: {formatTime(((trimEnd - trimStart) / 100) * duration)}</span>
            <span>End: {formatTime((trimEnd / 100) * duration)}</span>
          </TimeDisplay>
        </ControlSection>

        <ControlSection>
          <ControlLabel>Background Music</ControlLabel>
          <FileLabel htmlFor="music-upload">
            {backgroundMusic ? '🎵 Change Music' : '🎵 Add Music'}
          </FileLabel>
          <FileInput
            id="music-upload"
            type="file"
            accept="audio/*"
            onChange={handleMusicUpload}
          />
          {backgroundMusic && (
            <>
              <MusicFileName>📄 {backgroundMusic.name}</MusicFileName>
              <div style={{ marginTop: '12px' }}>
                <ControlLabel>Music Volume: {Math.round(musicVolume * 100)}%</ControlLabel>
                <Slider
                  type="range"
                  value={musicVolume}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                />
              </div>
            </>
          )}
          <div style={{ marginTop: '12px' }}>
            <ControlLabel>Original Audio: {Math.round(originalVolume * 100)}%</ControlLabel>
            <Slider
              type="range"
              value={originalVolume}
              min={0}
              max={1}
              step={0.05}
              onChange={(e) => setOriginalVolume(parseFloat(e.target.value))}
            />
          </div>
        </ControlSection>

        <ActionButtons>
          <ActionButton onClick={onCancel}>Cancel</ActionButton>
          <ActionButton primary onClick={handleSave}>Apply Changes</ActionButton>
        </ActionButtons>
      </ControlsContainer>
    </EditorContainer>
  );
};

export default VideoEditor;
