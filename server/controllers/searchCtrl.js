import User from '../models/User.js';
import Video from '../models/Video.js';

export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json({
        success: true,
        users: [],
        posts: [],
      });
    }

    const searchQuery = q.trim();

    const [users, posts] = await Promise.all([
      User.find({
        accountType: 'regular',
        $or: [
          { username: { $regex: searchQuery, $options: 'i' } },
          { displayName: { $regex: searchQuery, $options: 'i' } },
        ],
      })
        .select('username displayName displayImage')
        .limit(5),

      Video.find({
        privacy: 'Public',
        isFilm: { $ne: true },
        pendingReview: { $ne: true },
        $or: [
          { caption: { $regex: searchQuery, $options: 'i' } },
          { tags: { $regex: searchQuery, $options: 'i' } },
        ],
      })
        .select('_id caption thumbnailPath type createdAt userId')
        .limit(5)
        .sort({ createdAt: -1 }),
    ]);

    const postsWithUserData = await Promise.all(
      posts.map(async (post) => {
        const postObj = post.toObject();
        try {
          const user = await User.findById(postObj.userId).select(
            'username displayName displayImage'
          );
          postObj.user = user || null;
        } catch (err) {
          postObj.user = null;
        }
        return postObj;
      })
    );

    res.status(200).json({
      success: true,
      users,
      posts: postsWithUserData,
    });
  } catch (error) {
    next(error);
  }
};
