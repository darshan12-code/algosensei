import express from 'express';
import mongoose from 'mongoose';
import verifyToken from '../middleware/auth.js';
import WeakTopic from '../models/WeakTopic.js';
import { requireFields } from '../lib/validate.js';

const router = express.Router();

router.post('/update', verifyToken, async (req, res) => {
  try {
    const { topic, type, failed } = req.body;
    const valErr = requireFields(['topic', 'type'], req.body);
    if (valErr) return res.status(400).json({ error: valErr });
    const update = { $inc: { attemptCount: 1 }, $set: { lastAttempted: new Date() } };
    if (failed) update.$inc.failCount = 1;
    const doc = await WeakTopic.findOneAndUpdate(
      { userId: req.user._id, topic, type }, update, { upsert: true, new: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', verifyToken, async (req, res) => {
  try {
    const stats = await WeakTopic.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      { $project: { topic: 1, type: 1, attemptCount: 1, failCount: 1, failRate: { $divide: ['$failCount', { $max: ['$attemptCount', 1] }] } } },
      { $sort: { failRate: -1 } },
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;