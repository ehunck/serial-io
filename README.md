# Serial IO

This project implements a small web utility for interacting with a microcontroller using the Web Serial API. It was inspired by the [tackle-sensor-utility](https://github.com/ehunck/tackle-sensor-utility) project.

## Features

- Connect to a serial port directly from the browser.
- Debug interface to control output pins and monitor inputs using JSON packets.
- Simple bootloader page that sends a selected file line by line to the device.

The application is served by a small Express server.

## Running

```bash
npm install
npm start
```

Then open <http://localhost:3000> in a Chromium based browser.
