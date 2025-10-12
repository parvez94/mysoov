import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { MdEdit, MdDelete, MdOpenInNew } from 'react-icons/md';
import { FaPause, FaPlay, FaCheck, FaTimes } from 'react-icons/fa';
import ThreeDotsLoader from '../../components/loading/ThreeDotsLoader';

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

const ArticlesTable = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 180px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  font-family: var(--secondary-fonts);
  font-weight: 600;
  color: var(--secondary-color);
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 1024px) {
    grid-template-columns: 2fr 1fr 180px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 180px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  align-items: center;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  &:last-child {
    border-bottom: none;
  }

  ${(props) =>
    props.$highlighted &&
    `
    animation: highlightPulse 2s ease-in-out 3;
    border-left: 3px solid var(--primary-color);
  `}

  @keyframes highlightPulse {
    0%,
    100% {
      background: rgba(202, 8, 6, 0.15);
    }
    50% {
      background: rgba(202, 8, 6, 0.25);
    }
  }

  @media (max-width: 1024px) {
    grid-template-columns: 2fr 1fr 180px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.02);
    margin-bottom: 12px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const Cell = styled.div`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;

  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &::before {
      content: '${(props) => props.$label || ''}';
      font-weight: 600;
      color: var(--secondary-color);
      opacity: 0.7;
    }
  }
`;

const ArticleTitle = styled.div`
  font-weight: 500;
  color: var(--secondary-color);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) => {
    if (props.$pendingReview) return '#2196f3';
    if (props.$paused) return '#f44336';
    return props.$published ? '#4caf50' : '#ff9800';
  }};
  color: white;
  display: inline-block;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  @media (max-width: 768px) {
    justify-content: flex-end;
  }
`;

const ActionButton = styled.button`
  padding: 8px;
  background: ${(props) =>
    props.$danger ? '#f44336' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    font-size: 18px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--secondary-color);
  opacity: 0.6;
  font-family: var(--primary-fonts);
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
`;

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
  border-radius: 8px;
  color: #f44336;
  font-size: 14px;
  margin-bottom: 16px;
  font-family: var(--secondary-fonts);
`;

const SuccessMessage = styled.div`
  padding: 12px 16px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid #4caf50;
  border-radius: 8px;
  color: #4caf50;
  font-size: 14px;
  margin-bottom: 16px;
  font-family: var(--secondary-fonts);
`;

const HideOnMobile = styled.span`
  @media (max-width: 1024px) {
    display: none;
  }
`;

// Pause Reason Dialog Styles
const PauseReasonDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const PauseReasonBox = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const PauseReasonTitle = styled.h3`
  font-family: var(--secondary-fonts);
  color: var(--primary-color);
  font-size: 20px;
  margin-bottom: 16px;
`;

const PauseReasonText = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.6;
`;

const PauseReasonInput = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--primary-color);
  font-family: var(--primary-fonts);
  font-size: 14px;
  margin-bottom: 20px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
  }

  &::placeholder {
    color: var(--secondary-color);
  }
