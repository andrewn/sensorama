var Promise = require('es6-promise').Promise,
    serialport = require('serialport'),
    EventEmitter = require('events').EventEmitter;

var Receiver = function (serialPort) {
  var self = this;
  this.serial = null;
  connect(serialPort)
    .then(function (serial) {
      self.serial = serial;
      serial.on('data', function (data) {
        try {
          self.emit('msg', JSON.parse(data));
        } catch (e) {
          // do nothing
        }
      });
    });
};

Receiver.prototype = new EventEmitter();

Receiver.prototype.close = function () {
  if (this.serial) { this.serial.close(); }
};

module.exports = Receiver;

function connect(serialPort) {
  console.log('connect', serialPort);
  return new Promise(function (resolve, reject) {
    var query = new serialport.SerialPort(serialPort, {
                  baudrate: 9600,
                  parser: serialport.parsers.readline('\n')
                }, false);
    query.open(function (err) {
      console.log('opened', err);
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