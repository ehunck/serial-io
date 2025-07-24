const outputs = ["OUT1", "OUT2", "OUT3", "OUT4"];
const inputs = ["IN1", "IN2", "IN3", "IN4"];

const outputContainer = document.getElementById('outputs');
const inputContainer = document.getElementById('inputs');
const logElem = document.getElementById('log');
let port;
let reader;
let writer;

function log(message) {
  logElem.textContent += message + "\n";
  logElem.scrollTop = logElem.scrollHeight;
}

outputs.forEach((name, i) => {
  const id = `out${i}`;
  const div = document.createElement('div');
  div.className = 'form-check';
  div.innerHTML = `<input class="form-check-input" type="checkbox" id="${id}"> <label class="form-check-label" for="${id}">${name}</label>`;
  outputContainer.appendChild(div);
  document.getElementById(id).addEventListener('change', sendOutputs);
});

inputs.forEach((name, i) => {
  const id = `in${i}`;
  const div = document.createElement('div');
  div.id = id;
  div.textContent = `${name}: ?`;
  inputContainer.appendChild(div);
});

async function connect() {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    writer = port.writable.getWriter();
    reader = port.readable.pipeThrough(new TextDecoderStream()).getReader();
    readLoop();
    log('Connected');
  } catch (err) {
    log('Error: ' + err);
  }
}

document.getElementById('connect').addEventListener('click', connect);

async function readLoop() {
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (value) {
      buffer += value;
      let idx;
      while ((idx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        handleMessage(line);
      }
    }
    if (done) break;
  }
}

function handleMessage(line) {
  log('< ' + line);
  try {
    const msg = JSON.parse(line);
    if (msg.inputs) {
      msg.inputs.forEach((v, i) => {
        const elem = document.getElementById('in'+i);
        if (elem) elem.textContent = `${inputs[i]}: ${v}`;
      });
    }
  } catch (e) {
    // not JSON
  }
}

async function sendOutputs() {
  const values = outputs.map((_, i) => document.getElementById('out'+i).checked ? 1 : 0);
  const obj = { outputs: values };
  const text = JSON.stringify(obj) + '\n';
  writer.write(new TextEncoder().encode(text));
  log('> ' + text.trim());
}
