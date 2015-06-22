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

//
// Distance sensor (HC-SR04)
//
// var sensor = require("HC-SR04").connect(/* trig */ DISTANCE_TRIGGER, /* echo */ DISTANCE_ECHO, function(dist) {
//   emit({ type: 'distance', value: dist, unit: 'cm' });
// });

// Setup I2C
I2C1.setup({ scl: I2C_SCL, sda: I2C_SDA });

//
// Digital accelerometer and gyro (MPU6050)
//
// var mpu = require("MPU6050").connect(I2C1);

//
// Capacitive breakout (CAP1188)
//
var cap = require('CAP1188').connect(I2C1);

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

setTimeout(function () { shouldEmit = true; }, shouldEmitTimeout);

