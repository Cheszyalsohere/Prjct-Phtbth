// Wiring event & navigasi antar section.

import { state, setLayout, clearPhotos } from './state.js';
import { startCamera, getVideo } from './camera.js';
import { runSession } from './capture.js';
import { composeStrip } from './compose.js';

const screens = {
  landing: document.getElementById('landing'),
  layout: document.getElementById('choose-layout'),
  camera: document.getElementById('camera'),
  preview: document.getElementById('preview'),
};

const video = getVideo();
const stripCanvas = document.getElementById('strip-canvas');
const startCaptureBtn = document.getElementById('start-capture');
const downloadBtn = document.getElementById('download-btn');
const mirrorToggle = document.getElementById('mirror-toggle');

function show(name) {
  Object.values(screens).forEach((s) => s.classList.remove('is-active'));
  screens[name].classList.add('is-active');
}

// ---------- navigasi via data-action ----------
document.body.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;

  switch (action) {
    case 'go-layout':
      show('layout');
      break;
    case 'back-landing':
      show('landing');
      break;
    case 'back-layout':
      show('layout');
      break;
    case 'retry-camera':
      startCamera();
      break;
    case 'start-capture':
      beginCapture();
      break;
    case 'download':
      downloadStrip();
      break;
    case 'retake':
      retake();
      break;
  }
});

// ---------- pilih layout ----------
document.querySelectorAll('.layout-card').forEach((card) => {
  card.addEventListener('click', async () => {
    setLayout(card.dataset.layout, Number(card.dataset.poses));
    show('camera');
    applyMirror();
    await startCamera();
  });
});

// ---------- timer segmented ----------
const timerGroup = document.getElementById('timer-group');
timerGroup.addEventListener('click', (e) => {
  const seg = e.target.closest('.seg');
  if (!seg) return;
  timerGroup.querySelectorAll('.seg').forEach((s) => s.classList.remove('is-selected'));
  seg.classList.add('is-selected');
  state.timerSeconds = Number(seg.dataset.timer);
});

// ---------- mirror toggle ----------
mirrorToggle.addEventListener('click', () => {
  state.mirrorEnabled = !state.mirrorEnabled;
  mirrorToggle.setAttribute('aria-pressed', String(state.mirrorEnabled));
  mirrorToggle.textContent = state.mirrorEnabled ? 'On' : 'Off';
  applyMirror();
});

function applyMirror() {
  video.classList.toggle('mirrored', state.mirrorEnabled);
}

// ---------- capture ----------
async function beginCapture() {
  startCaptureBtn.disabled = true;
  try {
    await runSession();
    composeStrip(stripCanvas);
    downloadBtn.disabled = false;
    show('preview');
  } finally {
    startCaptureBtn.disabled = false;
  }
}

// ---------- warna frame ----------
const swatches = document.getElementById('color-swatches');
swatches.addEventListener('click', (e) => {
  const sw = e.target.closest('.swatch');
  if (!sw) return;
  swatches.querySelectorAll('.swatch').forEach((s) => s.classList.remove('is-selected'));
  sw.classList.add('is-selected');
  state.frameColor = sw.dataset.color;
  composeStrip(stripCanvas);
});

// ---------- download ----------
function downloadStrip() {
  const url = stripCanvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `photobooth-${Date.now()}.png`;
  a.click();
}

// ---------- retake ----------
function retake() {
  clearPhotos();
  document.getElementById('shots-preview').innerHTML = '';
  document.getElementById('pose-counter').textContent = `0/${state.poseCount}`;
  downloadBtn.disabled = true;
  show('camera');
  applyMirror();
  startCamera(); // stream lama dipakai ulang, tidak minta izin lagi
}

// download awalnya disabled sampai strip ter-compose
downloadBtn.disabled = true;
