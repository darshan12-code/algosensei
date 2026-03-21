// server/routes/tech.js
// Fix #8: uses shared groqJSON() helper.

import express from 'express';
import TechQuestion from '../models/TechQuestion.js';
import handleAxiosError from '../lib/handleAxiosError.js';
import verifyToken from '../middleware/auth.js';
import rateLimit from '../lib/rateLimiter.js';
import cache from '../lib/cache.js';
import { requireFields, validateStringLength } from '../lib/validate.js';
import { groqJSON } from '../lib/groq.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const q = {};
    if (category)   q.category   = category;
    if (difficulty) q.difficulty = difficulty;
    const questions = await TechQuestion.find(q).sort({ category: 1 }).lean();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const cached = cache.get('tech_categories');
    if (cached) return res.json(cached);

    const counts = await TechQuestion.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort:  { _id: 1 } },
    ]);
    cache.set('tech_categories', counts);
    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/explain', verifyToken, rateLimit, async (req, res) => {
  try {
    const { question, category } = req.body;

    const fieldErr = requireFields(['question'], req.body);
    if (fieldErr) return res.status(400).json({ error: fieldErr });

    const lenErr = validateStringLength(question, 'question', 1000);
    if (lenErr) return res.status(400).json({ error: lenErr });

    const prompt = `You are a senior engineer coaching an interview candidate.
Question: "${question}" (Category: ${category || 'General'})
Return ONLY valid JSON:
{
  "quickAnswer": "2-3 sentence answer in 30 seconds",
  "deepDive": "Full explanation with real code example (use markdown for code blocks)",
  "followUps": ["Follow-up 1?", "Follow-up 2?", "Follow-up 3?"],
  "avoidSaying": "2-3 common mistakes candidates make",
  "analogy": "One memorable real-world analogy"
}`;

    const parsed = await groqJSON(
      [
        { role: 'system', content: 'You are a senior engineer. Always respond with valid JSON only.' },
        { role: 'user',   content: prompt },
      ],
      { max_tokens: 1500 },
    );

    res.json(parsed);
  } catch (err) {
    if (err.response) return handleAxiosError(err, res);
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate', verifyToken, rateLimit, async (req, res) => {
  try {
    const { category } = req.body;

    const fieldErr = requireFields(['category'], req.body);
    if (fieldErr) return res.status(400).json({ error: fieldErr });

    const existing   = await TechQuestion.find({ category }).select('question').lean();
    const existingQs = existing.map(q => q.question).join('\n- ');

    const prompt = `Generate 1 NEW interview question for the "${category}" category.
Existing questions (DO NOT repeat):
- ${existingQs}
Return ONLY valid JSON:
{
  "question": "the interview question text",
  "difficulty": "Easy" | "Medium" | "Hard",
  "tags": ["tag1", "tag2"],
  "subcategory": "relevant subcategory"
}`;

    const parsed = await groqJSON(
      [
        { role: 'system', content: 'You are a technical interview question generator. Respond with valid JSON only.' },
        { role: 'user',   content: prompt },
      ],
      { max_tokens: 500 },
    );

    const newQ = await TechQuestion.create({ ...parsed, category, isCustom: true });
    cache.invalidate('tech_categories');
    res.json(newQ);
  } catch (err) {
    if (err.response) return handleAxiosError(err, res);
    res.status(500).json({ error: err.message });
  }
});

export default router;