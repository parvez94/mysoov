import express from 'express';
import { verifyToken } from '../utils/verifyToken.js';
import {
  addComment,
  deleteComment,
  getComments,
  updateComment,
} from '../controllers/commentCtrl.js';

const router = express.Router();

router.get('/:videoId', getComments);
router.post('/', verifyToken, addComment);
router.patch('/:id', verifyToken, updateComment);
router.delete('/:id', verifyToken, deleteComment);

export default router;
