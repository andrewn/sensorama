/* jshint strict: true */
/* global B1, B15, A0, A1, A5, A6, A7, USB, SPI1, I2C1, LED2 */
'use strict';

//
// Configure pins
//
var pins = {
  I2C: {
    instance: I2C1 // The Espruino global
  },
  SPI: {
    instance: SPI1, // The Espruino global
    SCK: A5,
    MISO: A6,
    MOSI: A7
  },
  distance: {
    enabled: false,
    trigger: A0,
    echo: A1
  },
  cap: {
    enabled: true
  },
  nfc: {
    enabled: false,
    cs: B1
  }
};

// Config
var config = {
  debug: false,
  emitDelayMs: 2000
};

// State
var state = {};

// Sensors
var sensors = {};

//
// Generic helper methods
//
function emit(msg) {
  var json = JSON.stringify(msg);
  if (state.shouldEmit) {
    USB.println( json );
  }
  // schedule another timeout?
}

function debug(msg) {
  if (config.debug) { console.log(msg); }
}

function resetCap(pin) {
  var delay = 100;
  pin.write(0);
  setTimeout(function () {
    pin.write(1);
    setTimeout(function () {
      pin.write(0);
    }, delay);
  }, delay);
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
  debug({ type: 'msg', value: 'poll' });

  var touches;

  // Distance sensor
  if (sensors.distance) {
    sensors.distance.trigger();
  }

  // Capacitive
  if (sensors.cap) {
    debug('read touches');
    touches = sensors.cap.readTouches();
    if ( !isArraySame(state.lastTouches, touches) ) {
      emit({ type: 'cap', unit: 'touched', pins: touches });
      state.lastTouches = touches;
    }
    else {
      debug('touches are the same');
    }
  }

  // Gyro
  if (sensors.mpu) {
    emit({ type: 'accel', unit: 'raw', xyz : sensors.mpu.getAcceleration() });
    emit({ type: 'gyro', unit: 'deg', xyz : sensors.mpu.getDegreesPerSecond() });
  }

  if (sensors.nfc) {
    sensors.nfc.findCards(function (card) {
      if (card) {
        emit({ type: 'rfid', unit: 'id', value: card });
      }
    });
  }

  // Blink on-board LED
  state.isOn = !state.isOn; LED2.write(state.isOn);
}

function startPolling() {
  setInterval(pollAndEmit, 500);
}

//
// This function runs on startup
//
function onInit() {
  // Initialise state
  state.isOn = false;
  state.shouldEmit = false;
  state.lastTouches = [];

  debug('Init');

  // Initialise sensors
  //

  // Distance sensor (HC-SR04)
  //
  if (pins.distance.enabled) {
    sensors.sensor = require('HC-SR04').connect(
      /* trig */ pins.distance.trigger,
      /* echo */ pins.distance.echo,
      function(dist) {
        emit({ type: 'distance', value: dist, unit: 'cm' });
      }
    );
  }

  // Setup I2C
  pins.I2C.instance.setup();
  debug('I2C setup done');

  // Setup SPI
  pins.SPI.instance.setup({ sck: pins.SPI.SCK, miso: pins.SPI.MISO, mosi: pins.SPI.MOSI });
  debug('SPI setup done');

  if (pins.nfc.enabled) {
    sensors.nfc = require('MFRC522').connect(pins.SPI.instance, pins.nfc.cs /*CS*/);
    sensors.nfc.init();
  }

  //
  // Digital accelerometer and gyro (MPU6050)
  //
  // mpu = require("MPU6050").connect(I2C1);

  //
  // Capacitive breakout (CAP1188)
  //
  if (pins.cap.enabled) {
    sensors.cap = require('CAP1188').connect(pins.I2C.instance);
    sensors.cap.linkLedsToSensors();
    debug('cap setup done');
  }

  // Start the main sensor polling loop
  startPolling();
  debug('started polling');

  // Wait before emitting anything over the
  // USB port
  setTimeout(function () {
    if (sensors.nfc) {
      sensors.nfc.init();
    }
    state.shouldEmit = true;
  }, config.emitDelayMs);
}
