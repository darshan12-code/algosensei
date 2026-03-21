import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

if (!process.env.GOOGLE_CLIENT_ID) throw new Error('GOOGLE_CLIENT_ID missing from .env');
if (!process.env.GOOGLE_CLIENT_SECRET) throw new Error('GOOGLE_CLIENT_SECRET missing from .env');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  `${SERVER_URL}/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await User.findOneAndUpdate(
      { googleId: profile.id },
      {
        googleId: profile.id,
        email:    profile.emails[0].value,
        name:     profile.displayName,
        image:    profile.photos[0]?.value,
      },
      { upsert: true, new: true }
    );
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

export default passport;