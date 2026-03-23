// server/routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import passport from '../lib/passport.js';
import verifyToken from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${CLIENT_URL}/login` }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);
  }
);

router.post('/auth/demo', async (req, res) => {
  try {
    const user = await User.findOne({ email: 'demo@algosensei.com' });
    if (!user) return res.status(404).json({ error: 'Demo user not found' });

    const token = jwt.sign(
      { id: user._id, isDemo: true },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }  // short-lived for demo
    );

    res.json({ token, user: { name: user.name, avatar: user.avatar, isDemo: true } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name email image').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;