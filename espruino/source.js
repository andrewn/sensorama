(function (exports) {
  /* Copyright (c) 2015 Andrew Nicolaou. See the file LICENSE for copying permission. */
  /*
    Module for Adafruit CAP1188 8-Key Capacitive Touch Sensor Breakout
    Only I2C is supported.

    See: https://www.adafruit.com/products/1602
    Bit writing code from: http://www.espruino.com/modules/MPU6050.js
    Influenced by Adafruit's CAP1188: https://github.com/adafruit/Adafruit_CAP1188_Library
  */
  var C = {
    ADDRESS_DEFAULT       : 0x29
  };

  /* Register addresses*/
  var R = {
    MAIN_CONTROL          : 0x00,
    SENSOR_INPUT_STATUS   : 0x03,
    MULTI_TOUCH_CONFIG    : 0x2a,
    STANDBY_CONFIG        : 0x41,
    SENSOR_INPUT_LINKING  : 0x72,
    LED_OUTPUT_CONTROL    : 0x74
  };

  /* Bits within register for functions */
  var B = {
    MAIN_CONTROL_INT      : 0x0
  };

  function CAP1188(_i2c, _opts) {
    _opts = (_opts == null) ? {} : _opts;
    this.i2c = _i2c;

    // Support old API where second param was _addr
    if (typeof _opts === 'number') {
      this.addr = _opts;
    } else {
      this.addr  = _opts.address || C.ADDRESS_DEFAULT;
      this.resetPin = _opts.resetPin || null;
    }

    this.initialize();
  }

  /* Initialize the chip */
  CAP1188.prototype.initialize = function() {
    this.linkLedsToSensors();
    this.multipleTouches(true);
    // "Speed up a bit"
    this.i2c.writeTo(this.addr, [R.STANDBY_CONFIG, 0x30]);
  };

  /* Reset the chip if a reset pin has been specified */
  CAP1188.prototype.reset = function(callback) {
    var delay = 100,
        pin   = this.resetPin,
        self  = this;

    if (pin == null) {
      throw new Error('CAP1188 reset called but no resetPin given');
    }

    pin.write(0);
    setTimeout(function () {
      pin.write(1);
      setTimeout(function () {
        pin.write(0);
        setTimeout(function () {
          self.initialize();
          if (callback) { callback(); }
        }, delay);
      }, delay);
    }, delay);
  };

  /* How many simultaneous touches to allow */
  CAP1188.prototype.multipleTouches = function(enable) {
    // 1 will block multiple touches
    this.writeBit(R.MULTI_TOUCH_CONFIG, 7, enable ? 0 : 1);
  };

  /* Link the LED to corresponding sensor */
  CAP1188.prototype.linkLedsToSensors = function() {
    for(var i = 0; i < 8; i++) {
      this.linkLedToSensor(i, 1);
    }
  };

  /* Link LED pin to sensor */
  CAP1188.prototype.linkLedToSensor = function(num, enable) {
    this.writeBit(R.SENSOR_INPUT_LINKING, num, enable);
  };

  /* Read state of all sensors */
  CAP1188.prototype.readTouches = function() {
    var touches = [],
        raw;

    this.i2c.writeTo(this.addr, R.SENSOR_INPUT_STATUS);
    raw = this.i2c.readFrom(this.addr, 1)[0];

    if (raw) {
      // Clear interrupt to be able to read again
      this.writeBit(R.MAIN_CONTROL, B.MAIN_CONTROL_INT, 0);
    }

    for(var i = 0; i < 8; i++) {
      touches[i] = this.getBit(raw, i);
    }


    return touches;
  };

  /*  */
  CAP1188.prototype.getBit = function(byt, position) {
    return (1 == ((byt >> position) & 1));
  };

  /* Set a single bit in a register */
  CAP1188.prototype.writeBit = function(reg, bit, val) {
    this.i2c.writeTo(this.addr, reg);
    var b = this.i2c.readFrom(this.addr, 1)[0];
    b = (val !== 0) ? (b | (1 << bit)) : (b & ~(1 << bit));
    this.i2c.writeTo(this.addr, [reg, b]);
  };

  /* Set more bits in a register */
  CAP1188.prototype.writeBits = function(reg, shift, val) {
    this.i2c.writeTo(this.addr, reg);
    var b = this.i2c.readFrom(this.addr, 1)[0];
    b = b | (val << shift);
    this.i2c.writeTo(this.addr, [reg, b]);
  };

  exports.connect = function (_i2c,_addr) {
    return new CAP1188(_i2c,_addr);
  };
})(E);


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

// From: https://github.com/voodootikigod/node-serialport/blob/master/parsers.js#L11-L28
// encoding: ascii utf8 utf16le ucs2 base64 binary hex
// More: http://nodejs.org/api/buffer.html#buffer_buffer
function readlineParser(delimiter, encoding) {
  if (typeof delimiter === 'undefined' || delimiter === null) { delimiter = '\r'; }
  if (typeof encoding  === 'undefined' || encoding  === null) { encoding  = 'utf8'; }
  // Delimiter buffer saved in closure
  var data = '';
  return function (emitter, buffer) {
    // Collect data
    data += buffer.toString(encoding);
    // Split collected data by delimiter
    var parts = data.split(delimiter);
    data = parts.pop();
    parts.forEach(function (part) {
      emitter.emit('data', part);
    });
  };
}

//
// This function is called by external
// systems over the serial port
//
function incoming(msg) {
  if (msg.name === 'reset') {
    resetCap();
  }
}

function pollAndEmit() {
  debug({ type: 'msg', data: 'poll' });

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
      // sensors.cap = E.connect(pins.I2C.instance);
      // sensors.cap.linkLedsToSensors();
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
  sensors.cap = E.connect(pins.I2C.instance, { resetPin: pins.cap.reset });
  sensors.cap.reset();

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
