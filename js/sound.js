// Efek suara via Web Audio API (tanpa file audio eksternal).

let ctx = null;

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
  }
  // Browser sering start dalam keadaan 'suspended' sampai ada interaksi user.
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function beep(freq, duration, { type = 'sine', gain = 0.18 } = {}) {
  const c = getCtx();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(g);
  g.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

// Tick tiap detik countdown (nada rendah), dan nada tinggi pada detik terakhir.
export function playTick(isLast = false) {
  beep(isLast ? 988 : 660, isLast ? 0.22 : 0.1, { type: 'triangle' });
}

// Suara jepretan: burst noise pendek menyerupai shutter kamera.
export function playShutter() {
  const c = getCtx();
  const duration = 0.08;
  const buffer = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length); // decay
  }
  const src = c.createBufferSource();
  const g = c.createGain();
  g.gain.value = 0.25;
  src.buffer = buffer;
  src.connect(g);
  g.connect(c.destination);
  src.start();
}
