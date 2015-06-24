//
// Configure pins
//
var I2C_SCL = B6;
var I2C_SDA = B7;

var DISTANCE_TRIGGER = A0;
var DISTANCE_ECHO = A1;


// This flag is enabled after a timeout
var shouldEmit = false,
    shouldEmitTimeout = 2000;

//
// Generic helper methods
//
function emit(msg) {
  if (shouldEmit) {
    USB.println( JSON.stringify(msg) );
  }
  // schedule another timeout?
}

function isArraySame(ar1, ar2) {
  if (ar1.length != ar2.length) { return false; }

  for (var i = 0, len = ar1.length; i < len; i++) {
    if (ar1[i] !== ar2[i]) {
      return false;
    }
  }

  return true;
}

//
// Distance sensor (HC-SR04)
//
// var sensor = require("HC-SR04").connect(/* trig */ DISTANCE_TRIGGER, /* echo */ DISTANCE_ECHO, function(dist) {
//   emit({ type: 'distance', value: dist, unit: 'cm' });
// });

// Setup I2C
I2C1.setup({ scl: I2C_SCL, sda: I2C_SDA });

// Setup SPI
SPI1.setup({ sck:A5, miso:A6, mosi:A7 });

var nfc = require("MFRC522").connect(SPI1, B1 /*CS*/);
nfc.init();
//
// Digital accelerometer and gyro (MPU6050)
//
// var mpu = require("MPU6050").connect(I2C1);

//
// Capacitive breakout (CAP1188)
//
var cap = require('CAP1188').connect(I2C1);
cap.linkLedsToSensors();

var isOn = false,
    lastCapValue = [];
setInterval(function () {
  var touches;

  // Distance sensor
  if (sensor) {
    sensor.trigger();
  }

  // Capacitive
  if (cap) {
    touches = cap.readTouches();
    if ( !isArraySame(lastCapValue, touches) ) {
      emit({ type: 'cap', unit: 'touched', pins: touches });
      lastCapValue = touches;
    }
    // else {
    //   emit({ type: 'nothing' });
    // }
  }

  // Gyro
  if (mpu) {
    emit({ type: 'accel', unit: 'raw', xyz : mpu.getAcceleration() });
    emit({ type: 'gyro', unit: 'deg', xyz : mpu.getDegreesPerSecond() });
  }

  if (nfc) {
    nfc.findCards(function (card) {
      if (card) {
        emit({ type: 'rfid', unit: 'id', value: card });
      }
    });
  }

  // Blink on-board LED
  isOn = !isOn; LED2.write(isOn);
}, 500);

setTimeout(function () {
  if (nfc) {
    nfc.init();
  }
  shouldEmit = true;
}, shouldEmitTimeout);

