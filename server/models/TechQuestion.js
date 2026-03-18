const mongoose = require('mongoose');

const TechQuestionSchema = new mongoose.Schema({
  category:    { type: String, required: true },  // JavaScript, System Design, etc.
  subcategory: String,
  question:    { type: String, required: true },
  answer:      String,
  difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  tags:        [String],
  isCustom:    { type: Boolean, default: false }
});

module.exports = mongoose.model('TechQuestion', TechQuestionSchema);