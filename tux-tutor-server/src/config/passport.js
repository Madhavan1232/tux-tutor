const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('../../db');
const { recordSignupSuccess, logger } = require('../utils/logger');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'dummy_github_client_id';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'dummy_github_client_secret';
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy_google_client_id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'dummy_google_client_secret';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const githubId = String(profile.id);

        // Extract primary or public email
        let email = null;
        if (profile.emails && profile.emails.length > 0) {
          email = profile.emails[0].value;
        } else if (profile._json && profile._json.email) {
          email = profile._json.email;
        }

        // Fallback email if GitHub account hides email
        if (!email) {
          email = `${profile.username || githubId}@users.noreply.github.com`;
        }
        const normalizedEmail = email.trim().toLowerCase();

        // 1. Check if user exists by githubId or email
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { githubId },
              { email: normalizedEmail },
            ],
          },
        });

        if (user) {
          // Link githubId if user previously registered with email/password
          if (!user.githubId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { githubId },
            });
          }
          return done(null, { user, isNew: false });
        }

        // 2. Create new user account automatically using GitHub profile data
        const rawUsername = (profile.username || normalizedEmail.split('@')[0] || `tux_${githubId}`).replace(/[^a-zA-Z0-9_]/g, '_');
        let username = rawUsername;
        let suffix = 1;
        while (await prisma.user.findUnique({ where: { username } })) {
          username = `${rawUsername}_${suffix}`;
          suffix += 1;
        }

        user = await prisma.user.create({
          data: {
            username,
            email: normalizedEmail,
            githubId,
            password: null,
            xp: 0,
            level: 1,
            streak: 0,
          },
        });

        recordSignupSuccess({
          email: user.email,
          username: user.username,
          ipAddress: 'github-oauth',
        });

        return done(null, { user, isNew: true });
      } catch (err) {
        logger.error('Error during GitHub OAuth strategy execution', { error: err.message });
        return done(err, null);
      }
    }
  )
);

// Register Google OAuth Strategy
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'dummy_google_client_id') {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = String(profile.id);

          let email = null;
          if (profile.emails && profile.emails.length > 0) {
            email = profile.emails[0].value;
          }
          if (!email) {
            return done(new Error('No email found in Google account profile'), null);
          }
          const normalizedEmail = email.trim().toLowerCase();

          // 1. Check if user exists by googleId or email
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { googleId },
                { email: normalizedEmail },
              ],
            },
          });

          if (user) {
            // Link googleId if not linked yet
            if (!user.googleId) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId },
              });
            }
            return done(null, { user, isNew: false });
          }

          // 2. Create new user account automatically using Google profile data
          const rawUsername = (profile.displayName || normalizedEmail.split('@')[0] || `google_${googleId}`)
            .toLowerCase()
            .replace(/[^a-zA-Z0-9_]/g, '_');
          let username = rawUsername;
          let suffix = 1;
          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${rawUsername}_${suffix}`;
            suffix += 1;
          }

          user = await prisma.user.create({
            data: {
              username,
              email: normalizedEmail,
              googleId,
              password: null,
              xp: 0,
              level: 1,
              streak: 0,
            },
          });

          recordSignupSuccess({
            email: user.email,
            username: user.username,
            ipAddress: 'google-oauth',
          });

          return done(null, { user, isNew: true });
        } catch (err) {
          logger.error('Error during Google OAuth strategy execution', { error: err.message });
          return done(err, null);
        }
      }
    )
  );
}

// Passport session serialization (even if using stateless JWT, passport requires these methods defined)
passport.serializeUser((userWrapper, done) => {
  done(null, userWrapper);
});

passport.deserializeUser((userWrapper, done) => {
  done(null, userWrapper);
});

module.exports = passport;
