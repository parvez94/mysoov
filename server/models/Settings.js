import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    // Storage provider settings
    storageProvider: {
      type: String,
      enum: ['local', 'cloudinary', 'youtube'],
      default: 'local',
    },

    // Local storage configuration
    localStorageConfig: {
      enabled: {
        type: Boolean,
        default: true,
      },
      maxSizeGB: {
        type: Number,
        default: 75,
      },
    },

    // YouTube configuration
    youtubeConfig: {
      enabled: {
        type: Boolean,
        default: false,
      },
      defaultPrivacy: {
        type: String,
        enum: ['public', 'unlisted', 'private'],
        default: 'unlisted',
      },
      channelId: String,
      channelName: String,
    },

    // Cloudinary configuration
    cloudinaryConfig: {
      enabled: {
        type: Boolean,
        default: true,
      },
    },

    // Stripe configuration
    stripeConfig: {
      enabled: {
        type: Boolean,
        default: false,
      },
      mode: {
        type: String,
        enum: ['test', 'live'],
        default: 'test',
      },
      testPublishableKey: String,
      testSecretKey: String,
      livePublishableKey: String,
      liveSecretKey: String,
      webhookSecret: String,
      currency: {
        type: String,
        default: 'usd',
      },
    },

    // Branding settings (for future use)
    branding: {
      logo: String,
      favicon: String,
      siteName: String,
    },

    // Email configuration
    emailConfig: {
      enabled: {
        type: Boolean,
        default: false,
      },
      host: String,
      port: {
        type: Number,
        default: 587,
      },
      username: String,
      password: String,
      fromEmail: String,
      fromName: {
        type: String,
        default: 'MySoov',
      },
    },

    // There should only be one settings document
    singleton: {
      type: Boolean,
      default: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
SettingsSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.models.Settings.countDocuments();
    if (count > 0) {
      const error = new Error('Settings document already exists');
      return next(error);
    }
  }
  next();
});

export default mongoose.model('Settings', SettingsSchema);
