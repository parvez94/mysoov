import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { MdSave, MdArrowBack } from 'react-icons/md';
import ThreeDotsLoader from '../components/loading/ThreeDotsLoader';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - var(--navbar-h));
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  padding: 12px 24px;
  background: ${(props) =>
    props.$secondary ? 'rgba(255, 255, 255, 0.1)' : 'var(--primary-color)'};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  font-family: var(--secondary-fonts);

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    font-size: 20px;
  }
`;

const Form = styled.form`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--secondary-color);
  margin-bottom: 8px;
  font-family: var(--secondary-fonts);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--secondary-color);
  font-size: 16px;
  outline: none;
  font-family: var(--primary-fonts);
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--primary-color);
  }

  &::placeholder {
    color: #999;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--secondary-color);
  font-size: 16px;
  outline: none;
  font-family: var(--primary-fonts);
  resize: vertical;
  min-height: 400px;
  line-height: 1.6;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--primary-color);
  }

  &::placeholder {
    color: #999;
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: var(--secondary-color);
  font-family: var(--primary-fonts);
  cursor: pointer;
`;

const HelpText = styled.p`
  font-size: 13px;
  color: #999;
  margin-top: 6px;
  font-family: var(--primary-fonts);
`;

const ImagePreview = styled.div`
  margin-top: 12px;
  width: 100%;
  max-width: 400px;
  height: 200px;
  border-radius: 8px;
  background: ${(props) =>
    props.$image ? `url(${props.$image})` : 'rgba(255, 255, 255, 0.05)'};
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-family: var(--primary-fonts);
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
`;

const ArticleEditor = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = id && id !== 'new';

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    featuredImage: '',
    published: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to='/' replace />;
  }

  useEffect(() => {
    if (isEditMode) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/blog/articles/${id}/edit`,
        {
          withCredentials: true,
        }
      );
      setFormData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Auto-generate slug from title
    if (name === 'title' && !isEditMode) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/upload`,
        formData,
        {
          withCredentials: true,
        }
      );

      setFormData((prev) => ({
        ...prev,
        featuredImage: response.data.url,
      }));

      setSuccess('Image uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (isEditMode) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/v1/blog/articles/${id}`,
          formData,
          {
            withCredentials: true,
          }
        );
        setSuccess('Article updated successfully!');
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/blog/articles`,
          formData,
          {
            withCredentials: true,
          }
        );
        setSuccess('Article created successfully!');

        // Redirect to the new article after a short delay
        setTimeout(() => {
          navigate(`/blog/${response.data.slug}`);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <ThreeDotsLoader />
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>{isEditMode ? 'Edit Article' : 'Write New Article'}</Title>
        <ButtonGroup>
          <Button $secondary onClick={() => navigate(-1)}>
            <MdArrowBack />
            Back
          </Button>
        </ButtonGroup>
      </Header>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor='title'>Title *</Label>
          <Input
            type='text'
            id='title'
            name='title'
            value={formData.title}
            onChange={handleChange}
            placeholder='Enter article title'
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor='slug'>URL Slug *</Label>
          <Input
            type='text'
            id='slug'
            name='slug'
            value={formData.slug}
            onChange={handleChange}
            placeholder='article-url-slug'
            required
          />
          <HelpText>
            This will be used in the article URL: /blog/
            {formData.slug || 'your-slug'}
          </HelpText>
        </FormGroup>

        <FormGroup>
          <Label htmlFor='featuredImage'>Featured Image</Label>
          <Input
            type='file'
            id='featuredImage'
            accept='image/*'
            onChange={handleImageUpload}
            disabled={uploadingImage}
          />
          <HelpText>
            {uploadingImage
              ? 'Uploading...'
              : 'Upload a featured image for your article'}
          </HelpText>
          {formData.featuredImage && (
            <ImagePreview $image={formData.featuredImage} />
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor='content'>Content *</Label>
          <Textarea
            id='content'
            name='content'
            value={formData.content}
            onChange={handleChange}
            placeholder='Write your article content here...'
            required
          />
          <HelpText>Supports plain text and basic formatting</HelpText>
        </FormGroup>

        <FormGroup>
          <CheckboxWrapper>
            <Checkbox
              type='checkbox'
              id='published'
              name='published'
              checked={formData.published}
              onChange={handleChange}
            />
            <CheckboxLabel htmlFor='published'>
              Publish immediately
            </CheckboxLabel>
          </CheckboxWrapper>
          <HelpText>
            {formData.published
              ? 'Article will be visible to everyone'
              : 'Article will be saved as draft'}
          </HelpText>
        </FormGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <ButtonGroup style={{ justifyContent: 'flex-end', marginTop: '32px' }}>
          <Button onClick={handleSubmit} disabled={saving}>
            <MdSave />
            {saving ? 'Saving...' : 'Save Article'}
          </Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

export default ArticleEditor;
