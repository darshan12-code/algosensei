const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId:    { type: String, required: true, unique: true },
  email:       { type: String, required: true },
  name:        { type: String, required: true },
  image:       String,
  streak:      { type: Number, default: 0 },
  totalSolved: { type: Number, default: 0 },
  xp:          { type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);