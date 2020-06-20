const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const { userInfo } = require('os');
let MongoStore = require('connect-mongo')(session);
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('./lib/passport');

const movieRoutes = require('./routes/movieRoutes');
const randomRoutes = require('./routes/randomRoutes');
const { random } = require('./controllers/thirdPartyController');

console.log(process.env.SECRET, process.env.SESSION_SECRET, process.env.MONGODB_URI);

const app = express();

app.use(morgan('dev'));
app.use(cookieParser(process.env.SECRET));
app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: process.env.SESSION_SECRET,
	cookie: {
		secure: false,
		maxAge: 1000 * 60 * 25
	}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log('Session:', req.session);
  console.log('User:', req.user);
  next();
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
.then(() => console.log('MongoDB Connected.'))
.catch(err => console.log('MongoDB error', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.locals.name = req.name;
  res.locals.user = req.user;
  res.locals.errors = req.flash('errors');
  res.locals.success = req.flash('success');

  next();
})
//app.use(cookieParser());

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/thankyou', (req, res) => {
  res.render('thankyou');
});

const auth = (req, res, next) => {
  if(req.isAuthenticated()) next();
  else res.send("You are not authorized to view this.");
};

app.get('/logged', auth, (req, res) => {
  res.render('logged');
});

app.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/');
});

const loginCheck = [
	check('email').isEmail(),
	check('password').isLength({min: 3})
];

const loginValidate = (req, res, next) => {
	const info = validationResult(req);
	console.log(info);
	if(!info.isEmpty()) {
		req.flash('errors', 'Invalid email or password');
		return res.redirect('/');
	}
	next();
};

app.post('/login', loginCheck, loginValidate, /*validateInput,*/ passport.authenticate('local-login', {
	successRedirect: '/logged',
	failureRedirect: '/',
	failureFlash: true
}));

app.post('/register', (req, res) => {
	User.findOne({ email: req.body.email }).then(user => {
		if(user) {
			req.flash('errors', 'Account exists');
			return res.redirect(301, '/register');
			//res.status(400).json({ message: 'User exists' });
		} else {
			const newUser = new User();
			const salt = bcrypt.genSaltSync(10);
			const hash = bcrypt.hashSync(req.body.password, salt);

			newUser.name = req.body.name;
			newUser.email = req.body.email;
			newUser.password = hash;

			newUser.save().then(user => {
				req.login(user, (err) => {
					if(err) {
						res.status(500).json({confirmation: false, message: 'Server error'});
					} else {
						res.redirect('/thankyou');
					}
				});
				//res.status(200).json({ message: 'User created: ', user});
			}).catch(err => console.log('Error: ', err));
		}
	});
});


// Parent routes
app.use('/movies', auth, (req, res, next) => {
  req.flash('title', 'Movies Now Playing');
  next();
});
app.use('/movies', auth, movieRoutes);

app.use('/random', auth, (req, res, next) => {
  req.flash('title', 'Random Profiles');
  next();
});
app.use('/random', auth, randomRoutes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;