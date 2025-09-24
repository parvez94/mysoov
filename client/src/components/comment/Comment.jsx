import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import {
  addComment,
  deleteCommentById,
  updateCommentById,
} from '../../redux/comment/commentSlice';
import { openModal } from '../../redux/modal/modalSlice';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const Container = styled.div`
  margin-top: 30px;
`;
const CommentCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 25px;
  width: 100%;
  position: relative; /* allow absolute positioning of the menu */
  padding-right: 8px; /* space for the menu */

  svg {
    color: var(--secondary-color);
  }
`;
const CommentAvatarImg = styled.div``;

const CommentAvatar = styled.img`
  width: 40px;
  height: 40px;
  display: block;
  object-fit: cover;
  border-radius: 50%;
  flex-shrink: 0;
  aspect-ratio: 1 / 1;
`;
const CommentUserInfo = styled.div`
  flex: 1;
`;

const CommentUserName = styled.div``;

const DisplayNameLine = styled.span`
  display: block;
  font-family: var(--primary-fonts);
  color: #fff;
  font-size: 15px; /* slightly larger than username */
`;

const UsernameLine = styled.span`
  display: block;
  font-family: var(--secondary-fonts);
  color: rgba(255, 255, 255, 0.65); /* very light grey */
  font-size: 13px;
`;
const CommentText = styled.p`
  font-family: var(--secondary-fonts);
  font-size: 14px;
  color: var(--secondary-color);
  margin: 10px 0;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;
const CommentEdit = styled.div`
  position: absolute;
  top: 0;
  right: 0;
`;

const Menu = styled.div`
  position: absolute;
  top: 20px;
  right: 0;
  background: rgba(20, 20, 20, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 6px 0;
  min-width: 140px;
  z-index: 10;
`;

const MenuItem = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  background: transparent;
  border: 0;
  color: var(--secondary-color);
  font-family: var(--secondary-fonts);
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const EditInput = styled.textarea`
  width: 100%;
  background-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  border: none;
  font-size: 14px;
  padding: 8px 10px;
  border-radius: 3px;
  font-family: var(--secondary-fonts);
  resize: vertical;
  min-height: 60px;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  &:focus {
    outline: none;
  }
`;

const EditActions = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 8px;
`;

const CommentReply = styled.button`
  font-family: var(--secondary-fonts);
  color: var(--primary-color);
  font-size: 13px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
`;

const Replies = styled.div`
  margin-top: 16px;
`;

const ReplyForm = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  position: relative;
`;

const ReplyInputWrapper = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
`;

const ReplyInput = styled.input`
  flex: 1;
  background-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  border: none;
  font-size: 14px;
  padding: 8px 40px 8px 10px;
  border-radius: 3px;
  font-family: var(--secondary-fonts);
  line-height: 1.5;

  &::placeholder {
    color: rgba(255, 255, 255, 0.65);
  }
  &:focus {
    outline: none;
  }
`;

const ReplyEmojiToggle = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ReplyEmojiPopover = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  z-index: 1000;

  /* Let emoji-mart handle its own styling and dimensions */
  & > div {
    border-radius: 8px !important;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35) !important;
  }

  /* Ensure header elements are visible */
  & [role='tablist'],
  & [role='searchbox'],
  & .search,
  & nav,
  & .nav,
  & .category,
  & .categories {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }

  /* Ensure category tabs are visible */
  & [role='tablist'],
  & .nav,
  & .categories {
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
  }

  /* Ensure search input is visible */
  & input[type='search'],
  & .search input {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }

  /* Force header section to be visible */
  & > div:first-child,
  & .header {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }

  /* Ensure proper emoji rendering within the picker */
  & em-emoji {
    font-size: 20px !important;
    line-height: 1 !important;
    display: inline-block !important;
    width: auto !important;
    height: auto !important;
  }

  /* Fix emoji button sizing */
  & button[data-emoji] {
    width: 32px !important;
    height: 32px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    border-radius: 6px !important;
  }
`;

