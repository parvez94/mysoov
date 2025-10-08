import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

async function testYouTubeUploadAuth() {
  console.log('\n🧪 Testing YouTube Upload Authentication...\n');

  try {
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );

    // Set credentials with refresh token
    oauth2Client.setCredentials({
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
    });

    console.log(
      '🔑 Refresh token found:',
      process.env.YOUTUBE_REFRESH_TOKEN ? '✅' : '❌'
    );
    console.log('🔄 Attempting to get access token...\n');

    // Try to get an access token (this validates the refresh token)
    const { credentials } = await oauth2Client.refreshAccessToken();

    console.log('✅ SUCCESS! Authentication is working!\n');
    console.log('📋 Token Details:');
    console.log(
      '   Access Token:',
      credentials.access_token ? '✅ Generated' : '❌ Missing'
    );
    console.log('   Token Type:', credentials.token_type);
    console.log(
      '   Expires In:',
      credentials.expiry_date
        ? new Date(credentials.expiry_date).toLocaleString()
        : 'N/A'
    );
    console.log('   Scope:', credentials.scope);
    console.log('\n🎉 Your YouTube upload integration is ready!\n');
    console.log(
      '✨ You can now upload videos to YouTube from your application.\n'
    );
  } catch (error) {
    console.error('❌ Error testing YouTube authentication:');
    console.error('   Message:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Details:', error.response.data);
    }
    console.log('\n💡 Tip: You may need to regenerate your refresh token.');
  }
}

testYouTubeUploadAuth();
