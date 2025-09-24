import Comment from '../models/Comment.js';
import Video from '../models/Video.js';
import mongoose from 'mongoose';

export const addComment = async (req, res, next) => {
  const newComment = new Comment({ ...req.body, userId: req.user.id });
  try {
    const savedComment = await newComment.save();
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
