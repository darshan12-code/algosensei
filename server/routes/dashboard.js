const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const verifyToken = require('../middleware/auth');
const Session = require('../models/Session');
const QuizResult = require('../models/QuizResult');
const WeakTopic = require('../models/WeakTopic');

// GET /api/dashboard — all stats in one request
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Problems solved (sessions where solved = true)
    const solvedCount = await Session.countDocuments({ userId, solved: true });

    // Total sessions
    const sessionCount = await Session.countDocuments({ userId });

    // Quiz accuracy
    const quizResults = await QuizResult.find({ userId });
    const quizAccuracy = quizResults.length === 0 ? null
      : Math.round(
          quizResults.reduce((acc, r) => acc + r.score, 0) / quizResults.length
        );

    // Streak — count consecutive days with at least one session
    const sessions = await Session.find({ userId })
      .sort({ completedAt: -1 })
      .select('completedAt');

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayMs = 86400000;

    const daySet = new Set(
      sessions.map(s => {
        const d = new Date(s.completedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );

    for (let i = 0; i <= 365; i++) {
      const day = new Date(today.getTime() - i * dayMs);
      if (daySet.has(day.getTime())) streak++;
      else if (i > 0) break; // streak broken
    }

    // Weak topics (top 6 worst)
    const weakTopics = await WeakTopic.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          topic: 1, type: 1, attemptCount: 1, failCount: 1,
          failRate: { $divide: ['$failCount', { $max: ['$attemptCount', 1] }] }
        }
      },
      { $sort: { failRate: -1 } },
      { $limit: 6 }
    ]);

    // Recent sessions (last 5)
    const recentSessions = await Session.find({ userId })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('problemId', 'title difficulty leetcodeNum');

    res.json({
      solvedCount,
      sessionCount,
      quizAccuracy,
      quizCount: quizResults.length,
      streak,
      weakTopics,
      recentSessions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;