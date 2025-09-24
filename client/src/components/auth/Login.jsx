import { useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import {
  loginStart,
  loginSuccess,
  loginFailed,
} from '../../redux/user/userSlice';
import { closeModal } from '../../redux/modal/modalSlice';

const ModalTop = styled.div`
  padding: 20px 40px;
  min-height: 0; /* let content size itself */
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
`;

const ModalBottom = styled.div`
  border-top: 0.8px solid var(--secondary-color);
  padding: 20px 40px;
`;

const Text = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  text-align: center;
`;

const Login = ({ link }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = `${import.meta.env.VITE_API_URL}/api/v1/auth/signin`;

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
      }),
    };

    dispatch(loginStart());

    try {
      const res = await fetch(url, requestOptions);

      if (res.ok) {
        const data = await res.json();
        dispatch(loginSuccess(data));
        dispatch(closeModal());
      } else {
        console.error('Error:', res.statusText);
      }
    } catch (err) {
      dispatch(loginFailed(err));
    }
  };

  return (
    <>
      <ModalTop>
        <Title>Sign in</Title>
        <Form>
          <InputField>
            <Label>Email</Label>
            <Input type='email' onChange={(e) => setEmail(e.target.value)} />
          </InputField>
          <InputField>
            <Label>Password</Label>
            <Input
              type='password'
              onChange={(e) => setPassword(e.target.value)}
            />
          </InputField>
          <Button onClick={handleSubmit}>Log in</Button>
        </Form>
      </ModalTop>
      <ModalBottom>
        <Text>
          Don’t have an account? <Link onClick={link}>Sign up</Link>
        </Text>
      </ModalBottom>
    </>
  );
};
export default Login;
