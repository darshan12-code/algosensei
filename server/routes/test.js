// server/routes/test.js
// Fix #7: The old route hit Groq with zero auth — anyone could use your API key for free.
// Replaced with a simple authenticated ping that proves the server + DB are up.

import express from 'express';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// Authenticated health check — safe to keep, useful for debugging
router.get('/ping', verifyToken, (req, res) => {
  res.json({ ok: true, user: req.user.email, ts: new Date().toISOString() });
});

export default router;