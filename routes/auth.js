var express = require('express');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var path = require('path');
var config = require(path.join(global.__basedir, 'config.json'));

var router = express.Router();

router.use(passport.initialize());
router.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: config.keys.GOOGLE_CLIENT_ID,
    clientSecret: config.keys.GOOGLE_CONSUMER_SECRET,
    callbackURL: config.callbackurl,
}, (accessToken, refreshToken, profile, cb) => {
    cb (null, profile);
}));

passport.serializeUser((user, cb) => {
    cb(null, { id: user.id,
               displayName: user.displayName,
               emails: user.emails.map(x => x.value),
               profile: user
    });
});

passport.deserializeUser((obj, cb) => {
    cb(null, obj);
});

router.get(
    '/google',

    (req, res, next) => {
        if (req.query.return)
            req.session.oauth2return = req.query.return;
        next();
    },

    passport.authenticate('google', { scope: ['email', 'profile'] })
);

router.get(
    // OAuth 2 callback url.
    '/google/callback',

    // Finish OAuth 2 flow using Passport.js
    passport.authenticate('google', { session: true}),

    // Redirect back to the original page, if any
    (req, res) => {
        const redirect = req.session.oauth2return || '/';
        console.log(`redirecting to ${redirect}`);
        delete req.session.oauth2return;
        res.redirect(redirect);
    }
);

router.get(
    '/logout',

    (req, res) => {
        req.logout();
        res.redirect('/');
    }
);

module.exports = router;
