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
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
