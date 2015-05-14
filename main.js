var debug = require('debug')('sensors'),
    Promise = require('es6-promise').Promise,
    fs = require('fs'),
    _ = require('lodash'),
    radiodan = require('radiodan-client').create();

var Espruino = require('./lib/espruino'),
    Receiver = require('./lib/receiver'),
    Router   = require('./lib/router'),
    Web      = require('./lib/web');

var serialNum    = process.env.ESPRUINO_SERIAL_NUM,
    codeFilePath = __dirname + '/espruino/source.js',
    port = process.env.PORT,
    player = radiodan.player.get('main');

if (!port) {
  debug('Set PORT variable');
  process.exit(1);
}

debug('Listen on port', port);

var web = new Web(port),
    router = new Router(player),
    receiver;

var serialPromise = programmeEspruino(serialNum, codeFilePath);
serialPromise
  .then(function (serialPort) {
    debug('Connecting receiver on port: ', serialPort);
    receiver = new Receiver(serialPort);
    receiver.on('msg', function (msg) {
      debug('MESSAGE', msg);
      web.broadcast('sensor', msg);
      router.process(msg);

      // TODO: Send only when new client connects
      web.broadcast('sensor', { type: 'sounds', sounds: router.pinSounds });
    });
    receiver.on('disconnect', gracefulExit);
  })
  .catch(errorAndExit);

process
  .on('SIGINT', gracefulExit)
  .on('SIGTERM', gracefulExit);

function gracefulExit() {
  // disconnect open serial ports
  // via Espruino.closeAll() ?
  if (receiver) { receiver.close(); }
  process.exit();
}

function programmeEspruino(serialNum, filePath) {
  var finderPromise;

  if (serialNum) {
    finderPromise = findEspruinoBySerialNumber(serialNum);
  } else {
    finderPromise = findEspruino();
  }

  return finderPromise
    .then(function (serialPort) {
      if (!serialPort) {
        throw new Error('No serial port found');
      }

      debug('Uploading to serial port: ', serialPort, ' from: ', filePath);

      return Espruino.upload(serialPort, filePath)
        .then(function () {
          debug('Done uploading');
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

function findEspruino() {
  return Espruino
    .findEspruinos()
    .then(function (espruinos) {
      return _.first(espruinos);
    })
    .then(getSerialPort);
}


function getSerialPort(info) {
  debug('getSerialPort', info.port);
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