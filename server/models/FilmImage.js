import mongoose from 'mongoose';

const filmImageSchema = new mongoose.Schema(
  {
    filmDirectoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FilmDirectory',
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    watermarkedUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    storageProvider: {
      type: String,
      enum: ['local', 'cloudinary'],
      default: 'local',
    },
    publicId: {
      type: String,
      default: '',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('FilmImage', filmImageSchema);
