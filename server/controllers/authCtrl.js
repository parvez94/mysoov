import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createError } from '../utils/error.js';
import validatePassword from '../utils/passwordValidator.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, dateOfBirth, marketingConsent } = req.body;

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ error: 'Name, email, phone and password are required' });
    }

    const existingEmail = await User.findOne({ 
      email, 
      accountType: 'regular' 
    });
    if (existingEmail) {
      return res
        .status(400)
        .json({ error: 'Email is already registered for a regular account' });
    }

    const existingPhone = await User.findOne({ 
      phone, 
      accountType: 'regular' 
    });
    if (existingPhone) {
      return res
        .status(400)
        .json({ error: 'Phone number is already registered for a regular account' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);

    // Generate a username from the provided name + 2 random digits, ensure uniqueness
    const base =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .slice(0, 20) || 'user';

    let username;
    for (let i = 0; i < 10; i++) {
      const suffix = Math.floor(Math.random() * 90 + 10); // two digits 10-99
      const candidate = `${base}${suffix}`;
      const exists = await User.exists({ username: candidate });
      if (!exists) {
        username = candidate;
        break;
      }
    }
    if (!username) {
      username = `${base}${Date.now().toString().slice(-2)}`;
    }

    const newUser = new User({
      username,
      displayName: name,
      email,
      phone,
      password: hashPass,
      accountType: 'regular',
      dateOfBirth: dateOfBirth || null,
      marketingConsent: marketingConsent || false,
    });

    await newUser.save();

    sendWelcomeEmail(newUser).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.SECRET_KEY
    );

    res.header('Access-Control-Allow-Credentials', true);

    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    };

    res.cookie('access_token', token, cookieOptions).status(201).json(newUser);
  } catch (err) {
    next(err);
  }
};

// Register as Happy Team member (editor)
export const registerEditor = async (req, res, next) => {
  try {
    const { name, email, phone, password, editorRole, dateOfBirth, marketingConsent } = req.body;

    if (!name || !email || !phone || !password || !editorRole) {
      return res
        .status(400)
        .json({ error: 'Name, email, phone, password and role are required' });
    }

    const existingEmail = await User.findOne({ 
      email, 
      accountType: 'happy-team' 
    });
    if (existingEmail) {
      return res
        .status(400)
        .json({ error: 'Email is already registered for a Happy Team account' });
    }

    const existingPhone = await User.findOne({ 
      phone, 
      accountType: 'happy-team' 
    });
    if (existingPhone) {
      return res
        .status(400)
        .json({ error: 'Phone number is already registered for a Happy Team account' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);

    // Generate a username
    const base =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .slice(0, 20) || 'editor';

    let username;
    for (let i = 0; i < 10; i++) {
      const suffix = Math.floor(Math.random() * 90 + 10);
      const candidate = `${base}${suffix}`;
      const exists = await User.exists({ username: candidate });
      if (!exists) {
        username = candidate;
        break;
      }
    }
    if (!username) {
      username = `${base}${Date.now().toString().slice(-2)}`;
    }

    const newUser = new User({
      username,
      displayName: name,
      email,
      phone,
      password: hashPass,
      role: 'editor',
      editorRole,
      accountType: 'happy-team',
      dateOfBirth: dateOfBirth || null,
      marketingConsent: marketingConsent || false,
    });

    await newUser.save();

    sendWelcomeEmail(newUser).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.SECRET_KEY
    );

    res.header('Access-Control-Allow-Credentials', true);

    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    };

    res.cookie('access_token', token, cookieOptions).status(201).json(newUser);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, accountType } = req.body;

    if (!email || !password)
      return next(createError(400, 'Email and password are required.'));

    const user = await User.findOne({ 
      email, 
      accountType: accountType || 'regular'
    });

    if (!user) {
      const accountTypeName = accountType === 'happy-team' ? 'Happy Team' : 'regular';
      return next(createError(404, `No ${accountTypeName} account found with this email.`));
    }

    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) return next(createError(400, 'Invalid credentials.'));

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY
    );

    const { password: _pwd, ...others } = user._doc;

    res.header('Access-Control-Allow-Credentials', true);

    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    };

    res.cookie('access_token', token, cookieOptions).status(200).json(others);
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email, accountType } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({
      email,
      accountType: accountType || 'regular'
    });

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    await sendPasswordResetEmail(user, resetToken);

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (err) {
    console.error('Forgot password error:', err);
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, accountType } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      accountType: accountType || 'regular'
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);

    user.password = hashPass;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    next(err);
  }
};
