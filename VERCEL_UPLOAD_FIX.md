# Vercel Upload Fix - 413 Error Resolution

## Problem

Vercel serverless functions have a **4.5MB request body size limit**, causing 413 (Payload Too Large) errors when uploading large video files.

## Solution

Implemented **direct client-side uploads to Cloudinary**, bypassing the Vercel server entirely.

---

## Changes Made

### 1. Server-Side Changes

#### `/server/vercel.json`

- Added function configuration to increase execution time and memory:
  - `maxDuration`: 60 seconds
  - `memory`: 3008MB

#### `/server/routes/uploadRoutes.js`

- Added new endpoint: `POST /api/v1/upload/signature`
- Generates Cloudinary signed upload parameters for secure client-side uploads
- Returns signature, timestamp, cloud name, and API key

### 2. Client-Side Changes

#### `/client/src/pages/Upload.jsx`

- Updated `handleUpload()` function to use direct Cloudinary upload
- Now follows this flow:
  1. Get signature from server
  2. Upload directly to Cloudinary
  3. Save video metadata to database

#### `/client/src/pages/dashboard/DashboardFilms.jsx`

- Updated `handleUploadFilm()` function with same direct upload approach
- Maintains progress tracking and error handling

---

## How It Works

### Old Flow (Causing 413 Error)

```
Client → Vercel Server (4.5MB limit!) → Cloudinary
```

### New Flow (No Size Limit)

```
Client → Vercel Server (get signature only)
Client → Cloudinary (direct upload)
Client → Vercel Server (save metadata)
```

---

## Deployment Steps

### 1. Deploy Backend Changes

```bash
cd server
git add .
git commit -m "Fix: Implement direct Cloudinary uploads to avoid Vercel 413 error"
git push

# If using Vercel CLI
vercel --prod
```

### 2. Deploy Frontend Changes

```bash
cd client
npm run build
git add .
git commit -m "Fix: Update upload flow for direct Cloudinary uploads"
git push

# If using Vercel CLI
vercel --prod
```

### 3. Verify Environment Variables

Ensure these are set in Vercel:

- `CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUD_API` - Your Cloudinary API key
- `CLOUD_SECRET` - Your Cloudinary API secret
- `MONGO_URL` - Your MongoDB connection string

---

## Testing

1. **Test Film Upload:**

   - Go to Dashboard → Films
   - Create a film directory
   - Try uploading a large video (>4.5MB)
   - Should now work without 413 error

2. **Test Regular Video Upload:**

   - Go to Upload page
   - Try uploading a video
   - Verify progress bar works
   - Check video plays correctly

3. **Check Console:**
   - No 413 errors should appear
   - Upload progress should display correctly

---

## Benefits

✅ **No Size Limit**: Upload videos of any size (within Cloudinary limits)  
✅ **Faster Uploads**: Direct connection to Cloudinary  
✅ **More Reliable**: No serverless timeout issues  
✅ **Cost Effective**: Less Vercel bandwidth usage  
✅ **Better UX**: Accurate progress tracking

---

## Rollback Plan

If issues occur, you can temporarily revert to server-side uploads for small files:

1. Restore previous version of `Upload.jsx` and `DashboardFilms.jsx`
2. Keep the signature endpoint (it's harmless)
3. Add file size check on client-side to limit uploads to 4MB

---

## Alternative Solution (If Needed)

If direct upload doesn't work, consider:

1. **YouTube Storage**: Already configured in your app

   - Edit `/server/models/Settings.js`
   - Set `storageProvider: 'youtube'`
   - No size limits on YouTube

2. **Different Hosting**: Move to a platform without body size limits
   - Railway
   - Render
   - AWS Lambda (with API Gateway configured)

---

## Notes

- The signature endpoint is secure (requires authentication)
- Signatures expire after upload, preventing misuse
- Original upload endpoint still works for small files
- Image uploads (avatars, etc.) still use server route (they're small)

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Check Vercel function logs
3. Verify Cloudinary credentials in environment variables
4. Test with a small file first (< 1MB)
