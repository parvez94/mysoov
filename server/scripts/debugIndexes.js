import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const debugIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('videos');

    // Check ALL indexes
    const indexes = await collection.indexes();
    console.log('\n📋 ALL INDEXES:');
    console.log(JSON.stringify(indexes, null, 2));

    // Count videos with null customerCode
    const nullCodeCount = await collection.countDocuments({
      customerCode: null,
    });
    console.log(`\n📊 Videos with customerCode: null = ${nullCodeCount}`);

    // Count videos with non-null customerCode
    const nonNullCodeCount = await collection.countDocuments({
      customerCode: { $ne: null },
    });
    console.log(`📊 Videos with customerCode set = ${nonNullCodeCount}`);

    // Show some example videos
    const samples = await collection.find({}).limit(3).toArray();
    console.log('\n📄 Sample videos:');
    samples.forEach((video, i) => {
      console.log(`\n  Video ${i + 1}:`);
      console.log(`    _id: ${video._id}`);
      console.log(`    customerCode: ${video.customerCode}`);
      console.log(`    caption: ${video.caption}`);
    });
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

debugIndexes();
