import React from 'react';
import styled from 'styled-components';
import SoundToggle from '../components/settings/SoundToggle';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  color: #fff;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-family: var(--secondary-fonts);
  font-size: 28px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-family: var(--primary-fonts);
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
`;

const Section = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h2`
  font-family: var(--secondary-fonts);
  font-size: 20px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionDescription = styled.p`
  font-family: var(--primary-fonts);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 20px;
  line-height: 1.5;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const SettingLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SettingName = styled.span`
  font-family: var(--secondary-fonts);
  font-size: 16px;
  font-weight: 500;
  color: #fff;
`;

const SettingDescription = styled.span`
  font-family: var(--primary-fonts);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
`;

const ComingSoon = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-family: var(--primary-fonts);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Settings = () => {
  return (
    <Container>
      <Header>
        <Title>Settings</Title>
        <Subtitle>Manage your account preferences and notifications</Subtitle>
      </Header>

      <Section>
        <SectionTitle>🔔 Notifications</SectionTitle>
        <SectionDescription>
          Control how you receive notifications and manage sound preferences.
        </SectionDescription>

        <SettingItem>
          <SettingLabel>
            <SettingName>Notification Sounds</SettingName>
            <SettingDescription>
              Play sounds for new messages and notifications
            </SettingDescription>
          </SettingLabel>
          <SoundToggle showLabel={false} />
        </SettingItem>
      </Section>

      <Section>
        <SectionTitle>🎨 Appearance</SectionTitle>
        <SectionDescription>
          Customize the look and feel of your Mysoov experience.
        </SectionDescription>

        <SettingItem>
          <SettingLabel>
            <SettingName>Theme</SettingName>
            <SettingDescription>
              Choose between light and dark themes
            </SettingDescription>
          </SettingLabel>
          <ComingSoon>Coming Soon</ComingSoon>
        </SettingItem>
      </Section>

      <Section>
        <SectionTitle>🔒 Privacy</SectionTitle>
        <SectionDescription>
          Control your privacy settings and data preferences.
        </SectionDescription>

        <SettingItem>
          <SettingLabel>
            <SettingName>Profile Visibility</SettingName>
            <SettingDescription>
              Control who can see your profile and videos
            </SettingDescription>
          </SettingLabel>
          <ComingSoon>Coming Soon</ComingSoon>
        </SettingItem>

        <SettingItem>
          <SettingLabel>
            <SettingName>Activity Status</SettingName>
            <SettingDescription>
              Show when you're online to other users
            </SettingDescription>
          </SettingLabel>
          <ComingSoon>Coming Soon</ComingSoon>
        </SettingItem>
      </Section>

      <Section>
        <SectionTitle>📱 Account</SectionTitle>
        <SectionDescription>
          Manage your account settings and preferences.
        </SectionDescription>

        <SettingItem>
          <SettingLabel>
            <SettingName>Email Notifications</SettingName>
            <SettingDescription>
              Receive email updates about your account activity
            </SettingDescription>
          </SettingLabel>
          <ComingSoon>Coming Soon</ComingSoon>
        </SettingItem>

        <SettingItem>
          <SettingLabel>
            <SettingName>Two-Factor Authentication</SettingName>
            <SettingDescription>
              Add an extra layer of security to your account
            </SettingDescription>
          </SettingLabel>
          <ComingSoon>Coming Soon</ComingSoon>
        </SettingItem>
      </Section>
    </Container>
  );
};

export default Settings;
