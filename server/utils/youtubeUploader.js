import { google } from 'googleapis';
import fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const youtube = google.youtube('v3');

/**
 * Initialize YouTube OAuth2 client
 */
export const getYouTubeClient = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI ||
      'http://localhost:5000/api/v1/youtube/oauth2callback'
  );

  // Set refresh token if available
  if (process.env.YOUTUBE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
    });
  }

  return oauth2Client;
};

/**
 * Upload video to YouTube
 * @param {string} filePath - Path to the video file
 * @param {object} metadata - Video metadata (title, description, tags)
 * @returns {Promise<object>} - YouTube video data
 */
export const uploadToYouTube = async (filePath, metadata = {}) => {
  try {
    const auth = getYouTubeClient();

    // Default metadata
    const {
      title = 'Mysoov.TV Video',
      description = 'Uploaded via Mysoov.TV',
      tags = ['mysoov'],
      privacyStatus = 'unlisted', // unlisted, public, or private
    } = metadata;

    const fileSize = fs.statSync(filePath).size;

    const res = await youtube.videos.insert({
      auth,
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title,
          description,
          tags,
          categoryId: '22', // People & Blogs category
        },
        status: {
          privacyStatus,
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: fs.createReadStream(filePath),
      },
    });

    const videoId = res.data.id;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    // Add parameters to remove YouTube overlays and branding
    const embedUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&controls=1&disablekb=0&fs=1`;

    return {
      success: true,
      videoId,
      url: videoUrl,
      embedUrl,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      provider: 'youtube',
      data: res.data,
    };
  } catch (error) {    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        'Failed to upload video to YouTube'
    );
  }
};

/**
 * Delete video from YouTube
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<boolean>}
 */
export const deleteFromYouTube = async (videoId) => {
  try {
    const auth = getYouTubeClient();

    await youtube.videos.delete({
      auth,
      id: videoId,
    });

    return true;
  } catch (error) {    throw new Error('Failed to delete video from YouTube');
  }
};

/**
 * Get video details from YouTube
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<object>}
 */
export const getYouTubeVideoDetails = async (videoId) => {
  try {
    const auth = getYouTubeClient();

    const res = await youtube.videos.list({
      auth,
      part: ['snippet', 'status', 'contentDetails'],
      id: [videoId],
    });

    if (!res.data.items || res.data.items.length === 0) {
      throw new Error('Video not found');
    }

    return res.data.items[0];
  } catch (error) {    throw new Error('Failed to get video details from YouTube');
  }
};

/**
 * Generate OAuth URL for initial setup
 * @returns {string} - OAuth authorization URL
 */
export const generateAuthUrl = () => {
  const oauth2Client = getYouTubeClient();

  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force to get refresh token
  });

  return url;
};

/**
 * Get tokens from authorization code
 * @param {string} code - Authorization code from OAuth callback
 * @returns {Promise<object>} - Tokens including refresh_token
 */
export const getTokensFromCode = async (code) => {
  try {
    const oauth2Client = getYouTubeClient();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {    throw new Error('Failed to exchange authorization code for tokens');
  }
};

/**
 * Check if YouTube is properly configured
 * @returns {boolean}
 */
export const isYouTubeConfigured = () => {
  return !!(
    process.env.YOUTUBE_CLIENT_ID &&
    process.env.YOUTUBE_CLIENT_SECRET &&
    process.env.YOUTUBE_REFRESH_TOKEN
  );
};
