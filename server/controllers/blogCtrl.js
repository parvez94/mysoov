import Article from '../models/Article.js';
import { createError } from '../utils/error.js';

// Get all published articles (public)
const getPublishedArticles = async (req, res, next) => {
  try {
    const articles = await Article.find({ published: true, isPaused: false })
      .populate('author', 'displayName username profilePic')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(articles);
  } catch (err) {
    next(err);
  }
};

// Get all articles including drafts (admin only)
const getAllArticles = async (req, res, next) => {
  try {
    const articles = await Article.find()
      .populate('author', 'displayName username profilePic')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(articles);
  } catch (err) {
    next(err);
  }
};

// Get single article by slug (public)
const getArticleBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const currentUserId = req.user?.id;

    // First, try to find a published and non-paused article
    let article = await Article.findOne({
      slug,
      published: true,
      isPaused: false,
    })
      .populate('author', 'displayName username profilePic')
      .lean();

    // If not found, check if user is the author and allow viewing their own paused/draft article
    if (!article && currentUserId) {
      article = await Article.findOne({
        slug,
        author: currentUserId,
      })
        .populate('author', 'displayName username profilePic')
        .lean();
    }

    if (!article) {
      return next(createError(404, 'Article not found'));
    }

    // Check if article is paused and user is not the author
    if (
      article.isPaused &&
      String(article.author._id) !== String(currentUserId)
    ) {
      return next(createError(403, 'This article is currently unavailable'));
    }

    // Increment views only for published, non-paused articles
    if (article.published && !article.isPaused) {
      await Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } });
    }

    res.status(200).json(article);
  } catch (err) {
    next(err);
  }
};

// Get article by ID for editing (user must be author or admin)
const getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id).lean();

    if (!article) {
      return next(createError(404, 'Article not found'));
    }

    // Check if user is the author or an admin
    const isAuthor = String(article.author) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return next(createError(403, 'You can only edit your own articles'));
    }

    res.status(200).json(article);
  } catch (err) {
    next(err);
  }
};

// Create new article (any authenticated user)
const createArticle = async (req, res, next) => {
  try {
    const { title, slug, content, featuredImage, published } = req.body;

    // Check if slug already exists
    const existingArticle = await Article.findOne({ slug });
    if (existingArticle) {
      return next(createError(400, 'An article with this slug already exists'));
    }

    const newArticle = new Article({
      title,
      slug,
      content,
      featuredImage: featuredImage || '',
      author: req.user.id,
      published: published || false,
    });

    const savedArticle = await newArticle.save();
    const populatedArticle = await Article.findById(savedArticle._id)
      .populate('author', 'displayName username profilePic')
      .lean();

    res.status(201).json(populatedArticle);
  } catch (err) {
    if (err.code === 11000) {
      return next(createError(400, 'An article with this slug already exists'));
    }
    next(err);
  }
};

// Update article (user must be author or admin)
const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, content, featuredImage, published } = req.body;

    const article = await Article.findById(id);
    if (!article) {
      return next(createError(404, 'Article not found'));
    }

    // Check if user is the author or an admin
    const isAuthor = String(article.author) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return next(createError(403, 'You can only edit your own articles'));
    }

    // If slug is being changed, check if new slug already exists
    if (slug !== article.slug) {
      const existingArticle = await Article.findOne({ slug });
      if (existingArticle) {
        return next(
          createError(400, 'An article with this slug already exists')
        );
      }
    }

    // If article is paused and user is editing it, set pendingReview flag
    const wasPaused = article.isPaused;

    article.title = title;
    article.slug = slug;
    article.content = content;
    article.featuredImage = featuredImage || '';
    article.published = published;

    if (wasPaused && isAuthor) {
      article.pendingReview = true;
      article.reviewRequestedAt = new Date();
    }

    const updatedArticle = await article.save();
    const populatedArticle = await Article.findById(updatedArticle._id)
      .populate('author', 'displayName username profilePic')
      .lean();

    // Notify admin if review is requested
    if (wasPaused && isAuthor && article.pendingReview) {
      const Notification = (await import('../models/Notification.js')).default;
      const User = (await import('../models/User.js')).default;

      // Find admin users
      const admins = await User.find({ role: 'admin' });

      // Create notification for each admin
      for (const admin of admins) {
        await Notification.create({
          recipient: admin._id,
          sender: req.user.id,
          type: 'review_requested',
          message: `A user has edited their paused article and requested review.`,
          relatedArticle: article._id,
        });
      }
    }

    res.status(200).json(populatedArticle);
  } catch (err) {
    if (err.code === 11000) {
      return next(createError(400, 'An article with this slug already exists'));
    }
    next(err);
  }
};

// Toggle publish status (admin only)
const togglePublishStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { published } = req.body;

    const article = await Article.findById(id);
    if (!article) {
      return next(createError(404, 'Article not found'));
    }

    article.published = published;
    await article.save();

    res.status(200).json({ message: 'Article status updated', published });
  } catch (err) {
    next(err);
  }
};

// Toggle article pause status (admin only)
const toggleArticlePause = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      return next(createError(404, 'Article not found'));
    }

    // Toggle pause status
    article.isPaused = !article.isPaused;
    await article.save();

    res.status(200).json({
      success: true,
      message: `Article ${
        article.isPaused ? 'paused' : 'unpaused'
      } successfully`,
      article,
    });
  } catch (err) {
    next(err);
  }
};

// Delete article (user must be author or admin)
const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      return next(createError(404, 'Article not found'));
    }

    // Check if user is the author or an admin
    const isAuthor = String(article.author) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return next(createError(403, 'You can only delete your own articles'));
    }

    await Article.findByIdAndDelete(id);

    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Get articles by user (for profile page)
const getUserArticles = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // If viewing own profile, show all articles (published, drafts, and paused)
    // If viewing someone else's profile, show only published and non-paused articles
    const currentUserId = req.user?.id;
    const isOwnProfile =
      currentUserId && String(currentUserId) === String(userId);

    const query = { author: userId };
    if (!isOwnProfile) {
      query.published = true;
      query.isPaused = false; // Hide paused articles from public view
    }

    const articles = await Article.find(query)
      .populate('author', 'displayName username profilePic')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(articles);
  } catch (err) {
    next(err);
  }
};

export {
  getPublishedArticles,
  getAllArticles,
  getArticleBySlug,
  getArticleById,
  createArticle,
  updateArticle,
  togglePublishStatus,
  toggleArticlePause,
  deleteArticle,
  getUserArticles,
};
