import mongoose from 'mongoose';

const filmDirectorySchema = new mongoose.Schema(
  {
    folderName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true, // For faster search - folderName IS the access code
    },
    films: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isRedeemed: {
      type: Boolean,
      default: false,
    },
    redeemedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    redeemedAt: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('FilmDirectory', filmDirectorySchema);
