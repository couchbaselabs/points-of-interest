global.Promise = require('bluebird');
require('dotenv').config();

const express = require('express');

const debug = require('debug')('poi:server');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const fs = require('fs');

const couchbase = require('couchbase');
const cluster = new couchbase.Cluster(process.env.CLUSTER);
cluster.authenticate(process.env.CLUSTER_USER, process.env.CLUSTER_PASSWORD);

const app = express();

app.locals.couchbase = couchbase;
app.locals.cluster = cluster;
app.locals.travel = cluster.openBucket('travel-sample');
app.locals.eventing = cluster.openBucket('eventing');

app.use(favicon(path.join(__dirname, 'images/favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static(path.join(__dirname, '../client')));

const records = require('./routes/records');
app.use('/records', records);
const events = require('./routes/events');
app.use('/events', events);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.dir(req);
  console.dir(res);
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
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

// HTTP server

const http_port = process.env.HTTP_PORT;
const http_server = http.createServer(app);

http_server.listen(http_port);

http_server.on('error', onError);
http_server.on('listening', onListening);

// HTTPS server

const options = {
  key: fs.readFileSync(path.join('ssl', 'key.pem')),
  cert: fs.readFileSync(path.join('ssl', 'cert.pem'))
};

const https_port = process.env.HTTPS_PORT;
const https_server = https.createServer(options, app);

https_server.listen(https_port);

https_server.on('error', onError);
https_server.on('listening', onListening);

/**
 * Event listener for HTTP/S server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP/S server "listening" event.
 */

function onListening() {
  let addr = this.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
