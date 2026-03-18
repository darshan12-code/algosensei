const express = require('express');
const axios = require('axios');
const router = express.Router();

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const groqPost = (messages, max_tokens = 500) =>
  axios.post(
    GROQ_URL,
    { model: GROQ_MODEL, messages, max_tokens },
    { headers: { Authorization: `Bearer ${process.env.GROQ_KEY}` } }
  );

// ─── BASIC TEST ─────────────────────────────────────────────
router.get('/groq', async (req, res) => {
  try {
    const response = await groqPost([
      { role: 'system', content: 'You are a concise DSA tutor.' },
      { role: 'user', content: 'Explain the Two Sum problem in 3 sentences.' }
    ]);
    const text = response.data.choices[0].message.content;
    console.log('\n⚡ Groq Token Usage:', response.data.usage);
    res.json({ answer: text, usage: response.data.usage });
  } catch (err) {
    console.error('Groq error:', err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── JSON STRUCTURED TEST (replaces what Gemini would do) ───
router.get('/groq-json', async (req, res) => {
  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a DSA tutor. Always respond with valid JSON only. No markdown, no explanation outside the JSON.'
          },
          {
            role: 'user',
            content: `Explain Two Sum. Return ONLY this JSON shape:
{
  "quickAnswer": "2-3 sentence answer",
  "timeComplexity": "O(?)",
  "spaceComplexity": "O(?)",
  "keyInsight": "the core trick in one sentence"
}`
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 500
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_KEY}` } }
    );
    const parsed = JSON.parse(response.data.choices[0].message.content);
    res.json(parsed);
  } catch (err) {
    console.error('Groq JSON error:', err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;