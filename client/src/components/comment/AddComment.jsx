import styled from 'styled-components';
import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addComment } from '../../redux/comment/commentSlice';
import { openModal } from '../../redux/modal/modalSlice';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const Container = styled.div`
  height: 10vh;
  margin-top: 30px;
  background-color: var(--tertiary-color);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  padding: 20px 0;
  position: sticky;
  bottom: 0px;
`;

const WritingBox = styled.div``;

const Form = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Controls = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 90%;
`;

const InputWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const Input = styled.input`
  width: 100%;
  background-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.75);
  border: none;
  font-size: 14px;
  padding: 10px 40px 10px 12px; /* space for emoji button inside */
  border-radius: 8px;
  font-family: var(--secondary-fonts);
  line-height: 1.5;

  &::placeholder {
    color: rgba(255, 255, 255, 0.75);
  }

  &:focus {
    outline: none;
  }
`;

const EmojiToggle = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.24);
  color: var(--secondary-color);
  border-radius: 8px;
  cursor: pointer;
  line-height: 1;
  font-size: 16px;
`;

const EmojiPopover = styled.div`
  position: absolute;
  bottom: 46px;
  right: 16px;
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

const Button = styled.button`
  font-family: var(--secondary-fonts);
  font-weight: 500;
  font-size: 14px;
  padding: 10px 20px;
  border: none;
  margin-left: 10px;
  border-radius: 3px;
  cursor: pointer;
`;

const AddComment = () => {
  const dispatch = useDispatch();
  const { currentVideo } = useSelector((state) => state.video);
  const { currentUser } = useSelector((state) => state.user);
  const [text, setText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null); // wraps input + toggle + popover

  const onSubmit = (e) => {
    e.preventDefault();
    const val = text.trim();
    if (!val || !currentVideo?._id) return;
    if (!currentUser) {
      dispatch(openModal());
      return;
    }
    dispatch(addComment({ videoId: currentVideo._id, comment: val }));
    setText('');
    setShowEmojis(false);
  };

  const handleFocusOrClick = () => {
    if (!currentUser) dispatch(openModal());
  };

  const handleButtonClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      dispatch(openModal());
    }
  };

  const toggleEmoji = () => {
    if (!currentUser) return dispatch(openModal());
    setShowEmojis((s) => !s);
  };

  const insertEmoji = (emoji) => {
    const native = emoji?.native || emoji;
    if (!inputRef.current || !native) return;
    const el = inputRef.current;
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    const next = text.slice(0, start) + native + text.slice(end);
    setText(next);
    // close picker and restore caret after emoji
    setShowEmojis(false);
    queueMicrotask(() => {
      el.focus();
      const pos = start + native.length;
      el.setSelectionRange(pos, pos);
    });
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (!showEmojis) return;
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowEmojis(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showEmojis]);

  return (
    <Container>
      <WritingBox>
        <Form onSubmit={onSubmit}>
          <Controls ref={wrapperRef}>
            <InputWrapper>
              <Input
                ref={inputRef}
                placeholder={
                  currentUser ? 'Add Comment...' : 'Log in to comment'
                }
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={handleFocusOrClick}
                onClick={handleFocusOrClick}
                readOnly={!currentUser}
              />
              <EmojiToggle
                type='button'
                aria-label='Add emoji'
                onClick={toggleEmoji}
              >
                😊
              </EmojiToggle>
              {showEmojis && (
                <EmojiPopover>
                  <Picker
                    data={data}
                    theme='dark'
                    previewPosition='none'
                    searchPosition='sticky'
                    navPosition='top'
                    skinTonePosition='none'
                    onEmojiSelect={insertEmoji}
                  />
                </EmojiPopover>
              )}
            </InputWrapper>
          </Controls>
          <Button type='submit' onClick={handleButtonClick}>
            Post
          </Button>
        </Form>
      </WritingBox>
    </Container>
  );
};
export default AddComment;
