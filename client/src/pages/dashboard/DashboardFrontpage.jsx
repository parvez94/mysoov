import { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaSave,
  FaImage,
  FaVideo,
  FaToggleOn,
  FaToggleOff,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaHeart,
  FaStar,
  FaFire,
  FaRocket,
  FaCrown,
  FaGem,
  FaTrophy,
  FaGift,
  FaBolt,
  FaMagic,
  FaSmile,
  FaThumbsUp,
  FaCheck,
  FaUser,
  FaUsers,
  FaUserFriends,
  FaPlay,
  FaFilm,
  FaCamera,
  FaMusic,
  FaHeadphones,
} from 'react-icons/fa';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--tertiary-color);
  min-height: 100vh;
`;

const Header = styled.div`
  background: var(--secondary-color);
  padding: 20px 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: var(--text-primary);
  margin: 0;
`;

const HeaderButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const SaveButton = styled.button`
  padding: 12px 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PreviewButton = styled.button`
  padding: 12px 24px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;

  &:hover {
    opacity: 0.9;
  }
`;

const SectionCard = styled.div`
  background: var(--secondary-color);
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  background: var(--secondary-color);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--tertiary-color);
`;

const SectionTitle = styled.h3`
  color: var(--text-primary);
  font-size: 1.2rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${(props) => (props.$enabled ? 'var(--primary-color)' : '#ccc')};
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionBody = styled.div`
  padding: 20px;
  display: ${(props) => (props.$collapsed ? 'none' : 'block')};
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--tertiary-color);
  color: var(--secondary-color);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--tertiary-color);
  color: var(--secondary-color);
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--tertiary-color);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ColorInput = styled.input`
  width: 60px;
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  background: none;
`;

const ColorRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ColorGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ColorInputRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const HexInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--tertiary-color);
  color: var(--secondary-color);
  font-size: 0.9rem;
  font-family: monospace;
  text-transform: uppercase;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  &::placeholder {
    color: rgb(113, 118, 123);
    text-transform: none;
  }
`;

const IconPickerContainer = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 15px;
  background: var(--tertiary-color);
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 10px;
  margin-top: 10px;
`;

const IconOption = styled.button`
  padding: 12px;
  background: ${(props) =>
    props.$selected ? 'var(--primary-color)' : 'var(--secondary-color)'};
  border: 2px solid
    ${(props) =>
      props.$selected ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: ${(props) => (props.$selected ? 'white' : 'var(--text-primary)')};
  transition: all 0.3s;

  &:hover {
    transform: scale(1.1);
    border-color: var(--primary-color);
  }
`;

const StrokeControlsRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 15px;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StrokeWidthInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--tertiary-color);
  color: var(--secondary-color);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const SliderItemsContainer = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 15px;
  background: var(--tertiary-color);
`;

const SliderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: var(--secondary-color);
  border-radius: 6px;
  margin-bottom: 10px;
  border: 1px solid var(--border-color);
`;

const SliderItemPreview = styled.div`
  width: 80px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const SliderItemInfo = styled.div`
  flex: 1;
