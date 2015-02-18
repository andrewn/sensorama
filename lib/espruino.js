/*
  Find by serial number process inspired by
  https://github.com/mudcube/node-espruino
*/
var Promise = require('es6-promise').Promise,
    serialport = require('serialport'),
    spawn = require('child_process').spawn,
    _ = require('lodash');

module.exports = {
  findBySerialNumber: findBySerialNumber,
  upload: upload
};

function getSerialFromPort (port) {
  return new Promise(function (resolve, reject) {
    console.log('port', port.comName);

    var query = new serialport.SerialPort(port.comName, {
                  baudrate: 9600,
                  parser: serialport.parsers.readline('\n')
                }, false),
        timeoutId;

    query.open(function (err) {
      console.log('open');

      if (err) {
        console.log('error', port.comName, err.stack);
        resolve();
      } else {
        //were only going to wait 500 msec for this to finish
        timeoutId = setTimeout(function() {
          console.log('timeout', port.comName);
          query.close();
          resolve();
        }, 500);

        query.on('data', function (data) {
          var str = data.toString(),
              matches = /\"([0-9a-f-]+)\"/.exec(str);

          if (matches && matches.length > 0) {
            console.log('found', port.comName);
            clearTimeout(timeoutId);
            query.close();

            resolve({
              port: port.comName,
              serialNum: matches[1]
            });
          }
        });

        query.write('getSerial()\n');
      }
    });
  });
};

function findBySerialNumber(serialNum) {
  return new Promise(function (resolve, reject) {
    serialport.list(function (err, ports) {
      if (ports.length === 0) {
        resolve();
      }

      Promise
        .all( ports.map(getSerialFromPort) )
        .then(function (serials) {
          // console.log('serials', serials);
          var matching = _.chain(serials)
            .compact()
            .find(function(serial) { return serial.serialNum === serialNum; })
            .value();

          return matching;
        })
        .then(function (matching) {
          resolve( matching );
        });
    });
  });
}

function upload(serialPort, filePath) {
  var process;
  console.log('upload', serialPort, filePath);
  return new Promise(function (resolve, reject) {
    process = spawn('espruinotool',  ['--port', serialPort, filePath]);
    process.on('error', reject);
    process.on('close', resolve);
  });
}
