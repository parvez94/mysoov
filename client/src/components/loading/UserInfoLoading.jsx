import styled, { keyframes } from 'styled-components';

// Pulse animation for loading states
const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`;

// Base loading component
const LoadingBase = styled.div`
  background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);
  background-size: 200% 100%;
  animation: ${pulse} 1.5s ease-in-out infinite;
  border-radius: 4px;
`;

// Avatar loading skeleton
export const LoadingAvatar = styled(LoadingBase)`
  width: ${(props) => props.$size || '40px'};
  height: ${(props) => props.$size || '40px'};
  border-radius: 50%;
  flex-shrink: 0;
  aspect-ratio: 1 / 1;
`;

// Text loading skeleton
export const LoadingText = styled(LoadingBase)`
  height: ${(props) => props.$height || '16px'};
  width: ${(props) => props.$width || '100px'};
  border-radius: 3px;
`;

// User info container for loading states
export const LoadingUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.$gap || '15px'};

  @media (max-width: 768px) {
    gap: ${(props) => props.$mobileGap || '10px'};
  }
`;

// User names container for loading states
export const LoadingUserNames = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

// Navbar specific loading
export const NavbarUserLoading = () => <LoadingAvatar $size='40px' />;

// VideoCard specific loading
export const VideoCardUserLoading = () => (
  <LoadingUserInfo $gap='20px' $mobileGap='15px'>
    <LoadingAvatar $size='56px' />
    <LoadingUserNames>
      <LoadingText $width='120px' $height='18px' />
      <LoadingText $width='80px' $height='14px' />
    </LoadingUserNames>
  </LoadingUserInfo>
);

// Comment specific loading
export const CommentUserLoading = ({ depth = 0 }) => (
  <LoadingUserInfo $gap='25px' $mobileGap='15px'>
    {depth === 1 && <div style={{ width: '60px' }} />}
    <LoadingAvatar $size='40px' />
    <LoadingUserNames>
      <LoadingText $width='100px' $height='15px' />
      <LoadingText $width='70px' $height='13px' />
    </LoadingUserNames>
  </LoadingUserInfo>
);

// Generic user info loading component
export const GenericUserLoading = ({
  avatarSize = '40px',
  displayNameWidth = '120px',
  usernameWidth = '80px',
  gap = '15px',
  mobileGap = '10px',
}) => (
  <LoadingUserInfo $gap={gap} $mobileGap={mobileGap}>
    <LoadingAvatar $size={avatarSize} />
    <LoadingUserNames>
      <LoadingText $width={displayNameWidth} $height='16px' />
      <LoadingText $width={usernameWidth} $height='14px' />
    </LoadingUserNames>
  </LoadingUserInfo>
);
