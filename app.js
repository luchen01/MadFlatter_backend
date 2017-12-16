var express = require('express');
var Sequelize = require('sequelize')
var session = require('express-session');
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var db = require('./models');
var User = require('./models').User;
var sequelize = require('./models').sequelize;
var routes = require('./routes/routes');
var auth = require('./routes/auth');
var app = express();
// var io = require('socket.io')(server);

// view engine setup
var hbs = require('express-handlebars')({
  defaultLayout: 'main',
  extname: '.hbs'
});
app.engine('hbs', hbs);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('tiny'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SECRET,
  cookie: {
    secure: true
  },
  store: new SequelizeStore({
    db: sequelize
  }),
  resave: true,
  saveUninitialized: false,// we support the touch method so per the express-session docs this should be set to false
  // proxy: true // if you do SSL outside of node.
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  console.log('in serializeUser, user is :', user.id);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log('in deserializeUser, id is ', id);
  User.findById(id)
    .then((user)=>{
      console.log('found user by id', user);
      done(null, user);
    })
    .catch((err)=>{
      console.log('error in findby id', err);
      done(err, null)
    });
});

// Passport

// passport strategy
passport.use(new LocalStrategy(function(username, password, done) {
  console.log('passport local strategy username and password', username, password);
  // Find the user with the given username
  User.findOne({
    where: {username: username}})
    .then(user=>{
      if(user.password === password){
        console.log('passwords match, user is', user);
        return done(null, user);
      }else{
        console.log('user passwords dont match');
        return done(null, false);
      }
    })
    .catch(err=> {
      console.log('error findone user', err)
      return done(err)
    });
}
));

// passport.use(new FacebookStrategy({
//     clientID: process.env.FACEBOOK_APP_ID,
//     clientSecret: process.env.FACEBOOK_APP_SECRET,
//     callbackURL: "http://localhost:3000/auth/facebook/callback",
//     profileFields: ['id','first_name', 'last_name','gender', 'email','birthday', 'hometown', 'education']
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     User.create({facebookId: profile.id,
//         facebookToken: accessToken,
//         firstname: profile.name.givenName,
//         lastname: profile.name.familyName,
//         username: profile.username,
//         gender: profile.gender,
//         profileUrl: profile.profileUrl,
//         groupId: 1
//         // email: profile.email,
//         // birthday: profile.birthday
//       })
//       .then(user=>cb(null, user))
//     .catch(err=>cb(err, null));
//   }
// ));
//
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/auth/google/callback"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     User.create({googleId: profile.id,
//         googleToken: accessToken,
//         firstname: profile.name.givenName,
//         lastname: profile.name.familyName,
//         username: profile.username,
//         gender: profile.gender,
//         profileUrl: profile.photos[0].value,
//         groupId: 1,
//         // email: profile.email,
//         // birthday: profile.birthday
//       })
//       .then(user=>cb(null, user))
//     .catch(err=>cb(err, null));
//   }
// ));

// io.on('connection', function(socket){
// });


app.use('/', auth(passport));
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

db.sequelize.sync({force: true}).then(function(){
  var port = process.env.PORT || 3000;
  app.listen(port);
  console.log('Express started. Listening on port %s', port);
})


module.exports = app;
