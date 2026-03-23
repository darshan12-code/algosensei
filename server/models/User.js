import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  googleId:  { type: String, required: true, unique: true },
  email:     { type: String, required: true },
  name:      { type: String, required: true },
  image:     String,
  createdAt: { type: Date, default: Date.now },
  isDemo: { type: Boolean, default: false }
});

export default mongoose.model('User', UserSchema);