import Comment from '../models/Comment.js';
import Video from '../models/Video.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { createNotification } from './notificationCtrl.js';

export const addComment = async (req, res, next) => {
  console.log('🔔 ===== COMMENT CREATION DEBUG =====');
  console.log('🔔 Request body:', req.body);
  console.log('🔔 User ID:', req.user.id);
  console.log('🔔 Parent ID from request:', req.body.parentId);
  console.log('🔔 Parent ID type:', typeof req.body.parentId);

  const newComment = new Comment({ ...req.body, userId: req.user.id });
  console.log('🔔 New comment object:', {
    videoId: newComment.videoId,
    comment: newComment.comment,
    parentId: newComment.parentId,
    userId: newComment.userId,
  });

  try {
    const savedComment = await newComment.save();
    console.log('🔔 Saved comment:', {
      _id: savedComment._id,
      parentId: savedComment.parentId,
      parentIdType: typeof savedComment.parentId,
    });

    // Get video and user info for notification
    const video = await Video.findById(savedComment.videoId);
    const user = await User.findById(req.user.id).select(
      'username displayName'
    );

    // If this is a reply to another comment, notify the parent comment author
    if (savedComment.parentId) {
      console.log('🔔 ===== REPLY NOTIFICATION DEBUG =====');
      console.log(
        '🔔 Processing reply notification for comment:',
        savedComment._id
      );
      console.log('🔔 Parent ID from saved comment:', savedComment.parentId);
      console.log('🔔 Parent ID type:', typeof savedComment.parentId);

      const parentComment = await Comment.findById(savedComment.parentId);
      console.log(
        '🔔 Parent comment found:',
        parentComment ? parentComment._id : 'null'
      );

      if (parentComment) {
        console.log('🔔 Parent comment details:', {
          _id: parentComment._id,
          userId: parentComment.userId,
          comment: parentComment.comment.substring(0, 50) + '...',
          createdAt: parentComment.createdAt,
        });
        console.log(
          '🔔 Parent comment user ID:',
          parentComment.userId.toString()
        );
        console.log('🔔 Current user ID:', req.user.id.toString());
        console.log(
          '🔔 Are they different?',
          parentComment.userId.toString() !== req.user.id.toString()
        );

        if (parentComment.userId.toString() !== req.user.id.toString()) {
          console.log(
            '🔔 Creating reply notification for user:',
            parentComment.userId
          );
          console.log('🔔 Video details:', {
            id: video._id,
            title: video.title,
          });
          console.log('🔔 User details:', {
            id: req.user.id,
            username: user.username,
            displayName: user.displayName,
          });

          const notification = await createNotification(
            parentComment.userId,
            req.user.id,
            'reply',
            `${user.displayName || user.username} replied to your comment`,
            video._id,
            savedComment._id
          );

          console.log(
            '🔔 Reply notification result:',
            notification
              ? {
                  id: notification._id,
                  recipient: notification.recipient,
                  sender: notification.sender,
                  type: notification.type,
                  message: notification.message,
                }
              : 'FAILED TO CREATE'
          );
        } else {
          console.log('🔔 No notification needed - replying to own comment');
        }
      } else {
        console.log(
          '🔔 ERROR: Parent comment not found with ID:',
          savedComment.parentId
        );
        // Let's try to find any comments with similar IDs
        const allComments = await Comment.find({
          videoId: savedComment.videoId,
        }).limit(10);
        console.log(
          '🔔 Available comments in this video:',
          allComments.map((c) => ({ id: c._id, parentId: c.parentId }))
        );
      }
      console.log('🔔 ===== END REPLY NOTIFICATION DEBUG =====');
    } else if (video && video.userId !== req.user.id) {
      // Create notification for video owner only for top-level comments (not replies)
      await createNotification(
        video.userId,
        req.user.id,
        'comment',
        `${user.displayName || user.username} commented on your video "${
          video?.title || 'your video'
        }"`,
        video._id,
        savedComment._id
      );
    }

    res.status(200).json(savedComment);
  } catch (err) {
    next(err);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const existing = await Comment.findById(id);
    if (!existing) return res.status(404).json('Comment not found');

    // Only comment owner can edit their comment
    const isCommentOwner = String(req.user.id) === String(existing.userId);
    if (!isCommentOwner)
      return res.status(403).json('Not allowed to edit this comment');

    existing.comment = comment;
    const saved = await existing.save();
    return res.status(200).json(saved);
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json('Comment not found');

    // Find the video for the comment to allow video owner moderation
    const video = await Video.findById(comment.videoId);

    const isCommentOwner = String(req.user.id) === String(comment.userId);
    const isVideoOwner = video && String(video.userId) === String(req.user.id);

    if (isCommentOwner || isVideoOwner) {
      // Cascade delete: collect this comment and all its descendants
      const toDelete = new Set([String(req.params.id)]);
      const queue = [String(req.params.id)];

      while (queue.length) {
        const pid = queue.shift();

        // Build match for children where parentId equals pid
        // Handle legacy records where parentId may be stored as ObjectId
        const orMatch = [{ parentId: pid }];
        try {
          const asObjId = new mongoose.Types.ObjectId(pid);
          orMatch.push({ parentId: asObjId });
        } catch (_) {
          // pid is not a valid ObjectId; ignore
        }

        const children = await Comment.find(
          { $or: orMatch },
          { _id: 1 }
        ).lean();
        for (const ch of children) {
          const idStr = String(ch._id);
          if (!toDelete.has(idStr)) {
            toDelete.add(idStr);
            queue.push(idStr);
          }
        }
      }

      await Comment.deleteMany({ _id: { $in: Array.from(toDelete) } });
      return res.status(200).json({ deleted: toDelete.size });
    }

    return res.status(403).json("You cannot delete another user's comment");
  } catch (err) {
    next(err);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    // Return all comments for a video, including replies. Client will group by parentId
    const comments = await Comment.find({ videoId }).sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
};
