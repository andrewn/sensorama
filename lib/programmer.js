var nodeEspruino = require('node-espruino'),
    Promise = require('es6-promise').Promise,
    path = require('path');

var Programmer = function (serial) {
  this.espruino = nodeEspruino.espruino({
    boardSerial: serial
  });
  this.openPromise = null;
};

Programmer.prototype.ready = function () {
  var self = this;
  if (!self.openPromise) {
    self.openPromise = new Promise(function (resolve, reject) {
      self.espruino.open(function (err) {
        console.log('--> open');
        err ? reject(err) : resolve();
      });
    });
  }
  return self.openPromise;
};

Programmer.prototype.upload = function (code) {
  var modulePath = path.join(__dirname, '..', 'vendor', 'espruino-docs', 'devices');

  var opts = {
    save: false,
    uploadModules: true,
    moduleDir: modulePath
  },
  self = this;
  return new Promise(function (resolve, reject) {
    self.ready()
      .then(function () {
        console.log('--> Upload');
        self.espruino.upload(code, opts, function (err) {
          console.log('--> uploaded.');
          err ? reject(err) : resolve();
        });
      });
  });
};

Programmer.prototype.close = function (code) {
  this.espruino.close();
};


module.exports = Programmer;