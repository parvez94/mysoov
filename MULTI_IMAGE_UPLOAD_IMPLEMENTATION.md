# Multi-Image Upload Implementation Guide

## Overview

This implementation adds support for uploading multiple images that will be displayed in a slider across feeds, explore, and profile pages.

## Changes Made

### Backend Changes

#### 1. Video Model (`server/models/Video.js`)

- Added `images` field to store array of image objects

```javascript
images: {
  type: [Object],
  default: [],
}
```

#### 2. Upload Routes (`server/routes/uploadRoutes.js`)

- Added new endpoint `/upload/images` for handling multiple image uploads
- Supports both single and multiple file uploads
- Validates file sizes against user's subscription plan
- Uploads all images to Cloudinary in parallel
- Returns array of uploaded images with public_id and url

### Frontend Changes

#### 1. ImageSlider Component (`client/src/components/ImageSlider.jsx`)

- New component for displaying multiple images in a carousel/slider
- Features:
  - Navigation buttons (previous/next)
  - Dot indicators for current position
  - Image counter (1/3, 2/3, etc.)
  - Touch-friendly for mobile
  - Responsive design
  - Smooth transitions

#### 2. Card Component (`client/src/components/Card.jsx`)

- Updated to use ImageSlider when multiple images exist
- Falls back to single image display for backward compatibility
- Works in feeds, explore, and profile pages

#### 3. Upload Page (`client/src/pages/Upload.jsx`)

- **Needs to be updated** to allow selecting multiple images
- Key changes needed:
  - Add `multiple` attribute to file input for image type
  - Handle array of files instead of single file
  - Upload multiple images using the new `/upload/images` endpoint
  - Preview all selected images before posting
  - Allow removing individual images from the selection

## How to Complete the Implementation

### Update Upload.jsx

You need to modify the Upload page to:

1. **Detect if user selects multiple images**
2. **Upload all images using the new endpoint**
3. **Store the images array in state**
4. **Show previews for all images**
5. **Submit the images array when creating the post**

### Key Code Changes for Upload.jsx

#### State Changes

```javascript
const [images, setImages] = useState([]); // Array of uploaded images
const [imageFiles, setImageFiles] = useState([]); // Local file objects for preview
```

#### File Input

```javascript
<DragInput
  type='file'
  accept={mediaType === 'video' ? 'video/*' : 'image/*'}
  multiple={mediaType === 'image'} // Enable multiple for images
  onChange={handleUpload}
/>
```

#### Upload Handler (for multiple images)

```javascript
const handleUpload = async (e) => {
  const files = Array.from(e.target.files || []);

  if (files.length === 0) return;

  // Detect if first file is image or video
  const firstFile = files[0];
  const isImage = firstFile.type.startsWith('image/');
  const isVideo = firstFile.type.startsWith('video/');

  if (isVideo && files.length > 1) {
    alert('You can only upload one video at a time');
    return;
  }

  if (isImage && files.length > 1) {
    // Handle multiple image upload
    await uploadMultipleImages(files);
  } else {
    // Handle single file upload (existing logic)
    // ... existing code ...
  }
};

const uploadMultipleImages = async (files) => {
  try {
    setUploading(true);
    setStatus('uploading');

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/upload/images`,
      formData,
      {
        withCredentials: true,
        onUploadProgress: (evt) => {
          if (evt.total) {
            const percent = Math.round((evt.loaded / evt.total) * 100);
            setUploadProgress(Math.min(95, percent));
          }
        },
      }
    );

    setImages(res.data.images);
    setImageFiles(files);
    setMediaType('image');
    setStatus('success');
    setUploadProgress(100);
  } catch (err) {
    setStatus('error');
    alert('Failed to upload images');
  } finally {
    setUploading(false);
  }
};
```

#### Form Submission

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  // For images with multiple uploads
  if (mediaType === 'image' && images.length > 0) {
    const requestBody = {
      caption: caption,
      images: images, // Array of images
      videoUrl: images[0], // First image as primary (for backward compatibility)
      mediaType: 'image',
      privacy: privacy || 'Public',
      storageProvider: 'cloudinary',
    };

    // ... rest of submission logic
  }
  // For single video or single image
  else if (videoFile) {
    const requestBody = {
      caption: caption,
      videoUrl: videoFile,
      mediaType: mediaType,
      privacy: privacy || 'Public',
      storageProvider: videoFile?.provider || 'cloudinary',
    };

    // ... rest of submission logic
  }
};
```

## Testing

1. **Single Image**: Upload a single image - should work as before
2. **Multiple Images**: Select 2-5 images - should show slider
3. **Video**: Upload a video - should work as before
4. **Feeds**: Check that multi-image posts show slider in feed
5. **Explore**: Check that multi-image posts show slider in explore
6. **Profile**: Check that multi-image posts show slider on profile

## Future Enhancements

- Add image reordering before upload
- Add individual image captions
- Support drag-and-drop for multiple files
- Add image editing (crop, filter) before upload
- Set a maximum number of images per post (e.g., 10)
