const mongoose = require('mongoose');

const WeakTopicSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic:        String,
  type:         { type: String, enum: ['dsa', 'tech'] },
  attemptCount: { type: Number, default: 0 },
  failCount:    { type: Number, default: 0 },
  lastAttempted: Date
});

module.exports = mongoose.model('WeakTopic', WeakTopicSchema);