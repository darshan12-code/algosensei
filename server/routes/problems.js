import express from 'express';
import DSAProblem from '../models/DSAProblem.js';
import Session from '../models/Session.js';
import verifyToken from '../middleware/auth.js';
import cache from '../lib/cache.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { topic, difficulty, company, search, page = 1, limit = 50 } = req.query;
    const q = {};
    if (topic)      q.topics     = { $in: [topic] };
    if (difficulty) q.difficulty = difficulty;
    if (company)    q.companies  = { $in: [company] };
    if (search)     q.title      = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [problems, total] = await Promise.all([
      DSAProblem.find(q).sort({ leetcodeNum: 1 }).skip(skip).limit(parseInt(limit)),
      DSAProblem.countDocuments(q),
    ]);
    res.json({ problems, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/meta', async (req, res) => {
  try {
    const cached = cache.get('problems_meta');
    if (cached) return res.json(cached);
    const [topics, companies] = await Promise.all([
      DSAProblem.distinct('topics'),
      DSAProblem.distinct('companies'),
    ]);
    const data = { topics: topics.sort(), companies: companies.sort() };
    cache.set('problems_meta', data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/solved', verifyToken, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id, solved: true }).select('problemId');
    const solvedIds = [...new Set(sessions.map(s => s.problemId?.toString()).filter(Boolean))];
    res.json(solvedIds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const problem = await DSAProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;