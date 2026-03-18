const express = require('express');
const axios = require('axios');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const PROMPTS = require('../lib/prompts');
const DSAProblem = require('../models/DSAProblem');
const TechQuestion = require('../models/TechQuestion');

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// POST /api/chat/stream — main streaming endpoint
router.post('/stream', verifyToken, async (req, res) => {
  const { messages, mode, problemId, techQuestionId } = req.body;

  // Build system prompt based on mode + context
  let systemPrompt = '';
  try {
    if (mode === 'dsa_hint' || mode === 'dsa_reveal') {
      const problem = await DSAProblem.findById(problemId);
      if (!problem) return res.status(404).json({ error: 'Problem not found' });
      systemPrompt = PROMPTS[mode](problem);
    } else if (mode === 'tech_explain') {
      const question = await TechQuestion.findById(techQuestionId);
      if (!question) return res.status(404).json({ error: 'Question not found' });
      systemPrompt = PROMPTS.tech_explain(question);
    } else if (mode === 'mock_dsa' || mode === 'mock_tech' || mode === 'mock_behavioral') {
      const typeMap = {
        mock_dsa:       'DSA / coding',
        mock_tech:      'technical concepts',
        mock_behavioral:'behavioral'
      };
      systemPrompt = PROMPTS.mock_interview(typeMap[mode]);
    } else {
      return res.status(400).json({ error: `Unknown mode: ${mode}` });
    }
  } catch (err) {
     if (err.response) return handleAxiosError(err, res);
        res.status(500).json({ error: err.message });
  }

  // Set SSE headers — this is what makes it stream
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.flushHeaders(); // send headers immediately before the stream starts

  try {
    const groqRes = await axios.post(
      GROQ_URL,
      {
        model:      GROQ_MODEL,
        messages:   [{ role: 'system', content: systemPrompt }, ...messages],
        stream:     true,
        max_tokens: 1500,
      },
      {
        headers:      { Authorization: `Bearer ${process.env.GROQ_KEY}` },
        responseType: 'stream', // critical — don't buffer, get a stream back
      }
    );

    // Pipe Groq's stream directly to the client — no buffering
    groqRes.data.pipe(res);

    // Clean up when client disconnects
    req.on('close', () => {
      groqRes.data.destroy();
    });

  } catch (err) {
    console.error('Stream error:', err.response?.data || err.message);
    //  if (err.response) return handleAxiosError(err, res);
    //     res.status(500).json({ error: err.message });
    // Can't use res.status() after headers are sent — write an SSE error event
    res.write(`data: [ERROR] ${err.message}\n\n`);
    res.end();
  }
});

// GET /api/chat/context — fetch problem or tech question for the chat sidebar
router.get('/context', verifyToken, async (req, res) => {
  try {
    const { problemId, techQuestionId } = req.query;
    if (problemId) {
      const problem = await DSAProblem.findById(problemId);
      return res.json({ type: 'dsa', data: problem });
    }
    if (techQuestionId) {
      const question = await TechQuestion.findById(techQuestionId);
      return res.json({ type: 'tech', data: question });
    }
    // No context — mock interview mode
    res.json({ type: 'mock', data: null });
  } catch (err) {
    if (err.response) return handleAxiosError(err, res);
        res.status(500).json({ error: err.message });
  }
});

module.exports = router;