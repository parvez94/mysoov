import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

async function testYouTubeConnection() {
  console.log('\n🧪 Testing YouTube API Connection...\n');

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

    // Create YouTube API client
    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    });

    // Test: Get channel information
    console.log('📡 Fetching your YouTube channel info...\n');
    const response = await youtube.channels.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      mine: true,
    });

    if (response.data.items && response.data.items.length > 0) {
      const channel = response.data.items[0];
      console.log('✅ SUCCESS! Connected to YouTube API\n');
      console.log('📺 Channel Details:');
      console.log('   Name:', channel.snippet.title);
      console.log('   ID:', channel.id);
      console.log('   Subscribers:', channel.statistics.subscriberCount);
      console.log('   Total Videos:', channel.statistics.videoCount);
      console.log('   Total Views:', channel.statistics.viewCount);
      console.log('\n🎉 Your YouTube integration is ready to use!\n');
    } else {
      console.log('⚠️  No channel found for this account');
    }
  } catch (error) {
    console.error('❌ Error testing YouTube API:');
    console.error('   Message:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Details:', error.response.data);
    }
  }
}

testYouTubeConnection();
