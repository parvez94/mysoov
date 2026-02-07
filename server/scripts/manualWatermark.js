import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Video from '../models/Video.js';
import { createWatermarkedVideoCopy } from '../utils/videoProcessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const watermarkFilm = async (filmId) => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    const film = await Video.findById(filmId);
    if (!film) {
      console.error('❌ Film not found:', filmId);
      process.exit(1);
    }

    console.log('📹 Film found:', film.caption);
    console.log('   videoUrl:', film.videoUrl?.url);
    console.log('   watermarkedVideoUrl:', film.watermarkedVideoUrl?.url || 'NULL');
    console.log('   storageProvider:', film.storageProvider);
    console.log('   mediaType:', film.mediaType);

    if (film.watermarkedVideoUrl?.url) {
      console.log('⚠️  Film already has watermark!');
      process.exit(0);
    }

    if (film.mediaType !== 'video') {
      console.log('⏭️  Skipping: Not a video');
      process.exit(0);
    }

    if (!film.videoUrl?.url) {
      console.log('❌ No video URL found');
      process.exit(1);
    }

    let videoPath = film.videoUrl.url;
    if (videoPath.startsWith('http')) {
      const urlObj = new URL(videoPath);
      videoPath = urlObj.pathname;
    }
    videoPath = videoPath.replace(/^\//, '');

    const fullVideoPath = path.join(process.cwd(), videoPath);
    console.log('📁 Full path:', fullVideoPath);
    console.log('📁 File exists:', fs.existsSync(fullVideoPath));

    if (!fs.existsSync(fullVideoPath)) {
      console.error('❌ Video file not found on disk');
      process.exit(1);
    }

    console.log('🎨 Starting watermark generation...');
    const originalFileName = path.basename(film.videoUrl.url);
    
    const watermarkResult = await createWatermarkedVideoCopy(
      fullVideoPath,
      originalFileName
    );

    console.log('✅ Watermark created:', watermarkResult.url);

    film.watermarkedVideoUrl = {
      url: watermarkResult.url,
      public_id: watermarkResult.fileName,
    };
    
    if (!film.storageProvider) {
      film.storageProvider = 'local';
    }
    
    await film.save();
    
    console.log('✅ Film updated in database');
    console.log('📹 Original:', film.videoUrl.url);
    console.log('🎨 Watermarked:', film.watermarkedVideoUrl.url);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

const filmId = process.argv[2];
if (!filmId) {
  console.error('Usage: node manualWatermark.js <FILM_ID>');
  process.exit(1);
}

watermarkFilm(filmId);
