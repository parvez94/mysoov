import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import Settings from '../models/Settings.js';
import { isYouTubeConfigured } from '../utils/youtubeUploader.js';

dotenv.config();

async function testStorageSettings() {
  try {
    console.log('🔍 Testing Storage Settings Configuration...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB\n');

    // Check YouTube configuration
    const youtubeConfigured = isYouTubeConfigured();
    console.log('📺 YouTube Configuration Status:');
    console.log(`   Configured: ${youtubeConfigured ? '✅ YES' : '❌ NO'}`);
    console.log(`   CLIENT_ID: ${process.env.YOUTUBE_CLIENT_ID ? '✓' : '✗'}`);
    console.log(
      `   CLIENT_SECRET: ${process.env.YOUTUBE_CLIENT_SECRET ? '✓' : '✗'}`
    );
    console.log(
      `   REFRESH_TOKEN: ${process.env.YOUTUBE_REFRESH_TOKEN ? '✓' : '✗'}`
    );
    console.log('');

    // Get current settings
    let settings = await Settings.findOne();

    if (!settings) {
      console.log('⚠️  No settings found, creating default...');
      settings = await Settings.create({
        storageProvider: 'cloudinary',
        cloudinaryConfig: { enabled: true },
        youtubeConfig: { enabled: false, defaultPrivacy: 'unlisted' },
      });
      console.log('✅ Default settings created\n');
    }

    console.log('⚙️  Current Storage Settings:');
    console.log(`   Provider: ${settings.storageProvider}`);
    console.log(`   Cloudinary Config:`, settings.cloudinaryConfig);
    console.log(`   YouTube Config:`, settings.youtubeConfig);
    console.log('');

    // Simulate API response
    const apiResponse = {
      success: true,
      storageProvider: settings.storageProvider,
      cloudinaryConfig: settings.cloudinaryConfig,
      youtubeConfig: {
        ...settings.youtubeConfig,
        isConfigured: youtubeConfigured,
      },
      youtubeConfigured: youtubeConfigured,
    };

    console.log('📤 API Response (what frontend receives):');
    console.log(JSON.stringify(apiResponse, null, 2));
    console.log('');

    // Test upload logic
    console.log('🧪 Upload Logic Tests:');
    console.log('');

    const testCases = [
      { isVideo: false, provider: 'cloudinary', desc: 'Image upload' },
      {
        isVideo: false,
        provider: 'youtube',
        desc: 'Image upload (YouTube selected)',
      },
      { isVideo: true, provider: 'cloudinary', desc: 'Video to Cloudinary' },
      { isVideo: true, provider: 'youtube', desc: 'Video to YouTube' },
    ];

    testCases.forEach(({ isVideo, provider, desc }) => {
      const willUseCloudinary =
        !isVideo || provider !== 'youtube' || !youtubeConfigured;
      const needsSizeCheck = willUseCloudinary;

      console.log(`   ${desc}:`);
      console.log(
        `      Will use: ${willUseCloudinary ? 'Cloudinary' : 'YouTube'}`
      );
      console.log(
        `      Size limit check: ${
          needsSizeCheck ? '✅ YES (5MB limit applies)' : '❌ NO (unlimited)'
        }`
      );
      console.log('');
    });

    console.log('✅ All tests completed!');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testStorageSettings();