`;

const SliderItemType = styled.span`
  background: var(--primary-color);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const SliderItemUrl = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 5px;
  word-break: break-all;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  padding: 8px;
  background: ${(props) =>
    props.$variant === 'danger'
      ? '#ff4444'
      : props.$variant === 'primary'
      ? 'var(--primary-color)'
      : 'var(--tertiary-color)'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;

  &:hover {
    opacity: 0.8;
  }
`;

const AddButton = styled.button`
  width: 100%;
  padding: 15px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;

  &:hover {
    opacity: 0.9;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--secondary-color);
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  color: var(--text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
`;

const ModalButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;

  ${(props) =>
    props.$variant === 'primary'
      ? `
    background: var(--primary-color);
    color: white;
  `
      : `
    background: var(--tertiary-color);
    color: var(--text-primary);
  `}

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const InputWithButton = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const UploadButton = styled.button`
  padding: 12px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  transition: all 0.3s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ImagePreview = styled.div`
  margin-top: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  background: var(--tertiary-color);

  img,
  video {
    width: 100%;
    height: auto;
    max-height: 300px;
    object-fit: contain;
    display: block;
  }
`;

// Icon options for the icon picker
const ICON_OPTIONS = [
  { name: 'none', component: null, label: 'None' },
  { name: 'heart', component: FaHeart },
  { name: 'star', component: FaStar },
  { name: 'fire', component: FaFire },
  { name: 'rocket', component: FaRocket },
  { name: 'crown', component: FaCrown },
  { name: 'gem', component: FaGem },
  { name: 'trophy', component: FaTrophy },
  { name: 'gift', component: FaGift },
  { name: 'bolt', component: FaBolt },
  { name: 'magic', component: FaMagic },
  { name: 'smile', component: FaSmile },
  { name: 'thumbs-up', component: FaThumbsUp },
  { name: 'check', component: FaCheck },
  { name: 'user', component: FaUser },
  { name: 'users', component: FaUsers },
  { name: 'user-friends', component: FaUserFriends },
  { name: 'play', component: FaPlay },
  { name: 'film', component: FaFilm },
  { name: 'camera', component: FaCamera },
  { name: 'music', component: FaMusic },
  { name: 'headphones', component: FaHeadphones },
];

// Icon Picker Component
const IconPicker = ({ selectedIcon, onSelect, label }) => {
  return (
    <FormGroup>
      <Label>{label}</Label>
      <IconPickerContainer>
        <IconGrid>
          {ICON_OPTIONS.map((icon) => {
            const Icon = icon.component;
            return (
              <IconOption
                key={icon.name}
                type='button'
                $selected={selectedIcon === icon.name}
                onClick={() => onSelect(icon.name)}
                title={icon.label || icon.name}
              >
                {Icon ? <Icon /> : '✕'}
              </IconOption>
            );
          })}
        </IconGrid>
      </IconPickerContainer>
    </FormGroup>
  );
};

const DashboardFrontpage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddSliderModal, setShowAddSliderModal] = useState(false);
  const [newSliderItem, setNewSliderItem] = useState({
    type: 'image',
    url: '',
    alt: '',
    title: '',
  });
  const [uploadingSliderImage, setUploadingSliderImage] = useState(false);
  const [showAddBannerModal, setShowAddBannerModal] = useState(false);
  const [newBannerItem, setNewBannerItem] = useState({
    type: 'image',
    url: '',
    alt: '',
    title: '',
  });
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/frontpage/settings`
      );
      setSettings(res.data);
    } catch (err) {
      console.error('Error fetching frontpage settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/v1/frontpage/settings`,
        settings
      );
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (sectionKey) => {
    setSettings((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        enabled: !prev[sectionKey]?.enabled,
      },
    }));
  };

  const updateSectionField = (sectionKey, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }));
  };

  const updateNestedField = (sectionKey, nestedKey, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [nestedKey]: {
          ...prev[sectionKey][nestedKey],
          [field]: value,
        },
      },
    }));
  };

  const closeSliderModal = () => {
    setShowAddSliderModal(false);
    setNewSliderItem({ type: 'image', url: '', alt: '', title: '' });
    setUploadingSliderImage(false);
  };

  const addSliderItem = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/frontpage/slider/items`,
        newSliderItem
      );
      setSettings(res.data);
      closeSliderModal();
    } catch (err) {
      console.error('Error adding slider item:', err);
      alert('Error adding slider item');
    }
  };

  const handleSliderImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (newSliderItem.type === 'image' && !file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (newSliderItem.type === 'video' && !file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    try {
      setUploadingSliderImage(true);
      const formData = new FormData();

      if (newSliderItem.type === 'image') {
        formData.append('image', file);
      } else {
        formData.append('video', file);
      }

      const endpoint =
        newSliderItem.type === 'image'
          ? '/api/v1/upload/image'
          : '/api/v1/upload';

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      // Update the URL in the form
      setNewSliderItem({ ...newSliderItem, url: res.data.url });
    } catch (err) {
      console.error('Error uploading file:', err);
      alert(err.response?.data?.msg || 'Error uploading file');
    } finally {
      setUploadingSliderImage(false);
    }
  };

  const removeSliderItem = async (itemId) => {
    if (!confirm('Are you sure you want to remove this slider item?')) return;

    try {
      const res = await axios.delete(
        `${
          import.meta.env.VITE_API_URL
        }/api/v1/frontpage/slider/items/${itemId}`
      );
      setSettings(res.data);
    } catch (err) {
      console.error('Error removing slider item:', err);
      alert('Error removing slider item');
    }
  };

  const closeBannerModal = () => {
    setShowAddBannerModal(false);
    setNewBannerItem({ type: 'image', url: '', alt: '', title: '' });
    setUploadingBannerImage(false);
  };

  const addBannerItem = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/frontpage/banner/items`,
        newBannerItem
      );
      setSettings(res.data);
      closeBannerModal();
    } catch (err) {
      console.error('Error adding banner item:', err);
      alert('Error adding banner item');
    }
  };

  const handleBannerImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (newBannerItem.type === 'image' && !file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (newBannerItem.type === 'video' && !file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    try {
      setUploadingBannerImage(true);
      const formData = new FormData();

      if (newBannerItem.type === 'image') {
        formData.append('image', file);
      } else {
        formData.append('video', file);
      }

      const endpoint =
        newBannerItem.type === 'image'
          ? '/api/v1/upload/image'
          : '/api/v1/upload';

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      // Update the URL in the form
      setNewBannerItem({ ...newBannerItem, url: res.data.url });
    } catch (err) {
      console.error('Error uploading file:', err);
      alert(err.response?.data?.msg || 'Error uploading file');
    } finally {
      setUploadingBannerImage(false);
    }
  };

  const removeBannerItem = async (itemId) => {
    if (!confirm('Are you sure you want to remove this banner item?')) return;

    try {
      const res = await axios.delete(
        `${
          import.meta.env.VITE_API_URL
        }/api/v1/frontpage/banner/items/${itemId}`
      );
      setSettings(res.data);
    } catch (err) {
      console.error('Error removing banner item:', err);
      alert('Error removing banner item');
    }
  };

  if (loading) {
    return (
      <Container>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
          }}
        >
          Loading...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Frontpage Settings</Title>
        <HeaderButtonGroup>
          <PreviewButton
            onClick={() => window.open('/frontpage-preview', '_blank')}
          >
            <FaEye />
            Preview
          </PreviewButton>
          <SaveButton onClick={saveSettings} disabled={saving}>
            <FaSave />
            {saving ? 'Saving...' : 'Save Changes'}
          </SaveButton>
        </HeaderButtonGroup>
      </Header>

      {/* Section 1: Slider */}
      <SectionCard>
        <SectionHeader>
          <SectionTitle>
            <FaImage />
            Slider Section
          </SectionTitle>
          <ToggleButton
            $enabled={settings.slider?.enabled}
            onClick={() => toggleSection('slider')}
          >
            {settings.slider?.enabled ? <FaToggleOn /> : <FaToggleOff />}
            {settings.slider?.enabled ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SectionHeader>
        <SectionBody $collapsed={!settings.slider?.enabled}>
          <FormGroup>
            <Label>Slider Items</Label>
            <SliderItemsContainer>
              {settings.slider?.items?.map((item, index) => (
                <SliderItem key={item._id || index}>
                  <SliderItemPreview>
                    {item.type === 'video' ? (
                      <video
                        src={item.url}
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    ) : (
                      <img src={item.url} alt={item.alt} />
                    )}
                  </SliderItemPreview>
                  <SliderItemInfo>
                    <SliderItemType>{item.type}</SliderItemType>
                    <SliderItemUrl>{item.url}</SliderItemUrl>
                  </SliderItemInfo>
                  <ButtonGroup>
                    <IconButton
                      $variant='danger'
                      onClick={() => removeSliderItem(item._id)}
                    >
                      <FaTrash />
                    </IconButton>
                  </ButtonGroup>
                </SliderItem>
              ))}
              <AddButton onClick={() => setShowAddSliderModal(true)}>
                <FaPlus />
                Add Slider Item
              </AddButton>
            </SliderItemsContainer>
          </FormGroup>
        </SectionBody>
      </SectionCard>

      {/* Section 2: Happy Views */}
      <SectionCard>
        <SectionHeader>
          <SectionTitle>Happy Views Section</SectionTitle>
          <ToggleButton
            $enabled={settings.happyViewsSection?.enabled}
            onClick={() => toggleSection('happyViewsSection')}
          >
            {settings.happyViewsSection?.enabled ? (
              <FaToggleOn />
            ) : (
              <FaToggleOff />
            )}
            {settings.happyViewsSection?.enabled ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SectionHeader>
        <SectionBody $collapsed={!settings.happyViewsSection?.enabled}>
          <FormGroup>
            <ColorRow>
              <ColorGroup>
                <Label>Background Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.happyViewsSection?.backgroundColor || '#FF8C00'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyViewsSection',
                        'backgroundColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={
                      settings.happyViewsSection?.backgroundColor || '#FF8C00'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyViewsSection',
                        'backgroundColor',
                        e.target.value
                      )
                    }
                    placeholder='#FF8C00'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
              <ColorGroup>
                <Label>Text Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={settings.happyViewsSection?.textColor || '#ffffff'}
                    onChange={(e) =>
                      updateSectionField(
                        'happyViewsSection',
                        'textColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={settings.happyViewsSection?.textColor || '#ffffff'}
                    onChange={(e) =>
                      updateSectionField(
                        'happyViewsSection',
                        'textColor',
                        e.target.value
                      )
                    }
                    placeholder='#FFFFFF'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
              <ColorGroup>
                <Label>Heading Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.happyViewsSection?.headingColor || '#ffffff'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyViewsSection',
                        'headingColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={
                      settings.happyViewsSection?.headingColor || '#ffffff'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyViewsSection',
                        'headingColor',
                        e.target.value
                      )
                    }
                    placeholder='#FFFFFF'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
            </ColorRow>
          </FormGroup>
          <FormGroup>
            <Label>Heading</Label>
            <Input
              type='text'
              value={settings.happyViewsSection?.heading || ''}
              onChange={(e) =>
                updateSectionField(
                  'happyViewsSection',
                  'heading',
                  e.target.value
                )
              }
            />
          </FormGroup>
          <IconPicker
            selectedIcon={settings.happyViewsSection?.icon || 'none'}
            onSelect={(icon) =>
              updateSectionField('happyViewsSection', 'icon', icon)
            }
            label='Heading Icon'
          />
          <FormGroup>
            <Label>Heading Text Stroke</Label>
            <StrokeControlsRow>
              <ColorGroup>
                <Label>Stroke Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.happyViewsSection?.headingStrokeColor ||
                      '#000000'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyViewsSection',
                        'headingStrokeColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={
                      settings.happyViewsSection?.headingStrokeColor ||
                      '#000000'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyViewsSection',
                        'headingStrokeColor',
                        e.target.value
                      )
                    }
                    placeholder='#000000'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
              <ColorGroup>
                <Label>Stroke Width (px)</Label>
                <StrokeWidthInput
                  type='number'
                  min='0'
                  max='10'
                  value={settings.happyViewsSection?.headingStrokeWidth || 0}
                  onChange={(e) =>
                    updateSectionField(
                      'happyViewsSection',
                      'headingStrokeWidth',
                      parseInt(e.target.value)
                    )
                  }
                />
              </ColorGroup>
            </StrokeControlsRow>
          </FormGroup>
          <FormGroup>
            <Label>Description (Optional)</Label>
            <TextArea
              value={settings.happyViewsSection?.description || ''}
              onChange={(e) =>
                updateSectionField(
                  'happyViewsSection',
                  'description',
                  e.target.value
                )
              }
              placeholder='Add an optional description here...'
            />
          </FormGroup>
          <FormGroup>
            <Label>Text Alignment</Label>
            <Select
              value={settings.happyViewsSection?.textAlign || 'center'}
              onChange={(e) =>
                updateSectionField(
                  'happyViewsSection',
                  'textAlign',
                  e.target.value
                )
              }
            >
              <option value='left'>Left</option>
              <option value='center'>Center</option>
              <option value='right'>Right</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Code Input Label</Label>
            <Input
              type='text'
              value={settings.happyViewsSection?.codeInput?.label || ''}
              onChange={(e) =>
                updateNestedField(
                  'happyViewsSection',
                  'codeInput',
                  'label',
                  e.target.value
                )
              }
            />
          </FormGroup>
          <FormGroup>
            <Label>Code Input Placeholder</Label>
            <Input
              type='text'
              value={settings.happyViewsSection?.codeInput?.placeholder || ''}
              onChange={(e) =>
                updateNestedField(
                  'happyViewsSection',
                  'codeInput',
                  'placeholder',
                  e.target.value
                )
              }
            />
          </FormGroup>
          <FormGroup>
            <ColorRow>
              <ColorGroup>
                <Label>Button Background Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.happyViewsSection?.buttonBackgroundColor ||
                      '#FF0000'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyViewsSection',
                        'buttonBackgroundColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={
                      settings.happyViewsSection?.buttonBackgroundColor || ''
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyViewsSection',
                        'buttonBackgroundColor',
                        e.target.value
                      )
                    }
                    placeholder='#FF0000'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
              <ColorGroup>
                <Label>Button Text Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.happyViewsSection?.buttonTextColor || '#ffffff'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyViewsSection',
                        'buttonTextColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={settings.happyViewsSection?.buttonTextColor || ''}
                    onChange={(e) =>
                      updateSectionField(
                        'happyViewsSection',
                        'buttonTextColor',
                        e.target.value
                      )
                    }
                    placeholder='#FFFFFF'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
            </ColorRow>
          </FormGroup>
        </SectionBody>
      </SectionCard>

      {/* Section 4: Banner */}
      <SectionCard>
        <SectionHeader>
          <SectionTitle>
            <FaImage />
            Banner Slider Section
          </SectionTitle>
          <ToggleButton
            $enabled={settings.bannerSection?.enabled}
            onClick={() => toggleSection('bannerSection')}
          >
            {settings.bannerSection?.enabled ? <FaToggleOn /> : <FaToggleOff />}
            {settings.bannerSection?.enabled ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SectionHeader>
        <SectionBody $collapsed={!settings.bannerSection?.enabled}>
          <FormGroup>
            <Label>Banner Items</Label>
            <SliderItemsContainer>
              {settings.bannerSection?.items?.map((item, index) => (
                <SliderItem key={item._id || index}>
                  <SliderItemPreview>
                    {item.type === 'video' ? (
                      <video
                        src={item.url}
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    ) : (
                      <img src={item.url} alt={item.alt} />
                    )}
                  </SliderItemPreview>
                  <SliderItemInfo>
                    <SliderItemType>{item.type}</SliderItemType>
                    <SliderItemUrl>{item.url}</SliderItemUrl>
                  </SliderItemInfo>
                  <ButtonGroup>
                    <IconButton
                      $variant='danger'
                      onClick={() => removeBannerItem(item._id)}
                    >
                      <FaTrash />
                    </IconButton>
                  </ButtonGroup>
                </SliderItem>
              ))}
              <AddButton onClick={() => setShowAddBannerModal(true)}>
                <FaPlus />
                Add Banner Item
              </AddButton>
            </SliderItemsContainer>
          </FormGroup>
        </SectionBody>
      </SectionCard>

      {/* Section 5: Happy Team */}
      <SectionCard>
        <SectionHeader>
          <SectionTitle>Happy Team Section</SectionTitle>
          <ToggleButton
            $enabled={settings.happyTeamSection?.enabled}
            onClick={() => toggleSection('happyTeamSection')}
          >
            {settings.happyTeamSection?.enabled ? (
              <FaToggleOn />
            ) : (
              <FaToggleOff />
            )}
            {settings.happyTeamSection?.enabled ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SectionHeader>
        <SectionBody $collapsed={!settings.happyTeamSection?.enabled}>
          <FormGroup>
            <ColorRow>
              <ColorGroup>
                <Label>Background Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.happyTeamSection?.backgroundColor || '#0f0f0f'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyTeamSection',
                        'backgroundColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={
                      settings.happyTeamSection?.backgroundColor || '#0f0f0f'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyTeamSection',
                        'backgroundColor',
                        e.target.value
                      )
                    }
                    placeholder='#0F0F0F'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
              <ColorGroup>
                <Label>Text Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={settings.happyTeamSection?.textColor || '#ffffff'}
                    onChange={(e) =>
                      updateSectionField(
                        'happyTeamSection',
                        'textColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={settings.happyTeamSection?.textColor || '#ffffff'}
                    onChange={(e) =>
                      updateSectionField(
                        'happyTeamSection',
                        'textColor',
                        e.target.value
                      )
                    }
                    placeholder='#FFFFFF'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
              <ColorGroup>
                <Label>Heading Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={settings.happyTeamSection?.headingColor || '#ffffff'}
                    onChange={(e) =>
                      updateSectionField(
                        'happyTeamSection',
                        'headingColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={settings.happyTeamSection?.headingColor || '#ffffff'}
                    onChange={(e) =>
                      updateSectionField(
                        'happyTeamSection',
                        'headingColor',
                        e.target.value
                      )
                    }
                    placeholder='#FFFFFF'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
            </ColorRow>
          </FormGroup>
          <FormGroup>
            <Label>Left Text</Label>
            <Input
              type='text'
              value={settings.happyTeamSection?.leftText || ''}
              onChange={(e) =>
                updateSectionField(
                  'happyTeamSection',
                  'leftText',
                  e.target.value
                )
              }
            />
          </FormGroup>
          <IconPicker
            selectedIcon={settings.happyTeamSection?.icon || 'none'}
            onSelect={(icon) =>
              updateSectionField('happyTeamSection', 'icon', icon)
            }
            label='Heading Icon'
          />
          <FormGroup>
            <Label>Heading Text Stroke</Label>
            <StrokeControlsRow>
              <ColorGroup>
                <Label>Stroke Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.happyTeamSection?.headingStrokeColor || '#000000'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyTeamSection',
                        'headingStrokeColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={
                      settings.happyTeamSection?.headingStrokeColor || '#000000'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyTeamSection',
                        'headingStrokeColor',
                        e.target.value
                      )
                    }
                    placeholder='#000000'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
              <ColorGroup>
                <Label>Stroke Width (px)</Label>
                <StrokeWidthInput
                  type='number'
                  min='0'
                  max='10'
                  value={settings.happyTeamSection?.headingStrokeWidth || 0}
                  onChange={(e) =>
                    updateSectionField(
                      'happyTeamSection',
                      'headingStrokeWidth',
                      parseInt(e.target.value)
                    )
                  }
                />
              </ColorGroup>
            </StrokeControlsRow>
          </FormGroup>
          <FormGroup>
            <Label>Description (Optional)</Label>
            <TextArea
              value={settings.happyTeamSection?.description || ''}
              onChange={(e) =>
                updateSectionField(
                  'happyTeamSection',
                  'description',
                  e.target.value
                )
              }
              placeholder='Add an optional description here...'
            />
          </FormGroup>
          <FormGroup>
            <Label>Text Alignment</Label>
            <Select
              value={settings.happyTeamSection?.textAlign || 'center'}
              onChange={(e) =>
                updateSectionField(
                  'happyTeamSection',
                  'textAlign',
                  e.target.value
                )
              }
            >
              <option value='left'>Left</option>
              <option value='center'>Center</option>
              <option value='right'>Right</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <ColorRow>
              <ColorGroup>
                <Label>Login Button Text</Label>
                <Input
                  type='text'
                  value={settings.happyTeamSection?.loginText || ''}
                  onChange={(e) =>
                    updateSectionField(
                      'happyTeamSection',
                      'loginText',
                      e.target.value
                    )
                  }
                  placeholder='Login'
                />
              </ColorGroup>
              <ColorGroup>
                <Label>Signup Button Text</Label>
                <Input
                  type='text'
                  value={settings.happyTeamSection?.signupText || ''}
                  onChange={(e) =>
                    updateSectionField(
                      'happyTeamSection',
                      'signupText',
                      e.target.value
                    )
                  }
                  placeholder='Signup'
                />
              </ColorGroup>
            </ColorRow>
          </FormGroup>
          <FormGroup>
            <Label>Login Button Colors</Label>
            <ColorRow>
              <ColorGroup>
                <Label>Background Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.happyTeamSection?.loginButtonBackgroundColor ||
                      '#FF0000'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyTeamSection',
                        'loginButtonBackgroundColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={
                      settings.happyTeamSection?.loginButtonBackgroundColor ||
                      ''
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyTeamSection',
                        'loginButtonBackgroundColor',
                        e.target.value
                      )
                    }
                    placeholder='#FF0000'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
              <ColorGroup>
                <Label>Text Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.happyTeamSection?.loginButtonTextColor ||
                      '#ffffff'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyTeamSection',
                        'loginButtonTextColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={
                      settings.happyTeamSection?.loginButtonTextColor || ''
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyTeamSection',
                        'loginButtonTextColor',
                        e.target.value
                      )
                    }
                    placeholder='#FFFFFF'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
            </ColorRow>
          </FormGroup>
          <FormGroup>
            <Label>Signup Button Colors</Label>
            <ColorRow>
              <ColorGroup>
                <Label>Background Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.happyTeamSection?.signupButtonBackgroundColor ||
                      '#FF0000'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyTeamSection',
                        'signupButtonBackgroundColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={
                      settings.happyTeamSection?.signupButtonBackgroundColor ||
                      ''
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyTeamSection',
                        'signupButtonBackgroundColor',
                        e.target.value
                      )
                    }
                    placeholder='#FF0000'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
              <ColorGroup>
                <Label>Text Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.happyTeamSection?.signupButtonTextColor ||
                      '#ffffff'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyTeamSection',
                        'signupButtonTextColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={
                      settings.happyTeamSection?.signupButtonTextColor || ''
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'happyTeamSection',
                        'signupButtonTextColor',
                        e.target.value
                      )
                    }
                    placeholder='#FFFFFF'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
            </ColorRow>
          </FormGroup>
        </SectionBody>
      </SectionCard>

      {/* Footer Section */}
      <SectionCard>
        <SectionHeader>
          <SectionTitle>Footer Section</SectionTitle>
          <ToggleButton
            $enabled={settings.footerSection?.enabled}
            onClick={() => toggleSection('footerSection')}
          >
            {settings.footerSection?.enabled ? <FaToggleOn /> : <FaToggleOff />}
            {settings.footerSection?.enabled ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </SectionHeader>
        <SectionBody $collapsed={!settings.footerSection?.enabled}>
          <FormGroup>
            <ColorRow>
              <ColorGroup>
                <Label>Background Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={settings.footerSection?.backgroundColor || '#1a1a1a'}
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'backgroundColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={settings.footerSection?.backgroundColor || '#1a1a1a'}
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'backgroundColor',
                        e.target.value
                      )
                    }
                    placeholder='#1A1A1A'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
              <ColorGroup>
                <Label>Text Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={settings.footerSection?.textColor || '#ffffff'}
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'textColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={settings.footerSection?.textColor || '#ffffff'}
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'textColor',
                        e.target.value
                      )
                    }
                    placeholder='#FFFFFF'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
            </ColorRow>
          </FormGroup>
          <FormGroup>
            <Label>Site Name</Label>
            <Input
              type='text'
              value={settings.footerSection?.siteName || ''}
              onChange={(e) =>
                updateSectionField('footerSection', 'siteName', e.target.value)
              }
              placeholder='Company Name'
            />
          </FormGroup>
          <FormGroup>
            <Label>Site Name Color</Label>
            <ColorInputRow>
              <ColorInput
                type='color'
                value={settings.footerSection?.siteNameColor || '#ff0000'}
                onChange={(e) =>
                  updateSectionField(
                    'footerSection',
                    'siteNameColor',
                    e.target.value
                  )
                }
              />
              <HexInput
                type='text'
                value={settings.footerSection?.siteNameColor || ''}
                onChange={(e) =>
                  updateSectionField(
                    'footerSection',
                    'siteNameColor',
                    e.target.value
                  )
                }
                placeholder='#FF0000'
                maxLength='7'
              />
            </ColorInputRow>
          </FormGroup>
          <FormGroup>
            <Label>Description</Label>
            <TextArea
              value={settings.footerSection?.description || ''}
              onChange={(e) =>
                updateSectionField(
                  'footerSection',
                  'description',
                  e.target.value
                )
              }
              placeholder='Company description...'
            />
          </FormGroup>
          <FormGroup>
            <Label>Description Color</Label>
            <ColorInputRow>
              <ColorInput
                type='color'
                value={settings.footerSection?.descriptionColor || '#cccccc'}
                onChange={(e) =>
                  updateSectionField(
                    'footerSection',
                    'descriptionColor',
                    e.target.value
                  )
                }
              />
              <HexInput
                type='text'
                value={settings.footerSection?.descriptionColor || ''}
                onChange={(e) =>
                  updateSectionField(
                    'footerSection',
                    'descriptionColor',
                    e.target.value
                  )
                }
                placeholder='#CCCCCC'
                maxLength='7'
              />
            </ColorInputRow>
          </FormGroup>
          <FormGroup>
            <Label>Contact Information</Label>
            <ColorRow>
              <ColorGroup>
                <Label>Phone</Label>
                <Input
                  type='text'
                  value={settings.footerSection?.phone || ''}
                  onChange={(e) =>
                    updateSectionField('footerSection', 'phone', e.target.value)
                  }
                  placeholder='+1 (555) 123-4567'
                />
              </ColorGroup>
              <ColorGroup>
                <Label>Email</Label>
                <Input
                  type='email'
                  value={settings.footerSection?.email || ''}
                  onChange={(e) =>
                    updateSectionField('footerSection', 'email', e.target.value)
                  }
                  placeholder='contact@company.com'
                />
              </ColorGroup>
              <ColorGroup>
                <Label>Location</Label>
                <Input
                  type='text'
                  value={settings.footerSection?.location || ''}
                  onChange={(e) =>
                    updateSectionField(
                      'footerSection',
                      'location',
                      e.target.value
                    )
                  }
                  placeholder='New York, USA'
                />
              </ColorGroup>
            </ColorRow>
          </FormGroup>
          <FormGroup>
            <Label>Contact Colors</Label>
            <ColorRow>
              <ColorGroup>
                <Label>Text Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.footerSection?.contactTextColor || '#ffffff'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'contactTextColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={settings.footerSection?.contactTextColor || ''}
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'contactTextColor',
                        e.target.value
                      )
                    }
                    placeholder='#FFFFFF'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
              <ColorGroup>
                <Label>Icon Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.footerSection?.contactIconColor || '#ff0000'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'contactIconColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={settings.footerSection?.contactIconColor || ''}
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'contactIconColor',
                        e.target.value
                      )
                    }
                    placeholder='#FF0000'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
            </ColorRow>
          </FormGroup>
          <FormGroup>
            <Label>Hire Form Title</Label>
            <Input
              type='text'
              value={settings.footerSection?.formTitle || ''}
              onChange={(e) =>
                updateSectionField('footerSection', 'formTitle', e.target.value)
              }
              placeholder='Hire Us'
            />
          </FormGroup>
          <FormGroup>
            <Label>Form Title Color</Label>
            <ColorInputRow>
              <ColorInput
                type='color'
                value={settings.footerSection?.formTitleColor || '#ffffff'}
                onChange={(e) =>
                  updateSectionField(
                    'footerSection',
                    'formTitleColor',
                    e.target.value
                  )
                }
              />
              <HexInput
                type='text'
                value={settings.footerSection?.formTitleColor || ''}
                onChange={(e) =>
                  updateSectionField(
                    'footerSection',
                    'formTitleColor',
                    e.target.value
                  )
                }
                placeholder='#FFFFFF'
                maxLength='7'
              />
            </ColorInputRow>
          </FormGroup>
          <FormGroup>
            <Label>Available Roles</Label>
            <SliderItemsContainer>
              {settings.footerSection?.roles?.map((role, index) => (
                <SliderItem key={index}>
                  <SliderItemInfo>
                    <div style={{ color: 'var(--text-primary)' }}>{role}</div>
                  </SliderItemInfo>
                  <ButtonGroup>
                    <IconButton
                      $variant='danger'
                      onClick={() => {
                        const newRoles = settings.footerSection.roles.filter(
                          (_, i) => i !== index
                        );
                        updateSectionField('footerSection', 'roles', newRoles);
                      }}
                    >
                      <FaTrash />
                    </IconButton>
                  </ButtonGroup>
                </SliderItem>
              ))}
              <AddButton
                onClick={() => {
                  const role = prompt('Enter role name:');
                  if (role) {
                    const newRoles = [
                      ...(settings.footerSection?.roles || []),
                      role,
                    ];
                    updateSectionField('footerSection', 'roles', newRoles);
                  }
                }}
              >
                <FaPlus />
                Add Role
              </AddButton>
            </SliderItemsContainer>
          </FormGroup>
          <FormGroup>
            <Label>Form Colors</Label>
            <ColorRow>
              <ColorGroup>
                <Label>Form Background</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.footerSection?.formBackgroundColor || '#0f0f0f'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'formBackgroundColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={settings.footerSection?.formBackgroundColor || ''}
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'formBackgroundColor',
                        e.target.value
                      )
                    }
                    placeholder='#0F0F0F'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
              <ColorGroup>
                <Label>Form Border</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={settings.footerSection?.formBorderColor || '#333333'}
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'formBorderColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={settings.footerSection?.formBorderColor || ''}
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'formBorderColor',
                        e.target.value
                      )
                    }
                    placeholder='#333333'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
            </ColorRow>
          </FormGroup>
          <FormGroup>
            <Label>Form Input Colors</Label>
            <ColorRow>
              <ColorGroup>
                <Label>Input Background</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.footerSection?.formInputBackgroundColor ||
                      '#000000'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'formInputBackgroundColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={
                      settings.footerSection?.formInputBackgroundColor || ''
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'formInputBackgroundColor',
                        e.target.value
                      )
                    }
                    placeholder='#000000'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
              <ColorGroup>
                <Label>Input Text</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.footerSection?.formInputTextColor || '#ffffff'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'formInputTextColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={settings.footerSection?.formInputTextColor || ''}
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'formInputTextColor',
                        e.target.value
                      )
                    }
                    placeholder='#FFFFFF'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
              <ColorGroup>
                <Label>Input Border</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.footerSection?.formInputBorderColor || '#333333'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'formInputBorderColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={settings.footerSection?.formInputBorderColor || ''}
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'formInputBorderColor',
                        e.target.value
                      )
                    }
                    placeholder='#333333'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
            </ColorRow>
          </FormGroup>
          <FormGroup>
            <ColorRow>
              <ColorGroup>
                <Label>Input Focus Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.footerSection?.formInputFocusColor || '#ff0000'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'formInputFocusColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={settings.footerSection?.formInputFocusColor || ''}
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'formInputFocusColor',
                        e.target.value
                      )
                    }
                    placeholder='#FF0000'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
              <ColorGroup>
                <Label>Placeholder Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.footerSection?.formInputPlaceholderColor ||
                      '#666666'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'formInputPlaceholderColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={
                      settings.footerSection?.formInputPlaceholderColor || ''
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'formInputPlaceholderColor',
                        e.target.value
                      )
                    }
                    placeholder='#666666'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
            </ColorRow>
          </FormGroup>
          <FormGroup>
            <Label>Form Button Text</Label>
            <Input
              type='text'
              value={settings.footerSection?.formButtonText || ''}
              onChange={(e) =>
                updateSectionField(
                  'footerSection',
                  'formButtonText',
                  e.target.value
                )
              }
              placeholder='Submit'
            />
          </FormGroup>
          <FormGroup>
            <Label>Form Button Colors</Label>
            <ColorRow>
              <ColorGroup>
                <Label>Button Background</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.footerSection?.formButtonBackgroundColor ||
                      '#ff0000'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'formButtonBackgroundColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={
                      settings.footerSection?.formButtonBackgroundColor || ''
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'formButtonBackgroundColor',
                        e.target.value
                      )
                    }
                    placeholder='#FF0000'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
              <ColorGroup>
                <Label>Button Text</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.footerSection?.formButtonTextColor || '#ffffff'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'formButtonTextColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={settings.footerSection?.formButtonTextColor || ''}
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'formButtonTextColor',
                        e.target.value
                      )
                    }
                    placeholder='#FFFFFF'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
            </ColorRow>
          </FormGroup>
          <FormGroup>
            <Label>Copyright Text</Label>
            <Input
              type='text'
              value={settings.footerSection?.copyrightText || ''}
              onChange={(e) =>
                updateSectionField(
                  'footerSection',
                  'copyrightText',
                  e.target.value
                )
              }
              placeholder='© 2024 Company Name. All rights reserved.'
            />
          </FormGroup>
          <FormGroup>
            <Label>Copyright Colors</Label>
            <ColorRow>
              <ColorGroup>
                <Label>Text Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.footerSection?.copyrightTextColor || '#999999'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'copyrightTextColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={settings.footerSection?.copyrightTextColor || ''}
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'copyrightTextColor',
                        e.target.value
                      )
                    }
                    placeholder='#999999'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
              <ColorGroup>
                <Label>Border Color</Label>
                <ColorInputRow>
                  <ColorInput
                    type='color'
                    value={
                      settings.footerSection?.copyrightBorderColor || '#333333'
                    }
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'copyrightBorderColor',
                        e.target.value
                      )
                    }
                  />
                  <HexInput
                    type='text'
                    value={settings.footerSection?.copyrightBorderColor || ''}
                    onChange={(e) =>
                      updateSectionField(
                        'footerSection',
                        'copyrightBorderColor',
                        e.target.value
                      )
                    }
                    placeholder='#333333'
                    maxLength='7'
                  />
                </ColorInputRow>
              </ColorGroup>
            </ColorRow>
          </FormGroup>
        </SectionBody>
      </SectionCard>

      {/* Add Slider Item Modal */}
      {showAddSliderModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Add Slider Item</ModalTitle>
              <CloseButton onClick={closeSliderModal}>×</CloseButton>
            </ModalHeader>
            <FormGroup>
              <Label>Type</Label>
              <select
                value={newSliderItem.type}
                onChange={(e) =>
                  setNewSliderItem({ ...newSliderItem, type: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  background: 'var(--tertiary-color)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value='image'>Image</option>
                <option value='video'>Video</option>
              </select>
            </FormGroup>
            <FormGroup>
              <Label>URL</Label>
              <InputWithButton>
                <Input
                  type='url'
                  value={newSliderItem.url}
                  onChange={(e) =>
                    setNewSliderItem({ ...newSliderItem, url: e.target.value })
                  }
                  placeholder='Enter image or video URL'
                  style={{ flex: 1 }}
                />
                <HiddenFileInput
                  type='file'
                  id='sliderFileInput'
                  accept={
                    newSliderItem.type === 'image' ? 'image/*' : 'video/*'
                  }
                  onChange={handleSliderImageUpload}
                />
                <UploadButton
                  type='button'
                  onClick={() =>
                    document.getElementById('sliderFileInput').click()
                  }
                  disabled={uploadingSliderImage}
                >
                  {uploadingSliderImage ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      {newSliderItem.type === 'image' ? (
                        <FaImage />
                      ) : (
                        <FaVideo />
                      )}
                      Upload
                    </>
                  )}
                </UploadButton>
              </InputWithButton>
              {newSliderItem.url && (
                <ImagePreview>
                  {newSliderItem.type === 'video' ? (
                    <video
                      src={newSliderItem.url}
                      controls
                      controlsList='nodownload'
                      disablePictureInPicture
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  ) : (
                    <img src={newSliderItem.url} alt='Preview' />
                  )}
                </ImagePreview>
              )}
            </FormGroup>
            <FormGroup>
              <Label>Alt Text</Label>
              <Input
                type='text'
                value={newSliderItem.alt}
                onChange={(e) =>
                  setNewSliderItem({ ...newSliderItem, alt: e.target.value })
                }
                placeholder='Alt text for accessibility'
              />
            </FormGroup>
            <FormGroup>
              <Label>Title</Label>
              <Input
                type='text'
                value={newSliderItem.title}
                onChange={(e) =>
                  setNewSliderItem({ ...newSliderItem, title: e.target.value })
                }
                placeholder='Optional title'
              />
            </FormGroup>
            <ModalButtonGroup>
              <Button onClick={closeSliderModal}>Cancel</Button>
              <Button
                $variant='primary'
                onClick={addSliderItem}
                disabled={uploadingSliderImage}
              >
                Add Item
              </Button>
            </ModalButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {/* Add Banner Item Modal */}
      {showAddBannerModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Add Banner Item</ModalTitle>
              <CloseButton onClick={closeBannerModal}>×</CloseButton>
            </ModalHeader>
            <FormGroup>
              <Label>Type</Label>
              <select
                value={newBannerItem.type}
                onChange={(e) =>
                  setNewBannerItem({ ...newBannerItem, type: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  background: 'var(--tertiary-color)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value='image'>Image</option>
                <option value='video'>Video</option>
              </select>
            </FormGroup>
            <FormGroup>
              <Label>URL</Label>
              <InputWithButton>
                <Input
                  type='url'
                  value={newBannerItem.url}
                  onChange={(e) =>
                    setNewBannerItem({ ...newBannerItem, url: e.target.value })
                  }
                  placeholder='Enter image or video URL'
                  style={{ flex: 1 }}
                />
                <HiddenFileInput
                  type='file'
                  id='bannerFileInput'
                  accept={
                    newBannerItem.type === 'image' ? 'image/*' : 'video/*'
                  }
                  onChange={handleBannerImageUpload}
                />
                <UploadButton
                  type='button'
                  onClick={() =>
                    document.getElementById('bannerFileInput').click()
                  }
                  disabled={uploadingBannerImage}
                >
                  {uploadingBannerImage ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      {newBannerItem.type === 'image' ? (
                        <FaImage />
                      ) : (
                        <FaVideo />
                      )}
                      Upload
                    </>
                  )}
                </UploadButton>
              </InputWithButton>
              {newBannerItem.url && (
                <ImagePreview>
                  {newBannerItem.type === 'video' ? (
                    <video
                      src={newBannerItem.url}
                      controls
                      controlsList='nodownload'
                      disablePictureInPicture
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  ) : (
                    <img src={newBannerItem.url} alt='Preview' />
                  )}
                </ImagePreview>
              )}
            </FormGroup>
            <FormGroup>
              <Label>Alt Text</Label>
              <Input
                type='text'
                value={newBannerItem.alt}
                onChange={(e) =>
                  setNewBannerItem({ ...newBannerItem, alt: e.target.value })
                }
                placeholder='Alt text for accessibility'
              />
            </FormGroup>
            <FormGroup>
              <Label>Title</Label>
              <Input
                type='text'
                value={newBannerItem.title}
                onChange={(e) =>
                  setNewBannerItem({ ...newBannerItem, title: e.target.value })
                }
                placeholder='Optional title'
              />
            </FormGroup>
            <ModalButtonGroup>
              <Button onClick={closeBannerModal}>Cancel</Button>
              <Button
                $variant='primary'
                onClick={addBannerItem}
                disabled={uploadingBannerImage}
              >
                Add Item
              </Button>
            </ModalButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default DashboardFrontpage;
