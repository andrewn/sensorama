/* jshint strict: true */
/* global B6, B7, A0, A1, A5, A6, A7, USB, SPI1, I2C1, LED2 */
'use strict';

//
// Configure pins
//
var I2C_SCL = B6;
var I2C_SDA = B7;

var DISTANCE_TRIGGER = A0;
var DISTANCE_ECHO = A1;

// State variables
var shouldEmitTimeout = 2000,
    shouldEmit,
    isOn,
    lastCapValue,
    lastEmitMsg;

// Sensors
var cap, sensor, nfc, mpu;

//
// Generic helper methods
//
function emit(msg) {
  var json = JSON.stringify(msg);
  if (shouldEmit) {
    lastEmitMsg = json;
    USB.println( json );
  }
  // schedule another timeout?
}

function isArraySame(ar1, ar2) {
  if (ar1.length !== ar2.length) { return false; }

  for (var i = 0, len = ar1.length; i < len; i++) {
    if (ar1[i] !== ar2[i]) {
      return false;
    }
  }

  return true;
}

function pollAndEmit() {
  emit({ type: 'msg', value: 'poll' });

  var touches;

  // Distance sensor
  if (sensor) {
    sensor.trigger();
  }

  // Capacitive
  if (cap) {
    emit({ type: 'msg', value: 'readTouches' });
    touches = cap.readTouches();
    if ( !isArraySame(lastCapValue, touches) ) {
      emit({ type: 'cap', unit: 'touched', pins: touches });
      lastCapValue = touches;
    }
    else {
      emit({ type: 'msg', value: 'touches are the same' });
    }
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
}

function startPolling() {
  setInterval(pollAndEmit, 500);
}

//
// This function runs on startup
//
function onInit() {
  // Initialise state
  shouldEmit = false;
  isOn = false;
  lastCapValue = [];

  console.log('Init');

  // Initialise sensors
  //

  // Distance sensor (HC-SR04)
  //
  // sensor = require("HC-SR04").connect(/* trig */ DISTANCE_TRIGGER, /* echo */ DISTANCE_ECHO, function(dist) {
  //   emit({ type: 'distance', value: dist, unit: 'cm' });
  // });

  // Setup I2C
  I2C1.setup({ scl: I2C_SCL, sda: I2C_SDA });

  console.log('I2C setup done');

  // Setup SPI
  SPI1.setup({ sck:A5, miso:A6, mosi:A7 });

  console.log('SPI setup done');

  // nfc = require("MFRC522").connect(SPI1, B1 /*CS*/);
  // nfc.init();

  //
  // Digital accelerometer and gyro (MPU6050)
  //
  // mpu = require("MPU6050").connect(I2C1);

  //
  // Capacitive breakout (CAP1188)
  //
  cap = require('CAP1188').connect(I2C1);
  cap.linkLedsToSensors();

  console.log('cap setup done');

  // Start the main sensor polling loop
  startPolling();

  console.log('started polling');

  // Wait before emitting anything over the
  // USB port
  setTimeout(function () {
    if (nfc) {
      nfc.init();
    }
    shouldEmit = true;
  }, shouldEmitTimeout);
}
