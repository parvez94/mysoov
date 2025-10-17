import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUser } from '../redux/user/userSlice';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 20px;
`;

const Message = styled.div`
  font-size: 18px;
  color: ${({ theme }) => theme.text};
  text-align: center;
  margin-bottom: 20px;
`;

const Spinner = styled.div`
  border: 4px solid ${({ theme }) => theme.soft};
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const RefreshUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const refreshUserData = async () => {
      if (!currentUser) {
        navigate('/');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/find/${currentUser._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Update Redux state with fresh user data
        dispatch(updateUser(response.data));

        // Redirect to home after 1 second
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } catch (error) {
        navigate('/');
      }
    };

    refreshUserData();
  }, [currentUser, dispatch, navigate]);

  return (
    <Container>
      <Spinner />
      <Message>Refreshing your profile data...</Message>
    </Container>
  );
};

export default RefreshUser;
