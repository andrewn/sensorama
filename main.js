var debug = require('debug')('sensors:main'),
    log   = console.log,
    Promise = require('es6-promise').Promise,
    fs = require('fs'),
    _ = require('lodash'),
    radiodan = require('radiodan-client').create();

var Espruino = require('./lib/espruino'),
    Receiver = require('./lib/receiver'),
    rfidReader = require('./lib/rfid'),
    Router   = require('./lib/router'),
    Web      = require('./lib/web');

var serialNum    = process.env.ESPRUINO_SERIAL_NUM,
    rfidSerial   = process.env.RFID_SERIAL_PORT,
    codeFilePath = __dirname + '/espruino/source.js',
    port = process.env.PORT,
    player = radiodan.player.get('main');

if (!port) {
  log('Set PORT variable');
  process.exit(1);
}

debug('Listen on port', port);

var web = new Web(port),
    router = new Router(player),
    receiver;

web.on('incoming-msg', function (msg) {
  router.processUi(msg);
});

if (!rfidSerial) {
  log('RFID_SERIAL_PORT not set, will not connect to RFID reader');
} else {
  rfid = rfidReader(rfidSerial);
  rfid.on('tag:added', function (id) {
    log('RFID tag added: ', id);
    web.broadcast('sensor', { type: 'rfid', value: id });
  });
  rfid.on('tag:removed', function (id) {
    log('RFID tag removed: ', id);
    web.broadcast('sensor', { type: 'rfid', value: null });
  });
}

var serialPromise = programmeEspruino(serialNum, codeFilePath);
serialPromise
  .then(function (serialPort) {
    debug('Connecting receiver on port: ', serialPort);
    receiver = new Receiver(serialPort);
    receiver.on('msg', function (msg) {
      debug('MESSAGE', msg);
      web.broadcast('sensor', msg);
      router.processSensor(msg);

      // TODO: Send only when new client connects
      web.broadcast('sensor', { type: 'assignedSounds', sounds: router.pinSounds });
      web.broadcast('sensor', { type: 'sounds', sounds: router.availableSounds });
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