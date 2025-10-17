import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { HiOutlineClock, HiOutlineUser, HiArrowLeft } from 'react-icons/hi2';

const Container = styled.div`
  padding: 40px 20px;
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px 10px;
  }
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-color);
  font-family: var(--secondary-fonts);
  font-size: 16px;
  text-decoration: none;
  margin-bottom: 32px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  svg {
    font-size: 20px;
  }
`;

const FeaturedImage = styled.div`
  width: 100%;
  height: 400px;
  background: ${(props) =>
    props.$image
      ? `url(${props.$image})`
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    height: 250px;
  }
`;

const ArticleHeader = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 16px;
  opacity: 0.7;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    font-size: 20px;
  }
`;

const Content = styled.div`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 18px;
  line-height: 1.8;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: var(--secondary-fonts);
    margin-top: 32px;
    margin-bottom: 16px;
    font-weight: 600;
  }

  h2 {
    font-size: 32px;
  }

  h3 {
    font-size: 24px;
  }

  p {
    margin-bottom: 20px;
  }

  a {
    color: var(--primary-color);
    text-decoration: underline;

    &:hover {
      opacity: 0.8;
    }
  }

  ul,
  ol {
    margin-bottom: 20px;
    padding-left: 24px;
  }

  li {
    margin-bottom: 8px;
  }

  blockquote {
    border-left: 4px solid var(--primary-color);
    padding-left: 20px;
    margin: 24px 0;
    font-style: italic;
    opacity: 0.9;
  }

  code {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 16px;
  }

  pre {
    background: rgba(255, 255, 255, 0.05);
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 20px;

    code {
      background: none;
      padding: 0;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 24px 0;
  }

  @media (max-width: 768px) {
    font-size: 16px;

    h2 {
      font-size: 24px;
    }

    h3 {
      font-size: 20px;
    }
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 20px;
  color: var(--primary-color);
  font-size: 18px;
  font-family: var(--primary-fonts);
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #f44336;
  font-family: var(--primary-fonts);
  font-size: 18px;
`;

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/blog/articles/${slug}`
      );
      setArticle(response.data);
    } catch (error) {
      setError(
        error.response?.status === 404
          ? 'Article not found'
          : 'Failed to load article'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading article...</LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <BackButton to='/blog'>
          <HiArrowLeft />
          Back to Blog
        </BackButton>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <Container>
      <BackButton to='/blog'>
        <HiArrowLeft />
        Back to Blog
      </BackButton>

      {article.featuredImage && (
        <FeaturedImage $image={article.featuredImage} />
      )}

      <ArticleHeader>
        <Title>{article.title}</Title>
        <Meta>
          <MetaItem>
            <HiOutlineUser />
            <span>{article.author?.displayName || 'Admin'}</span>
          </MetaItem>
          <MetaItem>
            <HiOutlineClock />
            <span>{formatDate(article.createdAt)}</span>
          </MetaItem>
        </Meta>
      </ArticleHeader>

      <Content dangerouslySetInnerHTML={{ __html: article.content }} />
    </Container>
  );
};

export default BlogPost;
