import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import {
  loginStart,
  loginSuccess,
  loginFailed,
} from '../../redux/user/userSlice';
import { closeModal } from '../../redux/modal/modalSlice';
import ThreeDotsLoader from '../loading/ThreeDotsLoader';

const ModalTop = styled.div`
  padding: 20px 40px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
`;

const Title = styled.h2`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 25px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  text-align: center;
  opacity: 0.8;
  margin-top: -8px;
`;

const Form = styled.form`
  margin-top: 20px;
`;

const InputField = styled.div`
  margin-bottom: 10px;
`;

const Label = styled.label`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  display: block;
  font-size: 14px;
  margin-bottom: 5px;
`;

const Input = styled.input`
  border: 1px solid rgba(255, 255, 255, 0.04);
  background-color: rgba(255, 255, 255, 0.12);
  font-size: 14px;
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  padding: 10px 15px;
  width: 100%;
  border-radius: 3px;

  &:focus {
    outline: none;
  }
`;

const Button = styled.button`
  font-family: var(--secondary-fonts);
  font-size: 15px;
  font-weight: 500;
  width: 100%;
  padding: 10px 20px;
  border: 1px solid var(--primary-color);
  background-color: var(--primary-color);
  color: var(--secondary-color);
  border-radius: 3px;
  cursor: pointer;
  margin-top: 10px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ModalBottom = styled.div`
  border-top: 0.8px solid var(--secondary-color);
  padding: 20px 40px;
`;

const ErrorMessage = styled.div`
  margin-top: 10px;
  padding: 8px 12px;
  background-color: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 3px;
  color: #ff6b6b;
  font-family: var(--secondary-fonts);
  font-size: 13px;
  text-align: center;
`;

const Text = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  text-align: center;
`;

const RegisterEditor = ({ link }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setError('');

    // Basic validation
    if (!name || !email || !phone || !password || !role) {
      setError('Please fill in all fields');
      return;
    }

    if (name.length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const url = `${import.meta.env.VITE_API_URL}/api/v1/auth/signup-editor`;

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        editorRole: role,
      }),
    };

    dispatch(loginStart());

    try {
      const res = await fetch(url, requestOptions);

      if (res.ok) {
        const data = await res.json();
        dispatch(loginSuccess(data));
        dispatch(closeModal());
        // Redirect to happy team dashboard
        navigate('/dashboard/happy-team');
      } else {
        const errorData = await res.json();
        const errorMessage =
          errorData.message ||
          errorData.error ||
          'Registration failed. Please try again.';
        setError(errorMessage);
        dispatch(loginFailed(errorMessage));
      }
    } catch (err) {
      const errorMessage =
        'Network error. Please check your connection and try again.';
      setError(errorMessage);
      dispatch(loginFailed(errorMessage));
    }
  };

  return (
    <>
      <ModalTop>
        <Title>Join Happy Team 🎉</Title>
        <Subtitle>Become a content editor and share amazing moments!</Subtitle>
        <Form>
          <InputField>
            <Label>Name</Label>
            <Input
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
            />
          </InputField>
          <InputField>
            <Label>Email</Label>
            <Input
              type='email'
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
            />
          </InputField>
          <InputField>
            <Label>Phone Number</Label>
            <Input
              type='tel'
              placeholder='+1234567890'
              onChange={(e) => {
                setPhone(e.target.value);
                if (error) setError('');
              }}
            />
          </InputField>
          <InputField>
            <Label>Your Role</Label>
            <Input
              type='text'
              placeholder='e.g., Photographer, Video Editor, Designer'
              onChange={(e) => {
                setRole(e.target.value);
                if (error) setError('');
              }}
            />
          </InputField>
          <InputField>
            <Label>Password</Label>
            <Input
              type='password'
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
            />
          </InputField>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <ThreeDotsLoader /> : 'Join Happy Team'}
          </Button>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </ModalTop>
      <ModalBottom>
        <Text>
          Already have an account? <Link onClick={link}>Log in</Link>
        </Text>
      </ModalBottom>
    </>
  );
};
export default RegisterEditor;
