import React from 'react';
import styled from 'styled-components';
import NotificationsList from '../components/notifications/NotificationsList';
import { HomeSidebar } from '../components/index';

const Container = styled.div`
  display: flex;
  justify-content: space-between;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Wrapper = styled.div`
  flex: 7;
  padding: 20px 50px;

  @media (max-width: 768px) {
    flex: 1;
    padding: 20px;
  }
`;

const Notifications = () => {
  return (
    <Container>
      <Wrapper>
        <NotificationsList />
      </Wrapper>
      <HomeSidebar />
    </Container>
  );
};

export default Notifications;
