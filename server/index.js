require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
require('./lib/passport');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
connectDB();

app.use('/api/test',      require('./routes/test'));
app.use('/auth',          require('./routes/auth'));
app.use('/api/problems',  require('./routes/problems'));
app.use('/api/tech',      require('./routes/tech'));
app.use('/api/chat',      require('./routes/chat'));
app.use('/api/sessions',  require('./routes/sessions'));
app.use('/api/animate',   require('./routes/animate'));
app.use('/api/quiz',      require('./routes/quiz'));       // ← NEW
app.use('/api/tracker',   require('./routes/tracker'));   // ← NEW
app.use('/api/dashboard', require('./routes/dashboard')); // ← NEW
// 404 — route not found
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Global error handler — catches anything routes miss
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Something went wrong', details: err.message });
});
app.get('/', (req, res) => res.json({ message: 'AlgoSensei API running 🚀' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));