// server/models/QuizResult.js
// Fix #14: Added index on userId — every QuizResult.find({ userId }) now
// uses an index instead of a full collection scan.

import mongoose from 'mongoose';

const QuizResultSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic:      String,
  type:       { type: String, enum: ['dsa', 'tech'], default: 'dsa' },
  score:      Number,
  questions:  [{ question: String, userAnswer: String, correct: Boolean }],
  answeredAt: { type: Date, default: Date.now },
});

// Index covers QuizResult.find({ userId }) used by dashboard
QuizResultSchema.index({ userId: 1, answeredAt: -1 });

export default mongoose.model('QuizResult', QuizResultSchema);