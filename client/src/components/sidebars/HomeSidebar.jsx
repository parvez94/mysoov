import styled from 'styled-components';

const Container = styled.div`
  padding: 20px 20px 20px 50px;
  flex: 2;

  @media (max-width: 768px) {
    display: none;
  }
`;

const RightSidebar = () => {
  return <Container>right</Container>;
};
export default RightSidebar;
