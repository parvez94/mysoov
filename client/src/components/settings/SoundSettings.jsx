import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  getSoundEnabled,
  getSoundVolume,
  setSoundEnabled,
  setSoundVolume,
  playNotificationSound,
  playMessageSound,
} from '../../utils/soundUtils';

const Container = styled.div`
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-family: var(--secondary-fonts);
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingLabel = styled.label`
  font-family: var(--primary-fonts);
  color: var(--text-color);
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const ToggleSwitch = styled.div`
  position: relative;
  width: 50px;
  height: 24px;
  background-color: ${(props) =>
    props.enabled ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${(props) => (props.enabled ? '26px' : '2px')};
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    transition: left 0.3s ease;
  }
`;

const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  pointer-events: ${(props) => (props.disabled ? 'none' : 'auto')};
`;

const VolumeSlider = styled.input`
  width: 120px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  -webkit-appearance: none;

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

const VolumeLabel = styled.span`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  min-width: 30px;
`;

const TestButton = styled.button`
  background: none;
  border: 1px solid var(--secondary-color);
  color: var(--secondary-color);
  padding: 6px 12px;
  border-radius: 6px;
  font-family: var(--secondary-fonts);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  pointer-events: ${(props) => (props.disabled ? 'none' : 'auto')};

  &:hover {
    background-color: var(--secondary-color);
    color: var(--tertiary-color);
    transform: translateY(-1px);
  }
`;

const SoundSettings = () => {
  const [soundEnabled, setSoundEnabledState] = useState(getSoundEnabled());
  const [volume, setVolumeState] = useState(getSoundVolume());

  useEffect(() => {
    // Sync with stored preferences on mount
    setSoundEnabledState(getSoundEnabled());
    setVolumeState(getSoundVolume());
  }, []);

  const handleToggleSound = () => {
    const newEnabled = !soundEnabled;
    setSoundEnabledState(newEnabled);
    setSoundEnabled(newEnabled);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolumeState(newVolume);
    setSoundVolume(newVolume);
  };

  const testNotificationSound = () => {
    playNotificationSound();
  };

  const testMessageSound = () => {
    playMessageSound();
  };

  return (
    <Container>
      <Title>🔊 Sound Settings</Title>

      <SettingRow>
        <SettingLabel>Enable notification sounds</SettingLabel>
        <ToggleSwitch enabled={soundEnabled} onClick={handleToggleSound} />
      </SettingRow>

      <SettingRow>
        <SettingLabel>Volume</SettingLabel>
        <VolumeContainer disabled={!soundEnabled}>
          <VolumeSlider
            type='range'
            min='0'
            max='1'
            step='0.1'
            value={volume}
            onChange={handleVolumeChange}
            disabled={!soundEnabled}
          />
          <VolumeLabel>{Math.round(volume * 100)}%</VolumeLabel>
        </VolumeContainer>
      </SettingRow>

      <SettingRow>
        <SettingLabel>Test notification sound</SettingLabel>
        <TestButton onClick={testNotificationSound} disabled={!soundEnabled}>
          Test
        </TestButton>
      </SettingRow>

      <SettingRow>
        <SettingLabel>Test message sound</SettingLabel>
        <TestButton onClick={testMessageSound} disabled={!soundEnabled}>
          Test
        </TestButton>
      </SettingRow>
    </Container>
  );
};

export default SoundSettings;
