import express from 'express';
import Session from '../models/Session.js';
import verifyToken, { blockDemo } from '../middleware/auth.js';
import { requireFields } from '../lib/validate.js';

const router = express.Router();

// Demo users can't save sessions — they read pre-seeded ones only
router.post('/', verifyToken, blockDemo, async (req, res) => {
  try {
    const { problemId, messages, mode, solved } = req.body;
    const valErr = requireFields(['messages', 'mode'], req.body);
    if (valErr) return res.status(400).json({ error: valErr });
    const session = await Session.create({
      userId: req.user._id, problemId: problemId || undefined,
      messages, mode, solved: solved || false, completedAt: new Date(),
    });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', verifyToken, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .sort({ completedAt: -1 }).limit(20).populate('problemId', 'title difficulty leetcodeNum');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;