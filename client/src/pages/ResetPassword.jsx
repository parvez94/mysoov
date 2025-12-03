import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--tertiary-color);
  padding: 20px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
`;

const Title = styled.h1`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 28px;
  text-align: center;
  margin-bottom: 30px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
`;

const Input = styled.input`
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.08);
  font-size: 14px;
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  padding: 12px 15px;
  border-radius: 4px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Button = styled.button`
  font-family: var(--secondary-fonts);
  font-size: 15px;
  font-weight: 500;
  padding: 12px 20px;
  border: none;
  background-color: var(--primary-color);
  color: var(--secondary-color);
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  padding: 12px;
  border-radius: 4px;
  font-family: var(--secondary-fonts);
  font-size: 14px;
  text-align: center;
  background-color: ${props => props.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 0, 0, 0.1)'};
  border: 1px solid ${props => props.success ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 0, 0, 0.3)'};
  color: ${props => props.success ? '#4CAF50' : '#ff6b6b'};
`;

const PasswordRequirements = styled.ul`
  font-family: var(--secondary-fonts);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 5px 0 0 20px;
  
  li {
    margin: 3px 0;
  }
`;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!password || !confirmPassword) {
      setMessage('Please fill in all fields');
      setSuccess(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setSuccess(false);
      return;
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters long');
      setSuccess(false);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/reset-password/${token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage('Password reset successfully! Redirecting to login...');
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setMessage(data.error || 'Failed to reset password');
        setSuccess(false);
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>Reset Password</Title>
        <Form onSubmit={handleSubmit}>
          <InputField>
            <Label>New Password</Label>
            <Input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter new password'
            />
            <PasswordRequirements>
              <li>At least 8 characters long</li>
              <li>Must contain uppercase and lowercase letters</li>
              <li>Must contain at least one number</li>
            </PasswordRequirements>
          </InputField>
          <InputField>
            <Label>Confirm Password</Label>
            <Input
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder='Confirm new password'
            />
          </InputField>
          <Button type='submit' disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
          {message && <Message success={success}>{message}</Message>}
        </Form>
      </Card>
    </Container>
  );
};

export default ResetPassword;
