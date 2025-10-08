import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);

const code =
  '4/0AVGzR1CPUMH7jYdmacoEohyEHM11cUEyEjyrborEWfZeR1OFpfm0BIm4mLps5fAinlIz4Q';

async function getToken() {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n✅ SUCCESS! Your refresh token is:\n');
    console.log(tokens.refresh_token);
    console.log('\n📝 Add this to your .env file as YOUTUBE_REFRESH_TOKEN\n');
  } catch (error) {
    console.error('❌ Error getting token:', error.message);
  }
}

getToken();
