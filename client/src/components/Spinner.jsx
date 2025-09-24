import styled, { keyframes } from 'styled-components';

// Simple, reusable ring spinner
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Box = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: ${({ pad }) => (pad ? '40px 0' : '0')};
  /* When full prop is true, take available space to center absolutely */
  width: ${({ full }) => (full ? '100%' : 'auto')};
  min-height: ${({ full }) => (full ? '50vh' : 'auto')};
`;

const Ring = styled.div`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border: ${({ thickness }) => thickness}px solid rgba(255, 255, 255, 0.15);
  border-top-color: ${({ color }) => color || 'var(--secondary-color)'};
  border-radius: 50%;
  animation: ${spin} ${({ duration }) => duration || 0.9}s linear infinite;
`;

const Label = styled.span`
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  font-size: 16px;
`;

// Props: size, thickness, color, pad, label, full (center with min height), duration (seconds)
const Spinner = ({
  size = 40,
  thickness = 4,
  color,
  pad = true,
  label,
  full = false,
  duration = 0.9,
}) => {
  return (
    <Box
      pad={pad}
      full={full}
      role='status'
      aria-live='polite'
      aria-busy='true'
    >
      <Ring
        size={size}
        thickness={thickness}
        color={color}
        duration={duration}
      />
      {label ? <Label>{label}</Label> : null}
    </Box>
  );
};

export default Spinner;
