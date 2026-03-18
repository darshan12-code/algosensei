const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId:   { type: mongoose.Schema.Types.ObjectId, ref: 'DSAProblem' },
  messages:    [{ role: String, content: String }],
  mode:        { type: String, enum: ['hint', 'reveal', 'explain', 'mock'] },
  startedAt:   { type: Date, default: Date.now },
  completedAt: Date,
  solved:      { type: Boolean, default: false }
});

module.exports = mongoose.model('Session', SessionSchema);