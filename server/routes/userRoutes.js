import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
  likeVideo,
  unLikeVideo,
  getUserVideos,
  saveVideo,
  unSaveVideo,
  getSavedVideos,
  checkUsernameAvailability,
  getFollowers,
  getFollowing,
} from '../controllers/userCtrl.js';

import { verifyToken } from '../utils/verifyToken.js';

const router = express.Router();

// Get users
router.get('/', getUsers);

// Check username availability
router.get('/check-username/:username', checkUsernameAvailability);

// Get user
router.get('/:id', getUser);

// Update user
router.put('/:id', verifyToken, updateUser);

// Delete user
router.delete('/:id', verifyToken, deleteUser);

// Follow user
router.put('/follow/:id', verifyToken, followUser);

// Unfollow user
router.put('/unfollow/:id', verifyToken, unfollowUser);

// Like video
router.put('/like/:videoId', verifyToken, likeVideo);

// Unline video
router.put('/unlike/:videoId', verifyToken, unLikeVideo);

// Save / Unsave video
router.put('/save/:videoId', verifyToken, saveVideo);
router.put('/unsave/:videoId', verifyToken, unSaveVideo);

// Profile (own uploads)
router.get('/profile/:id', verifyToken, getUserVideos);

// Saved videos (private)
router.get('/saved/:id', verifyToken, getSavedVideos);

// Get followers list
router.get('/followers/:id', getFollowers);

// Get following list
router.get('/following/:id', getFollowing);

export default router;
