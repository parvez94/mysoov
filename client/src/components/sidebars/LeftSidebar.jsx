import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { IoIosHome } from 'react-icons/io';
import { RiUserFollowLine } from 'react-icons/ri';
import { MdOutlineExplore } from 'react-icons/md';
import { LuUser2 } from 'react-icons/lu';
import { AiOutlineUpload } from 'react-icons/ai';
import { openModal } from '../../redux/modal/modalSlice';

const Container = styled.div`
  position: sticky;
  top: var(--navbar-h);
  padding: 20px 50px 20px 20px;
  height: calc(var(--vh, 1vh) * 100 - var(--navbar-h));
  overflow: auto;
  display: flex;
  flex-direction: column;
  flex: 2;
  border-right: 0.5px solid rgba(255, 255, 255, 0.2);
`;
const Nav = styled.nav`
  padding-bottom: 60px;
`;
const NavItem = styled.div`
  font-family: var(--secondary-fonts);
  font-weight: 600;
  font-size: 20px;
  padding: 15px 5px;
  color: var(--secondary-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Wrapper = styled.div`
  border-top: 0.5px solid rgba(255, 255, 255, 0.2);
  padding: 20px 0;
`;
const Text = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
`;
const Button = styled.button`
  font-family: var(--secondary-fonts);
  background-color: transparent;
  border: 2px solid var(--secondary-color);
  color: var(--secondary-color);
  margin-top: 20px;
  display: block;
  width: 100%;
  padding: 10px;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.6px;
  cursor: pointer;
  border-radius: 3px;
`;

const Footer = styled.div`
  margin-top: auto; /* push footer to the bottom within flex column */
  padding-top: 20px;
`;
const FooterText = styled.p`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
`;

const LeftSidebar = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  // Prevent navigation for guests and open login modal instead
  const guardClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      dispatch(openModal());
    }
  };

  const handleOpenModal = () => dispatch(openModal());

  return (
    <Container>
      <Nav>
        <Link to='/'>
          <NavItem>
            <IoIosHome />
            Home
          </NavItem>
        </Link>
        <Link to='following' onClick={guardClick}>
          <NavItem>
            <RiUserFollowLine />
            Following
          </NavItem>
        </Link>
        <Link to='explore' onClick={guardClick}>
          <NavItem>
            <MdOutlineExplore />
            Explore
          </NavItem>
        </Link>
        {currentUser && (
          <Link to='upload'>
            <NavItem>
              <AiOutlineUpload />
              Upload
            </NavItem>
          </Link>
        )}
        {currentUser ? (
          <Link to={`/${currentUser.username}`}>
            <NavItem>
              <LuUser2 />
              Profile
            </NavItem>
          </Link>
        ) : (
          <Link to='profile' onClick={guardClick}>
            <NavItem>
              <LuUser2 />
              Profile
            </NavItem>
          </Link>
        )}
      </Nav>
      {!currentUser && (
        <Wrapper>
          <Text>Log in to upload videos, like and view comments.</Text>
          <Button onClick={handleOpenModal}>Log in</Button>
        </Wrapper>
      )}

      <Footer>
        <FooterText>&copy; 2025 Mysoov.TV</FooterText>
      </Footer>
    </Container>
  );
};
export default LeftSidebar;
