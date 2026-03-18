const express = require('express');
const router = express.Router();
const axios = require('axios');
const TechQuestion = require('../models/TechQuestion');

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// GET /api/tech — filter by category and/or difficulty
router.get('/', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const q = {};
    if (category)   q.category   = category;
    if (difficulty) q.difficulty = difficulty;

    const questions = await TechQuestion.find(q).sort({ category: 1 });
    res.json(questions);
  } catch (err) {
     if (err.response) return handleAxiosError(err, res);
        res.status(500).json({ error: err.message });
  }
});

// GET /api/tech/categories — category list with counts (for sidebar)
router.get('/categories', async (req, res) => {
  try {
    const counts = await TechQuestion.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json(counts);
  } catch (err) {
     if (err.response) return handleAxiosError(err, res);
        res.status(500).json({ error: err.message });
  }
});

// POST /api/tech/explain — Groq JSON explanation
router.post('/explain', async (req, res) => {
  try {
    const { question, category } = req.body;
    if (!question) return res.status(400).json({ error: 'question is required' });

    const prompt = `You are a senior engineer coaching an interview candidate.
Question: "${question}" (Category: ${category})

Return ONLY valid JSON with exactly these fields:
{
  "quickAnswer": "2-3 sentence answer you can give in 30 seconds",
  "deepDive": "Full explanation with a real code example and trade-offs (use markdown for code blocks)",
  "followUps": ["Follow-up question 1?", "Follow-up question 2?", "Follow-up question 3?"],
  "avoidSaying": "2-3 common mistakes candidates make when answering this specific question",
  "analogy": "One memorable real-world analogy that makes this concept click"
}`;

    const response = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are a senior engineer. Always respond with valid JSON only. No markdown, no backticks, no explanation outside the JSON object.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1500
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_KEY}` } }
    );

    const parsed = JSON.parse(response.data.choices[0].message.content);
    res.json(parsed);
  } catch (err) {
     if (err.response) return handleAxiosError(err, res);
        res.status(500).json({ error: err.message });
    console.error('Explain error:', err.response?.data || err.message);
    // res.status(500).json({ error: err.message });
  }
});

module.exports = router;