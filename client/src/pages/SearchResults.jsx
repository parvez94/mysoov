import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { Card, HomeSidebar } from '../components';
import { FaFolder, FaFilm, FaTimes } from 'react-icons/fa';

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
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
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

const SuccessMessage = styled.div`
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  color: #4caf50;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-family: var(--secondary-fonts);
`;

const FilmDirectoryCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const DirectoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const DirectoryIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
`;

const DirectoryInfo = styled.div`
  flex: 1;
`;

const DirectoryName = styled.h3`
  font-family: var(--secondary-fonts);
  color: var(--primary-color);
  font-size: 20px;
  margin-bottom: 4px;
`;

const DirectoryMeta = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
`;

const DirectoryDescription = styled.p`
  font-family: var(--primary-fonts);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
`;

const RedeemButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-family: var(--primary-fonts);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalBox = styled.div`
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  font-family: var(--secondary-fonts);
  color: var(--primary-color);
  font-size: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--secondary-color);
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--primary-color);
  }
`;

const ModalText = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--primary-color);
  font-family: var(--primary-fonts);
  font-size: 14px;
  margin-bottom: 20px;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
  }

  &::placeholder {
    color: var(--secondary-color);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-family: var(--primary-fonts);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) =>
    props.$primary
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'rgba(255, 255, 255, 0.1)'};
  color: var(--primary-color);

  &:hover {
    background: ${(props) =>
      props.$primary
        ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
        : 'rgba(255, 255, 255, 0.15)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q');
  const [videos, setVideos] = useState([]);
  const [filmDirectory, setFilmDirectory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setFilmDirectory(null);
        setVideos([]);

        // First, try to search for film directory
        try {
          const filmResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/v1/films/search/${query}`,
            {
              withCredentials: true,
            }
          );
          setFilmDirectory(filmResponse.data.directory);
        } catch (filmErr) {
          // If no film directory found, search for regular videos
          console.log('No film directory found, searching videos...');
        }

        // Also search for regular videos
        try {
          const videoResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/v1/videos/search`,
            {
              params: { code: query },
              withCredentials: true,
            }
          );
          setVideos(videoResponse.data);
        } catch (videoErr) {
          console.log('No videos found');
        }
      } catch (err) {
        console.error('Search error:', err);
        setError(
          err.response?.data?.message || 'Failed to search. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleViewFilms = () => {
    setShowVerifyModal(true);
    setVerifyCode('');
    setError(null);
  };

  const handleVerify = async () => {
    if (!verifyCode) {
      setError('Please enter the access code');
      return;
    }

    try {
      setVerifying(true);
      setError(null);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/films/verify`,
        { code: verifyCode },
        { withCredentials: true }
      );

      // Films are automatically transferred to user's profile
      setShowVerifyModal(false);
      setSuccess(response.data.message || 'Films added to your profile!');

      // Redirect to profile after 1.5 seconds
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Verify error:', err);
      setError(
        err.response?.data?.message || 'Invalid access code. Please try again.'
      );
    } finally {
      setVerifying(false);
    }
  };

  if (!query) {
    return (
      <Container>
        <Wrapper>
          <Message>Please enter an access code to search.</Message>
        </Wrapper>
        <HomeSidebar />
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Wrapper>
          <LoadingSpinner>Searching...</LoadingSpinner>
        </Wrapper>
        <HomeSidebar />
      </Container>
    );
  }

  return (
    <Container>
      <Wrapper>
        <Title>
          Search Results for: <CodeBadge>{query}</CodeBadge>
        </Title>
        <Subtitle>
          {filmDirectory
            ? 'Film directory found!'
            : videos.length > 0
            ? `Found ${videos.length} video${videos.length !== 1 ? 's' : ''}`
            : 'No results found'}
        </Subtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        {/* Film Directory Card */}
        {filmDirectory && (
          <FilmDirectoryCard>
            <DirectoryHeader>
              <DirectoryIcon>
                <FaFolder />
              </DirectoryIcon>
              <DirectoryInfo>
                <DirectoryName>{filmDirectory.folderName}</DirectoryName>
                <DirectoryMeta>
                  <FaFilm style={{ marginRight: '4px' }} />
                  {filmDirectory.filmCount} film
                  {filmDirectory.filmCount !== 1 ? 's' : ''}
                  {filmDirectory.isRedeemed
                    ? ' (Already Redeemed)'
                    : ' available'}
                </DirectoryMeta>
              </DirectoryInfo>
            </DirectoryHeader>
            {filmDirectory.description && (
              <DirectoryDescription>
                {filmDirectory.description}
              </DirectoryDescription>
            )}
            {filmDirectory.isRedeemed ? (
              <DirectoryDescription
                style={{ color: '#ff9800', marginTop: '12px' }}
              >
                ⚠️ This folder has already been redeemed
                {filmDirectory.redeemedBy && (
                  <>
                    {' '}
                    by{' '}
                    {filmDirectory.redeemedBy.username ||
                      filmDirectory.redeemedBy.displayName}
                  </>
                )}
                {filmDirectory.redeemedAt && (
                  <>
                    {' '}
                    on {new Date(filmDirectory.redeemedAt).toLocaleDateString()}
                  </>
                )}
                .
              </DirectoryDescription>
            ) : (
              <RedeemButton onClick={handleViewFilms}>
                <FaFilm />
                View Films
              </RedeemButton>
            )}
          </FilmDirectoryCard>
        )}

        {/* Regular Videos */}
        {videos.length > 0 ? (
          <VideosGrid>
            {videos.map((video) => (
              <Card key={video._id} video={video} />
            ))}
          </VideosGrid>
        ) : !filmDirectory ? (
          <Message>
            No results found for "{query}".
            <br />
            <br />
            Make sure you have the correct code and try again.
          </Message>
        ) : null}
      </Wrapper>
      <HomeSidebar />

      {/* Verify Code Modal */}
      {showVerifyModal && (
        <Modal onClick={() => setShowVerifyModal(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Verify Access Code</ModalTitle>
              <CloseButton onClick={() => setShowVerifyModal(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            <ModalText>
              Enter the access code to verify and automatically add all films to
              your profile.
            </ModalText>
            <Input
              type='text'
              placeholder='Enter access code'
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
            />
            <ModalButtons>
              <Button onClick={() => setShowVerifyModal(false)}>Cancel</Button>
              <Button $primary onClick={handleVerify} disabled={verifying}>
                {verifying ? 'Adding to Profile...' : 'Verify & Add'}
              </Button>
            </ModalButtons>
          </ModalBox>
        </Modal>
      )}
    </Container>
  );
};

export default SearchResults;
