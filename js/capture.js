// Menjalankan sesi capture: countdown per pose lalu ambil frame video ke canvas.

import { state } from './state.js';
import { getVideo, isReady } from './camera.js';

const overlay = document.getElementById('countdown-overlay');
const numberEl = document.getElementById('countdown-number');
const flash = document.getElementById('flash');
const counterEl = document.getElementById('pose-counter');
const shotsPreview = document.getElementById('shots-preview');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Ambil satu sesi penuh (state.poseCount foto).
 * onProgress(current, total) dipanggil tiap foto selesai.
 * Resolve setelah semua pose terisi.
 */
export async function runSession(onProgress) {
  state.photos = [];
  shotsPreview.innerHTML = '';
  updateCounter(0);

  for (let i = 0; i < state.poseCount; i++) {
    await countdown(state.timerSeconds);
    const canvas = grabFrame();
    state.photos.push(canvas);
    fireFlash();
    addThumb(canvas);
    updateCounter(state.photos.length);
    onProgress?.(state.photos.length, state.poseCount);
    if (i < state.poseCount - 1) await sleep(700); // jeda antar pose
  }
}

async function countdown(seconds) {
  overlay.hidden = false;
  for (let n = seconds; n > 0; n--) {
    numberEl.textContent = n;
    // retrigger animasi pop
    numberEl.style.animation = 'none';
    void numberEl.offsetWidth;
    numberEl.style.animation = '';
    await sleep(1000);
  }
  overlay.hidden = true;
}

function grabFrame() {
  const video = getVideo();
  const w = video.videoWidth || 1280;
  const h = video.videoHeight || 960;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  if (state.mirrorEnabled) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, w, h);
  return canvas;
}

function fireFlash() {
  flash.classList.remove('fire');
  void flash.offsetWidth;
  flash.classList.add('fire');
}

function addThumb(canvas) {
  const img = document.createElement('img');
  img.src = canvas.toDataURL('image/jpeg', 0.7);
  shotsPreview.appendChild(img);
}

function updateCounter(done) {
  counterEl.textContent = `${done}/${state.poseCount}`;
}

export { isReady };
