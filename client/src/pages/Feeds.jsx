import { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
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

const LoadingMore = styled.div`
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-family: var(--secondary-fonts);
`;

const Feeds = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef();

  const lastVideoRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore]
  );

  useEffect(() => {
    const fetchVideos = async () => {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        let allVideos = [];
        
        if (currentUser) {
          const feedsRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/v1/videos/feeds?page=${page}&limit=20`,
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
          `${import.meta.env.VITE_API_URL}/api/v1/videos/random?page=${page}&limit=20`,
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
        
        if (allVideos.length === 0) {
          setHasMore(false);
        } else {
          setVideos((prev) => {
            const existingIds = new Set(prev.map(v => v._id || v.id));
            const newVideos = allVideos.filter(v => !existingIds.has(v._id || v.id));
            return [...prev, ...newVideos];
          });
        }
      } catch (err) {
        console.error('Error fetching videos:', err);
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
      }
    };

    fetchVideos();
  }, [currentUser, page]);

  const handleVideoDelete = (videoId) => {
    setVideos((prevVideos) => prevVideos.filter((v) => v._id !== videoId));
  };

  return (
    <Container>
      <Wrapper>
        {isLoading ? (
          <Spinner label='Loading videos' full duration={2} />
        ) : (
          <>
            {videos.map((video, index) => {
              if (videos.length === index + 1) {
                return (
                  <div ref={lastVideoRef} key={video._id}>
                    <Card video={video} onVideoDelete={handleVideoDelete} />
                  </div>
                );
              } else {
                return <Card key={video._id} video={video} onVideoDelete={handleVideoDelete} />;
              }
            })}
            {loadingMore && <LoadingMore>Loading more...</LoadingMore>}
            {!hasMore && videos.length > 0 && (
              <LoadingMore>No more posts to show</LoadingMore>
            )}
          </>
        )}
      </Wrapper>
      <HomeSidebar />
    </Container>
  );
};
export default Feeds;
