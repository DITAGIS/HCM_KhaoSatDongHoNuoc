var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
const passport = require('passport');
const LocalStrategy = require('passport-local');
var index = require('./routes/index');
var database = require('./modules/Database');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(session({
  secret: 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
  resave: true,
  saveUninitialized: true,
}));

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//PASSPORT

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
  console.log('serializeUser');
  done(null, user);
})
passport.deserializeUser((user, done) => {
  console.log('deserializeUser');
  done(null, user);
})
passport.use(new LocalStrategy(
  function (username, password, done) {
    database.isUser(username, password)
      .then(function (user) {
        // bcrypt.compare(password, user.Password, function (err, result) {
        if (!user) {
          return done(null, false, {
            message: 'Incorrect username and password'
          });
        }
        return done(null, user);
        // })
      }).catch(function (err) {
        return done(err);
      })
  }
))
app.use('/', index);
app.post('/session', function (req, res) {
  if (req.isAuthenticated())
    res.status(200).send(req.session.passport.user);
  else
    res.status(400).send();
})
app.get('/login', (req, res) => {
  res.render('login', {
    title: 'Đăng nhập'
  });
});
app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true
}), function (req, res) {
  if (req.body.remember == "true") {
    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
  } else {
    req.session.cookie.expires = false; // Cookie expires at end of session
  }
  res.redirect('/')
})
app.get('/logout', (req, res) => {
  res.clearCookie('passport');
  req.session.destroy();
  res.redirect('/');
  res.end()
})
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;