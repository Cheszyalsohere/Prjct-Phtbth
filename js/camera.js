// Mengelola akses webcam via getUserMedia dan menaruh stream ke <video>.

let stream = null;

const video = document.getElementById('video');
const errorPanel = document.getElementById('camera-error');
const errorMsg = document.getElementById('camera-error-msg');
const retryBtn = document.getElementById('retry-camera');

/**
 * Minta akses kamera. Resolve true kalau berhasil, false kalau gagal
 * (panel error otomatis ditampilkan dengan pesan yang sesuai).
 */
export async function startCamera() {
  hideError();

  // Sudah punya stream aktif → pakai ulang, jangan minta izin lagi.
  if (stream && stream.active) {
    video.srcObject = stream;
    return true;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
      audio: false,
    });
    video.srcObject = stream;
    return true;
  } catch (err) {
    showError(messageForError(err));
    return false;
  }
}

function messageForError(err) {
  switch (err.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return { text: 'Akses kamera ditolak. Aktifkan izin kamera di browser lalu coba lagi.', retry: true };
    case 'NotFoundError':
    case 'OverconstrainedError':
      return { text: 'Kamera tidak ditemukan. Pastikan perangkat punya webcam.', retry: false };
    case 'NotReadableError':
      return { text: 'Kamera sedang dipakai aplikasi lain. Tutup aplikasi itu lalu coba lagi.', retry: true };
    default:
      return { text: 'Kamera tidak tersedia. Coba lagi.', retry: true };
  }
}

function showError({ text, retry }) {
  errorMsg.textContent = text;
  retryBtn.hidden = !retry;
  errorPanel.hidden = false;
}

function hideError() {
  errorPanel.hidden = true;
}

export function isReady() {
  return !!(stream && stream.active && video.videoWidth > 0);
}

export function getVideo() {
  return video;
}
