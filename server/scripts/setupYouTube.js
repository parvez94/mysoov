/**
 * YouTube OAuth Setup Script
 *
 * This script helps you obtain the refresh token needed for YouTube API access.
 *
 * Steps:
 * 1. Make sure you have YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in your .env file
 * 2. Run this script: node scripts/setupYouTube.js
 * 3. Visit the URL printed in the console
 * 4. Authorize the application
 * 5. Copy the refresh_token from the output and add it to your .env file
 */

import * as dotenv from 'dotenv';
import {
  generateAuthUrl,
  getTokensFromCode,
} from '../utils/youtubeUploader.js';
import express from 'express';

dotenv.config();

const app = express();
const PORT = 5100;

console.log('\n🎬 YouTube API Setup\n');
console.log('='.repeat(50));

// Check if credentials are set
if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_CLIENT_SECRET) {
  console.error('\n❌ Error: YouTube credentials not found in .env file');
  console.log('\nPlease add the following to your .env file:');
  console.log('YOUTUBE_CLIENT_ID=your_client_id');
  console.log('YOUTUBE_CLIENT_SECRET=your_client_secret');
  console.log(
    'YOUTUBE_REDIRECT_URI=http://localhost:5100/api/v1/youtube/oauth2callback'
  );
  process.exit(1);
}

// Generate authorization URL
const authUrl = generateAuthUrl();

console.log('\n✅ Step 1: Visit this URL to authorize the application:\n');
console.log(authUrl);
console.log('\n' + '='.repeat(50));
console.log(
  '\n📝 Step 2: After authorization, you will be redirected to a callback URL.'
);
console.log('   The refresh token will be displayed on the page.\n');

// Set up callback endpoint
app.get('/api/v1/youtube/oauth2callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code not found');
  }

  try {
    const tokens = await getTokensFromCode(code);

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ SUCCESS! Add this to your .env file:\n');
    console.log(`YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\n' + '='.repeat(50));
    console.log(
      '\n⚠️  IMPORTANT: Keep this token secure and never commit it to version control!\n'
    );

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>YouTube Setup Complete</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              background: #f5f5f5;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #2ecc71; }
            .token-box {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 4px;
              border-left: 4px solid #2ecc71;
              margin: 20px 0;
              word-break: break-all;
              font-family: monospace;
            }
            .warning {
              background: #fff3cd;
              padding: 15px;
              border-radius: 4px;
              border-left: 4px solid #ffc107;
              margin: 20px 0;
            }
            code {
              background: #e9ecef;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ YouTube Setup Complete!</h1>
            <p>Add this line to your <code>.env</code> file:</p>
            <div class="token-box">
              YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}
            </div>
            <div class="warning">
              <strong>⚠️ Important:</strong> Keep this token secure and never commit it to version control!
            </div>
            <p>You can now close this window and restart your server.</p>
            <p>Check the terminal for the complete token information.</p>
          </div>
        </body>
      </html>
    `);

    // Give user time to see the message before shutting down
    setTimeout(() => {
      console.log(
        '\n👋 Setup complete! You can now close this script (Ctrl+C).\n'
      );
      process.exit(0);
    }, 5000);
  } catch (error) {
    console.error('\n❌ Error getting tokens:', error.message);
    res.status(500).send(`Error: ${error.message}`);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Callback server running on http://localhost:${PORT}`);
  console.log('\nWaiting for authorization...\n');
});
