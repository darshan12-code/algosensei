import mongoose from 'mongoose';

const TechQuestionSchema = new mongoose.Schema({
  category:    { type: String, required: true },
  subcategory: String,
  question:    { type: String, required: true },
  answer:      String,
  difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  tags:        [String],
  isCustom:   { type: Boolean, default: false },
});

export default mongoose.model('TechQuestion', TechQuestionSchema);