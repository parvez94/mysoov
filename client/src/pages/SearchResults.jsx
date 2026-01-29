import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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

const FilmsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FilmItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`;

const FilmThumbnail = styled.div`
  width: 100%;
  height: 180px;
  background: rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
`;

const FilmInfo = styled.div`
  padding: 15px;
`;

const FilmTitle = styled.h4`
  font-family: var(--secondary-fonts);
  color: var(--primary-color);
  font-size: 16px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FilmMeta = styled.p`
  font-family: var(--primary-fonts);
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  margin-bottom: 12px;
`;

const OwnButton = styled.button`
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 6px;
  color: white;
  font-family: var(--primary-fonts);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const query = searchParams.get('q');
  const [videos, setVideos] = useState([]);
  const [filmDirectory, setFilmDirectory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showFilmsModal, setShowFilmsModal] = useState(false);
  const [directoryFilms, setDirectoryFilms] = useState([]);
  const [loadingFilms, setLoadingFilms] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState(null);

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
        let filmError = null;
        try {
          const filmResponse = await axios.get(
            `${
              import.meta.env.VITE_API_URL
            }/api/v1/films/search/${encodeURIComponent(query)}`,
            {
              withCredentials: true,
            }
          );
          console.log('Initial search result:', filmResponse.data.directory);
          setFilmDirectory(filmResponse.data.directory);
        } catch (filmErr) {
          // Only show error if it's not a 404 (not found)
          // For 400 errors (like already redeemed), show the message to user
          if (filmErr.response?.status === 400) {
            filmError =
              filmErr.response?.data?.message || 'Film directory error';
            setError(filmError);
          }
          // For 404 or other errors, continue to search for regular videos
        }

        // Also search for regular videos (only if no film error was set)
        if (!filmError) {
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
            // No videos found - this is okay
          }
        }
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to search. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleViewFilms = async () => {
    if (!filmDirectory) return;

    try {
      setLoadingFilms(true);
      setError(null);
      setSelectedFilm(null); // Reset selected film when opening modal

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/films/details/${
          filmDirectory._id
        }`,
        { withCredentials: true }
      );

      // Update film directory with full data including price
      console.log('Fetched directory details:', response.data.directory);
      setFilmDirectory(response.data.directory);
      setDirectoryFilms(response.data.directory.films || []);
      setShowFilmsModal(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load films. Please try again.'
      );
    } finally {
      setLoadingFilms(false);
    }
  };

  const handleWatchFilm = (film) => {
    setSelectedFilm(film);
  };

  const handleAddToProfile = async (film) => {
    if (!filmDirectory?._id || !film?._id) {
      setError('Unable to add film to profile. Please try again.');
      return;
    }

    try {
      setLoadingFilms(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/films/add-to-profile`,
        {
          filmId: film._id,
          directoryId: filmDirectory._id,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Redirect to profile page
        navigate(`/${currentUser?.username || 'profile'}`);
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Failed to add film to profile. Please try again.'
      );
    } finally {
      setLoadingFilms(false);
    }
  };

  const handleBuyCompleteFolder = () => {
    console.log('Buy Complete Folder clicked', {
      filmDirectory,
      directoryFilms,
      filmDirectoryId: filmDirectory?._id,
    });

    if (!filmDirectory) {
      setError('Film directory information is missing. Please try again.');
      return;
    }

    if (!filmDirectory._id) {
      setError('Film directory ID is missing. Please refresh and try again.');
      return;
    }

    if (!directoryFilms || directoryFilms.length === 0) {
      setError('No films found in this directory. Please try again.');
      return;
    }

    if (!directoryFilms[0]._id) {
      setError('Film information is invalid. Please try again.');
      return;
    }

    const price = filmDirectory.price ?? 0;
    const firstFilm = directoryFilms[0];
    navigate(
      `/payment?type=film&filmId=${firstFilm._id}&directoryId=${
        filmDirectory._id
      }&filmName=${encodeURIComponent(
        filmDirectory.folderName || 'Film Collection'
      )}&price=${price}`
    );
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
                  {filmDirectory.filmCount !== 1 ? 's' : ''} available
                </DirectoryMeta>
              </DirectoryInfo>
              <RedeemButton onClick={handleViewFilms} disabled={loadingFilms}>
                <FaFilm />
                {loadingFilms ? 'Loading...' : 'View Films'}
              </RedeemButton>
            </DirectoryHeader>
            {filmDirectory.description && (
              <DirectoryDescription>
                {filmDirectory.description}
              </DirectoryDescription>
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

      {/* Films Display Modal */}
      {showFilmsModal && (
        <Modal onClick={() => setShowFilmsModal(false)}>
          <ModalBox
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px' }}
          >
            <ModalHeader>
              <ModalTitle>
                <FaFolder style={{ marginRight: '8px' }} />
                {filmDirectory?.folderName} - Available Films
              </ModalTitle>
              <CloseButton
                onClick={() => {
                  setShowFilmsModal(false);
                  setSelectedFilm(null);
                }}
              >
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            {!selectedFilm ? (
              <>
                <ModalText>
                  Click on any film to watch it. You can add films to your
                  profile for free, or purchase the entire collection to own it
                  permanently and download all videos.
                </ModalText>

                <FilmsGrid>
                  {directoryFilms.length > 0 ? (
                    directoryFilms.map((film) => (
                      <FilmItem key={film._id}>
                        <FilmThumbnail
                          onClick={() => handleWatchFilm(film)}
                          style={{ cursor: 'pointer' }}
                        >
                          {film.videoUrl?.url ? (
                            <>
                              <video
                                src={film.videoUrl.url}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                                onContextMenu={(e) => e.preventDefault()}
                              />
                            </>
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                background:
                                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <FaFilm size={40} color='rgba(255,255,255,0.5)' />
                            </div>
                          )}
                        </FilmThumbnail>
                        <FilmInfo>
                          <FilmTitle>
                            {film.caption || 'Untitled Film'}
                          </FilmTitle>
                          <FilmMeta>
                            {new Date(film.createdAt).toLocaleDateString()}
                          </FilmMeta>
                          <div
                            style={{
                              display: 'flex',
                              gap: '8px',
                              marginTop: '8px',
                            }}
                          >
                            <OwnButton
                              onClick={() => handleWatchFilm(film)}
                              style={{
                                flex: 1,
                                background:
                                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              }}
                            >
                              Watch
                            </OwnButton>
                            <OwnButton
                              onClick={() => handleAddToProfile(film)}
                              style={{
                                flex: 1,
                                background:
                                  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                              }}
                            >
                              Add to Profile
                            </OwnButton>
                          </div>
                        </FilmInfo>
                      </FilmItem>
                    ))
                  ) : (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: 'rgba(255,255,255,0.5)',
                      }}
                    >
                      No films available in this directory.
                    </div>
                  )}
                </FilmsGrid>

                {/* Single Purchase Button for Entire Collection */}
                {directoryFilms.length > 0 && (
                  <div
                    style={{
                      marginTop: '24px',
                      padding: '20px',
                      background: 'rgba(102, 126, 234, 0.1)',
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                      borderRadius: '12px',
                      textAlign: 'center',
                    }}
                  >
                    <ModalText
                      style={{
                        marginBottom: '16px',
                        fontSize: '15px',
                        fontWeight: '500',
                      }}
                    >
                      💎 Purchase entire collection ({directoryFilms.length}{' '}
                      {directoryFilms.length === 1 ? 'film' : 'films'}) for
                      permanent ownership and download access
                    </ModalText>
                    {!filmDirectory?._id && (
                      <div
                        style={{
                          padding: '12px',
                          background: 'rgba(255, 0, 0, 0.1)',
                          border: '1px solid rgba(255, 0, 0, 0.3)',
                          borderRadius: '8px',
                          color: '#ff6b6b',
                          marginBottom: '12px',
                          fontSize: '14px',
                        }}
                      >
                        ⚠️ Directory ID missing. Please close and reopen this
                        modal.
                      </div>
                    )}
                    <OwnButton
                      onClick={handleBuyCompleteFolder}
                      disabled={!filmDirectory?._id}
                      style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '14px 24px',
                        fontSize: '16px',
                        fontWeight: '700',
                        background: !filmDirectory?._id
                          ? '#666'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                        opacity: !filmDirectory?._id ? 0.5 : 1,
                        cursor: !filmDirectory?._id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      🛒 Purchase All Films - $
                      {filmDirectory?.price?.toFixed(2) || '0.00'}
                    </OwnButton>
                  </div>
                )}
              </>
            ) : (
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={() => setSelectedFilm(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px',
                    fontFamily: 'var(--primary-fonts)',
                    fontSize: '14px',
                  }}
                >
                  ← Back to films
                </button>

                <div
                  style={{
                    background: '#000',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '20px',
                    position: 'relative',
                  }}
                >
                  <video
                    src={selectedFilm.videoUrl?.url}
                    controls
                    controlsList="nodownload"
                    disablePictureInPicture
                    autoPlay
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      display: 'block',
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>

                <div
                  style={{
                    padding: '16px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    marginBottom: '16px',
                  }}
                >
                  <h3
                    style={{
                      color: 'var(--primary-color)',
                      fontFamily: 'var(--secondary-fonts)',
                      fontSize: '20px',
                      marginBottom: '8px',
                    }}
                  >
                    {selectedFilm.caption || 'Untitled Film'}
                  </h3>
                  <p
                    style={{
                      color: 'var(--secondary-color)',
                      fontFamily: 'var(--primary-fonts)',
                      fontSize: '14px',
                      marginBottom: '16px',
                    }}
                  >
                    Released:{' '}
                    {new Date(selectedFilm.createdAt).toLocaleDateString()}
                  </p>

                  <OwnButton
                    onClick={() => handleAddToProfile(selectedFilm)}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      background:
                        'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    }}
                  >
                    Add to Profile (Free)
                  </OwnButton>
                  <ModalText
                    style={{
                      marginTop: '12px',
                      fontSize: '13px',
                      textAlign: 'center',
                      opacity: 0.7,
                    }}
                  >
                    💡 To purchase and download all films, go back and use the
                    "Purchase All Films" button
                  </ModalText>
                </div>
              </div>
            )}
          </ModalBox>
        </Modal>
      )}
    </Container>
  );
};

export default SearchResults;
