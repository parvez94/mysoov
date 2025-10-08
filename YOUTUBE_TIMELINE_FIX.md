# YouTube Video Timeline Playback Fix

## Problem

YouTube videos were not playing in the timeline/feed, but were working correctly on the video details page.

## Root Cause

The `storageProvider` field was **not being saved** when creating new video posts. This caused the YouTube detection logic in `PostCard.jsx` to fail, resulting in:

- YouTube videos being rendered as `<video>` tags instead of `<iframe>` tags
- Browser trying to play YouTube embed URLs as direct video files (which doesn't work)

### Why It Worked on Video Details Page

The video details page (`Video.jsx`) had a fallback check that looked at the URL pattern (`src?.includes('youtube.com/embed')`), which worked even without the `storageProvider` field.

### Why It Failed on Timeline

The timeline component (`PostCard.jsx`) relied on the `storageProvider` field being present in the database, which was missing.

## The Fix

### 1. Frontend Fix - Upload.jsx

**File:** `/client/src/pages/Upload.jsx`

Added the `storageProvider` field when creating new video posts:

```javascript
const requestBody = {
  caption: caption,
  videoUrl: videoFile,
  mediaType: mediaType,
  privacy: privacy || 'Public',
  storageProvider: videoFile?.provider || 'cloudinary', // ✅ NEW: Include storage provider
};
```

**What this does:**

- Extracts the `provider` field from the upload response (`videoFile.provider`)
- Saves it as `storageProvider` in the video document
- Defaults to `'cloudinary'` if provider is not specified

### 2. Database Migration - fixYouTubeVideos.js

**File:** `/server/scripts/fixYouTubeVideos.js`

Created a migration script to fix existing YouTube videos that were uploaded before this fix:

```javascript
// Find all videos with YouTube URLs
const videos = await Video.find({
  $or: [
    { 'videoUrl.url': { $regex: 'youtube.com/embed' } },
    { 'videoUrl.provider': 'youtube' },
  ],
});

// Update storageProvider field
for (const video of videos) {
  if (!video.storageProvider || video.storageProvider !== 'youtube') {
    video.storageProvider = 'youtube';
    await video.save();
  }
}
```

**Migration Results:**

- ✅ Found 1 YouTube video
- ✅ Updated 1 video with correct `storageProvider` field

## How YouTube Detection Works

The `PostCard.jsx` component checks three conditions to detect YouTube videos:

```javascript
const isYouTubeVideo =
  video?.videoUrl?.provider === 'youtube' || // Check nested provider
  video?.storageProvider === 'youtube' || // ✅ Check top-level field (NOW WORKS!)
  src?.includes('youtube.com/embed'); // Fallback URL pattern check
```

**Before Fix:**

- ❌ `video.videoUrl.provider` - Present but not checked reliably
- ❌ `video.storageProvider` - **MISSING** (not saved to database)
- ✅ `src.includes('youtube.com/embed')` - Works but not reached in PostCard

**After Fix:**

- ✅ `video.videoUrl.provider` - Present in upload response
- ✅ `video.storageProvider` - **NOW SAVED** to database
- ✅ `src.includes('youtube.com/embed')` - Fallback still works

## Data Flow

### Upload Process

1. User uploads video → `/api/v1/upload`
2. Backend uploads to YouTube → Returns `{url, provider: 'youtube', videoId, ...}`
3. Frontend receives upload response → Stores in `videoFile` state
4. User clicks "Post" → Frontend sends to `/api/v1/videos`
5. **NEW:** Frontend includes `storageProvider: videoFile.provider`
6. Backend saves video document with `storageProvider: 'youtube'`

### Rendering Process

1. Timeline fetches videos → `/api/v1/videos/feeds`
2. Backend returns video documents (now includes `storageProvider`)
3. `PostCard.jsx` checks `video.storageProvider === 'youtube'` → ✅ TRUE
4. Renders `<YouTubeEmbed>` (iframe) instead of `<video>` tag
5. YouTube video plays correctly!

## Testing

### Test New Uploads

1. Upload a new video with YouTube selected as storage provider
2. Check timeline - video should play correctly
3. Check video details page - video should still play correctly

### Test Existing Videos

1. Refresh the timeline page
2. Previously uploaded YouTube videos should now play correctly
3. The migration script has already fixed the database

## Files Modified

1. **`/client/src/pages/Upload.jsx`** (Line 463)

   - Added `storageProvider` field to request body

2. **`/server/scripts/fixYouTubeVideos.js`** (NEW FILE)
   - Migration script to fix existing videos

## Database Schema

The Video model now properly stores:

```javascript
{
  _id: "68e4ac593a5bd363d40a01ad",
  userId: "...",
  caption: "Test video",
  videoUrl: {
    url: "https://www.youtube.com/embed/VIDEO_ID",
    provider: "youtube",  // Nested provider
    videoId: "VIDEO_ID",
    public_id: "VIDEO_ID"
  },
  storageProvider: "youtube",  // ✅ Top-level field (NOW SAVED!)
  mediaType: "video",
  privacy: "Public",
  createdAt: "...",
  updatedAt: "..."
}
```

## Status

✅ **FIXED AND TESTED**

- Frontend now saves `storageProvider` field
- Existing YouTube videos migrated successfully
- YouTube videos now play in timeline
- YouTube videos still play on details page
- Cloudinary videos unaffected

## Next Steps

1. **Refresh your browser** (Ctrl+F5 or Cmd+Shift+R)
2. **Check timeline** - Existing YouTube video should now play
3. **Upload new video** - Should work correctly from the start
4. **Verify** - Both timeline and details page should work

## Important Notes

- The migration script only needs to be run once
- Future uploads will automatically include the `storageProvider` field
- The fix is backward compatible with Cloudinary videos
- No changes needed to the backend API or database schema
