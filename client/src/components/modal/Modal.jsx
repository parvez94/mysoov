import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, selectModal } from '../../redux/modal/modalSlice';
import styled from 'styled-components';
import Login from '../auth/Login';
import Register from '../auth/Register';
import RegisterEditor from '../auth/RegisterEditor';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';

const ModalWrapper = styled.div`
  position: fixed;
  inset: 0; /* top:0; right:0; bottom:0; left:0 */
  width: 100vw;
  height: 100dvh; /* ensure full viewport height on mobile */
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2147483647; /* sit above everything including navbars */
  padding: 16px; /* breathing room on small screens */
  overflow: auto; /* allow scroll when content is taller */
`;

const ModalContent = styled.div`
  position: relative; /* anchor close button */
  background-color: var(--tertiary-color);
  width: min(400px, 100%);
  max-height: 90dvh; /* avoid exceeding short screens */
  border-radius: 10px;
  overflow: auto; /* scroll within modal if needed */
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: var(--secondary-color);
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Modal = () => {
  const { modalType } = useSelector(selectModal);
  const [activeForm, setActiveForm] = useState(modalType || 'login');
  const dispatch = useDispatch();

  // Update activeForm when modalType changes
  useEffect(() => {
    setActiveForm(modalType || 'login');
  }, [modalType]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      dispatch(closeModal());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Disable background scroll while modal is open
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [dispatch]);

  const handleCloseModal = (e) => {
    if (e.target === e.currentTarget) {
      dispatch(closeModal());
    }
  };

  const switchToLogin = () => {
    setActiveForm('login');
  };

  const switchToReg = () => {
    setActiveForm('register');
  };

  const content = (
    <ModalWrapper onClick={handleCloseModal} role='dialog' aria-modal='true'>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={() => dispatch(closeModal())} aria-label='Close'>
          <IoClose size={22} />
        </CloseButton>
        {activeForm === 'login' && <Login link={switchToReg} />}
        {activeForm === 'register' && <Register link={switchToLogin} />}
        {activeForm === 'register-editor' && (
          <RegisterEditor link={switchToLogin} />
        )}
        {activeForm === 'happy-team-login' && <Login link={switchToLogin} accountType='happy-team' />}
      </ModalContent>
    </ModalWrapper>
  );

  // Render at the document.body level so it truly overlays entire app
  return createPortal(content, document.body);
};

export default Modal;
