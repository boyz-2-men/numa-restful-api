'use strict';

try {

// modules ---------------------------------------------------------------------
  var express      = require('express');
  var logger       = require('express-logger');
  var passport     = require('passport');
  var mongoose     = require('mongoose');
  var bodyParser   = require('body-parser');
  var cookieParser = require('cookie-parser');
  var session      = require('express-session');
  var errorhandler = require('errorhandler');
  var colors       = require('colors');
  var cors         = require('cors');
  var app          = express();
  var db           = require('./config/db.js');
  var auth         = require('./config/auth.js');

// global config ---------------------------------------------------------------
  app.set('port', process.env.PORT || 3000);
  app.use(logger({
    path: './logfile.txt'
  }));
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cors());

// env config ------------------------------------------------------------------
  if (process.env.NODE_ENV === 'development') {
    app.use(errorhandler());
  }

  if (process.env.NODE_ENV === 'production') {
    app.use(errorhandler({
      dumpExceptions : true,
      showStack      : true
    }));
  }

// db config -------------------------------------------------------------------
  mongoose.connect(db.MONGO_CONNECTION_URI);

// routes ----------------------------------------------------------------------
  require('./routes.js')(app);

// run server ------------------------------------------------------------------
  app.listen(app.get('port'), function() {
    var message = '\nExpress server listening on port ' + app.get('port');
    console.log(message.bold.blue);
  });
}

// https://stackoverflow.com/questions/12890494/improving-express-js-module-usage
catch (exception) {
  var message = 'Server exception: ' + exception;
  console.log(message.bold.red);
}