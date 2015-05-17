// Read serial number of any RFID tags
// connected over serial to a reader

var debug = require('debug')('rfid:debug'),
    log   = console.log,
    serialport = require('serialport'),
    EventEmitter = require('events').EventEmitter;

var Cmd = {
    start: 0xAA
  , ok   : 0x00
  , end  : 0xBB
};

module.exports = function (serialPath) {

  var instance = new EventEmitter();

  if (!serialPath) {
    throw new Error('No serialPath provided to RFID reader client');
  }

  var serial = new serialport.SerialPort(serialPath, {
    baudrate: 9600,
    parser: serialport.parsers.byteDelimiter(Cmd.end)
  });

  // MF_GET_SNR (0x25) command
  // http://neophob.com/files/rfid/PROTOCOL-821-880%20_2_.pdf
  var query = [Cmd.start, 0x00, 0x03, 0x25, 0x26, 0x00, 0x00, Cmd.end];

  function hex(num) {
    return (num < 10 ) ? '0' + num : num.toString(16);
  }

  function hexString(array) {
    return array
      .map(hex)
      .join('');
  }

  var lastTagId = null;

  // Prints the ID and keeps a reference
  // to it since we're polling the reader
  // for tags and don't want to repeatedly
  // print the same id
  function done(id) {
    if (id && lastTagId != id) {
      lastTagId = id;
      debug('id', id);
      instance.emit('tag:added', id);
    } else if (id == null && lastTagId != null) {
      instance.emit('tag:removed', lastTagId);
      debug('Removed');
      lastTagId = null;
    }
    setTimeout(doQuery, 0);
  }

  // Parse a response from the reader,
  // an array of bytes
  function parseResponse(b) {
    var status = b[3],  // query success
        numTags = b[4], // how many tags found
        id = [];

    if (status == Cmd.ok) {
      debug('read: ok', b);

      debug(numTags);

      switch(numTags) {
        case 0x00: debug('one tag readable');
          break;
        case 0x01: debug('at least 2 tags readable');
          break;
      }

      id = b.slice(5, 9); // 4 bit device serial number
      debug('ID: ' + id);

      id = hexString(id); // turn the 4 bits into a hex string

      done(id);
    } else {
      done();
    }

  }

  // Write a query to the reader to
  // find any tags within it's range
  // This triggers data to be sent
  // back over the serial port
  function doQuery () {
    serial.write(query);
  }

  // On serial port open set up listener
  // for incoming data and trigger
  // done() to kick off polling
  serial.on('open', function () {
    log('Connected');
    serial.on('data', parseResponse);
    done();
  });

  return instance;
};
