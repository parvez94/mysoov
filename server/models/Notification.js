import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'follow',
        'like',
        'comment',
        'reply',
        'video_upload',
        'content_paused',
        'content_unpaused',
        'review_requested',
        'review_approved',
        'review_rejected',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedVideo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      default: null,
    },
    relatedArticle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      default: null,
    },
    relatedComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    adminReason: {
      type: String,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, read: 1 });

export default mongoose.model('Notification', NotificationSchema);
