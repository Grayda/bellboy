var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport, bellboy) {
  passport.use('login', new LocalStrategy({
      passReqToCallback: true
    },
    function(req, username, password, done) {
      if(bellboy.modules["bellauth"].CheckDetails(username, password)) {
        // bellboy.modules["bellweb"].emit("loggedin", username)
        return done(null, username);
      } else {
        // bellboy.modules["bellweb"].emit("failedlogin", username)
        return done(null, false);
      }
    }.bind(this)))
}.bind(this)
