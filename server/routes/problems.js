const express = require('express');
const router = express.Router();
const DSAProblem = require('../models/DSAProblem');
const verifyToken = require('../middleware/auth');

// GET /api/problems — dynamic filters
router.get('/', async (req, res) => {
  try {
    const { topic, difficulty, company, search } = req.query;

    // Only add filter fields that actually exist in the query
    const q = {};
    if (topic)      q.topics     = { $in: [topic] };
    if (difficulty) q.difficulty = difficulty;
    if (company)    q.companies  = { $in: [company] };
    if (search)     q.title      = { $regex: search, $options: 'i' };

    const problems = await DSAProblem.find(q).sort({ leetcodeNum: 1 });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/problems/meta — all unique topics + companies for filter dropdowns
router.get('/meta', async (req, res) => {
  try {
    const topics    = await DSAProblem.distinct('topics');
    const companies = await DSAProblem.distinct('companies');
    res.json({ topics: topics.sort(), companies: companies.sort() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/problems/:id — single problem detail
router.get('/:id', async (req, res) => {
  try {
    const problem = await DSAProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;