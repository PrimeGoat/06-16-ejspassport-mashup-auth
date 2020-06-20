const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();


// const indexRouter = require('./routes/index');
// const usersRouter = require('./routes/users');
const movieRoutes = require('./routes/movieRoutes');
const randomRoutes = require('./routes/randomRoutes');
const { random } = require('./controllers/thirdPartyController');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(cookieParser(process.env.SECRET));
app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: process.env.SESSION_SECRET,
	cookie: {
		secure: false,
		maxAge: 1000 * 60
	}
}));
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Parent routes
app.use('/movies', (req, res, next) => {
  req.flash('title', 'Movies Now Playing');
  next();
});
app.use('/movies', movieRoutes);

app.use('/random', (req, res, next) => {
  req.flash('title', 'Random Profiles');
  next();
});
app.use('/random', randomRoutes);

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

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