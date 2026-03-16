/// <reference lib="webworker" />

import { exponentialSmooth } from '../utils/smoothing/exponentialSmoothing';

interface WorkerInput {
  point: { x: number; y: number };
  smoothing: number;
  blinkRatio: number;
  mouthRatio: number;
  smileRatio: number;
  headTilt: number;
  clickSensitivity: number;
  doubleBlinkWindowMs: number;
  consecutiveBlinkGapMs: number;
  longBlinkMs: number;
}

let previous = { x: 0.5, y: 0.5 };
let blinkCount = 0;
let lastBlinkAt = 0;
let blinkStart = 0;

self.onmessage = (event: MessageEvent<WorkerInput>) => {
  const payload = event.data;
  const smoothed = exponentialSmooth(previous, payload.point, payload.smoothing);
  previous = smoothed;

  const now = performance.now();
  const blink = payload.blinkRatio < payload.clickSensitivity;

  if (blink && blinkStart === 0) {
    blinkStart = now;
  }

  if (!blink && blinkStart !== 0) {
    if (now - lastBlinkAt < payload.consecutiveBlinkGapMs) {
      blinkCount += 1;
    } else {
      blinkCount = 1;
    }
    lastBlinkAt = now;
    blinkStart = 0;
  }

  const longBlink = blink && now - blinkStart > payload.longBlinkMs;
  const doubleBlink = blinkCount >= 2 && now - lastBlinkAt < payload.doubleBlinkWindowMs;

  if (doubleBlink) {
    blinkCount = 0;
  }

  postMessage({
    x: smoothed.x,
    y: smoothed.y,
    blink,
    doubleBlink,
    longBlink,
    mouthOpen: payload.mouthRatio > 0.08,
    smile: payload.smileRatio > 0.24,
    headTilt: payload.headTilt,
    dragMode: longBlink
  });
};

export {};
