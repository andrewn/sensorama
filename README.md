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

1. An espruino is found (see Which Espriuno? below)
2. The contents of `espruino/source.js` are used to programme the espruino, requiring any modules from the internet in that source file.
3. A new serial connection will be established to the espruino over USB, receiving sensor data.

## Which Espruino?

If ESPRUINO_SERIAL_NUM is set as a env variable or in the `.env` file, the Espruino with that serial number will be searched for and if connected it will be selected.

If not, all serial ports are searched and the first connected Espruino is selected.