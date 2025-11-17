import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const Container = styled.div`
  min-height: calc(100vh - var(--navbar-h));
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--tertiary-color);
  padding: 2rem;
`;

const Content = styled.div`
  text-align: center;
  max-width: 600px;
  width: 100%;
`;

const IconWrapper = styled.div`
  font-size: 80px;
  color: var(--primary-color);
  margin-bottom: 1rem;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  @media (max-width: 768px) {
    font-size: 60px;
  }
`;

const Title = styled.h1`
  font-size: 120px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
  line-height: 1;
  font-family: 'Poppins', sans-serif;

  @media (max-width: 768px) {
    font-size: 80px;
  }
`;

const Subtitle = styled.h2`
  font-size: 32px;
  font-weight: 600;
  color: var(--text-light);
  margin: 1rem 0;
  font-family: 'Poppins', sans-serif;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Message = styled.p`
  font-size: 18px;
  color: var(--text-secondary);
  margin: 1.5rem 0 2.5rem;
  line-height: 1.6;
  font-family: 'IBM Plex Sans', sans-serif;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const HomeButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'IBM Plex Sans', sans-serif;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(202, 8, 6, 0.3);

  &:hover {
    background-color: #a80605;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(202, 8, 6, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 14px;
  }
`;

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Container>
      <Content>
        <IconWrapper>
          <FaExclamationTriangle />
        </IconWrapper>
        <Title>404</Title>
        <Subtitle>Page Not Found</Subtitle>
        <Message>
          Oops! The page you're looking for doesn't exist. It might have been
          removed, renamed, or didn't exist in the first place.
        </Message>
        <HomeButton onClick={handleGoHome}>
          <FaHome />
          Back to Home
        </HomeButton>
      </Content>
    </Container>
  );
};

export default NotFound;
