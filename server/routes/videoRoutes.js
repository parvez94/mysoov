import express from 'express';
import { verifyToken } from '../utils/verifyToken.js';
import {
  getVideo,
  addVideo,
  updateVideo,
  deleteVideo,
  addView,
  randomVideos,
  trend,
  videoFeeds,
  search,
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

router.get('/find/:id', getVideo);
router.get('/random', randomVideos);
router.get('/feeds', verifyToken, videoFeeds);

// router.get("/search", search)
// router.put("/view/:id", addView)
// router.get("/trend", trend)

export default router;
