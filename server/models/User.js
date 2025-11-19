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
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      enum: ['regular', 'happy-team'],
      default: 'regular',
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
      enum: ['user', 'admin', 'editor'],
      default: 'user',
    },
    editorRole: {
      type: String,
      default: '',
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
      expiresAt: {
        type: Date,
        default: null,
      },
    },
    storageUsed: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    marketingConsent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1, accountType: 1 }, { unique: true });
userSchema.index({ phone: 1, accountType: 1 }, { unique: true });

export default mongoose.model('User', userSchema);
