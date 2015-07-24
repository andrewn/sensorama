var debug = require('debug')('sensors:receiver-mock'),
    Promise = require('es6-promise').Promise,
    EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    inherits = require('util').inherits;

var Web = require('./web');

var Receiver = function (port) {
  var self = this;
  this.serial = null;
  this.lastRfid = null;
  this.connected = Promise.resolve();

  this.web = new Web(port, { indexPage: '/mock.html' });

  debug('Receiver mock port: ', port);

  this.web.on('command', function (msg) {
    debug('command', msg);
    self.handleMessage(msg);
  });
};

inherits(Receiver, EventEmitter);

Receiver.prototype.close = function () {
  debug('close');
};

Receiver.prototype.send = function (msg) {
  debug('send: incoming(' + JSON.stringify(msg) + ')');
};

Receiver.prototype.handleMessage = function (msg) {
  debug('handle message');
  if (msg.type === 'cap') {
    debug('is cap message type', msg.data);
    // Expand to individual targets
    var states = _.map(msg.data, function (item, index) {
      return { id: 'touch-' + index, name: index.toString(), type: 'cap', isActive: item };
    });
    debug('emit targets: ', states);
    this.emit('targets', states);
  } else if (msg.type === 'rfid' && msg.data) {
    var id = msg.data,
        payload = { id: 'rfid-' + id, name: id, type: 'rfid', isActive: true };
    this.lastRfid = payload;
    this.emit('targets', [payload]);
  } else if (msg.type === 'rfid') {
    this.lastRfid.isActive = false;
    this.emit('targets', [this.lastRfid]);
  }
}

module.exports = Receiver;
