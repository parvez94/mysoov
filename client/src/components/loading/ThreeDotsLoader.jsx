import styled, { keyframes } from 'styled-components';

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
`;

const LoaderContainer = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const Dot = styled.div`
  width: 6px;
  height: 6px;
  background-color: var(--secondary-color);
  border-radius: 50%;
  animation: ${bounce} 1.4s ease-in-out infinite both;

  &:nth-child(1) {
    animation-delay: -0.32s;
  }

  &:nth-child(2) {
    animation-delay: -0.16s;
  }

  &:nth-child(3) {
    animation-delay: 0s;
  }
`;

const ThreeDotsLoader = () => {
  return (
    <LoaderContainer>
      <Dot />
      <Dot />
      <Dot />
    </LoaderContainer>
  );
};

export default ThreeDotsLoader;
