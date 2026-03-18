const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const verifyToken = require('../middleware/auth');

// POST /api/sessions — save a completed session
router.post('/', verifyToken, async (req, res) => {
  try {
    const { problemId, messages, mode, solved } = req.body;
    const session = await Session.create({
      userId:    req.user._id,
      problemId: problemId || undefined,
      messages,
      mode,
      solved:      solved || false,
      completedAt: new Date(),
    });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sessions/my — get current user's sessions
router.get('/my', verifyToken, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(20)
      .populate('problemId', 'title difficulty');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;