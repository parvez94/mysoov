import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createError } from '../utils/error.js';
import validatePassword from '../utils/passwordValidator.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: 'Name, email and password are required' });
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
      password: hashPass,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY);

    res.header('Access-Control-Allow-Credentials', true);

    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };

    res.cookie('access_token', token, cookieOptions).status(201).json(newUser);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return next(createError(400, 'Email and password are required.'));

    const user = await User.findOne({ email });

    if (!user) return next(createError(404, 'User not found.'));

    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) return next(createError(400, 'Invalid credentials.'));

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);

    const { password: _pwd, ...others } = user._doc;

    res.header('Access-Control-Allow-Credentials', true);

    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };

    res.cookie('access_token', token, cookieOptions).status(200).json(others);
  } catch (err) {
    next(err);
  }
};
