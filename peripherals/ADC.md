<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Analog to Digital Converter
=======================

* KEYWORDS: Analog,ADC,A2D,Built-In

Analog inputs are easy to read in Espruino:

```analogRead(A0)```

This returns a value between 0 and 1. Internally ADCs in Espruino devices are usually 12 bits, but these are then divided by 4096 (2^12) such that the value is always in the range 0 to 1.

**Note:** Not all pins are capable of Analog Input. See the [[Reference]] for your board ```ADC```.

Using Analog Inputs
------------------------

* APPEND_USES: ADC
