const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const chatRouter = require('./routes/chats');
const messagesRouter = require('./routes/messages')

const sequelize = require('./models/sync.js');

const authMiddleware = require('./middleware/authMiddleware.js');

require('dotenv').config({path: './.env'});

const app = express();


sequelize.sync()
    .then(() => console.log("User model synced with the database"))
    .catch((err) => console.error("Error syncing User model:", err));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(authMiddleware);


app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/chats', chatRouter);
app.use('/api/messages', messagesRouter);


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



// tcp server
const net = require('net');
const port = process.env.PORT;
const host = '127.0.0.1';


const {onConnection} = require('./socket/handlers.js');

const server = net.createServer();
server.listen(port, host, () => {
    console.log('TCP Server is running on port ' + port + '.');
});


server.on('connection', onConnection);

module.exports = app;

