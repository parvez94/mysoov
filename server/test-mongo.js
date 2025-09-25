import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const testMongoConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MONGO_URL exists:', !!process.env.MONGO_URL);
    console.log(
      'MONGO_URL preview:',
      process.env.MONGO_URL
        ? process.env.MONGO_URL.substring(0, 20) + '...'
        : 'Not set'
    );

    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error('MONGO_URL environment variable is not set');
    }

    await mongoose.connect(mongoUrl, {
      bufferCommands: false,
    });

    console.log('✅ Successfully connected to MongoDB!');

    // Test basic operations
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      '📁 Available collections:',
      collections.map((c) => c.name)
    );

    // Test if we can access the videos collection
    const Video = mongoose.model(
      'Video',
      new mongoose.Schema({}, { strict: false })
    );
    const videoCount = await Video.countDocuments();
    console.log('🎥 Total videos in database:', videoCount);

    // Test aggregation (same as your random videos endpoint)
    const sampleVideos = await Video.aggregate([
      { $match: { privacy: 'Public' } },
      { $sample: { size: 3 } },
    ]);
    console.log('🎲 Sample videos found:', sampleVideos.length);

    await mongoose.disconnect();
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection test failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);

    if (error.message.includes('IP')) {
      console.error('🚨 This looks like an IP whitelist issue!');
      console.error(
        '💡 Solution: Add 0.0.0.0/0 to your MongoDB Atlas Network Access'
      );
    }

    if (error.message.includes('authentication')) {
      console.error('🚨 This looks like an authentication issue!');
      console.error(
        '💡 Solution: Check your database username/password in MONGO_URL'
      );
    }

    process.exit(1);
  }
};

testMongoConnection();
