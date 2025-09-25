import styled from 'styled-components';

const Container = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

const VideoSidebar = () => {
  return <Container>VideoSidebar</Container>;
};
export default VideoSidebar;
