// scripts/seedDemo.js
import mongoose from 'mongoose';
import 'dotenv/config';
import dns from 'dns';
import User from '../models/User.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ MongoDB connected');

const demo = await User.findOneAndUpdate(
  { email: 'demo@algosensei.com' },
  {
    email:  'demo@algosensei.com',
    name:   'Demo User',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=algosensei',
    isDemo: true,
  },
  { upsert: true, new: true }
);

console.log('✅ Demo user seeded:', demo._id);
mongoose.disconnect();