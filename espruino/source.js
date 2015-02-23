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
CAP1188.prototype.getBit = function(byte, position) {
  return (1 == ((byte >> position) & 1));
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

/* Set more bits in a register */
CAP1188.prototype.query = function(reg, qty) {
  I2C1.writeTo(this.addr, reg);
  return I2C1.readFrom(this.addr, qty);
};

exports.connect = function (_i2c,_addr) {
  return new CAP1188(_i2c,_addr);
};


})();

/*
  Generic helper methods
*/
function emit(msg) {
  USB.println( JSON.stringify(msg) );
}

/*
  Distance sensor (HC-SR04)
*/
// var sensor = require("HC-SR04").connect(A0,A1,function(dist) {
//   emit({ type: 'distance', value: dist, unit: 'cm' });
// });
// setInterval(function() {
//   sensor.trigger(); // send pulse
// }, 500);

/*
  Digital accelerometer and gyro (MPU6050)
*/
I2C1.setup({scl:B6,sda:B7});
var mpu = require("MPU6050").connect(I2C1);
setInterval(function () {
  emit({ type: 'accel', unit: 'raw', xyz : mpu.getAcceleration() });
  emit({ type: 'gyro', unit: 'deg', xyz : mpu.getDegreesPerSecond() });
  //mpu.getAcceleration(); // returns an [x,y,z] array with raw accl. data
  //mpu.getGravity();  // returns acceleration array in G's
  //mpu.getRotation(); // returns an [x,y,z] array with raw gyro data
  //mpu.getDegreesPerSecond(); // returns gyro array in degrees/s
}, 1000);

/*
  Capacitive breakout (CAP1188)
*/
var cap = exports.connect(I2C1);
setInterval(function () {
  emit({ type: 'cap', unit: 'touched', pins: cap.readTouches() });
}, 100);

/*
  Blink a light
*/
var isOn = false;
setInterval(function () { isOn = !isOn; LED1.write(isOn); }, 1000);
