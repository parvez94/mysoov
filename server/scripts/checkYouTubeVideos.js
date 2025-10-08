import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Video from '../models/Video.js';

dotenv.config();

/**
 * Check YouTube videos in database
 */
async function checkYouTubeVideos() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB\n');

    // Find all videos with YouTube URLs
    const videos = await Video.find({
      $or: [
        { 'videoUrl.url': { $regex: 'youtube.com' } },
        { 'videoUrl.provider': 'youtube' },
        { storageProvider: 'youtube' },
      ],
    }).lean();

    console.log(`Found ${videos.length} YouTube video(s)\n`);

    for (const video of videos) {
      console.log('='.repeat(60));
      console.log('Video ID:', video._id);
      console.log('Caption:', video.caption || 'No caption');
      console.log('Media Type:', video.mediaType);
      console.log('Storage Provider:', video.storageProvider || '❌ MISSING');
      console.log('\nVideo URL Object:');
      console.log('  - url:', video.videoUrl?.url || 'N/A');
      console.log('  - provider:', video.videoUrl?.provider || '❌ MISSING');
      console.log('  - videoId:', video.videoUrl?.videoId || 'N/A');
      console.log('  - public_id:', video.videoUrl?.public_id || 'N/A');
      console.log('\nCreated:', video.createdAt);
      console.log('='.repeat(60));
      console.log('');
    }

    // Check if any videos are missing storageProvider
    const missingProvider = videos.filter((v) => !v.storageProvider);
    if (missingProvider.length > 0) {
      console.log(
        `\n⚠️  WARNING: ${missingProvider.length} video(s) missing storageProvider field!`
      );
      console.log('Run fixYouTubeVideos.js to fix them.\n');
    } else {
      console.log('\n✅ All YouTube videos have storageProvider field!\n');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Check failed:', error);
    process.exit(1);
  }
}

// Run the check
checkYouTubeVideos();
