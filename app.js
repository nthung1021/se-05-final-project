var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('./components/users/passportConfig');
var PrismaSessionStore = require('./prismaSessionStore');
var prismaStore = new PrismaSessionStore();

var indexRouter = require('./components/index/indexRoute');
var usersRouter = require('./components/users/usersRoute');
var chatRouter = require('./components/chat/chatRoute');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    store: prismaStore,
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60, //(miliseconds, total: 1 hour)
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Make 'req.user' available as 'user' in templates
app.use(function(req, res, next) {
    res.locals.user = req.user; 
    next();
});

app.use('/', indexRouter);
app.use('/home', indexRouter);
app.use('/chat', chatRouter);
app.use('/users', usersRouter);

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
