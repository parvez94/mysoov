import { Link } from 'react-router-dom';
import styled from 'styled-components';
import ArticleOptionsMenu from './ArticleOptionsMenu';

const Card = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const FeaturedImage = styled.div`
  width: 100%;
  height: 200px;
  background-image: url(${(props) => props.$src});
  background-size: cover;
  background-position: center;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

const Title = styled.h3`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  flex: 1;
`;

const OptionsWrapper = styled.div`
  flex-shrink: 0;
`;

const Excerpt = styled.p`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 14px;
  opacity: 0.7;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const DateText = styled.div`
  font-family: var(--primary-fonts);
  color: var(--secondary-color);
  font-size: 12px;
  opacity: 0.5;
  margin-top: auto;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-family: var(--secondary-fonts);
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
  background-color: ${(props) => {
    if (props.$isPaused) return 'rgba(255, 152, 0, 0.15)';
    if (props.$isDraft) return 'rgba(158, 158, 158, 0.15)';
    return 'transparent';
  }};
  color: ${(props) => {
    if (props.$isPaused) return '#ff9800';
    if (props.$isDraft) return '#9e9e9e';
    return 'var(--secondary-color)';
  }};
  border: 1px solid
    ${(props) => {
      if (props.$isPaused) return 'rgba(255, 152, 0, 0.3)';
      if (props.$isDraft) return 'rgba(158, 158, 158, 0.3)';
      return 'transparent';
    }};
`;

const ArticleCard = ({ article, isOwner, onArticleDelete }) => {
  const isPaused = article.isPaused;
  const isDraft = !article.published;

  return (
    <Card>
      <CardLink to={`/blog/${article.slug}`}>
        {article.featuredImage && (
          <FeaturedImage $src={article.featuredImage} />
        )}
        <Content>
          <Header>
            <Title>{article.title}</Title>
          </Header>
          {isOwner && (isPaused || isDraft) && (
            <StatusBadge $isPaused={isPaused} $isDraft={isDraft}>
              {isPaused ? '⏸ Paused by Admin' : '📝 Draft'}
            </StatusBadge>
          )}
          <Excerpt>{article.content?.substring(0, 150)}...</Excerpt>
          <DateText>
            {new Date(article.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </DateText>
        </Content>
      </CardLink>
      {isOwner && (
        <OptionsWrapper
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: '50%',
          }}
        >
          <ArticleOptionsMenu
            article={article}
            onArticleDelete={onArticleDelete}
          />
        </OptionsWrapper>
      )}
    </Card>
  );
};

export default ArticleCard;
