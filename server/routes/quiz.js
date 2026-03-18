const express = require('express');
const axios = require('axios');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const QuizResult = require('../models/QuizResult');
const handleAxiosError = require('../lib/handleAxiosError');

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const QUIZ_PROMPT = (topic, type) => `Generate exactly 5 multiple choice quiz questions about: "${topic}" (type: ${type} interview prep).

Return ONLY valid JSON with this exact structure:
{
  "topic": "${topic}",
  "questions": [
    {
      "question": "What is the time complexity of HashMap lookup?",
      "options": ["O(1) average", "O(n)", "O(log n)", "O(n²)"],
      "correct": 0,
      "explanation": "Hash maps provide O(1) average-case lookup because the hash function maps directly to a bucket index. Worst case is O(n) due to collisions but rare with a good hash function."
    }
  ]
}

Rules:
- Exactly 5 questions
- Each question has exactly 4 options (strings, not "A)" prefixed)
- correct is the 0-based index of the correct option (0, 1, 2, or 3)
- explanation is 2-3 sentences explaining why the correct answer is right
- Questions must be genuinely challenging, interview-level difficulty
- No duplicate questions`;

// POST /api/quiz/generate
router.post('/generate', verifyToken, async (req, res) => {
  const { topic, type = 'dsa' } = req.body;
  if (!topic) return res.status(400).json({ error: 'topic is required' });

  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a technical interview quiz generator. Always respond with valid JSON only. No markdown, no backticks, no explanation outside the JSON.'
          },
          { role: 'user', content: QUIZ_PROMPT(topic, type) }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 2000,
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_KEY}` } }
    );

    const raw = response.data.choices[0].message.content;
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleaned);

    // Validate structure
    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error('Invalid quiz structure returned');
    }

    // Ensure correct is always a number index
    data.questions = data.questions.map(q => ({
      ...q,
      correct: typeof q.correct === 'string'
        ? parseInt(q.correct) || 0
        : q.correct
    }));

    res.json(data);
  } catch (err) {
     if (err.response) return handleAxiosError(err, res);
        res.status(500).json({ error: err.message });
    // console.error('Quiz generate error:', err.response?.data || err.message);
    // res.status(500).json({ error: 'Quiz generation failed', details: err.message });
  }
});

// POST /api/quiz/result — save completed quiz
router.post('/result', verifyToken, async (req, res) => {
  try {
    const { topic, score, questions } = req.body;
    const result = await QuizResult.create({
      userId:    req.user._id,
      topic,
      score,
      questions,
      answeredAt: new Date(),
    });
    res.json(result);
  } catch (err) {
     if (err.response) return handleAxiosError(err, res);
        res.status(500).json({ error: err.message });
  }
});

module.exports = router;