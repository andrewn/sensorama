var debug = require('debug')('sensors:receiver'),
    Promise = require('es6-promise').Promise,
    serialport = require('serialport'),
    EventEmitter = require('events').EventEmitter,
    _ = require('lodash');

var Receiver = function (serialPort) {
  var self = this;
  this.serial = null;
  connect(serialPort)
    .then(function (serial) {
      debug('Receiver connected');
      self.serial = serial;
      serial.on('data', function (data) {
        debug('data', data);
        try {
          self.handleMessage( JSON.parse(data) );
        } catch (e) {
          // do nothing
        }
      });
      serial.on('disconnect', function () {
        self.emit('disconnect');
      });
    });
};

Receiver.prototype = new EventEmitter();

Receiver.prototype.close = function () {
  if (this.serial) { this.serial.close(); }
};

Receiver.prototype.send = function (msg) {
  var data = 'incoming(' + JSON.stringify(msg) + ')\n';
  if (this.serial) {
    this.serial.write( data );
  }
};

Receiver.prototype.handleMessage = function (msg) {
  debug('handle message');
  if (msg.type === 'cap') {
    debug('is cap message type', msg.data);
    // Expand to individual targets
    var states = _.map(msg.data, function (item, index) {
      return { id: 'touch-' + index, name: index, type: 'cap', isActive: item };
    });
    debug('emit targets: ', states);
    this.emit('targets', states);
  } else if (msg.type === 'rfid'){
    var id = msg.data.reduce(function (acc, curr) { return acc + curr.toString(16); }, ''),
        msg = { id: 'rfid-' + id, name: id, type: 'rfid', isActive: true };
    this.emit('targets', [msg]);
  }
}

module.exports = Receiver;

function connect(serialPort) {
  debug('connect', serialPort);
  return new Promise(function (resolve, reject) {
    var query = new serialport.SerialPort(serialPort, {
                  baudrate: 9600,
                  parser: serialport.parsers.readline('\n')
                }, false);
    query.open(function (err) {
      debug('opened: ', serialPort, err);
      if (err) {
        query.close();
        reject(err);
      } else {
        resolve(query);
      }
    });
  });
}

function error() {
  console.error(err.stack);
}
