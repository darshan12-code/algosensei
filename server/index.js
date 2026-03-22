import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './db.js';
import './lib/passport.js';

import testRouter      from './routes/test.js';
import authRouter      from './routes/auth.js';
import problemsRouter  from './routes/problems.js';
import techRouter      from './routes/tech.js';
import chatRouter      from './routes/chat.js';
import sessionsRouter  from './routes/sessions.js';
import animateRouter   from './routes/animate.js';
import quizRouter      from './routes/quiz.js';
import trackerRouter   from './routes/tracker.js';
import dashboardRouter from './routes/dashboard.js';

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));

connectDB();

app.use('/api/test',      testRouter);
app.use('/auth',          authRouter);
app.use('/api/problems',  problemsRouter);
app.use('/api/tech',      techRouter);
app.use('/api/chat',      chatRouter);
app.use('/api/sessions',  sessionsRouter);
app.use('/api/animate',   animateRouter);
app.use('/api/quiz',      quizRouter);
app.use('/api/tracker',   trackerRouter);
app.use('/api/dashboard', dashboardRouter);

app.get('/', (_req, res) => res.json({ message: 'AlgoSensei API v3 🚀' }));

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Something went wrong', details: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));