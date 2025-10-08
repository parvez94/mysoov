# YouTube Storage Integration Setup Guide

This guide will help you set up YouTube as a video storage provider for your Mysoov.TV application.

## Overview

The YouTube integration allows you to store videos on YouTube instead of Cloudinary, which can significantly reduce storage costs for large video libraries. Videos are uploaded as **unlisted** by default, meaning they won't appear in YouTube search results but can be embedded on your website.

### Key Features

- ✅ Unlimited video storage using YouTube's infrastructure
- ✅ Videos uploaded as unlisted (not searchable on YouTube)
- ✅ Automatic fallback to Cloudinary if YouTube upload fails
- ✅ Images always use Cloudinary for optimal performance
- ✅ Easy switching between storage providers via admin dashboard

## Prerequisites

- A Google account
- Access to Google Cloud Console
- Node.js and npm installed
- Admin access to your Mysoov.TV application

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter a project name (e.g., "Mysoov YouTube Integration")
5. Click **"Create"**

## Step 2: Enable YouTube Data API v3

1. In your Google Cloud Console, make sure your new project is selected
2. Go to **"APIs & Services"** > **"Library"**
3. Search for **"YouTube Data API v3"**
4. Click on it and then click **"Enable"**

## Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Select **"External"** user type (unless you have a Google Workspace account)
3. Click **"Create"**
4. Fill in the required information:
   - **App name**: Your application name (e.g., "Mysoov.TV")
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click **"Save and Continue"**

6. **IMPORTANT - On the Scopes page:**

   - Click **"Add or Remove Scopes"**
   - In the filter/search box, type: `youtube.upload`
   - Find and check the box for: **`https://www.googleapis.com/auth/youtube.upload`**
   - This scope description should say: "Upload YouTube videos and manage your YouTube videos"
   - Click **"Update"** at the bottom
   - Verify the scope appears in your selected scopes list
   - Click **"Save and Continue"**

7. On the **Test users** page:

   - Click **"Add Users"**
   - Add your Google account email (the one you'll use to upload videos)
   - Click **"Add"**
   - Click **"Save and Continue"**

8. Review the summary and click **"Back to Dashboard"**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. Select **"Web application"** as the application type
4. Enter a name (e.g., "Mysoov YouTube Client")
5. Under **"Authorized redirect URIs"**, add:
   ```
   http://localhost:5000/api/v1/youtube/oauth2callback
   ```
   (Change the port if your server runs on a different port)
6. Click **"Create"**
7. **Important**: Copy the **Client ID** and **Client Secret** - you'll need these next

## Step 5: Configure Environment Variables

1. Open your server's `.env` file
2. Add the following variables:

```env
# YouTube API Configuration
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
YOUTUBE_REDIRECT_URI=http://localhost:5000/api/v1/youtube/oauth2callback
```

Replace `your_client_id_here` and `your_client_secret_here` with the values from Step 4.

**Note**: If your server runs on a different port or domain, update the `YOUTUBE_REDIRECT_URI` accordingly.

## Step 6: Obtain Refresh Token

1. Open a terminal in your project's server directory
2. Run the setup script:

```bash
cd server
node scripts/setupYouTube.js
```

3. The script will output a URL. Copy and paste it into your browser
4. Sign in with your Google account (the one you added as a test user)
5. Grant the requested permissions
6. You'll be redirected to a page showing your **refresh token**
7. Copy the refresh token and add it to your `.env` file:

```env
YOUTUBE_REFRESH_TOKEN=your_refresh_token_here
```

## Step 7: Restart Your Server

After adding all the environment variables, restart your server:

```bash
# If using npm
npm run dev

# If using nodemon
nodemon server.js

# Or however you normally start your server
```

## Step 8: Configure Storage Provider in Admin Dashboard

1. Log in to your Mysoov.TV application as an admin
2. Go to **Dashboard** > **Settings**
3. Scroll down to the **"Video Storage Provider"** section
4. You should see YouTube marked as **"Configured"**
5. Select **YouTube** as your storage provider
6. Click **"Save Storage Settings"**

## Testing the Integration

1. Try uploading a video through your application
2. The video should be uploaded to YouTube
3. Check your YouTube channel - the video should appear as **unlisted**
4. The video should play correctly on your website using YouTube's embed player

## Troubleshooting

### "YouTube is not configured" Error

- Make sure all environment variables are set correctly in your `.env` file
- Verify that you've restarted your server after adding the variables
- Check that the refresh token is valid

### Upload Fails

- Check your server logs for detailed error messages
- Verify that the YouTube Data API v3 is enabled in your Google Cloud project
- Make sure your OAuth consent screen is properly configured
- Check that your Google account has permission to upload videos

### "Invalid Credentials" Error

- Double-check your `YOUTUBE_CLIENT_ID` and `YOUTUBE_CLIENT_SECRET`
- Make sure there are no extra spaces or quotes in your `.env` file
- Verify that the redirect URI in your Google Cloud Console matches the one in your `.env` file

### Quota Exceeded Error

YouTube Data API has a default quota of 10,000 units per day. Uploading a video costs approximately 1,600 units. If you exceed this quota:

1. Go to your Google Cloud Console
2. Navigate to **"APIs & Services"** > **"Quotas"**
3. Request a quota increase if needed

## Security Best Practices

1. **Never commit your `.env` file** to version control
2. Keep your refresh token secure - it provides access to your YouTube account
3. Regularly rotate your OAuth credentials
4. Monitor your YouTube channel for unauthorized uploads
5. Use environment-specific credentials (different for development and production)

## Switching Back to Cloudinary

If you want to switch back to Cloudinary:

1. Go to **Dashboard** > **Settings**
2. In the **"Video Storage Provider"** section, select **Cloudinary**
3. Click **"Save Storage Settings"**

New uploads will use Cloudinary. Existing YouTube videos will continue to work.

## Additional Notes

- **Images always use Cloudinary** regardless of the selected video provider
- **Automatic fallback**: If YouTube upload fails, the system automatically falls back to Cloudinary
- **Video privacy**: Videos are uploaded as "unlisted" by default, meaning they're not searchable on YouTube but can be embedded
- **Storage provider tracking**: Each video stores which provider it uses, so you can have a mix of Cloudinary and YouTube videos

## API Quota Information

YouTube Data API v3 quota costs:

- Upload a video: ~1,600 units
- Delete a video: ~50 units
- Get video details: ~1 unit

Default daily quota: 10,000 units (approximately 6 video uploads per day)

To increase your quota, you'll need to apply for a quota extension through the Google Cloud Console.

## Support

If you encounter any issues not covered in this guide:

1. Check the server logs for detailed error messages
2. Verify all steps were completed correctly
3. Ensure your Google Cloud project is properly configured
4. Check that your OAuth consent screen is approved (may take a few days for Google review)

## Production Deployment

When deploying to production:

1. Update the `YOUTUBE_REDIRECT_URI` in your `.env` file to use your production domain:

   ```env
   YOUTUBE_REDIRECT_URI=https://yourdomain.com/api/v1/youtube/oauth2callback
   ```

2. Add the production redirect URI to your Google Cloud Console:

   - Go to **"APIs & Services"** > **"Credentials"**
   - Edit your OAuth 2.0 Client ID
   - Add the production URI to **"Authorized redirect URIs"**

3. Run the setup script again on your production server to get a new refresh token

4. Make sure your OAuth consent screen is published (not in testing mode) for production use

---

**Congratulations!** You've successfully set up YouTube as a video storage provider for your Mysoov.TV application. 🎉
