import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { MdEmail, MdSave } from 'react-icons/md';
import ThreeDotsLoader from '../../components/loading/ThreeDotsLoader';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 10px;
  font-family: var(--primary-fonts);
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #999;
  font-family: var(--secondary-fonts);
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--primary-fonts);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--secondary-color);
  margin-bottom: 8px;
  font-family: var(--secondary-fonts);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--secondary-color);
  font-size: 14px;
  font-family: var(--secondary-fonts);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--secondary-color);
  font-size: 14px;
  font-family: var(--secondary-fonts);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Toggle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.checked ? 'var(--primary-color)' : '#ccc'};
  transition: 0.4s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: '';
    height: 18px;
    width: 18px;
    left: ${props => props.checked ? '28px' : '3px'};
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: var(--secondary-fonts);
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  font-family: var(--secondary-fonts);
  background-color: ${props => props.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 0, 0, 0.1)'};
  border: 1px solid ${props => props.success ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 0, 0, 0.3)'};
  color: ${props => props.success ? '#4CAF50' : '#ff6b6b'};
`;

const InfoText = styled.p`
  font-size: 13px;
  color: #999;
  margin-top: 6px;
  font-family: var(--secondary-fonts);
`;

const TestEmailSection = styled.div`
  margin-top: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const DashboardEmailSettings = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testSuccess, setTestSuccess] = useState(false);

  const [config, setConfig] = useState({
    enabled: false,
    host: '',
    port: 587,
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'MySoov',
  });

  useEffect(() => {
    fetchEmailConfig();
  }, []);

  const fetchEmailConfig = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/admin/email-config`,
        { withCredentials: true }
      );
      if (res.data.emailConfig) {
        setConfig(res.data.emailConfig);
      }
    } catch (err) {
      console.error('Error fetching email config:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      console.log('Saving email config:', {
        enabled: config.enabled,
        host: config.host,
        port: config.port,
        username: config.username,
        passwordLength: config.password?.length,
        fromEmail: config.fromEmail
      });

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/v1/admin/email-config`,
        { emailConfig: config },
        { withCredentials: true }
      );

      if (res.data.success) {
        setMessage('✅ Email settings saved successfully!');
        setSuccess(true);
        // Reload config to get masked password
        await fetchEmailConfig();
      }
    } catch (err) {
      console.error('Save error:', err.response?.data);
      setMessage(err.response?.data?.error || 'Failed to save settings');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setTestMessage('');
    setTestLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/admin/test-email`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        setTestMessage('Test email sent successfully! Check your inbox.');
        setTestSuccess(true);
      }
    } catch (err) {
      setTestMessage(err.response?.data?.error || 'Failed to send test email');
      setTestSuccess(false);
    } finally {
      setTestLoading(false);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to='/' />;
  }

  return (
    <Container>
      <Header>
        <Title>Email Settings</Title>
        <Subtitle>Configure SMTP settings for sending emails</Subtitle>
      </Header>

      <Section>
        <SectionTitle>
          <MdEmail size={24} />
          SMTP Configuration
        </SectionTitle>

        {message && <Message success={success}>{message}</Message>}

        <form onSubmit={handleSubmit}>
          <Toggle>
            <ToggleSwitch>
              <ToggleInput
                type='checkbox'
                name='enabled'
                checked={config.enabled}
                onChange={handleChange}
              />
              <ToggleSlider checked={config.enabled} />
            </ToggleSwitch>
            <ToggleLabel>Enable Email System</ToggleLabel>
          </Toggle>

          <FormGroup>
            <Label>SMTP Host</Label>
            <Input
              type='text'
              name='host'
              value={config.host}
              onChange={handleChange}
              placeholder='smtp.gmail.com'
              disabled={!config.enabled}
            />
            <InfoText>Your SMTP server hostname (e.g., smtp.gmail.com, smtp.sendgrid.net)</InfoText>
          </FormGroup>

          <FormGroup>
            <Label>SMTP Port</Label>
            <Select
              name='port'
              value={config.port}
              onChange={handleChange}
              disabled={!config.enabled}
            >
              <option value={587}>587 (TLS)</option>
              <option value={465}>465 (SSL)</option>
              <option value={25}>25 (Non-secure)</option>
            </Select>
            <InfoText>587 is recommended for most SMTP providers</InfoText>
          </FormGroup>

          <FormGroup>
            <Label>Username / Email</Label>
            <Input
              type='text'
              name='username'
              value={config.username}
              onChange={handleChange}
              placeholder='your-email@example.com'
              disabled={!config.enabled}
            />
            <InfoText>Your SMTP authentication username (usually your email address)</InfoText>
          </FormGroup>

          <FormGroup>
            <Label>Password / App Password</Label>
            <Input
              type='text'
              name='password'
              value={config.password}
              onChange={handleChange}
              placeholder='Enter SMTP password or app password'
              disabled={!config.enabled}
              autoComplete='off'
            />
            <InfoText>
              Gmail: Paste App Password exactly as shown (including spaces if any).
              {config.password === '••••••••' && ' Current password saved. Enter new to update.'}
            </InfoText>
          </FormGroup>

          <FormGroup>
            <Label>From Email</Label>
            <Input
              type='email'
              name='fromEmail'
              value={config.fromEmail}
              onChange={handleChange}
              placeholder='noreply@mysoov.com'
              disabled={!config.enabled}
            />
            <InfoText>Email address that will appear as sender</InfoText>
          </FormGroup>

          <FormGroup>
            <Label>From Name</Label>
            <Input
              type='text'
              name='fromName'
              value={config.fromName}
              onChange={handleChange}
              placeholder='MySoov'
              disabled={!config.enabled}
            />
            <InfoText>Name that will appear as sender</InfoText>
          </FormGroup>

          <Button type='submit' disabled={loading || !config.enabled}>
            {loading ? <ThreeDotsLoader /> : (
              <>
                <MdSave size={18} />
                Save Settings
              </>
            )}
          </Button>
        </form>

        {config.enabled && (
          <TestEmailSection>
            <SectionTitle style={{ fontSize: '16px', marginBottom: '12px' }}>
              Test Email Configuration
            </SectionTitle>
            {testMessage && <Message success={testSuccess}>{testMessage}</Message>}
            <Button onClick={handleTestEmail} disabled={testLoading}>
              {testLoading ? <ThreeDotsLoader /> : 'Send Test Email'}
            </Button>
            <InfoText style={{ marginTop: '12px' }}>
              This will send a test email to your admin account ({currentUser.email})
            </InfoText>
          </TestEmailSection>
        )}
      </Section>
    </Container>
  );
};

export default DashboardEmailSettings;
