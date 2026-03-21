// server/models/Session.js
// Fix #14: Added compound index on { userId, completedAt }.
// Every Session.find({ userId }) + sort({ completedAt: -1 }) now uses the index
// instead of a full collection scan.

import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId:   { type: mongoose.Schema.Types.ObjectId, ref: 'DSAProblem' },
  messages:    [{ role: String, content: String }],
  mode:        {
    type: String,
    enum: ['dsa_hint', 'dsa_reveal', 'tech_explain', 'mock_dsa', 'mock_tech', 'mock_behavioral'],
  },
  startedAt:   { type: Date, default: Date.now },
  completedAt: { type: Date, default: Date.now },
  solved:      { type: Boolean, default: false },
});

// Compound index: covers find({ userId }) + sort({ completedAt: -1 })
SessionSchema.index({ userId: 1, completedAt: -1 });
// Secondary index: covers find({ userId, solved: true }) for solved count
SessionSchema.index({ userId: 1, solved: 1 });

export default mongoose.model('Session', SessionSchema);