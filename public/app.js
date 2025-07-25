const outputs = ["Output1", "Output2", "Output3", "Output4"];
const inputs = ["Input1", "Input2", "Input3", "Input4"];

let port;
let reader;
let writer;

const statusElem = document.getElementById('status');
const connectBtn = document.getElementById('connect');
const disconnectBtn = document.getElementById('disconnect');
const blFile = document.getElementById('bl-file');
const blStart = document.getElementById('bl-start');
const blProgress = document.getElementById('bl-progress');
const blLog = document.getElementById('bl-log');
const outputsContainer = document.getElementById('io-outputs');
const inputsContainer = document.getElementById('io-inputs');
const ioLog = document.getElementById('io-log');

function logBoot(msg){
  if(blLog){
    blLog.textContent += msg + '\n';
    blLog.scrollTop = blLog.scrollHeight;
  }
}
function logIO(msg){
  if(ioLog){
    ioLog.textContent += msg + '\n';
    ioLog.scrollTop = ioLog.scrollHeight;
  }
}

async function connect(){
  try{
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    writer = port.writable.getWriter();
    reader = port.readable.pipeThrough(new TextDecoderStream()).getReader();
    readLoop();
    statusElem.textContent = 'Connected';
  }catch(err){
    statusElem.textContent = 'Error: ' + err;
  }
}

async function disconnect(){
  if(reader){
    await reader.cancel().catch(()=>{});
    reader = null;
  }
  if(writer){
    writer.releaseLock();
    writer = null;
  }
  if(port){
    await port.close().catch(()=>{});
    port = null;
  }
  statusElem.textContent = 'Disconnected';
}

connectBtn.addEventListener('click', connect);
disconnectBtn.addEventListener('click', disconnect);

function createIO(){
  outputs.forEach((name,i)=>{
    const id = `out${i}`;
    const div = document.createElement('div');
    div.className = 'form-check';
    div.innerHTML = `<input class="form-check-input" type="checkbox" id="${id}"> <label class="form-check-label" for="${id}">${name}</label>`;
    outputsContainer.appendChild(div);
    document.getElementById(id).addEventListener('change', sendOutputs);
  });

  inputs.forEach((name,i)=>{
    const id = `in${i}`;
    const div = document.createElement('div');
    div.id = id;
    div.textContent = `${name}: ?`;
    inputsContainer.appendChild(div);
  });
}

createIO();

async function readLoop(){
  let buffer = '';
  while(port && reader){
    const {value, done} = await reader.read();
    if(value){
      buffer += value;
      let idx;
      while((idx = buffer.indexOf('\n')) !== -1){
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        handleLine(line);
      }
    }
    if(done) break;
  }
}

function handleLine(line){
  logBoot('< ' + line);
  logIO('< ' + line);
  try{
    const msg = JSON.parse(line);
    if(msg.inputs){
      msg.inputs.forEach((v,i)=>{
        const elem = document.getElementById('in'+i);
        if(elem) elem.textContent = `${inputs[i]}: ${v}`;
      });
    }
  }catch(e){
    // not JSON
  }
}

async function sendOutputs(){
  if(!writer) return;
  const values = outputs.map((_,i)=>document.getElementById('out'+i).checked ? 1 : 0);
  const obj = { outputs: values };
  const text = JSON.stringify(obj) + '\n';
  await writer.write(new TextEncoder().encode(text));
  logIO('> ' + text.trim());
}

blStart.addEventListener('click', startBootloader);

async function startBootloader(){
  if(!writer || !blFile.files.length) return;
  const file = blFile.files[0];
  const text = await file.text();
  const lines = text.split(/\r?\n/);
  blProgress.style.width = '0%';
  for(let i=0;i<lines.length;i++){
    const line = lines[i];
    await writer.write(new TextEncoder().encode(line + '\n'));
    logBoot('> ' + line);
    const pct = Math.round(((i+1)/lines.length)*100);
    blProgress.style.width = pct + '%';
  }
}
