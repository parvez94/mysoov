import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const checkCustomerCodes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('videos');

    // Find ALL videos and check their customerCode field
    const allVideos = await collection.find({}).toArray();

    console.log(`\n📊 Total videos: ${allVideos.length}\n`);

    const videosWithField = [];
    const videosWithoutField = [];
    const videosWithNull = [];
    const videosWithValue = [];

    allVideos.forEach((video) => {
      if (!video.hasOwnProperty('customerCode')) {
        videosWithoutField.push(video._id);
      } else if (video.customerCode === null) {
        videosWithNull.push(video._id);
      } else {
        videosWithValue.push({ id: video._id, code: video.customerCode });
      }
    });

    console.log('📋 Analysis:');
    console.log(
      `   Videos WITHOUT customerCode field: ${videosWithoutField.length}`
    );
    console.log(`   Videos WITH customerCode = null: ${videosWithNull.length}`);
    console.log(`   Videos WITH customerCode value: ${videosWithValue.length}`);

    if (videosWithValue.length > 0) {
      console.log('\n✅ Videos with customer codes:');
      videosWithValue.forEach((v) => {
        console.log(`   - ${v.id}: "${v.code}"`);
      });
    }

    // Check for potential duplicates in null values
    console.log('\n🔍 Checking for issues...');

    // Try to create a test video with null customerCode
    console.log('\n🧪 Testing: Creating video with customerCode: null');
    try {
      const testVideo = await collection.insertOne({
        userId: 'test-user',
        caption: 'Test video',
        customerCode: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✅ SUCCESS! Can create video with null customerCode');

      // Clean up
      await collection.deleteOne({ _id: testVideo.insertedId });
      console.log('🧹 Test video cleaned up');
    } catch (err) {
      console.error('❌ FAILED! Error creating video with null customerCode:');
      console.error(err.message);
    }
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

checkCustomerCodes();
