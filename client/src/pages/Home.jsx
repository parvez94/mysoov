import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Card, HomeSidebar, Spinner } from '../components/index';
import { fetchVideos } from '../redux/video/feedSlice';
import { useMinLoading } from '../utils/useMinLoading';

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

const EmptyMsg = styled.p`
  color: #9aa0a6; /* light grey */
  font-family: var(--primary-fonts);
  font-size: 16px;
  margin: 10px 0;
`;

const Home = () => {
  const dispatch = useDispatch();
  const { isLoading, videos } = useSelector((state) => state.videos);
  const { currentUser } = useSelector((state) => state.user);
  const showLoader = useMinLoading(isLoading, 1200);
  const [localVideos, setLocalVideos] = useState([]);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchVideos('feeds'));
    } else {
      dispatch(fetchVideos('random'));
    }
  }, [currentUser, dispatch]);

  // Sync localVideos with Redux videos
  useEffect(() => {
    setLocalVideos(videos);
  }, [videos]);

  const handleVideoUpdate = (updatedVideo) => {
    // If video becomes private, remove it from the feed
    if (updatedVideo.privacy === 'Private') {
      setLocalVideos((prevVideos) =>
        prevVideos.filter((video) => video._id !== updatedVideo._id)
      );
    } else {
      // Otherwise, update the video in the list
      setLocalVideos((prevVideos) =>
        prevVideos.map((video) =>
          video._id === updatedVideo._id ? updatedVideo : video
        )
      );
    }
  };

  const handleVideoDelete = (videoId) => {
    setLocalVideos((prevVideos) =>
      prevVideos.filter((video) => video._id !== videoId)
    );
  };

  const showEmptyState =
    Boolean(currentUser) && !isLoading && localVideos.length === 0;

  return (
    <Container>
      <Wrapper>
        {showLoader ? (
          <Spinner label='Loading videos' full duration={3} />
        ) : showEmptyState ? (
          <EmptyMsg>You have not video post yet.</EmptyMsg>
        ) : (
          localVideos.map((video) => (
            <Card
              key={video._id}
              video={video}
              onVideoUpdate={handleVideoUpdate}
              onVideoDelete={handleVideoDelete}
            />
          ))
        )}
      </Wrapper>
      <HomeSidebar />
    </Container>
  );
};
export default Home;
