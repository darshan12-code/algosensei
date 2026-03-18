const mongoose = require('mongoose');

const QuizResultSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic:       String,
  score:       Number,
  questions:   [{ question: String, userAnswer: String, correct: Boolean }],
  answeredAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', QuizResultSchema);