`;

const PauseReasonButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const DashboardArticles = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [searchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pauseReasonModal, setPauseReasonModal] = useState(null);
  const [pauseReason, setPauseReason] = useState('');
  const [reviewModal, setReviewModal] = useState(null); // { article, action: 'approve' | 'reject' }
  const [reviewNotes, setReviewNotes] = useState('');
  const [highlightId, setHighlightId] = useState(null);
  const highlightRef = useRef(null);

  // Redirect if not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to='/' replace />;
  }

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredArticles(articles);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          (article.author?.displayName &&
            article.author.displayName.toLowerCase().includes(query)) ||
          (article.author?.username &&
            article.author.username.toLowerCase().includes(query))
      );
      setFilteredArticles(filtered);
    }
  }, [searchQuery, articles]);

  // Handle highlight from URL parameter
  useEffect(() => {
    const highlightParam = searchParams.get('highlight');
    if (highlightParam) {
      setHighlightId(highlightParam);
    }
  }, [searchParams]);

  // Scroll to highlighted article after data loads
  useEffect(() => {
    if (highlightId && !loading && highlightRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
    }
  }, [highlightId, loading]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/articles`,
        {
          withCredentials: true,
        }
      );
      setArticles(response.data.articles || []);
      setFilteredArticles(response.data.articles || []);
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      // Only show error if it's not a 404 (no articles found is okay)
      if (err.response?.status !== 404) {
        setError('Failed to load articles. Please try again.');
      } else {
        setArticles([]); // Set empty array for 404
        setFilteredArticles([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPauseDialog = (article) => {
    // If article is already paused, unpause directly without dialog
    if (article.isPaused) {
      handleTogglePause(article._id);
    } else {
      // If article is active, show dialog to pause
      setPauseReasonModal(article);
    }
  };

  const handleConfirmPause = () => {
    if (pauseReasonModal) {
      handleTogglePause(pauseReasonModal._id, pauseReason);
    }
  };

  const handleTogglePause = async (articleId, reason = '') => {
    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_API_URL
        }/api/admin/articles/${articleId}/toggle-pause`,
        { reason },
        {
          withCredentials: true,
        }
      );
      setSuccess(response.data.message);
      setTimeout(() => setSuccess(''), 3000);
      fetchArticles();

      // Close the pause reason modal if open
      setPauseReasonModal(null);
      setPauseReason('');
    } catch (err) {
      setError('Failed to toggle article pause status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleOpenReviewModal = (article, action) => {
    setReviewModal({ article, action });
    setReviewNotes('');
  };

  const handleReviewAction = async () => {
    if (!reviewModal) return;

    const { article, action } = reviewModal;

    // Validate rejection reason
    if (action === 'reject' && !reviewNotes.trim()) {
      setError('Please provide a reason for rejection');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const endpoint = `${
        import.meta.env.VITE_API_URL
      }/api/admin/reviews/article/${article._id}/${action}`;

      await axios.post(
        endpoint,
        { notes: reviewNotes },
        {
          withCredentials: true,
        }
      );

      setSuccess(
        `Article ${
          action === 'approve' ? 'approved' : 'rejected'
        } successfully!`
      );
      setTimeout(() => setSuccess(''), 3000);

      // Update local state immediately
      setArticles((prevArticles) =>
        prevArticles.map((a) =>
          a._id === article._id
            ? {
                ...a,
                pendingReview: false,
                published: action === 'approve',
                isPaused: action === 'reject',
              }
            : a
        )
      );

      // Close modal and reset
      setReviewModal(null);
      setReviewNotes('');

      // Refresh articles list
      fetchArticles();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${action} article. Please try again.`
      );
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (articleId) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/v1/blog/articles/${articleId}`,
        {
          withCredentials: true,
        }
      );
      setSuccess('Article deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchArticles();
    } catch (err) {
      setError('Failed to delete article');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container>
      <Title>Total Articles</Title>
      <Subtitle>
        View and manage all blog articles ({articles.length} total,{' '}
        {articles.filter((a) => a.published && !a.isPaused).length} active,{' '}
        {articles.filter((a) => a.isPaused).length} paused,{' '}
        {articles.filter((a) => !a.published).length} drafts)
      </Subtitle>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <SearchBar
        type='text'
        placeholder='Search by title or author...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {loading ? (
        <LoadingContainer>
          <ThreeDotsLoader />
        </LoadingContainer>
      ) : filteredArticles.length === 0 ? (
        <EmptyState>
          <p>
            {searchQuery
              ? 'No articles found matching your search'
              : 'No articles found in the system.'}
          </p>
        </EmptyState>
      ) : (
        <ArticlesTable>
          <TableHeader>
            <div>Title</div>
            <HideOnMobile>Author</HideOnMobile>
            <HideOnMobile>Date</HideOnMobile>
            <div>Status</div>
            <div>Actions</div>
          </TableHeader>
          {filteredArticles.map((article) => {
            const isHighlighted = highlightId === article._id;
            return (
              <TableRow
                key={article._id}
                $highlighted={isHighlighted}
                ref={isHighlighted ? highlightRef : null}
              >
                <Cell>
                  <ArticleTitle>{article.title}</ArticleTitle>
                </Cell>
                <HideOnMobile>
                  <Cell>{article.author?.displayName || 'Unknown'}</Cell>
                </HideOnMobile>
                <HideOnMobile>
                  <Cell>{formatDate(article.createdAt)}</Cell>
                </HideOnMobile>
                <Cell $label='Status'>
                  <StatusBadge
                    $published={article.published}
                    $paused={article.isPaused}
                    $pendingReview={article.pendingReview}
                  >
                    {article.pendingReview
                      ? 'Pending Review'
                      : article.isPaused
                      ? 'Paused'
                      : article.published
                      ? 'Active'
                      : 'Draft'}
                  </StatusBadge>
                </Cell>
                <Cell $label='Actions'>
                  <Actions>
                    <ActionButton
                      as='a'
                      href={`/blog/${article.slug}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      title='View Article'
                    >
                      <MdOpenInNew />
                    </ActionButton>
                    {article.pendingReview ? (
                      <>
                        <ActionButton
                          onClick={() =>
                            handleOpenReviewModal(article, 'approve')
                          }
                          title='Approve Article'
                          style={{
                            background: 'rgba(76, 175, 80, 0.2)',
                            color: '#4caf50',
                          }}
                        >
                          <FaCheck />
                        </ActionButton>
                        <ActionButton
                          onClick={() =>
                            handleOpenReviewModal(article, 'reject')
                          }
                          title='Reject Article'
                          style={{
                            background: 'rgba(244, 67, 54, 0.2)',
                            color: '#f44336',
                          }}
                        >
                          <FaTimes />
                        </ActionButton>
                      </>
                    ) : (
                      <ActionButton
                        onClick={() => handleOpenPauseDialog(article)}
                        title={
                          article.isPaused
                            ? 'Unpause (show in public)'
                            : 'Pause (hide from public)'
                        }
                        style={{
                          background: article.isPaused
                            ? 'rgba(76, 175, 80, 0.2)'
                            : 'rgba(255, 152, 0, 0.2)',
                          color: article.isPaused ? '#4caf50' : '#ff9800',
                        }}
                      >
                        {article.isPaused ? <FaPlay /> : <FaPause />}
                      </ActionButton>
                    )}
                    <ActionButton
                      as={Link}
                      to={`/article/${article._id}`}
                      title='Edit'
                    >
                      <MdEdit />
                    </ActionButton>
                    <ActionButton
                      $danger
                      onClick={() => handleDelete(article._id)}
                      title='Delete'
                    >
                      <MdDelete />
                    </ActionButton>
                  </Actions>
                </Cell>
              </TableRow>
            );
          })}
        </ArticlesTable>
      )}

      {/* Pause Reason Modal */}
      {pauseReasonModal && (
        <PauseReasonDialog onClick={() => setPauseReasonModal(null)}>
          <PauseReasonBox onClick={(e) => e.stopPropagation()}>
            <PauseReasonTitle>Pause Article</PauseReasonTitle>
            <PauseReasonText>
              You are about to pause "{pauseReasonModal.title}". The author will
              be notified that their article requires review. You can optionally
              provide a reason below:
            </PauseReasonText>
            <PauseReasonInput
              placeholder='Optional: Explain why this article is being paused (e.g., violates content guidelines, needs fact-checking, etc.)'
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
            />
            <PauseReasonButtons>
              <ActionButton onClick={() => setPauseReasonModal(null)}>
                Cancel
              </ActionButton>
              <ActionButton
                onClick={handleConfirmPause}
                style={{
                  background: '#ff9800',
                  color: 'white',
                }}
              >
                Confirm Pause
              </ActionButton>
            </PauseReasonButtons>
          </PauseReasonBox>
        </PauseReasonDialog>
      )}

      {/* Review Modal (Approve/Reject) */}
      {reviewModal && (
        <PauseReasonDialog onClick={() => setReviewModal(null)}>
          <PauseReasonBox onClick={(e) => e.stopPropagation()}>
            <PauseReasonTitle>
              {reviewModal.action === 'approve'
                ? 'Approve Article'
                : 'Reject Article'}
            </PauseReasonTitle>
            <PauseReasonText>
              {reviewModal.action === 'approve' ? (
                <>
                  You are about to approve "{reviewModal.article.title}". The
                  article will be made public and the author will be notified.
                  You can optionally add notes:
                </>
              ) : (
                <>
                  You are about to reject "{reviewModal.article.title}". The
                  article will remain private and the author will be notified.
                  Please provide a reason for rejection:
                </>
              )}
            </PauseReasonText>
            <PauseReasonInput
              placeholder={
                reviewModal.action === 'approve'
                  ? 'Optional: Add any notes for the author'
                  : 'Required: Explain why this article is being rejected'
              }
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              required={reviewModal.action === 'reject'}
            />
            <PauseReasonButtons>
              <ActionButton onClick={() => setReviewModal(null)}>
                Cancel
              </ActionButton>
              <ActionButton
                onClick={handleReviewAction}
                style={{
                  background:
                    reviewModal.action === 'approve' ? '#4caf50' : '#f44336',
                  color: 'white',
                }}
              >
                {reviewModal.action === 'approve'
                  ? 'Confirm Approval'
                  : 'Confirm Rejection'}
              </ActionButton>
            </PauseReasonButtons>
          </PauseReasonBox>
        </PauseReasonDialog>
      )}
    </Container>
  );
};

export default DashboardArticles;
