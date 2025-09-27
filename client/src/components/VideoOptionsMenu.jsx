import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const MenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: var(--secondary-color);
  cursor: pointer;
  padding: 8px 0 8px 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  font-family: var(--secondary-fonts);

  svg {
    width: 20px;
    height: 20px;
  }
`;

const MenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--tertiary-color);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 120px;
  overflow: hidden;
  margin-top: 4px;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  color: var(--secondary-color);
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  font-family: var(--secondary-fonts);
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &.delete {
    color: var(--primary-color);
  }
`;

const EditModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const EditForm = styled.div`
  background: var(--tertiary-color);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const FormTitle = styled.h3`
  color: var(--secondary-color);
  margin: 0 0 20px 0;
  font-size: 18px;
  font-family: var(--primary-fonts);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: var(--secondary-color);
  margin-bottom: 8px;
  font-size: 14px;
  font-family: var(--secondary-fonts);
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--secondary-color);
  font-size: 14px;
  resize: vertical;
  font-family: var(--secondary-fonts);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  &::placeholder {
    color: rgba(244, 241, 230, 0.5);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--secondary-color);
  font-size: 14px;
  font-family: var(--secondary-fonts);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  option {
    background: var(--tertiary-color);
    color: var(--secondary-color);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-family: var(--secondary-fonts);
  cursor: pointer;
  transition: background-color 0.2s;

  &.primary {
    background: var(--primary-color);
    color: var(--secondary-color);

    &:hover {
      background: #a50605;
    }

    &:disabled {
      background: rgba(202, 8, 6, 0.5);
      cursor: not-allowed;
    }
  }

  &.secondary {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: var(--secondary-color);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
`;

const VideoOptionsMenu = ({ video, onVideoUpdate, onVideoDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    caption: video?.caption || '',
    privacy: video?.privacy || 'Public',
  });

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      window.confirm(
        'Are you sure you want to delete this video? This action cannot be undone.'
      )
    ) {
      setIsMenuOpen(false);
      try {
        await axios.delete(`${API}/api/v1/videos/${video._id}`, {
          withCredentials: true,
        });
        onVideoDelete?.(video._id);
      } catch (error) {
        console.error('Error deleting video:', error);
        alert('Failed to delete video. Please try again.');
      }
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${API}/api/v1/videos/${video._id}`,
        editData,
        {
          withCredentials: true,
        }
      );

      onVideoUpdate?.(response.data);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating video:', error);
      alert('Failed to update video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEditData({
      caption: video?.caption || '',
      privacy: video?.privacy || 'Public',
    });
    setIsEditModalOpen(false);
  };

  return (
    <>
      <MenuContainer
        ref={menuRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <MenuButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
        >
          <svg viewBox='0 0 24 24' fill='currentColor'>
            <circle cx='12' cy='5' r='2' />
            <circle cx='12' cy='12' r='2' />
            <circle cx='12' cy='19' r='2' />
          </svg>
        </MenuButton>

        {isMenuOpen && (
          <MenuDropdown
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <MenuItem onClick={handleEdit}>Edit</MenuItem>
            <MenuItem className='delete' onClick={handleDelete}>
              Delete
            </MenuItem>
          </MenuDropdown>
        )}
      </MenuContainer>

      {isEditModalOpen && (
        <EditModal
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.target === e.currentTarget) handleCancelEdit();
          }}
        >
          <EditForm
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <FormTitle>Edit Video</FormTitle>

            <FormGroup>
              <Label>Caption</Label>
              <TextArea
                value={editData.caption}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, caption: e.target.value }))
                }
                placeholder='Write a caption for your video...'
              />
            </FormGroup>

            <FormGroup>
              <Label>Privacy</Label>
              <Select
                value={editData.privacy}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, privacy: e.target.value }))
                }
              >
                <option value='Public'>Public</option>
                <option value='Private'>Private</option>
              </Select>
            </FormGroup>

            <ButtonGroup>
              <Button className='secondary' onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button
                className='primary'
                onClick={handleSaveEdit}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </ButtonGroup>
          </EditForm>
        </EditModal>
      )}
    </>
  );
};

export default VideoOptionsMenu;
