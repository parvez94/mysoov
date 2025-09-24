import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Card, HomeSidebar, Spinner } from '../components/index';
import { fetchVideos } from '../redux/video/feedSlice';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Wrapper = styled.div`
  flex: 7;
  padding: 20px 50px;
`;

const Explore = () => {
  const dispatch = useDispatch();
  const { isLoading, videos } = useSelector((state) => state.videos);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchVideos('random'));
  }, [dispatch]);

  // Filter out own videos from Explore if logged in
  const filteredVideos = currentUser
    ? videos.filter((v) => v.userId !== currentUser._id)
    : videos;

  return (
    <Container>
      <Wrapper>
        {isLoading ? (
          <Spinner label='Loading videos' full duration={2} />
        ) : (
          filteredVideos.map((video) => <Card key={video._id} video={video} />)
        )}
      </Wrapper>
      <HomeSidebar />
    </Container>
  );
};
export default Explore;
