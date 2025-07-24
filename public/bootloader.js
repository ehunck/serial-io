let port;
let reader;
let writer;
const logElem = document.getElementById('log');

function log(msg) {
  logElem.textContent += msg + '\n';
  logElem.scrollTop = logElem.scrollHeight;
}

document.getElementById('connect').addEventListener('click', async () => {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    writer = port.writable.getWriter();
    reader = port.readable.getReader();
    log('Connected');
  } catch (err) {
    log('Error: ' + err);
  }
});

document.getElementById('send').addEventListener('click', async () => {
  const fileInput = document.getElementById('file');
  if (!fileInput.files.length || !writer) return;
  const file = fileInput.files[0];
  const text = await file.text();
  const encoder = new TextEncoder();
  for (const line of text.split(/\r?\n/)) {
    await writer.write(encoder.encode(line + '\n'));
    log('> ' + line);
  }
});
