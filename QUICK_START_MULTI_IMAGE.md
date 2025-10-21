# Quick Start: Multi-Image Upload Feature

## 🚀 For End Users

### How to Upload Multiple Images:

1. **Click "Upload"** button in the top navigation bar
2. **Click the upload area** (or drag files)
3. **Select multiple images:**
   - **Windows:** Hold `Ctrl` and click multiple images
   - **Mac:** Hold `Cmd` and click multiple images
   - **Range Select:** Click first image, hold `Shift`, click last image
4. **Preview appears** showing all selected images in a grid
5. **Remove unwanted images** by clicking the × button on each
6. **Add a caption** for your post
7. **Choose privacy** (Public or Private)
8. **Click "Post Now"**

### How to View Multi-Image Posts:

- **Navigate:** Click ← → arrow buttons on either side
- **Jump:** Click dot indicators at the bottom
- **See Position:** Image counter shows "2/5" (image 2 of 5)
- **Mobile:** Swipe left/right to navigate (coming soon)

---

## 👨‍💻 For Developers

### Quick Integration Guide:

#### Use ImageSlider in Your Component:

```jsx
import { ImageSlider } from '../components';

// In your component:
const MyComponent = ({ post }) => {
  const images = post?.images || [];

  return (
    <div>
      {images.length > 0 ? (
        <ImageSlider images={images} caption={post.caption} />
      ) : (
        <img src={post.videoUrl.url} alt='Single image' />
      )}
    </div>
  );
};
```

#### Upload Multiple Images from Your Code:

```javascript
const uploadImages = async (files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await axios.post('/api/v1/upload/images', formData, {
    withCredentials: true,
    onUploadProgress: (evt) => {
      const percent = (evt.loaded / evt.total) * 100;
      console.log(`Upload progress: ${percent}%`);
    },
  });

  return response.data.images; // Array of {public_id, url, provider}
};
```

#### Create Post with Multiple Images:

```javascript
const createPost = async (caption, images) => {
  const response = await fetch('/api/v1/videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      caption: caption,
      videoUrl: images[0], // First image for backward compatibility
      images: images, // All images for slider
      mediaType: 'image',
      privacy: 'Public',
      storageProvider: 'cloudinary',
    }),
  });

  return response.json();
};
```

---

## 🎨 Customization Examples

### Change Slider Colors:

```css
/* In ImageSlider.jsx */

// Navigation buttons
background: rgba(255, 0, 0, 0.8); /* Red buttons */

// Active indicator
background: #00ff00; /* Green active dot */

// Inactive indicator
background: rgba(255, 255, 255, 0.3); /* Light inactive dots */
```

### Change Animation Speed:

```css
/* In ImageSlider.jsx - SliderWrapper */
transition: transform 0.5s ease-in-out; /* Slower */
transition: transform 0.2s ease-in-out; /* Faster */
```

### Change Max Images Height:

```css
/* In ImageSlider.jsx - Image */
max-height: 800px; /* Larger */
max-height: 400px; /* Smaller */
```

---

## 📊 API Reference

### Backend Endpoint

**Upload Multiple Images:**

```
POST /api/v1/upload/images
Content-Type: multipart/form-data
Authentication: Required (cookie)

Body:
  images: File[] (array of image files)

Response:
{
  "images": [
    {
      "public_id": "images/abc123",
      "url": "https://res.cloudinary.com/...",
      "provider": "cloudinary"
    },
    ...
  ]
}

Errors:
  400 - No files uploaded
  403 - File size exceeds plan limit
  404 - User not found
  500 - Server error
```

**Create Post with Images:**

```
POST /api/v1/videos
Content-Type: application/json
Authentication: Required (cookie)

Body:
{
  "caption": "My post caption",
  "videoUrl": {...}, // First image (backward compatibility)
  "images": [...],   // All images for slider
  "mediaType": "image",
  "privacy": "Public",
  "storageProvider": "cloudinary"
}

Response:
{
  "_id": "...",
  "caption": "...",
  "images": [...],
  ...
}
```

---

## 🔧 Troubleshooting

### Issue: Images Not Uploading

**Solutions:**

- Check file size (must be within plan limit)
- Verify user is logged in
- Check Cloudinary credentials in .env
- Look for errors in browser console

### Issue: Slider Not Showing

**Solutions:**

- Ensure post has `images` array with multiple items
- Check if ImageSlider is properly imported
- Verify CSS is loading correctly
- Check browser console for errors

### Issue: Upload Progress Stuck

**Solutions:**

- Check internet connection
- Verify backend is running
- Check Cloudinary API limits
- Try smaller images

### Issue: Can't Select Multiple Files

**Solutions:**

- Make sure you're selecting images (not videos)
- Use Ctrl/Cmd + Click to select multiple
- Check if `multiple` attribute is on input
- Try different browser

---

## 📱 Browser Support

| Browser       | Version | Support |
| ------------- | ------- | ------- |
| Chrome        | 90+     | ✅ Full |
| Firefox       | 88+     | ✅ Full |
| Safari        | 14+     | ✅ Full |
| Edge          | 90+     | ✅ Full |
| Mobile Safari | 14+     | ✅ Full |
| Chrome Mobile | 90+     | ✅ Full |

---

## 🎯 Performance Tips

1. **Optimize Images:** Compress before upload (use tools like TinyPNG)
2. **Limit Count:** Keep it under 10 images per post
3. **File Size:** Keep individual images under 5MB
4. **Formats:** Use JPG for photos, PNG for graphics
5. **Lazy Load:** Images load as needed in the slider

---

## 📚 Additional Resources

- **Cloudinary Docs:** https://cloudinary.com/documentation
- **React File Upload:** https://react.dev/reference/react-dom/components/input#file
- **FormData API:** https://developer.mozilla.org/en-US/docs/Web/API/FormData

---

## ❓ FAQ

**Q: How many images can I upload at once?**
A: There's no hard limit, but we recommend 2-10 images per post for best performance.

**Q: Can I mix images and videos?**
A: No, each post can have either multiple images OR one video, not both.

**Q: What file formats are supported?**
A: JPG, PNG, WebP, GIF (non-animated recommended)

**Q: Can I reorder images after upload?**
A: Not yet - select them in the desired order when uploading.

**Q: What happens to old single-image posts?**
A: They continue to work perfectly! The feature is backward compatible.

**Q: Can I edit images after uploading?**
A: Currently no, but you can remove and re-upload them.

---

## 🎉 That's It!

You're all set to use the multi-image upload feature. If you have any questions or run into issues, refer to the full implementation guide or check the troubleshooting section.

**Happy posting! 📸**
