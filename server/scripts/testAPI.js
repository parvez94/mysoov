import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Video from '../models/Video.js';

dotenv.config();

/**
 * Test what the API returns for YouTube videos
 */
async function testAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB\n');

    // Find YouTube video
    const video = await Video.findOne({
      storageProvider: 'youtube',
    });

    if (!video) {
      console.log('No YouTube video found');
      await mongoose.disconnect();
      return;
    }

    console.log('Raw MongoDB Document:');
    console.log(JSON.stringify(video, null, 2));
    console.log('\n' + '='.repeat(60) + '\n');

    // Convert to plain object (like API does)
    const videoObj = video.toObject ? video.toObject() : video;

    console.log('Converted to Plain Object (API Response):');
    console.log(JSON.stringify(videoObj, null, 2));
    console.log('\n' + '='.repeat(60) + '\n');

    // Check specific fields
    console.log('Field Check:');
    console.log('  storageProvider:', videoObj.storageProvider);
    console.log('  videoUrl.provider:', videoObj.videoUrl?.provider);
    console.log('  videoUrl.url:', videoObj.videoUrl?.url);
    console.log('  mediaType:', videoObj.mediaType);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testAPI();
