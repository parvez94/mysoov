import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Video from '../models/Video.js';

dotenv.config();

/**
 * Migration script to fix existing YouTube videos
 * This adds the storageProvider field to videos that have YouTube URLs
 */
async function fixYouTubeVideos() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Find all videos with YouTube URLs but missing storageProvider
    const videos = await Video.find({
      $or: [
        { 'videoUrl.url': { $regex: 'youtube.com/embed' } },
        { 'videoUrl.provider': 'youtube' },
      ],
    });

    console.log(`Found ${videos.length} videos to check`);

    let updatedCount = 0;

    for (const video of videos) {
      // Check if storageProvider is missing or incorrect
      if (!video.storageProvider || video.storageProvider !== 'youtube') {
        video.storageProvider = 'youtube';
        await video.save();
        updatedCount++;
        console.log(`Updated video ${video._id}`);
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`Updated ${updatedCount} videos`);
    console.log(
      `Skipped ${videos.length - updatedCount} videos (already correct)`
    );

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
fixYouTubeVideos();
