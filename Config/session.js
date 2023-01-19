const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const { login, findById } = require("../Services/DB/db");

passport.use(new localStrategy({
     usernameField: 'email',
     passwordField: 'password'
}, async (username, password, done) => {
     try {
          const user = await login(username, password)
          return done(null, user);
     } catch (err) {
          return done(null, false, { message: 'email or password is wrong!' });
     }
}))

passport.serializeUser((user, done) => {
     done(null, user.id);
})

passport.deserializeUser((id, done) => {
     try {
          const user = findById(id);
          done(null, user);
     }
     catch (err) {
          done(null, false);
     }
})