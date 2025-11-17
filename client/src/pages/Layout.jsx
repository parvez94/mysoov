import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectModal } from '../redux/modal/modalSlice';
import styled from 'styled-components';
import { Outlet, useLocation } from 'react-router-dom';
import { LeftSidebar, Navbar, Modal } from '../components/index';

const Container = styled.div``;

const Main = styled.div`
  background-color: var(--tertiary-color);
  display: flex;
`;
const Wrapper = styled.div`
  flex: 10;
`;

const Layout = () => {
  const { isOpen } = useSelector(selectModal);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Container>
      {isOpen && <Modal />}
      <Navbar />
      <Main>
        <LeftSidebar />
        <Wrapper>
          <Outlet />
        </Wrapper>
      </Main>
    </Container>
  );
};
export default Layout;
