var Promise = require('es6-promise').Promise,
    fs = require('fs');

var Espruino = require('./lib/espruino'),
    Receiver = require('./lib/receiver'),
    Web      = require('./lib/web');

var serialNum    = '34ffd805-41563235-09651043',
    codeFilePath = __dirname + '/espruino/source.js',
    port = process.env.PORT;

if (!port) {
  console.log('Set PORT variable');
  process.exit(1);
}

console.log('Listen on port', port);
var web = new Web(port);

var serialPromise = programmeEspruino(serialNum, codeFilePath);
serialPromise
  .then(function (serialPort) {
    var r = new Receiver(serialPort);
    r.on('msg', function (msg) {
      console.log('MESSAGE', msg);
      web.broadcast('sensor', msg);
    });
  })
  .catch(errorAndExit);

process
  .on('SIGINT', gracefulExit)
  .on('SIGTERM', gracefulExit);

function gracefulExit() {
  // disconnect open serial ports
  // via Espruino.closeAll() ?
  // and r.close()
  process.exit();
}

function programmeEspruino(serialNum, filePath) {
  return findEspruinoBySerialNumber(serialNum)
    .then(function (serialPort) {
      return Espruino.upload(serialPort, filePath)
        .then(function () {
          return serialPort;
        })
    })
    .catch(error);
}

function findEspruinoBySerialNumber(serialNum) {
  return Espruino
    .findBySerialNumber(serialNum)
    .then(getSerialPort);
}

function getSerialPort(info) {
  console.log('getSerialPort', info.port);
  return info.port;
}

function getCode(filePath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, function (err, data) {
      err ? reject(err) : resolve(data.toString());
    });
  });
}

function error(err) {
  console.error(err.stack);
}

function errorAndExit(err) {
  error(err);
  gracefulExit();
}

// if (!process.env.SERIAL_PORT) {
//   console.error('Specify SERIAL_PORT of arduino to connect to');
//   process.exit();
// }

// console.log(process.env.SERIAL_PORT);

// var Programmer = require('./lib/programmer'),
//     fs = require('fs');

// var filePath = __dirname + '/espruino/source.js';

// console.log('Starting');

// console.log('Sending contents of %s to espruino', filePath);

// var code = fs.readFileSync(filePath);

// var p = new Programmer('34ffd805-41563235-09651043');
// p.upload(code)
//   .then(function () {
//     console.log('uploaded')
//     p.close();
//   })
//   .catch(fail);

// process
//   .on('SIGINT', gracefulExit)
//   .on('SIGTERM', gracefulExit);

// console.log('done');

// function gracefulExit() {
//   console.log('Close');
// }

// function success() {
//   console.log('Success!');
// }

// function fail(err) {
//   console.error('Fail!', err.stack);
// }