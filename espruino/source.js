/* jshint strict: true */
/* global B1, B15, A0, A1, USB, SPI3, I2C1, LED1, LED2 */
'use strict';

//
// Configure pins
//
var pins = {
  I2C: {
    instance: I2C1 // The Espruino global
  },
  SPI: {
    instance: SPI3 // The Espruino global
  },
  distance: {
    enabled: false,
    trigger: A0,
    echo: A1
  },
  cap: {
    enabled: true,
    reset: B15
  },
  nfc: {
    enabled: true,
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

function isArraySame(ar1, ar2) {
  if (ar1.length !== ar2.length) { return false; }

  for (var i = 0, len = ar1.length; i < len; i++) {
    if (ar1[i] !== ar2[i]) {
      return false;
    }
  }

  return true;
}

//
// This function is called by external
// systems over the serial port
//
function incoming(msg) {
  if (msg.name === 'reset') {
    resetCap();
  } else if (msg.name === 'state'){
    emit({ type: 'cap',  unit: 'touched', data: state.lastTouches });
    emit({ type: 'rfid', unit: 'id', data: state.lastRfid.length === 0 ? null : state.lastRfid });
  }
}

function pollAndEmit() {
  emit({ type: 'msg', data: 'heartbeat' });

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
      emit({ type: 'cap', unit: 'touched', data: touches });
      state.lastTouches = touches;
    }
    else {
      debug('touches are the same');
    }
  }

  // Gyro
  if (sensors.mpu) {
    emit({ type: 'accel', unit: 'raw', data : sensors.mpu.getAcceleration() });
    emit({ type: 'gyro', unit: 'deg', data : sensors.mpu.getDegreesPerSecond() });
  }

  function readRfid(nfc) {
    var rfid1, rfid2;
    nfc.isNewCard();
    rfid1 = nfc.getCardSerial();
    nfc.isNewCard();
    rfid2 = nfc.getCardSerial();

    if (rfid1.length === 0 && rfid2.length === 0) {
      return [];
    } else {
      if (rfid1.length > 0) {
        return rfid1;
      } else if (rfid2.length > 0) {
        return rfid2;
      }
    }
  }

  if (sensors.nfc) {
    var card = readRfid(sensors.nfc);
    if ( !isArraySame(card, state.lastRfid) ) {
      emit({ type: 'rfid', unit: 'id', data: card.length === 0 ? null : card });
      state.lastRfid = card;
    }
  }

  // Blink on-board LED
  state.isOn = !state.isOn; LED2.write(state.isOn);
}

function startPolling() {
  setInterval(pollAndEmit, 500);
}

function resetCap() {
  if (pins.cap.enabled) {
    LED1.write(1);
    sensors.cap.reset(function () {
      debug('cap reset done');
      LED1.write(0);
    });
  }
}

//
// This function runs on startup
//
function onInit() {
  // Initialise state
  state.isOn = false;
  state.shouldEmit = false;
  state.lastTouches = [];
  state.lastRfid = [];

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
        emit({ type: 'distance', data: dist, unit: 'cm' });
      }
    );
  }

  // Setup I2C
  pins.I2C.instance.setup();
  debug('I2C setup done');

  // Setup SPI
  pins.SPI.instance.setup();
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
    sensors.cap = require('CAP1188').connect(pins.I2C.instance, { resetPin: pins.cap.reset });
    sensors.cap.reset();
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
