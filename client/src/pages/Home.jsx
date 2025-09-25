import { useEffect } from 'react';
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
    padding: 10px 10px;
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

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchVideos('feeds'));
    } else {
      dispatch(fetchVideos('random'));
    }
  }, [currentUser, dispatch]);

  const showEmptyState =
    Boolean(currentUser) && !isLoading && videos.length === 0;

  return (
    <Container>
      <Wrapper>
        {showLoader ? (
          <Spinner label='Loading videos' full duration={3} />
        ) : showEmptyState ? (
          <EmptyMsg>You have not video post yet.</EmptyMsg>
        ) : (
          videos.map((video) => <Card key={video._id} video={video} />)
        )}
      </Wrapper>
      <HomeSidebar />
    </Container>
  );
};
export default Home;
