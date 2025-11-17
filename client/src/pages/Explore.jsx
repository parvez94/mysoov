import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Card, HomeSidebar, Spinner } from '../components/index';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Wrapper = styled.div`
  flex: 7;
  padding: 20px;
`;

const Explore = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchAllVideos = async () => {
      setIsLoading(true);
      try {
        let allVideos = [];
        
        if (currentUser) {
          const feedsRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/v1/videos/feeds`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              credentials: 'include',
            }
          );
          
          if (feedsRes.ok) {
            const feedsData = await feedsRes.json();
            allVideos = Array.isArray(feedsData) ? feedsData : [];
          }
        }
        
        const randomRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/videos/random`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            credentials: 'omit',
          }
        );
        
        if (randomRes.ok) {
          const randomData = await randomRes.json();
          const randomVideos = Array.isArray(randomData) ? randomData : [];
          
          const feedIds = new Set(allVideos.map(v => v._id || v.id));
          const uniqueRandomVideos = randomVideos.filter(v => !feedIds.has(v._id || v.id));
          
          allVideos = [...allVideos, ...uniqueRandomVideos];
        }
        
        setVideos(allVideos);
      } catch (err) {
        console.error('Error fetching videos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllVideos();
  }, [currentUser]);

  return (
    <Container>
      <Wrapper>
        {isLoading ? (
          <Spinner label='Loading videos' full duration={2} />
        ) : (
          videos.map((video) => <Card key={video._id} video={video} />)
        )}
      </Wrapper>
      <HomeSidebar />
    </Container>
  );
};
export default Explore;
