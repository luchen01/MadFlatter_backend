var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
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

// REQUIRED_ENV.forEach(function(el) {
//   if (!process.env[el]){
//     console.error("Missing required env var " + el);
//     process.exit(1);
//   }
// });


// const { Client } = require('pg');
//
// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: true,
// });
//
// client.connect();
//
// client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
//   if (err) throw err;
//   for (let row of res.rows) {
//     console.log(JSON.stringify(row));
//   }
//   client.end();
// });

var routes = require('./routes/routes');
var auth = require('./routes/auth');
var app = express();

// view engine setup
var hbs = require('express-handlebars')({
  defaultLayout: 'main',
  extname: '.hbs'
});
app.engine('hbs', hbs);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Passport
app.use(session({
  secret: process.env.SECRET
}));


app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id)
    .then((user)=>{
      done(null, user);
    })
    .catch((err)=>done(err, null));
});

// passport strategy
passport.use(new LocalStrategy(function(username, password, done) {
  // Find the user with the given username
  User.findOne({
    where: {username: username}})
    .then(user=>{
      console.log("find User", user);
      if(user.password === password){
        return done(null, user);
      }else{
        return done(null, false);
      }
    })
    .catch(err=>console.log(err));
}
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id','first_name', 'last_name','gender', 'name', 'email','birthday']
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log('profile', profile);
    User.findOrCreate({
      where: {facebookId: profile.id,
        firstname: profile.first_name,
        lastname: profile.last_name,
        username: profile.name,
        email: profile.email,
        birthday: profile.birthday
      } }, function (err, user) {
      return cb(err, user);
    });
  }
));

// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://www.example.com/auth/google/callback"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({ googleId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));

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
