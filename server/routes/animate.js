// server/routes/animate.js
// Fix #8: uses shared groqJSON() helper — no more copy-pasted GROQ_URL/MODEL/headers.

import express from 'express';
import verifyToken from '../middleware/auth.js';
import rateLimit from '../lib/rateLimiter.js';
import handleAxiosError from '../lib/handleAxiosError.js';
import { requireFields, validateStringLength } from '../lib/validate.js';
import { groqJSON } from '../lib/groq.js';
// import authMiddleware from '../middleware/auth.js';
const router = express.Router();

const ANIM_SYSTEM = 'You are a DSA animation engine. Respond with valid JSON only.';

const animPrompt = (input) => `You are a DSA animation engine. Analyze: "${input}"
Return ONLY valid JSON (no markdown):
{
  "title": "algorithm name",
  "vizType": "array",
  "timeComplexity": "O(?)",
  "spaceComplexity": "O(?)",
  "steps": [
    { "arr": [2,7,11,15], "highlight": [0], "compare": [], "sorted": [], "pointers": {"L":0}, "mapState": {}, "explain": "step explanation" }
  ],
  "conceptExplain": "core insight in 2 sentences",
  "interviewTip": "what interviewers look for"
}
Rules: vizType is one of array/hashmap/slidingwindow/stack/bars/tree/linkedlist. Generate 8-15 steps.`;

router.post('/', verifyToken, rateLimit, async (req, res) => {
  const { input } = req.body;

  const fieldErr = requireFields(['input'], req.body);
  if (fieldErr) return res.status(400).json({ error: fieldErr });

  const lenErr = validateStringLength(input, 'input', 2000);
  if (lenErr) return res.status(400).json({ error: lenErr });

  try {
    const data = await groqJSON(
      [
        { role: 'system', content: ANIM_SYSTEM },
        { role: 'user',   content: animPrompt(input) },
      ],
      { max_tokens: 2000 },
    );

    if (!Array.isArray(data.steps) || data.steps.length === 0) {
      throw new Error('AI returned invalid steps array');
    }

    res.json(data);
  } catch (err) {
    if (err.response) return handleAxiosError(err, res);
    res.status(500).json({ error: err.message });
  }
});
router.post('/explain', verifyToken, rateLimit, async (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: 'Input required' });

  try {
    const parsed = await groqJSON(
      [{
        role: 'user',
        content: `You are an expert DSA teacher. A student submitted: "${input}"

This is complex and cannot be animated simply. Provide a clear explanation as JSON with EXACTLY this structure:
{
  "concept": "2-3 sentence plain-English summary of the core idea",
  "steps": ["Step 1 description", "Step 2 description", "...up to 8 steps"],
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "interviewTip": "One key insight to mention in an interview"
}

Return ONLY valid JSON, no markdown, no explanation outside the JSON.`
      }],
      { max_tokens: 800 },
    );
    res.json(parsed);
  } catch (err) {
    if (err.response) return handleAxiosError(err, res);
    res.status(500).json({ error: err.message });
  }
});

export default router;