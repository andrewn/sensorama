/*
  Generic helper methods
*/
function emit(msg) {
  USB.println( JSON.stringify(msg) );
}

/*
  Distance sensor (HC-SR04)
*/
var sensor = require("HC-SR04").connect(A0,A1,function(dist) {
  emit({ type: 'distance', value: dist, unit: 'cm' });
});
setInterval(function() {
  sensor.trigger(); // send pulse
}, 500);

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
  Blink a light
*/
var isOn = false;
setInterval(function () { isOn = !isOn; LED1.write(isOn); }, 1000);

/*
  Disable console to allow message sending
*/
