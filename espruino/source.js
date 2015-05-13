exports = {};
(function () {

/* Copyright (c) 2014 Your Name. See the file LICENSE for copying permission. */
/*
  Module for Adafruit CAP1188 8-Key Capacitive Touch Sensor Breakout
  Only I2C is supported.

  See: https://www.adafruit.com/products/1602
  Bit writing code from: http://www.espruino.com/modules/MPU6050.js
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

function CAP1188(_i2c, _addr) {
  this.i2c = _i2c;
  this.addr = (undefined===_addr) ? C.ADDRESS_DEFAULT : _addr;
  this.initialize();
}

/* Initialize the chip */
CAP1188.prototype.initialize = function() {
  this.linkLedsToSensors();
  this.multipleTouches(true);
  // "Speed up a bit"
  this.i2c.writeTo(this.addr, [R.STANDBY_CONFIG, 0x30]);
};

/* Turn on all LEDs */
// CAP1188.prototype.turnOnLeds = function() {
//   for(var i = 0; i < 8; i++) {
//     this.led(i, 1);
//   }
// };

/* Turn on an LED */
// CAP1188.prototype.led = function(num, enable) {
//   this.writeBit(R.LED_OUTPUT_CONTROL, num, enable);
// };

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


})();

//
// Generic helper methods
//
function emit(msg) {
  USB.println( JSON.stringify(msg) );
  // schedule another timeout?
}

//
// Distance sensor (HC-SR04)
//
// var sensor = require("HC-SR04").connect(/* trig */ A0, /* echo */ A1, function(dist) {
//   emit({ type: 'distance', value: dist, unit: 'cm' });
// });

// Setup I2C
I2C1.setup({scl:B6,sda:B7});

//
// Digital accelerometer and gyro (MPU6050)
//
// var mpu = require("MPU6050").connect(I2C1);

//
// Capacitive breakout (CAP1188)
//
var cap = exports.connect(I2C1);

var isOn = false;
setInterval(function () {
  // Distance sensor
  if (sensor) {
    sensor.trigger();
  }

  // Capacitive
  if (cap) {
    emit({ type: 'cap', unit: 'touched', pins: cap.readTouches() });
  }

  // Gyro
  if (mpu) {
    emit({ type: 'accel', unit: 'raw', xyz : mpu.getAcceleration() });
    emit({ type: 'gyro', unit: 'deg', xyz : mpu.getDegreesPerSecond() });
  }

  // Blink on-board LED
  isOn = !isOn; LED2.write(isOn);
}, 500);

