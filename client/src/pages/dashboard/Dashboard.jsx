import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { MdPeople, MdVideoLibrary, MdNotifications } from 'react-icons/md';

const Container = styled.div`
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Title = styled.h1`
  font-family: var(--secondary-fonts);
  color: var(--primary-color);
  font-size: 32px;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 16px;
  margin-bottom: 40px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: ${(props) => props.$color || 'rgba(255, 255, 255, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  margin-bottom: 8px;
`;

const StatValue = styled.h2`
  font-family: var(--secondary-fonts);
  color: var(--primary-color);
  font-size: 32px;
  font-weight: 600;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-family: var(--secondary-fonts);
  color: var(--primary-color);
  font-size: 20px;
  margin-bottom: 16px;
`;

const InfoText = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  line-height: 1.6;
`;

const Dashboard = () => {
  const { currentUser } = useSelector((state) => state.user);

  // Redirect if not admin
  if (!currentUser || currentUser.role !== 1) {
    return <Navigate to='/' replace />;
  }

  return (
    <Container>
      <Title>Admin Dashboard</Title>
      <Subtitle>
        Welcome back, {currentUser.displayName || currentUser.username}!
      </Subtitle>

      <StatsGrid>
        <StatCard>
          <IconWrapper $color='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'>
            <MdPeople />
          </IconWrapper>
          <StatInfo>
            <StatLabel>Total Users</StatLabel>
            <StatValue>-</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <IconWrapper $color='linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'>
            <MdVideoLibrary />
          </IconWrapper>
          <StatInfo>
            <StatLabel>Total Videos</StatLabel>
            <StatValue>-</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <IconWrapper $color='linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'>
            <MdNotifications />
          </IconWrapper>
          <StatInfo>
            <StatLabel>Notifications Sent</StatLabel>
            <StatValue>-</StatValue>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionTitle>Quick Actions</SectionTitle>
        <InfoText>
          Use the sidebar menu to navigate to different sections:
          <br />• <strong>Users</strong> - Manage all registered users
          <br />• <strong>Posts</strong> - View and manage all video posts
        </InfoText>
      </Section>

      <Section>
        <SectionTitle>System Status</SectionTitle>
        <InfoText>
          All systems operational. Dashboard statistics will be implemented in
          future updates.
        </InfoText>
      </Section>
    </Container>
  );
};

export default Dashboard;
