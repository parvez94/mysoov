import mongoose from "mongoose"

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
    privacy: {
      type: String,
      enum: ["Public", "Private"],
      default: "Public",
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
  },
  { timestamps: true }
)

export default mongoose.model("Video", videoSchema)
