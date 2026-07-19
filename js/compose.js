// Menggabungkan foto-foto di state.photos menjadi satu canvas strip.

import { state } from './state.js';

// Ukuran strip dalam pixel (rasio ~6x2 inci). Foto rasio 4:3.
const STRIP_W = 600;
const PADDING = 30;      // margin luar
const GAP = 18;          // jarak antar foto
const FOOTER = 70;       // ruang tulisan bawah
const PHOTO_RATIO = 3 / 4; // tinggi/lebar tiap foto

/**
 * Render strip ke canvas target sesuai state.photos, layout, dan frameColor.
 * Aman dipanggil ulang (mis. saat ganti warna frame).
 */
export function composeStrip(canvas) {
  const photos = state.photos;
  const n = photos.length;
  if (n === 0) return;

  const photoW = STRIP_W - PADDING * 2;
  const photoH = Math.round(photoW * PHOTO_RATIO);
  const stripH = PADDING + n * photoH + (n - 1) * GAP + FOOTER;

  canvas.width = STRIP_W;
  canvas.height = stripH;
  const ctx = canvas.getContext('2d');

  // background / frame
  ctx.fillStyle = state.frameColor;
  ctx.fillRect(0, 0, STRIP_W, stripH);

  // tiap foto
  photos.forEach((photo, i) => {
    const y = PADDING + i * (photoH + GAP);
    drawCover(ctx, photo, PADDING, y, photoW, photoH);
  });

  // footer text
  const footerY = PADDING + n * photoH + (n - 1) * GAP;
  ctx.fillStyle = pickInk(state.frameColor);
  ctx.textAlign = 'center';
  ctx.font = '700 22px "Segoe UI", system-ui, sans-serif';
  ctx.fillText('photobooth', STRIP_W / 2, footerY + 34);
  ctx.font = '400 14px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(dateStamp(), STRIP_W / 2, footerY + 54);
}

// Gambar sumber dengan object-fit: cover ke kotak tujuan.
function drawCover(ctx, src, dx, dy, dw, dh) {
  const sw = src.width;
  const sh = src.height;
  const scale = Math.max(dw / sw, dh / sh);
  const cw = dw / scale;
  const ch = dh / scale;
  const sx = (sw - cw) / 2;
  const sy = (sh - ch) / 2;
  ctx.drawImage(src, sx, sy, cw, ch, dx, dy, dw, dh);
}

// Pilih warna teks kontras (hitam/putih) berdasar terangnya frame.
function pickInk(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#2a2622' : '#ffffff';
}

function dateStamp() {
  const d = new Date();
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}
