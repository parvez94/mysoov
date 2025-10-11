import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
    },
    videoUrl: {
      type: Object,
    },
    storageProvider: {
      type: String,
      enum: ['cloudinary', 'youtube'],
      default: 'cloudinary',
    },
    mediaType: {
      type: String,
      enum: ['video', 'image'],
      default: 'video',
    },
    privacy: {
      type: String,
      enum: ['Public', 'Private'],
      default: 'Public',
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: [String],
      default: [],
    },
    comments: {
      type: [String],
      default: [],
    },
    saved: {
      type: [String],
      default: [],
    },
    share: {
      type: Number,
      default: 0,
    },
    pendingReview: {
      type: Boolean,
      default: false,
    },
    reviewRequestedAt: {
      type: Date,
      default: null,
    },
    lastReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Video', videoSchema);
