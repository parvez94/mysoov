import express from 'express';
import { register, registerEditor, login, forgotPassword, resetPassword } from '../controllers/authCtrl.js';

const router = express.Router();

// Signup
router.post('/signup', register);

// Happy Team Signup (Editor role)
router.post('/signup-editor', registerEditor);

// Signin
router.post('/signin', login);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password/:token', resetPassword);

export default router;
