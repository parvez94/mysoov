import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Settings from '../models/Settings.js';

dotenv.config();

const updateStorageProvider = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Find existing settings
    let settings = await Settings.findOne();

    if (!settings) {
      // Create new settings with local as default
      settings = await Settings.create({
        storageProvider: 'local',
        localStorageConfig: {
          enabled: true,
          maxSizeGB: 75,
        },
        cloudinaryConfig: {
          enabled: true,
        },
        youtubeConfig: {
          enabled: false,
        },
      });
      console.log(
        '✅ Created new settings document with local storage as default'
      );
    } else {
      // Update existing settings to use local storage
      settings.storageProvider = 'local';

      // Ensure local storage config exists
      if (!settings.localStorageConfig) {
        settings.localStorageConfig = {
          enabled: true,
          maxSizeGB: 75,
        };
      } else {
        settings.localStorageConfig.enabled = true;
        if (!settings.localStorageConfig.maxSizeGB) {
          settings.localStorageConfig.maxSizeGB = 75;
        }
      }

      // Ensure cloudinary config exists
      if (!settings.cloudinaryConfig) {
        settings.cloudinaryConfig = { enabled: true };
      }

      await settings.save();
      console.log(
        '✅ Updated existing settings to use local storage as default'
      );
    }

    console.log('\n📊 Current Settings:');
    console.log(`   Storage Provider: ${settings.storageProvider}`);
    console.log(
      `   Local Storage Enabled: ${settings.localStorageConfig.enabled}`
    );
    console.log(
      `   Local Storage Max Size: ${settings.localStorageConfig.maxSizeGB} GB`
    );
    console.log(`   Cloudinary Enabled: ${settings.cloudinaryConfig.enabled}`);
    console.log(`   YouTube Enabled: ${settings.youtubeConfig.enabled}`);

    console.log('\n🎉 Storage provider updated successfully!');
    console.log('   New uploads will now use local VPS storage by default.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating storage provider:', error);
    process.exit(1);
  }
};

updateStorageProvider();
