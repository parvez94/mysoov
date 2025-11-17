import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const fixCustomerCodeIndex = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('videos');

    // Check existing indexes
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach((idx) => {
      if (idx.name.includes('customerCode')) {
        console.log(JSON.stringify(idx, null, 2));
      }
    });

    // Drop the old customerCode index
    try {
      await collection.dropIndex('customerCode_1');
      console.log('\n✅ Dropped old customerCode_1 index');
    } catch (err) {
      if (err.code === 27) {
        console.log('\n⚠️  Index customerCode_1 does not exist');
      } else {
        throw err;
      }
    }

    // Import the Video model to trigger index creation
    const { default: Video } = await import('../models/Video.js');

    // Ensure indexes are created (will create sparse index)
    await Video.syncIndexes();
    console.log('✅ Recreated indexes with sparse: true');

    // Verify the new index
    const newIndexes = await collection.indexes();
    console.log('\n📋 New indexes:');
    newIndexes.forEach((idx) => {
      if (idx.name.includes('customerCode')) {
        console.log(JSON.stringify(idx, null, 2));
      }
    });

    console.log('\n✅ Customer code index fixed successfully!');
    console.log('   Multiple videos can now have customerCode: null');
  } catch (err) {
    console.error('❌ Error fixing index:', err);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

fixCustomerCodeIndex();
