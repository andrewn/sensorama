var express  = require('express'),
    socketIO = require('socket.io'),
    Promise  = require('es6-promise').Promise,
    path     = require('path'),
    _ = require('lodash');

var Web = function (port) {
  this.app  = express();
  this.http = this.app.listen(port);
  this.io   = socketIO(this.http);

  // Middleware
  var staticPath = path.join(__dirname, '..', 'static');
  this.app.use(express.static(staticPath));
};

Web.prototype.broadcast = function (name, msg) {
  this.io.emit(name, msg);
};

module.exports = Web;