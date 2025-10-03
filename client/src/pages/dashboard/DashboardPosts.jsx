import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
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
  margin-bottom: 30px;
`;

const SearchBar = styled.input`
  width: 100%;
  max-width: 500px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--primary-color);
  font-family: var(--primary-fonts);
  font-size: 14px;
  margin-bottom: 24px;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
  }

  &::placeholder {
    color: var(--secondary-color);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const VideoCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-4px);
  }
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.1);
`;

const VideoInfo = styled.div`
  padding: 16px;
`;

const VideoTitle = styled.h3`
  font-family: var(--secondary-fonts);
  color: var(--primary-color);
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const VideoMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const DefaultAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: var(--secondary-fonts);
  font-weight: 600;
  font-size: 14px;
`;

const ChannelName = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 13px;
`;

const Stats = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
`;

const Stat = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 12px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const ViewButton = styled(Link)`
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  text-decoration: none;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
  grid-column: 1 / -1;
`;

const ErrorMessage = styled.div`
  padding: 20px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  color: #f44336;
  font-family: var(--primary-fonts);
  margin-bottom: 20px;
`;

const DashboardPosts = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not admin
  if (!currentUser || currentUser.role !== 1) {
    return <Navigate to='/' replace />;
  }

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVideos(videos);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = videos.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          (video.description &&
            video.description.toLowerCase().includes(query)) ||
          (video.userId?.username &&
            video.userId.username.toLowerCase().includes(query))
      );
      setFilteredVideos(filtered);
    }
  }, [searchQuery, videos]);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('/api/admin/videos', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setVideos(response.data.videos || []);
      setFilteredVideos(response.data.videos || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err.response?.data?.message || 'Failed to load videos');
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
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
      <Title>Posts Management</Title>
      <Subtitle>View and manage all video posts</Subtitle>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <SearchBar
        type='text'
        placeholder='Search by title, description, or channel...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <Grid>
        {filteredVideos.length === 0 ? (
          <EmptyState>
            {searchQuery
              ? 'No videos found matching your search'
              : 'No videos found'}
          </EmptyState>
        ) : (
          filteredVideos.map((video) => (
            <VideoCard key={video._id}>
              <Thumbnail
                src={video.thumbnail || '/default-thumbnail.jpg'}
                alt={video.title}
              />
              <VideoInfo>
                <VideoTitle>{video.title}</VideoTitle>

                <VideoMeta>
                  {video.userId?.displayImage ? (
                    <Avatar
                      src={video.userId.displayImage}
                      alt={video.userId.username}
                    />
                  ) : (
                    <DefaultAvatar>
                      {(
                        video.userId?.displayName ||
                        video.userId?.username ||
                        'U'
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </DefaultAvatar>
                  )}
                  <ChannelName>
                    {video.userId?.displayName ||
                      video.userId?.username ||
                      'Unknown'}
                  </ChannelName>
                </VideoMeta>

                <Stats>
                  <Stat>{formatNumber(video.views || 0)} views</Stat>
                  <Stat>•</Stat>
                  <Stat>{formatNumber(video.likes || 0)} likes</Stat>
                  <Stat>•</Stat>
                  <Stat>{formatDate(video.createdAt)}</Stat>
                </Stats>

                <ActionButtons>
                  <ViewButton to={`/video/${video._id}`}>View</ViewButton>
                  <ActionButton>Edit</ActionButton>
                </ActionButtons>
              </VideoInfo>
            </VideoCard>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default DashboardPosts;
