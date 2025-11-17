import express from 'express';
import {
  getAllContent,
  uploadContent,
  deleteOwnContent,
  approveContent,
  rejectContent,
  getApprovedContent,
  getPendingContent,
  redeemContent,
} from '../controllers/happyTeamCtrl.js';
import { verifyEditor } from '../middlewares/editorAuth.js';
import { verifyAdmin } from '../middlewares/adminAuth.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// Public routes (approved content)
router.get('/approved', getApprovedContent);

// Routes accessible by authenticated users
router.post('/redeem', verifyToken, redeemContent);

// Routes accessible by editors and admins
router.get('/', verifyEditor, getAllContent);
router.post('/upload', verifyEditor, uploadContent);
router.delete('/:id', verifyEditor, deleteOwnContent);

// Admin-only routes
router.get('/pending', verifyAdmin, getPendingContent);
router.put('/:id/approve', verifyAdmin, approveContent);
router.delete('/:id/reject', verifyAdmin, rejectContent);

export default router;