const ReplyButton = styled.button`
  font-family: var(--secondary-fonts);
  font-weight: 500;
  font-size: 13px;
  padding: 8px 14px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
`;

// item: comment object, repliesByParent: map[parentId] -> replies[]
const Comment = ({ item, repliesByParent = {}, depth = 0 }) => {
  const [channel, setChannel] = useState({});
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplyEmojis, setShowReplyEmojis] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const wrapperRef = useRef(null); // wraps icon + menu
  const replyInputRef = useRef(null);
  const dispatch = useDispatch();
  const { currentVideo } = useSelector((state) => state.video);
  const { currentUser } = useSelector((state) => state.user);
  const { userId } = item;

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/users/${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        }
      );
      const data = await response.json();
      setChannel(data);
    };
    fetchData();
  }, [userId]);

  // Close on outside click and when any other comment requests closing
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuOpen) return;
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    const onGlobalClose = () => setMenuOpen(false);

    document.addEventListener('click', onDocClick);
    window.addEventListener('comment-menu-close-all', onGlobalClose);
    return () => {
      document.removeEventListener('click', onDocClick);
      window.removeEventListener('comment-menu-close-all', onGlobalClose);
    };
  }, [menuOpen]);

  // Close reply emoji picker on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!showReplyEmojis) return;
      // Check if click is outside the emoji picker and emoji button
      const emojiButton = e.target.closest('[data-emoji-button="reply"]');
      const emojiPicker = e.target.closest(
        '[role="dialog"][aria-label="Emoji picker"]'
      );

      if (!emojiButton && !emojiPicker) {
        setShowReplyEmojis(false);
      }
    };

    document.addEventListener('click', onDocClick);
    return () => {
      document.removeEventListener('click', onDocClick);
    };
  }, [showReplyEmojis]);

  const baseURL = import.meta.env.VITE_API_URL;
  const resolveImg = (src) => {
    if (!src) return `${baseURL}/default-user.png`;
    return src.startsWith('http://') || src.startsWith('https://')
      ? src
      : `${baseURL}${src}`;
  };
  const imageUrl = resolveImg(
    currentUser && String(currentUser._id) === String(userId)
      ? currentUser.displayImage
      : channel?.displayImage
  );

  // Prevent navigation for guests and open login modal instead
  const guardClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      dispatch(openModal());
    }
  };

  const replies = repliesByParent[item._id] || [];

  const onSubmitReply = (e) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text || !currentVideo?._id) return;
    if (!currentUser) {
      dispatch(openModal());
      return;
    }
    dispatch(
      addComment({
        videoId: currentVideo._id,
        comment: text,
        parentId: item._id,
      })
    );
    setReplyText('');
    setShowReply(false);
    setShowReplyEmojis(false);
  };

  const insertReplyEmoji = (emoji) => {
    const input = replyInputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newText =
      replyText.slice(0, start) + emoji.native + replyText.slice(end);

    setReplyText(newText);
    setShowReplyEmojis(false);

    // Focus back to input and set cursor position
    setTimeout(() => {
      input.focus();
      const newCursorPos = start + emoji.native.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <Container>
      <CommentCardHeader>
        {depth === 1 ? <div style={{ width: 60 }} /> : null}
        <CommentAvatarImg>
          <a
            href={`/${channel?.username}`}
            onClick={(e) => {
              e.stopPropagation();
              guardClick(e);
            }}
          >
            <CommentAvatar src={imageUrl} />
          </a>
        </CommentAvatarImg>
        <CommentUserInfo>
          <CommentUserName>
            <a
              href={`/${channel?.username}`}
              style={{ textDecoration: 'none' }}
              onClick={(e) => {
                e.stopPropagation();
                guardClick(e);
              }}
            >
              <DisplayNameLine>
                {channel?.displayName || channel?.username}
              </DisplayNameLine>
            </a>
            <UsernameLine>@{channel?.username}</UsernameLine>
          </CommentUserName>

          {isEditing ? (
            <div>
              <EditInput
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder='Edit your comment'
              />
              <EditActions>
                <ReplyButton
                  type='button'
                  onClick={() => {
                    setIsEditing(false);
                    setEditText('');
                  }}
                >
                  Cancel
                </ReplyButton>
                <ReplyButton
                  type='button'
                  onClick={async () => {
                    if (!currentUser) return dispatch(openModal());
                    const text = editText.trim();
                    if (!text) return;
                    await dispatch(
                      updateCommentById({ id: item._id, comment: text })
                    );
                    setIsEditing(false);
                    setEditText('');
                  }}
                >
                  Save
                </ReplyButton>
              </EditActions>
            </div>
          ) : (
            <CommentText>{item.comment}</CommentText>
          )}

          <CommentReply
            onClick={() => {
              if (!currentUser) return dispatch(openModal());
              setShowReply((s) => !s);
              setShowReplyEmojis(false);
            }}
          >
            {showReply ? 'Cancel' : 'Reply'}
          </CommentReply>
          {showReply && (
            <ReplyForm onSubmit={onSubmitReply}>
              <ReplyInputWrapper>
                <ReplyInput
                  ref={replyInputRef}
                  placeholder={
                    currentUser ? 'Write a reply...' : 'Log in to reply'
                  }
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onFocus={() => {
                    if (!currentUser) dispatch(openModal());
                  }}
                  readOnly={!currentUser}
                />
                <ReplyEmojiToggle
                  type='button'
                  aria-label='Add emoji'
                  data-emoji-button='reply'
                  onClick={() => setShowReplyEmojis((s) => !s)}
                >
                  🙂
                </ReplyEmojiToggle>

                {showReplyEmojis && (
                  <ReplyEmojiPopover role='dialog' aria-label='Emoji picker'>
                    <Picker
                      data={data}
                      theme='dark'
                      previewPosition='none'
                      searchPosition='sticky'
                      navPosition='top'
                      skinTonePosition='none'
                      onEmojiSelect={insertReplyEmoji}
                    />
                  </ReplyEmojiPopover>
                )}
              </ReplyInputWrapper>
              <ReplyButton
                type='submit'
                onClick={(e) => {
                  if (!currentUser) {
                    e.preventDefault();
                    dispatch(openModal());
                  }
                }}
              >
                Post
              </ReplyButton>
            </ReplyForm>
          )}
        </CommentUserInfo>
        <CommentEdit ref={wrapperRef}>
          <BsThreeDotsVertical
            onClick={(e) => {
              e.stopPropagation();
              if (menuOpen) {
                // If this menu is already open, close it
                setMenuOpen(false);
              } else {
                // Close all other menus first, then open this one
                window.dispatchEvent(new Event('comment-menu-close-all'));
                setMenuOpen(true);
              }
            }}
            style={{ cursor: 'pointer' }}
          />
          {menuOpen && (
            <Menu>
              {currentUser &&
                String(currentUser._id) === String(item.userId) && (
                  <MenuItem
                    onClick={() => {
                      setMenuOpen(false);
                      setIsEditing(true);
                      setEditText(item.comment);
                    }}
                  >
                    Edit
                  </MenuItem>
                )}

              {(currentUser &&
                String(currentUser._id) === String(item.userId)) ||
              (currentUser &&
                String(currentUser._id) === String(currentVideo?.userId)) ? (
                <MenuItem
                  onClick={async () => {
                    if (!currentUser) return dispatch(openModal());
                    await dispatch(deleteCommentById(item._id));
                    setMenuOpen(false);
                  }}
                >
                  Delete
                </MenuItem>
              ) : null}
            </Menu>
          )}
        </CommentEdit>
      </CommentCardHeader>
      {replies.length > 0 && (
        <Replies>
          {replies.map((rep) => (
            <Comment
              key={rep._id}
              item={rep}
              repliesByParent={repliesByParent}
              depth={1}
            />
          ))}
        </Replies>
      )}
    </Container>
  );
};
export default Comment;
