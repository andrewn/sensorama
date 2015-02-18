Sensorama
====

Connects to a range of sensors via a microcontroller
bridge and controls a radiodan app.

## Requirements

- mpd
- rabbitmq
- node.js

## Installation

First [espruino-tools](https://github.com/espruino/espruino-tools) must be installed and the `espruinotool` must be available in the path.

Then:

    git clone https://github.com/radiodan/sensorama.git
    cd sensorama
    npm install

## Running

    npm start

This will start the radiodan server (for controlling audio) and `main.js`.

`main.js` runs as follows:

1. Given the espruino's serial number, all serial ports are searched for a matching espruino.
2. The contents of `espruino/source.js` are used to programme the espruino, requiring any modules from the internet in that source file.
3. A new serial connection will be established to the espruino, receiving sensor data.

