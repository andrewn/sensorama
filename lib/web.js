var express  = require('express'),
    socketIO = require('socket.io'),
    Promise  = require('es6-promise').Promise,
    EventEmitter = require('events').EventEmitter,
    inherits = require('util').inherits,
    path     = require('path'),
    _ = require('lodash');

var Web = function (port) {
  var self = this;
  this.app  = express();
  this.http = this.app.listen(port);
  this.io   = socketIO(this.http);
  this.lastMessageCache = {};

  this.io.on('connection', function(socket){
    console.log('connection');

    // Broadcast last messages
    _.forEach(self.lastMessageCache, function (value, key) {
      socket.emit(key, value);
    });

    // Route messages
    socket.on('ui', function(msg){
      console.log('incoming-msg');
      self.emit('incoming-msg', msg);
    });
  });

  // Middleware
  var staticPath = path.join(__dirname, '..', 'static');
  this.app.use(express.static(staticPath));
};

inherits(Web, EventEmitter);

Web.prototype.broadcast = function (name, msg) {
  this.lastMessageCache[name] = msg;
  this.io.emit(name, msg);
};

module.exports = Web;
