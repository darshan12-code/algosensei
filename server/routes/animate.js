const express = require('express');
const axios = require('axios');
const router = express.Router();
const verifyToken = require('../middleware/auth');

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const ANIM_PROMPT = (input) => `You are a DSA animation engine. Analyze this problem or algorithm:
"${input}"

Return ONLY valid JSON (no markdown, no backticks, no explanation):
{
  "title": "algorithm or problem name",
  "vizType": "array",
  "timeComplexity": "O(?)",
  "spaceComplexity": "O(?)",
  "steps": [
    {
      "arr": [2, 7, 11, 15],
      "highlight": [0],
      "compare": [0, 1],
      "sorted": [],
      "pointers": { "L": 0, "R": 3 },
      "mapState": {},
      "explain": "plain English explanation of this step"
    }
  ],
  "conceptExplain": "core insight in 2 sentences",
  "interviewTip": "what interviewers specifically look for"
}

Rules:
- vizType must be one of: array, hashmap, slidingwindow, stack
- arr must always be an array of numbers or single characters
- highlight = indices being examined (amber)
- compare = indices being compared (blue)
- sorted = finalized indices (green)
- pointers = named pointer positions as { name: index }
- mapState = current hashmap contents as { key: value } — use {} if not applicable
- Generate 8-15 steps that clearly show the algorithm executing
- explain must be a plain English sentence describing exactly what is happening in this step`;

// POST /api/animate
router.post('/', verifyToken, async (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: 'input is required' });

  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a DSA animation engine. Always respond with valid JSON only. No markdown fences, no preamble, no explanation outside the JSON.'
          },
          { role: 'user', content: ANIM_PROMPT(input) }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 2000,
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_KEY}` } }
    );

    const raw = response.data.choices[0].message.content;

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleaned);

    // Validate required fields
    if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
      throw new Error('AI returned invalid steps array');
    }

    res.json(data);

  } catch (err) {
    // console.error('Animate error:', err.response?.data || err.message);
     if (err.response) return handleAxiosError(err, res);
        res.status(500).json({ error: err.message });
  }
});

module.exports = router;