export interface CursorSettings {
  cameraId: string;
  sensitivity: number;
  deadzone: number;
  smoothing: number;
  dwellMs: number;
  clickSensitivity: number;
  stabilization: boolean;
  blinkEnabled: boolean;
  mouthEnabled: boolean;
  headTiltScrollEnabled: boolean;
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
