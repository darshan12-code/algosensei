const mongoose = require('mongoose');

const DSAProblemSchema = new mongoose.Schema({
  leetcodeNum:  { type: Number, unique: true },
  title:        { type: String, required: true },
  difficulty:   { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  topics:       [String],
  companies:    [String],
  description:  String,
  examples:     [String],
  constraints:  [String],
  isCustom:     { type: Boolean, default: false }
});

module.exports = mongoose.model('DSAProblem', DSAProblemSchema);