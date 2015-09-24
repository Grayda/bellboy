var login = require('./login');

module.exports = function(passport, bellboy){

	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(id, done) {
        done(null, id);
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport, bellboy);

}
