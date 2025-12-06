/**
 * Recalculate Storage Script
 * Recalculates storageUsed for all users based on their existing videos
 *
 * Run with: node server/scripts/recalculateStorage.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/mysoov';

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    runRecalculation();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function runRecalculation() {
  try {
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const videosCollection = db.collection('videos');

    console.log('\n🔍 Starting storage recalculation...\n');

    // Get all users
    const users = await usersCollection.find({}).toArray();
    console.log(`📊 Found ${users.length} users`);

    let updatedCount = 0;
    let totalStorageRecalculated = 0;

    for (const user of users) {
      // Calculate total storage used by this user
      const userVideos = await videosCollection
        .find({ userId: user._id.toString() })
        .toArray();

      // Sum up all fileSize values (only for videos that have fileSize)
      let totalStorage = 0;
      let videosWithSize = 0;
      let videosWithoutSize = 0;

      for (const video of userVideos) {
        if (video.fileSize && typeof video.fileSize === 'number') {
          totalStorage += video.fileSize;
          videosWithSize++;
        } else {
          videosWithoutSize++;
        }
      }

      // Update user's storageUsed
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { storageUsed: totalStorage } }
      );

      if (userVideos.length > 0) {
        console.log(
          `✓ User: ${user.username || user.email} - Videos: ${userVideos.length} (${videosWithSize} with size, ${videosWithoutSize} without) - Storage: ${totalStorage.toFixed(2)} MB`
        );
      }

      updatedCount++;
      totalStorageRecalculated += totalStorage;
    }

    console.log('\n' + '='.repeat(70));
    console.log('📋 RECALCULATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`\nTotal Users Updated: ${updatedCount}`);
    console.log(
      `Total Storage Recalculated: ${totalStorageRecalculated.toFixed(2)} MB (${(totalStorageRecalculated / 1024).toFixed(2)} GB)`
    );

    // Get statistics
    const usersWithStorage = await usersCollection.countDocuments({
      storageUsed: { $gt: 0 },
    });
    const usersWithoutStorage = await usersCollection.countDocuments({
      storageUsed: 0,
    });

    console.log(`\nUsers with storage: ${usersWithStorage}`);
    console.log(`Users with no storage: ${usersWithoutStorage}`);

    console.log('\n✅ Storage recalculation completed successfully!');
    console.log('='.repeat(70) + '\n');
  } catch (error) {
    console.error('\n❌ Recalculation failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled rejection:', err);
  process.exit(1);
});
