import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Video from '../models/Video.js';

dotenv.config();

const fixRelativeUrls = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5100';
    
    const videos = await Video.find({
      'videoUrl.url': { $regex: '^/uploads/' }
    });

    console.log(`Found ${videos.length} videos with relative URLs`);

    let fixed = 0;
    for (const video of videos) {
      if (video.videoUrl?.url && !video.videoUrl.url.startsWith('http')) {
        const oldUrl = video.videoUrl.url;
        video.videoUrl.url = `${backendUrl}${oldUrl.startsWith('/') ? '' : '/'}${oldUrl}`;
        await video.save();
        console.log(`✅ Fixed: ${video.caption || video._id}`);
        console.log(`   Old: ${oldUrl}`);
        console.log(`   New: ${video.videoUrl.url}`);
        fixed++;
      }
    }

    console.log(`\n✅ Fixed ${fixed} video URLs`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

fixRelativeUrls();
