import express from 'express';
import { verifyToken, optionalAuth } from '../utils/verifyToken.js';
import {
  getVideo,
  addVideo,
  updateVideo,
  deleteVideo,
  addView,
  addShare,
  randomVideos,
  trend,
  videoFeeds,
  search,
  searchByAccessCode,
} from '../controllers/videoCtrl.js';

const router = express.Router();

// Handle preflight requests for video creation
router.options('/', (req, res) => {
  res.header(
    'Access-Control-Allow-Origin',
    'https://mysoov-frontend.vercel.app'
  );
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Cookie'
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

router.post('/', verifyToken, addVideo);

// Handle preflight requests for video updates
router.options('/:id', (req, res) => {
  res.header(
    'Access-Control-Allow-Origin',
    'https://mysoov-frontend.vercel.app'
  );
  res.header('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Cookie'
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

router.put('/:id', verifyToken, updateVideo);
router.delete('/:id', verifyToken, deleteVideo);

router.get('/find/:id', optionalAuth, getVideo);
router.put('/share/:id', addShare);
router.get('/random', randomVideos);
router.get('/feeds', verifyToken, videoFeeds);
router.get('/search', searchByAccessCode);

// router.get("/search", search)
// router.put("/view/:id", addView)
// router.get("/trend", trend)

export default router;
