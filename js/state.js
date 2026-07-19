// State global aplikasi. Dibagi antar semua modul.
export const state = {
  layout: 'B',        // 'A' = 3 pose, 'B' = 4 pose
  poseCount: 4,
  timerSeconds: 5,
  mirrorEnabled: true,
  frameColor: '#ffffff',
  photos: [],         // array of HTMLCanvasElement, satu per pose
};

export function setLayout(layout, poseCount) {
  state.layout = layout;
  state.poseCount = poseCount;
}

export function clearPhotos() {
  state.photos = [];
}
