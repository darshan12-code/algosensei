const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const verifyToken = require('../middleware/auth');
const WeakTopic = require('../models/WeakTopic');

// POST /api/tracker/update — called after every quiz question answered
router.post('/update', verifyToken, async (req, res) => {
  try {
    const { topic, type, failed } = req.body;
    // failed = true if user got it wrong

    const update = {
      $inc: { attemptCount: 1 },
      $set: { lastAttempted: new Date() }
    };
    if (failed) update.$inc.failCount = 1;

    const doc = await WeakTopic.findOneAndUpdate(
      { userId: req.user._id, topic, type },
      update,
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tracker/stats — aggregation: fail rate per topic, sorted worst first
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const stats = await WeakTopic.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.user._id) }
      },
      {
        $project: {
          topic:        1,
          type:         1,
          attemptCount: 1,
          failCount:    1,
          // failRate = failCount / max(attemptCount, 1)
          failRate: {
            $divide: ['$failCount', { $max: ['$attemptCount', 1] }]
          }
        }
      },
      {
        $sort: { failRate: -1 }  // worst topics first
      }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;