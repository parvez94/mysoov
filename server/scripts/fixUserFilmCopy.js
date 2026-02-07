import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Video from '../models/Video.js';

dotenv.config();

const fixUserFilmCopies = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

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

    const userCopies = await Video.find({
      sourceFilmId: { $exists: true, $ne: null },
      isFilm: false
    }).populate('sourceFilmId');

    console.log(`Found ${userCopies.length} user film copies`);

    let fixed = 0;
    for (const copy of userCopies) {
      if (!copy.sourceFilmId) {
        console.log(`⚠️  Skipping ${copy.caption} - original film deleted`);
        continue;
      }

      const original = copy.sourceFilmId;
      
      if (original.watermarkedVideoUrl?.url) {
        const watermarkedUrl = toAbsoluteUrl(original.watermarkedVideoUrl);
        
        if (copy.videoUrl?.url !== watermarkedUrl.url) {
          console.log(`\n📹 Fixing: ${copy.caption}`);
          console.log(`   Old: ${copy.videoUrl?.url}`);
          console.log(`   New: ${watermarkedUrl.url}`);
          
          copy.videoUrl = watermarkedUrl;
          await copy.save();
          fixed++;
        }
      }
    }

    console.log(`\n✅ Fixed ${fixed} user film copies`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

fixUserFilmCopies();
