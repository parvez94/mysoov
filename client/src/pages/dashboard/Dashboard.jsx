import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { MdPeople, MdVideoLibrary, MdSettings } from 'react-icons/md';
import { HiOutlineNewspaper } from 'react-icons/hi2';
import { Spinner } from '../../components/index';

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

const StatCard = styled(Link)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVideos: 0,
    totalArticles: 0,
    totalViews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to='/' replace />;
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/stats`,
        {
          withCredentials: true,
        }
      );
      console.log('Dashboard stats response:', response.data);
      setStats(
        response.data.stats || {
          totalUsers: 0,
          totalVideos: 0,
          totalArticles: 0,
          totalViews: 0,
        }
      );
    } catch (err) {
      console.error('Error fetching stats:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <Container>
        <Spinner />
      </Container>
    );
  }

  return (
    <Container>
      <Title>Admin Dashboard</Title>
      <Subtitle>
        Welcome back, {currentUser.displayName || currentUser.username}!
      </Subtitle>

      <StatsGrid>
        <StatCard to='/dashboard/users'>
          <IconWrapper $color='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'>
            <MdPeople />
          </IconWrapper>
          <StatInfo>
            <StatLabel>Total Users</StatLabel>
            <StatValue>{formatNumber(stats.totalUsers || 0)}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard to='/dashboard/posts'>
          <IconWrapper $color='linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'>
            <MdVideoLibrary />
          </IconWrapper>
          <StatInfo>
            <StatLabel>Total Posts</StatLabel>
            <StatValue>{formatNumber(stats.totalVideos || 0)}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard to='/dashboard/articles'>
          <IconWrapper $color='linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'>
            <HiOutlineNewspaper />
          </IconWrapper>
          <StatInfo>
            <StatLabel>Total Articles</StatLabel>
            <StatValue>{formatNumber(stats.totalArticles || 0)}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard to='/dashboard/settings'>
          <IconWrapper $color='linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'>
            <MdSettings />
          </IconWrapper>
          <StatInfo>
            <StatLabel>Admin Settings</StatLabel>
            <StatValue>→</StatValue>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionTitle>Quick Actions</SectionTitle>
        <InfoText>
          Click on the cards above to navigate to different sections:
          <br />• <strong>Total Users</strong> - Manage all registered users (
          {formatNumber(stats.totalUsers || 0)})
          <br />• <strong>Total Posts</strong> - View and manage all posts
          (videos & images) ({formatNumber(stats.totalVideos || 0)})
          <br />• <strong>Total Articles</strong> - View and manage all blog
          articles ({formatNumber(stats.totalArticles || 0)})
          <br />• <strong>Admin Settings</strong> - Configure admin permissions
        </InfoText>
      </Section>

      <Section>
        <SectionTitle>System Status</SectionTitle>
        <InfoText>
          All systems operational. Total views:{' '}
          {formatNumber(stats.totalViews || 0)}
        </InfoText>
      </Section>
    </Container>
  );
};

export default Dashboard;
