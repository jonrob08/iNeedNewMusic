require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const isLoggedIn = require('./middleware/isLoggedIn');

// Middleware config file for passport
const passport = require('./config/ppConfig');

const SECRET_SESSION = process.env.SECRET_SESSION;
console.log('ayooo...>>>>', SECRET_SESSION);

app.set('view engine', 'ejs');

// See Routes
app.use(require('morgan')('dev'));
//Take in form data
app.use(express.urlencoded({ extended: false }));
//See anything in public folder ie. CSS
app.use(express.static(__dirname + '/public'));
//ejs is available
app.use(layouts);

app.use(session({
  secret: SECRET_SESSION,    // What we actually will be giving the user on our site as a session cookie
  resave: false,             // Save the session even if it's modified, make this false
  saveUninitialized: true    // If we have a new session, we save it, therefore making that true
}));

// flash middleware
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log('res locals  >>>>>', res.locals);
  res.locals.alerts = req.flash();
  // Get access to current use on any part of the app
  res.locals.currentUser = req.user;
  // Do whatever the next thing is
  next();
});

app.get('/', (req, res) => {
  res.render('index');
})

// access to all of our auth routes
app.use('/auth', require('./controllers/auth'));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;
