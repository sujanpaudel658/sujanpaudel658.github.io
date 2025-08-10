const passport = require('passport');
const SignupModel = require('../models/signup');

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await SignupModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Export passport with session support
module.exports = passport;
