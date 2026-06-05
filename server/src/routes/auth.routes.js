import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = Router();

function signToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error('Email is already registered');
      error.status = 409;
      throw error;
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    res.json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
});

export default router;
