Sensorama
====

Connects to a range of sensors via a microcontroller
bridge and controls a radiodan app.

The sensors are connected to an [Espruino](http://www.espruino.com/) which connects via USB to a host machine (we use a Raspberry Pi). The Espruino periodically sends the sensor state to the host.

## Requirements

- [mopidy](https://www.mopidy.com/)
- [Radiodan server](https://github.com/radiodan/radiodan.js)
- [Radiodan broker](https://github.com/radiodan/broker)
- [node.js](https://nodejs.org/)

## Installation

First [espruino-tools](https://github.com/espruino/espruino-tools) must be installed and the `espruinotool` must be available in the path.

You can put espruino-tools anywhere on your system:

    cd ~
    git clone https://github.com/espruino/espruino-tools.git
    cd espruino-tools
    sudo npm link

Then install this app:

    git clone https://github.com/radiodan/sensorama.git sensors
    cd sensors
    npm link espruino-tools
    cd ./node_modules/espruino-tools
    git submodule add https://github.com/espruino/EspruinoTools.git
    cd ../..
    npm install

## Programming the Espruino

The espruino only needs to be programmed once. This program is saved onto the flash memory and will run each time the Espruino is powered up.

This step requires internet access, since any required modules are downloaded from the espruino website.

To programme, run the following:

    bin/programmer

## Running

### For development locally

Start the radiodan server and broker. Then run:

    PORT=5000 bin/app

### Starting automatically

Copy the supervisor script into place and enable it:

    cp radiodan-type-sensors.conf /etc/supervisor/available/radiodan-type-sensors.conf
    sudo radiodan-device-type radiodan-type-sensors.conf

## Which Espruino?

If ESPRUINO_SERIAL_NUM is set as a env variable or in the `.env` file, the Espruino with that serial number will be searched for and if connected it will be selected.

If not, all serial ports are searched and the first connected Espruino is selected.

## Pins

### MRC522 RFID

| Pico | MRC 522 |
| B1   | SDA     |
| B3   | SCK     |
| B5   | MOSI    |
| B4   | MISO    |
| GND  | GND     |
| VCC  | 3.3V    |

### CAP1188

| Pico   | CAP1188 |
| Pi GND | GND     |
| Pi 3V3 | VIN     |
| B6     | SCK     |
| B7     | SDA     |
| B15    | RESET   |

