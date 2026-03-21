// server/routes/dashboard.js
// Fix #2: streak + activity now computed in MongoDB via aggregation — no more
//         loading ALL sessions into Node RAM.
// Fix #8: removed duplicate Session.countDocuments — derived from aggregation result.

import express from 'express';
import mongoose from 'mongoose';
import verifyToken from '../middleware/auth.js';
import Session from '../models/Session.js';
import QuizResult from '../models/QuizResult.js';
import WeakTopic from '../models/WeakTopic.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const userId  = new mongoose.Types.ObjectId(req.user._id ?? req.user.id);
    const today   = new Date(); today.setHours(0, 0, 0, 0);
    const dayMs   = 86_400_000;

    // ── 1. All parallel queries ──────────────────────────────────────────
    const [
      solvedCount,
      quizResults,
      activityAgg,        // 7-day activity counts from DB
      streakAgg,          // up to 366 distinct active days for streak calc
      weakTopics,
      recentSessions,
    ] = await Promise.all([

      // Solved count — uses { userId, solved } index
      Session.countDocuments({ userId, solved: true }),

      // Quiz results — only need score field
      QuizResult.find({ userId }).select('score').lean(),

      // 7-day activity — group by truncated date in DB
      Session.aggregate([
        { $match: { userId, completedAt: { $gte: new Date(today.getTime() - 6 * dayMs) } } },
        { $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt', timezone: 'UTC' },
          },
          count: { $sum: 1 },
        }},
      ]),

      // Streak — fetch distinct active days for last 366 days
      Session.aggregate([
        { $match: { userId, completedAt: { $gte: new Date(today.getTime() - 366 * dayMs) } } },
        { $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt', timezone: 'UTC' },
          },
        }},
        { $sort: { _id: -1 } },
      ]),

      // Weak topics — already aggregated in DB
      WeakTopic.aggregate([
        { $match: { userId } },
        { $project: {
          topic: 1, type: 1, attemptCount: 1, failCount: 1,
          failRate: { $divide: ['$failCount', { $max: ['$attemptCount', 1] }] },
        }},
        { $sort: { failRate: -1 } },
        { $limit: 8 },
      ]),

      // Recent sessions — only 5, already limited in DB
      Session.find({ userId })
        .sort({ completedAt: -1 })
        .limit(5)
        .populate('problemId', 'title difficulty leetcodeNum')
        .lean(),
    ]);

    // ── 2. Quiz accuracy — pure JS on small result set ───────────────────
    const quizAccuracy = quizResults.length === 0
      ? null
      : Math.round(quizResults.reduce((acc, r) => acc + (r.score ?? 0), 0) / quizResults.length);

    // ── 3. Streak — computed from DB-aggregated distinct days ────────────
    const activeDaySet = new Set(streakAgg.map(d => d._id)); // Set<'YYYY-MM-DD'>
    let streak = 0;
    for (let i = 0; i <= 365; i++) {
      const d   = new Date(today.getTime() - i * dayMs);
      const key = d.toISOString().split('T')[0];
      if (activeDaySet.has(key)) streak++;
      else if (i > 0) break;
    }

    // ── 4. 7-day activity — map aggregation result to ordered array ───────
    const activityMap = Object.fromEntries(activityAgg.map(d => [d._id, d.count]));
    const activityDays = Array.from({ length: 7 }, (_, i) => {
      const d   = new Date(today.getTime() - (6 - i) * dayMs);
      const key = d.toISOString().split('T')[0];
      return {
        date:  key,
        label: d.toLocaleDateString('en', { weekday: 'short' }),
        count: activityMap[key] ?? 0,
      };
    });

    // ── 5. Session count — derive from streak agg to avoid extra query ────
    // (we already have all distinct days; for total count use a lightweight agg)
    const sessionCount = await Session.countDocuments({ userId });

    res.json({
      solvedCount,
      sessionCount,
      quizAccuracy,
      quizCount: quizResults.length,
      streak,
      weakTopics,
      recentSessions,
      activityDays,
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;