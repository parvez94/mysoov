# YouTube API Scopes Reference

## Required Scope for Video Upload

For the Mysoov.TV YouTube integration, you need **ONE** specific scope:

### `https://www.googleapis.com/auth/youtube.upload`

**Description**: Upload YouTube videos and manage your YouTube videos

**What it allows:**

- Upload videos to YouTube
- Update video metadata (title, description, privacy status)
- Delete videos from YouTube
- Manage video thumbnails

---

## How to Add This Scope

### During OAuth Consent Screen Setup:

1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Click **"Edit App"** (if already created) or follow the setup wizard
3. Navigate to the **"Scopes"** step
4. Click **"Add or Remove Scopes"**
5. In the search/filter box, type: `youtube.upload`
6. Check the box next to: `https://www.googleapis.com/auth/youtube.upload`
7. Click **"Update"**
8. Verify it appears in your selected scopes
9. Click **"Save and Continue"**

---

## Other YouTube Scopes (NOT Required)

These are other YouTube scopes you might see, but **you don't need them** for this integration:

| Scope                                               | Description                 | Needed?                |
| --------------------------------------------------- | --------------------------- | ---------------------- |
| `https://www.googleapis.com/auth/youtube`           | Full YouTube account access | ❌ No (too broad)      |
| `https://www.googleapis.com/auth/youtube.readonly`  | View YouTube account info   | ❌ No                  |
| `https://www.googleapis.com/auth/youtube.force-ssl` | Full access via SSL         | ❌ No                  |
| `https://www.googleapis.com/auth/youtubepartner`    | YouTube Partner access      | ❌ No                  |
| `https://www.googleapis.com/auth/youtube.upload`    | Upload videos               | ✅ **YES - This one!** |

---

## Verification

After adding the scope, you should see it listed in your OAuth consent screen configuration:

```
Scopes for Google APIs:
✓ https://www.googleapis.com/auth/youtube.upload
  Upload YouTube videos and manage your YouTube videos
```

---

## Troubleshooting

### "Scope not found" error

- Make sure YouTube Data API v3 is enabled in your project
- Try refreshing the scopes list
- Search for just "youtube" and look through the available options

### "Invalid scope" error during authentication

- Double-check the scope URL is exactly: `https://www.googleapis.com/auth/youtube.upload`
- No extra spaces or characters
- Make sure it's saved in your OAuth consent screen

### "Access not configured" error

- Verify YouTube Data API v3 is enabled
- Check that the scope is added to your OAuth consent screen
- Ensure you're using the correct Google Cloud project

---

## What This Scope Does NOT Allow

For security, this scope is limited and does NOT allow:

- ❌ Reading your YouTube analytics
- ❌ Managing YouTube channel settings
- ❌ Managing YouTube playlists (beyond video uploads)
- ❌ Managing YouTube comments
- ❌ Managing YouTube subscriptions
- ❌ Accessing other Google services (Gmail, Drive, etc.)

It **ONLY** allows uploading and managing videos on your YouTube channel.

---

## Production Considerations

When moving to production:

1. **Keep the same scope** - Don't add unnecessary scopes
2. **Publish your OAuth consent screen** - Move from "Testing" to "Published"
3. **Add production redirect URI** - Update authorized redirect URIs
4. **Monitor quota usage** - Each upload costs ~1,600 quota units

---

## Quick Copy-Paste

If you need to manually enter the scope somewhere:

```
https://www.googleapis.com/auth/youtube.upload
```

**That's it!** Just this one scope is all you need for the YouTube storage integration.
