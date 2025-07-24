# Serial IO

This project implements a small web utility for interacting with a microcontroller using the Web Serial API. It was inspired by the [tackle-sensor-utility](https://github.com/ehunck/tackle-sensor-utility) project.

## Features

- Connect to a serial port directly from the browser.
- Debug interface to control output pins and monitor inputs using JSON packets.
- Simple bootloader page that sends a selected file line by line to the device.

The application is served by a small Express server.

## JSON Protocol

All communication between the browser and the microcontroller is line based JSON.
Each message is terminated with a newline (`\n`).

### Controlling outputs

To set the state of the digital outputs the browser sends an object with an
`outputs` array. Each entry is `0` or `1` corresponding to the state of the
output pin.

```json
{"outputs": [1, 0, 0, 1]}
```

### Reporting inputs

The device can report input states by sending an object with an `inputs` array.
Each value represents the current state of the matching input pin.

```json
{"inputs": [0, 1, 1, 0]}
```

## Running

```bash
npm install
npm start
```

Then open <http://localhost:3000> in a Chromium based browser.
