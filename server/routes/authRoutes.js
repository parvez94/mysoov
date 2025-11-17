import express from 'express';
import { register, registerEditor, login } from '../controllers/authCtrl.js';

const router = express.Router();

// Signup
router.post('/signup', register);

// Happy Team Signup (Editor role)
router.post('/signup-editor', registerEditor);

// Signin
router.post('/signin', login);

export default router;
