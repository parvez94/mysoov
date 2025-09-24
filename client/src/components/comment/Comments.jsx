import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import Comment from './Comment';
import AddComment from './AddComment';
import { fetchComments } from '../../redux/comment/commentSlice';
import { Spinner } from '../index';

const CommentsWrapper = styled.div`
  margin-top: 30px;
`;

const CommentsTitle = styled.h2`
  font-family: 'Alata';
  color: var(--secondary-color);
  border-bottom: 2px solid ${({ theme }) => theme.line};
  padding-bottom: 10px;
`;

const Comments = () => {
  const dispatch = useDispatch();
  const { isLoading, comments } = useSelector((state) => state.comments);
  const { currentVideo } = useSelector((state) => state.video);

  // Fetch whenever the current video changes
  useEffect(() => {
    if (currentVideo?._id) {
      dispatch(fetchComments(currentVideo._id));
    }
  }, [currentVideo?._id, dispatch]);

  // Prepare roots and replies map from flat list
  const { roots, repliesByParent } = useMemo(() => {
    const byParent = comments.reduce((acc, c) => {
      if (c.parentId) {
        (acc[c.parentId] ||= []).push(c);
      }
      return acc;
    }, {});
    const topLevel = comments.filter((c) => !c.parentId);
    return { roots: topLevel, repliesByParent: byParent };
  }, [comments]);

  return (
    <CommentsWrapper>
      {isLoading && (
        <Spinner label='Loading comments' size={28} thickness={3} />
      )}
      {roots.length > 0 && <CommentsTitle>Comments</CommentsTitle>}
      {roots.map((comment) => (
        <Comment
          key={comment._id}
          item={comment}
          repliesByParent={repliesByParent}
          depth={0}
        />
      ))}
      <AddComment />
    </CommentsWrapper>
  );
};
export default Comments;
