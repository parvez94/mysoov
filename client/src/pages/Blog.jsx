import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { HiOutlineClock, HiOutlineUser } from 'react-icons/hi2';

const Container = styled.div`
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px 10px;
  }
`;

const Header = styled.div`
  margin-bottom: 40px;
  text-align: center;
`;

const Title = styled.h1`
  font-family: var(--secondary-fonts);
  color: var(--primary-color);
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const Subtitle = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 18px;
  opacity: 0.8;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ArticlesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 32px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const ArticleCard = styled(Link)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const FeaturedImage = styled.div`
  width: 100%;
  height: 240px;
  background: ${(props) =>
    props.$image
      ? `url(${props.$image})`
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
  }
`;

const ArticleContent = styled.div`
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ArticleTitle = styled.h2`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.3;
`;

const ArticleExcerpt = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 15px;
  line-height: 1.6;
  opacity: 0.8;
  margin-bottom: 16px;
  flex: 1;
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  opacity: 0.6;
  margin-top: auto;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    font-size: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: var(--secondary-color);
  opacity: 0.6;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
`;

const EmptyText = styled.p`
  font-family: var(--primary-fonts);
  font-size: 18px;
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

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/blog/articles`
      );
      setArticles(response.data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
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

  const getExcerpt = (content, maxLength = 150) => {
    if (!content) return '';
    const text = content.replace(/<[^>]*>/g, ''); // Strip HTML tags
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading articles...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Blog</Title>
        <Subtitle>
          Discover stories, insights, and updates from our community
        </Subtitle>
      </Header>

      {articles.length === 0 ? (
        <EmptyState>
          <EmptyIcon>📝</EmptyIcon>
          <EmptyText>No articles published yet. Check back soon!</EmptyText>
        </EmptyState>
      ) : (
        <ArticlesGrid>
          {articles.map((article) => (
            <ArticleCard key={article._id} to={`/blog/${article.slug}`}>
              <FeaturedImage $image={article.featuredImage} />
              <ArticleContent>
                <ArticleTitle>{article.title}</ArticleTitle>
                <ArticleExcerpt>{getExcerpt(article.content)}</ArticleExcerpt>
                <ArticleMeta>
                  <MetaItem>
                    <HiOutlineUser />
                    <span>{article.author?.displayName || 'Admin'}</span>
                  </MetaItem>
                  <MetaItem>
                    <HiOutlineClock />
                    <span>{formatDate(article.createdAt)}</span>
                  </MetaItem>
                </ArticleMeta>
              </ArticleContent>
            </ArticleCard>
          ))}
        </ArticlesGrid>
      )}
    </Container>
  );
};

export default Blog;
