# YouTube Setup - Visual Step-by-Step Guide

This guide provides detailed visual descriptions of what you'll see at each step.

---

## 📍 Step 1: Google Cloud Console - Create Project

**URL**: https://console.cloud.google.com/

**What you'll see:**

- Top navigation bar with a project selector dropdown
- Click the dropdown (shows current project or "Select a project")
- A modal opens with "NEW PROJECT" button at the top right
- Click "NEW PROJECT"

**Form fields:**

- **Project name**: Enter "Mysoov YouTube Integration" (or your preferred name)
- **Organization**: Leave as "No organization" (unless you have one)
- **Location**: Leave as default
- Click **"CREATE"** button

**Wait**: Project creation takes 10-30 seconds. You'll see a notification when complete.

---

## 📍 Step 2: Enable YouTube Data API v3

**Navigation**:

- Left sidebar → **"APIs & Services"** → **"Library"**

**What you'll see:**

- A search bar at the top saying "Search for APIs & Services"
- Type: `YouTube Data API v3`
- You'll see a card with YouTube logo and title "YouTube Data API v3"
- Click on the card

**On the API details page:**

- Blue **"ENABLE"** button at the top
- Click **"ENABLE"**
- Wait 5-10 seconds
- You'll be redirected to the API dashboard showing "API enabled"

---

## 📍 Step 3: Configure OAuth Consent Screen

**Navigation**:

- Left sidebar → **"APIs & Services"** → **"OAuth consent screen"**

### 3.1 - User Type Selection

**What you'll see:**

- Two large cards: "Internal" and "External"
- **Select "External"** (unless you have Google Workspace)
- Click **"CREATE"** button at the bottom

### 3.2 - App Information

**Form fields you'll see:**

**App information:**

- **App name**: `Mysoov.TV` (or your app name)
- **User support email**: Select your email from dropdown
- **App logo**: (Optional - skip for now)

**App domain:** (Optional - can skip)

- Application home page
- Application privacy policy link
- Application terms of service link

**Authorized domains:** (Optional - skip for now)

**Developer contact information:**

- **Email addresses**: Enter your email

Click **"SAVE AND CONTINUE"** at the bottom

### 3.3 - Scopes Page ⚠️ IMPORTANT

**What you'll see:**

- A section titled "Scopes for Google APIs"
- Button: **"ADD OR REMOVE SCOPES"**
- Click this button

**A side panel opens:**

- Search box at the top
- Type: `youtube.upload`
- You'll see a table with columns: Checkbox | API | Scope | User-facing description

**Find this row:**

```
☐ | YouTube Data API v3 | .../auth/youtube.upload | Upload YouTube videos and manage your YouTube videos
```

**Actions:**

1. ✅ **Check the checkbox** next to this scope
2. Click **"UPDATE"** button at the bottom of the side panel
3. The panel closes
4. You should now see the scope listed in the main page:
   ```
   https://www.googleapis.com/auth/youtube.upload
   Upload YouTube videos and manage your YouTube videos
   ```
5. Click **"SAVE AND CONTINUE"**

### 3.4 - Test Users Page

**What you'll see:**

- Section titled "Test users"
- Button: **"ADD USERS"**
- Click this button

**A dialog opens:**

