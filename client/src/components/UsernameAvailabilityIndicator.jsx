import styled, { keyframes } from 'styled-components';
import { FiCheck, FiX, FiLoader } from 'react-icons/fi';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Container = styled.div`
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--secondary-fonts);
  font-size: 13px;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Icon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

const CheckingIcon = styled(Icon)`
  animation: ${spin} 1s linear infinite;
`;

const Message = styled.span`
  color: ${({ $status }) => {
    switch ($status) {
      case 'available':
        return '#4ade80'; // green
      case 'unavailable':
        return '#f87171'; // red
      case 'checking':
        return 'rgba(255, 255, 255, 0.7)'; // neutral
      case 'error':
        return '#fbbf24'; // yellow
      default:
        return 'rgba(255, 255, 255, 0.7)';
    }
  }};
`;

const UsernameAvailabilityIndicator = ({
  status,
  message,
  isVisible = true,
}) => {
  if (!isVisible || status === 'idle' || !message) {
    return null;
  }

  const renderIcon = () => {
    switch (status) {
      case 'checking':
        return (
          <CheckingIcon>
            <FiLoader size={14} color='rgba(255, 255, 255, 0.7)' />
          </CheckingIcon>
        );
      case 'available':
        return (
          <Icon>
            <FiCheck size={14} color='#4ade80' />
          </Icon>
        );
      case 'unavailable':
      case 'error':
        return (
          <Icon>
            <FiX size={14} color='#f87171' />
          </Icon>
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      {renderIcon()}
      <Message $status={status}>{message}</Message>
    </Container>
  );
};

export default UsernameAvailabilityIndicator;
