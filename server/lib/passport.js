const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  'http://localhost:5000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await User.findOneAndUpdate(
      { googleId: profile.id },
      {
        googleId: profile.id,
        email:    profile.emails[0].value,
        name:     profile.displayName,
        image:    profile.photos[0]?.value
      },
      { upsert: true, new: true }
    );
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

module.exports = passport;