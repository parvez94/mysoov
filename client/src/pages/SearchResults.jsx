import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { Card } from '../components';

const Container = styled.div`
  padding: 20px;
  min-height: calc(100vh - var(--navbar-h));
`;

const Title = styled.h2`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-family: var(--secondary-fonts);
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin-bottom: 30px;
`;

const CodeBadge = styled.span`
  background: var(--primary-color);
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-family: var(--secondary-fonts);
  font-weight: 600;
  font-size: 14px;
`;

const VideosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Message = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-family: var(--secondary-fonts);
  font-size: 16px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
  color: var(--primary-color);
  font-family: var(--secondary-fonts);
`;

const ErrorMessage = styled.div`
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  color: #f44336;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-family: var(--secondary-fonts);
`;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/videos/search`,
          {
            params: { code: query },
            withCredentials: true,
          }
        );

        setVideos(response.data);
      } catch (err) {
        console.error('Search error:', err);
        setError(
          err.response?.data?.message ||
            'Failed to search videos. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [query]);

  if (!query) {
    return (
      <Container>
        <Message>Please enter an access code to search.</Message>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Searching...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Title>
        Search Results for: <CodeBadge>{query}</CodeBadge>
      </Title>
      <Subtitle>
        {videos.length > 0
          ? `Found ${videos.length} video${videos.length !== 1 ? 's' : ''}`
          : 'No videos found with this access code'}
      </Subtitle>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {videos.length > 0 ? (
        <VideosGrid>
          {videos.map((video) => (
            <Card key={video._id} video={video} />
          ))}
        </VideosGrid>
      ) : (
        <Message>
          No videos found with access code "{query}".
          <br />
          <br />
          Make sure you have the correct code and try again.
        </Message>
      )}
    </Container>
  );
};

export default SearchResults;
