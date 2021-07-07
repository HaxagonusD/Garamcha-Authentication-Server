const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const uri =
  "mongodb+srv://julian:thesky@cluster0.bjsvk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const session = require("express-session");
const User = require("./User");

passport.use(
  "local-login",
  new LocalStrategy(
    {
      // by default, local strategy uses username and password, we will override with email
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true, // allows us to pass back the entire request to the callback
    },
    function (req, email, password, done) {
      User.findOne({ email: email }, function (err, user) {
        // if there are any errors, return the error before anything else
        if (err) return done(err);

        // if no user is found, return the message
        if (!user) return done(null, false);

        // if the user is found but the password is wrong
        if (!user.validPassword(password)) return done(null, false); // create the loginMessage and save it to session as flashdata

        // all is well, return successful user
        return done(null, user);
      });
    }
  )
);

passport.use(
  "local-signup",
  new LocalStrategy(
    {
      // by default, local strategy uses username and password, we will override with email
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true, // allows us to pass back the entire request to the callback
    },
    function (req, email, password, done) {
      User.findOne({ email: email }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, false);
        } else {
          // if there is no user with that email
          // create the user
          let newUser = new User({
            email: email,
            password: password,
          });
          // save the user
          newUser.save(function (err) {
            if (err) throw err;
            return done(null, newUser);
          });
        }
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.email);
});

passport.deserializeUser(function (username, done) {
  User.findOne({ username: username }, function (err, user) {
    done(err, user);
  });
});

app.use(
  session({ secret: "keyboard cat", resave: false, saveUninitialized: true })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/login", passport.authenticate("local-login"), function (req, res) {
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.
  res.json(req.email);
});

app.post("/signup", passport.authenticate("local-signup"), function (req, res) {
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.

  res.json(email);
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
