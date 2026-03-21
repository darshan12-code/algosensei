import mongoose from 'mongoose';

const WeakTopicSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic:         String,
  type:          { type: String, enum: ['dsa', 'tech'] },
  attemptCount:  { type: Number, default: 0 },
  failCount:     { type: Number, default: 0 },
  lastAttempted: Date,
});

WeakTopicSchema.index({ userId: 1, topic: 1, type: 1 }, { unique: true });

export default mongoose.model('WeakTopic', WeakTopicSchema);