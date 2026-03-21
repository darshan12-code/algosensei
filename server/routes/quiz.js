// server/routes/quiz.js
// Fix #8: uses shared groqJSON() helper.

import express from 'express';
import verifyToken from '../middleware/auth.js';
import rateLimit from '../lib/rateLimiter.js';
import QuizResult from '../models/QuizResult.js';
import WeakTopic from '../models/WeakTopic.js';
import handleAxiosError from '../lib/handleAxiosError.js';
import { requireFields } from '../lib/validate.js';
import { groqJSON } from '../lib/groq.js';

const router = express.Router();

const QUIZ_SYSTEM = 'You are a technical interview quiz generator. Always respond with valid JSON only.';

const quizPrompt = (topic, type) =>
  `Generate exactly 5 multiple choice quiz questions about: "${topic}" (type: ${type} interview prep).
Return ONLY valid JSON:
{
  "topic": "${topic}",
  "questions": [
    {
      "question": "the question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correct": 0,
      "explanation": "2-3 sentence explanation"
    }
  ]
}
Rules: 5 questions, 4 options each, correct is 0-based index, interview-level difficulty, mix of types.`;

router.post('/generate', verifyToken, rateLimit, async (req, res) => {
  const { topic, type = 'dsa' } = req.body;

  const err = requireFields(['topic'], req.body);
  if (err) return res.status(400).json({ error: err });

  try {
    const data = await groqJSON(
      [
        { role: 'system', content: QUIZ_SYSTEM },
        { role: 'user',   content: quizPrompt(topic, type) },
      ],
      { max_tokens: 2000 },
    );

    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error('Invalid quiz structure returned');
    }

    // Normalise correct index — model sometimes returns a string
    data.questions = data.questions.map(q => ({
      ...q,
      correct: typeof q.correct === 'string' ? (parseInt(q.correct) || 0) : q.correct,
    }));

    res.json(data);
  } catch (err) {
    if (err.response) return handleAxiosError(err, res);
    res.status(500).json({ error: err.message });
  }
});

router.post('/complete', verifyToken, async (req, res) => {
  try {
    const { topic, type = 'dsa', score, questions, answers } = req.body;

    const valErr = requireFields(['topic', 'score', 'questions'], req.body);
    if (valErr) return res.status(400).json({ error: valErr });

    const result = await QuizResult.create({
      userId: req.user._id,
      topic, type, score, questions,
      answeredAt: new Date(),
    });

    if (Array.isArray(answers) && answers.length > 0) {
      const bulkOps = answers.map(a => ({
        updateOne: {
          filter: { userId: req.user._id, topic, type },
          update: {
            $inc: { attemptCount: 1, ...(a.correct ? {} : { failCount: 1 }) },
            $set: { lastAttempted: new Date() },
          },
          upsert: true,
        },
      }));
      await WeakTopic.bulkWrite(bulkOps);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;