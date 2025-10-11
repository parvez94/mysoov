import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  font-family: var(--secondary-fonts);

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

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

const ArticleOptionsMenu = ({ article, onArticleDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

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
    // Navigate to article edit page
    navigate(`/article/${article._id}`);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      window.confirm(
        'Are you sure you want to delete this article? This action cannot be undone.'
      )
    ) {
      setIsMenuOpen(false);
      try {
        await axios.delete(`${API}/api/v1/blog/articles/${article._id}`, {
          withCredentials: true,
        });
        onArticleDelete?.(article._id);
      } catch (error) {
        alert('Failed to delete article. Please try again.');
      }
    }
  };

  return (
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
  );
};

export default ArticleOptionsMenu;
