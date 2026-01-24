import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB\n');

    const { default: HappyTeamContent } = await import('../models/HappyTeamContent.js');

    const contents = await HappyTeamContent.find({ type: 'image' }).limit(3);
    console.log('Recent image contents:');
    contents.forEach(c => {
      console.log(`\nTitle: ${c.title}`);
      console.log(`  Status: ${c.status}`);
      console.log(`  Original: ${c.fileUrl}`);
      console.log(`  Watermarked: ${c.watermarkedUrl || 'NOT SET'}`);
    });

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.connection.close();
  }
};

check();
