import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Video from '../models/Video.js';

dotenv.config();

const deleteAndReaddFilm = async (userId, sourceFilmId) => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    const userCopy = await Video.findOne({
      userId: userId,
      sourceFilmId: sourceFilmId
    });

    if (userCopy) {
      console.log('🗑️  Deleting user copy:', userCopy.caption);
      console.log('   Current videoUrl:', userCopy.videoUrl?.url);
      await Video.findByIdAndDelete(userCopy._id);
      console.log('✅ Deleted');
    } else {
      console.log('⚠️  No user copy found');
    }

    const originalFilm = await Video.findById(sourceFilmId);
    if (!originalFilm) {
      console.log('❌ Original film not found');
      process.exit(1);
    }

    console.log('\n📹 Original film:', originalFilm.caption);
    console.log('   Original videoUrl:', originalFilm.videoUrl?.url);
    console.log('   Watermarked videoUrl:', originalFilm.watermarkedVideoUrl?.url);

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5100';
    
    const toAbsoluteUrl = (urlObj) => {
      if (!urlObj?.url) return urlObj;
      
      const url = urlObj.url;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return urlObj;
      }
      
      return {
        ...urlObj,
        url: `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`
      };
    };

    const newCopy = new Video({
      caption: originalFilm.caption,
      videoUrl: toAbsoluteUrl(originalFilm.watermarkedVideoUrl) || toAbsoluteUrl(originalFilm.videoUrl),
      thumbnail: originalFilm.thumbnail,
      userId: userId,
      privacy: 'Public',
      isFilm: false,
      mediaType: originalFilm.mediaType,
      storageProvider: originalFilm.storageProvider,
      sourceFilmId: originalFilm._id,
    });

    await newCopy.save();

    console.log('\n✅ Created new copy with watermarked video');
    console.log('   New videoUrl:', newCopy.videoUrl?.url);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

const userId = process.argv[2];
const filmId = process.argv[3];

if (!userId || !filmId) {
  console.error('Usage: node deleteAndReaddFilm.js <USER_ID> <FILM_ID>');
  process.exit(1);
}

deleteAndReaddFilm(userId, filmId);
