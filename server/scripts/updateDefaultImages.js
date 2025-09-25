import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const updateDefaultImages = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to database...');

    // Find users with old default image path
    const usersWithOldDefault = await User.find({
      displayImage: '/default-user.png',
    });

    console.log(
      `Found ${usersWithOldDefault.length} users with old default image path`
    );

    if (usersWithOldDefault.length > 0) {
      // Update them to null
      const result = await User.updateMany(
        { displayImage: '/default-user.png' },
        { $set: { displayImage: null } }
      );

      console.log(`Updated ${result.modifiedCount} users`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

updateDefaultImages();
