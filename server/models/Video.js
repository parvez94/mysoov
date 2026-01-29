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
    watermarkedVideoUrl: {
      type: Object,
      default: null,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    images: {
      type: [Object],
      default: [],
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    storageProvider: {
      type: String,
      enum: ['local', 'cloudinary', 'youtube'],
      default: 'local',
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
    accessCode: {
      type: String,
      default: null,
      index: true, // Index for faster search
    },
    isFilm: {
      type: Boolean,
      default: false,
    },
    filmDirectoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FilmDirectory',
      default: null,
    },
    // New fields for simplified film system (no folders)
    customerCode: {
      type: String,
      // NO default - field won't exist unless explicitly set
      unique: true,
      sparse: true, // Allows multiple documents without this field
      index: true, // Index for faster search
    },
    purchasePrice: {
      type: Number,
      min: 0,
    },
    sourceFilmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Video', videoSchema);