- Text field to enter email addresses
- Enter your Google account email (the one you're logged in with)
- Click **"ADD"**
- The email appears in the test users list
- Click **"SAVE AND CONTINUE"**

### 3.5 - Summary Page

**What you'll see:**

- Summary of all your OAuth consent screen settings
- Review the information
- Click **"BACK TO DASHBOARD"**

---

## 📍 Step 4: Create OAuth 2.0 Credentials

**Navigation**:

- Left sidebar → **"APIs & Services"** → **"Credentials"**

**What you'll see:**

- Top bar with **"+ CREATE CREDENTIALS"** button
- Click it
- Dropdown menu appears
- Select **"OAuth client ID"**

### 4.1 - Create OAuth Client ID

**Form you'll see:**

**Application type:**

- Dropdown menu
- Select: **"Web application"**

**Name:**

- Text field
- Enter: `Mysoov YouTube Client`

**Authorized JavaScript origins:** (Skip this)

**Authorized redirect URIs:**

- Click **"+ ADD URI"**
- A text field appears
- Enter: `http://localhost:5000/api/v1/youtube/oauth2callback`
- (Change port if your server uses a different port)

Click **"CREATE"** button at the bottom

### 4.2 - Credentials Created

**A modal pops up:**

- Title: "OAuth client created"
- Shows your **Client ID** (long string)
- Shows your **Client secret** (shorter string)
- **⚠️ IMPORTANT**: Copy both of these NOW
- Click **"DOWNLOAD JSON"** (optional, for backup)
- Click **"OK"**

**Save these values:**

```
Client ID: 1234567890-abcdefghijklmnop.apps.googleusercontent.com
Client secret: GOCSPX-abcd1234efgh5678
```

---

## 📍 Step 5: Configure Environment Variables

**Open your server's `.env` file:**

**Location**: `/server/.env`

**Add these lines:**

```env
# YouTube API Configuration
YOUTUBE_CLIENT_ID=paste_your_client_id_here
YOUTUBE_CLIENT_SECRET=paste_your_client_secret_here
YOUTUBE_REDIRECT_URI=http://localhost:5000/api/v1/youtube/oauth2callback
```

**Example:**

```env
YOUTUBE_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-abcd1234efgh5678
YOUTUBE_REDIRECT_URI=http://localhost:5000/api/v1/youtube/oauth2callback
```

**Save the file** (but don't commit it to Git!)

---

## 📍 Step 6: Run Setup Script

**Open terminal in your project root:**

```bash
cd /Users/parvez/development/mysoov
node server/scripts/setupYouTube.js
```

**What you'll see in terminal:**

```
🔐 YouTube OAuth Setup
====================

Please visit this URL to authorize the application:

https://accounts.google.com/o/oauth2/v2/auth?client_id=...

Waiting for authorization...
```

### 6.1 - Browser Authorization

**Copy the URL and paste it in your browser**

**What you'll see:**

1. **Google Sign-In page**

   - Sign in with your Google account (the one you added as test user)

2. **App Authorization page**

   - Title: "Mysoov.TV wants to access your Google Account"
   - Shows your app name and icon
   - Lists the permission: "Upload YouTube videos and manage your YouTube videos"
   - Two buttons: "Cancel" and "Continue"
   - Click **"Continue"**

3. **Redirect page**

   - You'll be redirected to: `http://localhost:5000/api/v1/youtube/oauth2callback?code=...`
   - The page will show:

   ```
   Authorization successful!

   Your refresh token:
   1//0gABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890

   Add this to your .env file as YOUTUBE_REFRESH_TOKEN
   ```

**Copy the refresh token**

### 6.2 - Add Refresh Token to .env

**Open `/server/.env` again and add:**

```env
YOUTUBE_REFRESH_TOKEN=paste_your_refresh_token_here
```

**Example:**

```env
YOUTUBE_REFRESH_TOKEN=1//0gABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890
```

**Save the file**

---

## 📍 Step 7: Restart Server

**In your terminal:**

```bash
# Stop your server (Ctrl+C if running)

# Start it again
npm run dev
# or
node server.js
# or however you normally start it
```

**Check server logs for:**

```
✅ YouTube API configured successfully
```

---

## 📍 Step 8: Configure in Admin Dashboard

**Open your app in browser:**

1. Log in as admin
2. Navigate to: **Dashboard** → **Settings**
3. Scroll down to **"Video Storage Provider"** section

**What you'll see:**

```
┌─────────────────────────────────────────┐
│ Video Storage Provider                  │
├─────────────────────────────────────────┤
│                                         │
│ ○ Cloudinary                            │
│   Always Available                      │
│   Current default storage provider      │
│                                         │
│ ○ YouTube                               │
│   Configured ✓                          │
│   Store videos on YouTube channel       │
│                                         │
│ [Save Storage Settings]                 │
└─────────────────────────────────────────┘
```

**Actions:**

1. Click the **YouTube** radio button
2. Click **"Save Storage Settings"**
3. You'll see a success message: "Storage settings updated successfully"

---

## 📍 Step 9: Test Video Upload

**Upload a test video:**

1. Go to your app's upload page
2. Select a video file
3. Add a caption
4. Click upload

**What should happen:**

- Upload progress bar appears
- Video uploads successfully
- You see the video in your feed

**Verify on YouTube:**

1. Go to https://studio.youtube.com
2. Click **"Content"** in left sidebar
3. You should see your uploaded video
4. Visibility should be: **"Unlisted"**

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Admin settings shows YouTube as "Configured"
2. ✅ You can select YouTube as storage provider
3. ✅ Video uploads complete successfully
4. ✅ Videos appear in your YouTube channel as "Unlisted"
5. ✅ Videos play correctly on your website using YouTube embed
6. ✅ No errors in server logs

---

## 🎉 You're Done!

Your YouTube storage integration is now fully configured and ready to use!

**Next steps:**

- Upload a few test videos
- Check they appear on YouTube
- Verify playback on your website
- Monitor your YouTube API quota usage

---

## 📞 Need Help?

If something doesn't look right:

1. Check each step carefully
2. Verify all credentials are correct in `.env`
3. Check server logs for error messages
4. Refer to `YOUTUBE_SETUP_GUIDE.md` for troubleshooting
