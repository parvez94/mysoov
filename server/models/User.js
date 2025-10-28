import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    displayImage: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
    coverImagePosition: {
      type: Number,
      default: 50, // Y-axis position percentage (0-100)
    },
    bio: {
      type: String,
      default: '',
    },
    followers: {
      type: Number,
      default: 0,
    },
    following: {
      type: [String],
    },
    videos: {
      type: [String],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    subscription: {
      isPaid: {
        type: Boolean,
        default: false,
      },
      plan: {
        type: String,
        enum: ['free', 'basic', 'pro', 'premium'],
        default: 'free',
      },
      maxUploadSize: {
        type: Number,
        default: 5, // in MB
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
