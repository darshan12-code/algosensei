// server/routes/chat.js
// Fix #8: uses shared groqJSON() helper for the stream call.

import express from 'express';
import verifyToken from '../middleware/auth.js';
import rateLimit from '../lib/rateLimiter.js';
import PROMPTS from '../lib/prompts.js';
import DSAProblem from '../models/DSAProblem.js';
import TechQuestion from '../models/TechQuestion.js';
import handleAxiosError from '../lib/handleAxiosError.js';
import { requireFields } from '../lib/validate.js';
import { groqJSON } from '../lib/groq.js';

const router = express.Router();

router.post('/stream', verifyToken, rateLimit, async (req, res) => {
  const { messages, mode, problemId, techQuestionId, problemData, techData } = req.body;

  const valErr = requireFields(['messages', 'mode'], req.body);
  if (valErr) return res.status(400).json({ error: valErr });

  // ── Build system prompt ────────────────────────────────────────────────
  let systemPrompt = '';
  try {
    if (mode === 'dsa_hint' || mode === 'dsa_reveal') {
      const problem = problemData || (problemId ? await DSAProblem.findById(problemId).lean() : null);
      if (!problem) return res.status(404).json({ error: 'Problem not found' });
      systemPrompt = PROMPTS[mode](problem);

    } else if (mode === 'tech_explain') {
      const question = techData || (techQuestionId ? await TechQuestion.findById(techQuestionId).lean() : null);
      if (!question) return res.status(404).json({ error: 'Question not found' });
      systemPrompt = PROMPTS.tech_explain(question);

    } else if (['mock_dsa', 'mock_tech', 'mock_behavioral'].includes(mode)) {
      const typeMap = {
        mock_dsa:        'DSA / coding',
        mock_tech:       'technical concepts',
        mock_behavioral: 'behavioral',
      };
      systemPrompt = PROMPTS.mock_interview(typeMap[mode]);

    } else if (mode === 'general') {
      // Fix #13: AIChatBot widget uses this mode for freeform questions
      systemPrompt = PROMPTS.general();

    } else {
      return res.status(400).json({ error: `Unknown mode: ${mode}` });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  // ── Stream response ────────────────────────────────────────────────────
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.flushHeaders();

  try {
    const groqRes = await groqJSON(
      [{ role: 'system', content: systemPrompt }, ...messages],
      { stream: true, max_tokens: 2000 },
    );

    groqRes.data.pipe(res);
    req.on('close', () => groqRes.data.destroy());
  } catch (err) {
    console.error('Stream error:', err.response?.data || err.message);
    if (err.response) return handleAxiosError(err, res);
    res.write(`data: [ERROR] ${err.message}\n\n`);
    res.end();
  }
});

router.get('/context', verifyToken, async (req, res) => {
  try {
    const { problemId, techQuestionId } = req.query;
    if (problemId) {
      const problem = await DSAProblem.findById(problemId).lean();
      return res.json({ type: 'dsa', data: problem });
    }
    if (techQuestionId) {
      const question = await TechQuestion.findById(techQuestionId).lean();
      return res.json({ type: 'tech', data: question });
    }
    res.json({ type: 'mock', data: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;