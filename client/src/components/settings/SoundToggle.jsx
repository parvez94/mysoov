import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  getSoundEnabled,
  setSoundEnabled,
  playMessageSound,
} from '../../utils/soundUtils';

const ToggleButton = styled.button`
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: ${(props) =>
    props.enabled ? 'var(--primary-color)' : 'var(--secondary-color)'};
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  min-width: 36px;
  height: 36px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SoundToggle = ({ showLabel = false }) => {
  const [soundEnabled, setSoundEnabledState] = useState(getSoundEnabled());

  useEffect(() => {
    // Sync with stored preferences on mount
    setSoundEnabledState(getSoundEnabled());
  }, []);

  const handleToggle = () => {
    const newEnabled = !soundEnabled;
    setSoundEnabledState(newEnabled);
    setSoundEnabled(newEnabled);

    // Play a test sound when enabling
    if (newEnabled) {
      setTimeout(() => playMessageSound(), 100);
    }
  };

  return (
    <ToggleButton
      enabled={soundEnabled}
      onClick={handleToggle}
      title={
        soundEnabled
          ? 'Disable sound notifications'
          : 'Enable sound notifications'
      }
    >
      {soundEnabled ? '🔊' : '🔇'}
      {showLabel && (
        <span style={{ marginLeft: '8px', fontSize: '14px' }}>
          {soundEnabled ? 'On' : 'Off'}
        </span>
      )}
    </ToggleButton>
  );
};

export default SoundToggle;
