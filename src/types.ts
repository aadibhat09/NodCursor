export interface CursorSettings {
  cameraId: string;
  mirrorCamera: boolean;
  sensitivity: number;
  horizontalSensitivity: number;
  verticalSensitivity: number;
  deadzone: number;
  smoothing: number;
  dwellMs: number;
  dwellMoveTolerance: number;
  clickSensitivity: number;
  doubleBlinkWindowMs: number;
  consecutiveBlinkGapMs: number;
  longBlinkMs: number;
  stabilization: boolean;
  blinkEnabled: boolean;
  mouthEnabled: boolean;
  mouthClickCooldownMs: number;
  smileDoubleClickCooldownMs: number;
  headTiltScrollEnabled: boolean;
  tiltScrollThreshold: number;
  tiltScrollStep: number;
  tiltScrollCooldownMs: number;
  voiceEnabled: boolean;
  acceleration: number;
}

export interface CalibrationData {
  centerX: number;
  centerY: number;
  leftX: number;
  rightX: number;
  upY: number;
  downY: number;
  calibrated: boolean;
}

export interface TrackingState {
  x: number;
  y: number;
  confidence: number;
  blink: boolean;
  doubleBlink: boolean;
  longBlink: boolean;
  mouthOpen: boolean;
  smile: boolean;
  headTilt: number;
  dragMode: boolean;
  source: 'camera' | 'fallback';
}
