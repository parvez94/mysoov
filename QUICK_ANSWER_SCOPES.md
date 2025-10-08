# Quick Answer: YouTube API Scopes

## Your Question: Do I need to add scopes? If yes, what should I add?

### ✅ YES, you need to add a scope!

---

## The Scope You Need

Add **ONLY THIS ONE** scope:

```
https://www.googleapis.com/auth/youtube.upload
```

---

## Where to Add It

**During OAuth Consent Screen setup (Step 3):**

1. Go to Google Cloud Console
2. Navigate to: **APIs & Services** → **OAuth consent screen**
3. Click **Edit App** (or follow the setup wizard)
4. On the **Scopes** page:
   - Click **"Add or Remove Scopes"**
   - Search for: `youtube.upload`
   - Check the box next to: `https://www.googleapis.com/auth/youtube.upload`
   - Click **"Update"**
   - Click **"Save and Continue"**

---

## What This Scope Does

This scope allows your application to:

- ✅ Upload videos to YouTube
- ✅ Update video metadata (title, description)
- ✅ Set video privacy (unlisted, private, public)
- ✅ Delete videos

---

## What You DON'T Need

❌ Don't add these scopes (they're too broad or unnecessary):

- `https://www.googleapis.com/auth/youtube` (full access - too much)
- `https://www.googleapis.com/auth/youtube.readonly` (read-only - not needed)
- `https://www.googleapis.com/auth/youtube.force-ssl` (not needed)

---

## Visual Confirmation

After adding the scope, you should see this in your OAuth consent screen:

```
Scopes for Google APIs:
✓ https://www.googleapis.com/auth/youtube.upload
  Upload YouTube videos and manage your YouTube videos
```

---

## That's It!

Just **ONE** scope is all you need: `https://www.googleapis.com/auth/youtube.upload`

For detailed step-by-step instructions with screenshots descriptions, see:

- `YOUTUBE_SETUP_VISUAL_GUIDE.md` - Visual walkthrough
- `YOUTUBE_SCOPES_REFERENCE.md` - Complete scope reference
- `YOUTUBE_SETUP_GUIDE.md` - Full setup guide
