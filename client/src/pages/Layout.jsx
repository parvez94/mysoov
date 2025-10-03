import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectModal } from '../redux/modal/modalSlice';
import styled from 'styled-components';
import { Outlet, useLocation } from 'react-router-dom';
import { LeftSidebar, Navbar, Modal } from '../components/index';
import { SocketProvider } from '../contexts/SocketContext';

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
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <SocketProvider>
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
    </SocketProvider>
  );
};
export default Layout;
