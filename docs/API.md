# NodCursor API and Runtime Specification

This document is a technical reference for the current runtime behavior of NodCursor.
It is written for maintainers, reviewers, and instructors who need implementation-level detail.

---

## 1) Runtime Architecture (Concrete)

### 1.1 Main Pipeline

1. **Camera acquisition** (`getUserMedia`) starts in `useFaceTracking`.
2. **Face inference** runs through MediaPipe `FaceLandmarker` in `VIDEO` mode.
3. **Signal extraction** computes normalized features:
   - Nose anchor (`x`, `y`)
   - Eye aspect ratio proxy (`blinkRatio`)
   - Mouth gap proxy (`mouthRatio`)
   - Smile width proxy (`smileRatio`)
   - Brow differential (`headTilt`)
4. **Worker offload** posts signal payload to `trackingWorker`.
5. **Worker smoothing/state machine** computes smoothed cursor + blink event states.
6. **Viewport mapping** (`useCursorMapping`) transforms normalized coordinates into calibrated screen-space.
7. **Second-stage rendering smoothing** (`useSmoothCursor`) reduces visual snapping.
8. **Action interpretation** (`useGestureControls`, `useDwellClick`, `useMouthTypingControls`, `useVoiceCommands`) dispatches UI and synthetic pointer events.

### 1.2 Threading Model

- **Main thread**: camera stream, MediaPipe inference, rendering, event dispatch.
- **Web Worker**: temporal smoothing and blink sequence logic.
- **Goal**: keep high-frequency smoothing logic off the UI path to improve interactivity.

---

## 2) Module Contracts

## 2.1 App Context

**Location:** `src/context/AppContext.tsx`

### Provided API

- `settings: CursorSettings`
- `setSettings(updater: (prev: CursorSettings) => CursorSettings): void`
- `isPhoneMode: boolean`
- `calibration: CalibrationData`
- `setCalibration(next: CalibrationData): void`

### Persistence behavior

- Desktop profile key: `head-cursor-settings-desktop`
- Mobile profile key: `head-cursor-settings-mobile`
- Legacy compatibility key: `head-cursor-settings`
- Migration key: `head-cursor-mirror-flipped-v2`

Profiles are selected dynamically with media query:
- `(max-width: 768px), (pointer: coarse)`

---

## 2.2 useFaceTracking

**Location:** `src/hooks/useFaceTracking.ts`

### Signature

```ts
useFaceTracking(settings: CursorSettings, calibration: CalibrationData): {
  state: TrackingState;
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraError: string | null;
  availableCameras: MediaDeviceInfo[];
  lightState: AdaptiveLightState | null;
}
```

### Responsibilities (SRP-aligned)

1. Camera lifecycle management.
2. Face model lifecycle management.
3. Frame pacing and inference scheduling.
4. Feature extraction from landmarks.
5. Worker message exchange.
6. Adaptive light estimation integration.
7. Fallback mouse source when camera path is unavailable.

### Performance safeguards

- Detection is **paced** using a dynamic interval instead of unconditional per-frame inference.
- Update commits to React state are skipped for negligible movement + no gesture changes.
- Camera constraints are tuned periodically (not every frame).
- Inference is skipped when video element is not `readyState >= 2`.

---

## 2.3 Adaptive Light Learner

**Location:** `src/utils/ml/adaptiveLightLearner.ts`

### Purpose

Implements a lightweight online learner (EMA-based) that adapts processing cadence and blink sensitivity under changing lighting conditions.

### Exposed types

```ts
interface AdaptiveLightState {
  brightness: number;              // normalized [0, 1]
  contrast: number;                // normalized [0, 1]
  quality: number;                 // aggregate quality [0, 1]
  recommendation: 'low-light' | 'balanced' | 'bright';
  detectionIntervalMs: number;     // target cadence hint
  blinkSensitivityMultiplier: number;
}
```

### Learning behavior

- Uses exponential moving updates (`alpha = 0.08`) over sampled luma statistics.
- Combines brightness/contrast into a scalar quality score.
- Outputs:
  - A camera condition recommendation.
  - Inference pacing recommendation (`~33–66ms` range with warmup bias).
  - Blink threshold adjustment multiplier (`0.9–1.15`).

### Why this is “ML-style”

This is an **online adaptive model** (streaming parameter update over observations), not a static if-else rule table. It continuously re-estimates environment quality and influences downstream inference behavior.

---

## 2.4 trackingWorker

**Location:** `src/workers/trackingWorker.ts`

### Input contract

```ts
{
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
```

### Output contract

```ts
{
  x: number;
  y: number;
  blink: boolean;
  doubleBlink: boolean;
  longBlink: boolean;
  mouthOpen: boolean;
  smile: boolean;
  headTilt: number;
  dragMode: boolean;
}
```

### State machine summary

- `blink` is level-based (`blinkRatio < clickSensitivity`).
- `longBlink` is duration-based.
- `doubleBlink` uses count + timing windows.
- `dragMode` follows long blink behavior.

---

## 2.5 Mapping and Action Hooks

### useCursorMapping

**Location:** `src/hooks/useCursorMapping.ts`

- Converts normalized source to calibrated viewport coordinates.
- Applies deadzone, axis sensitivity, acceleration curve.
- Honors mirror mode upstream in `useFaceTracking` mapping input.

### useDwellClick

**Location:** `src/hooks/useDwellClick.ts`

- Tracks cursor stability against `dwellMoveTolerance`.
- Triggers callback after `dwellMs` of stability.

### useGestureControls

**Location:** `src/hooks/useGestureControls.ts`

- Consumes worker gesture signals and dispatches app actions.
- Handles blink/right-click/drag and optional mouth + tilt scrolling.

### useMouthTypingControls

**Location:** `src/hooks/useMouthTypingControls.ts`

- Maps mouth and smile actions to keyboard scanning + select behavior.
- Uses three independent cooldown controls for repeat suppression.

---

## 3) Data Types

**Location:** `src/types.ts`

### CursorSettings (selected groups)

1. **Camera + rendering**: `cameraId`, `mirrorCamera`, `stabilization`
2. **Movement dynamics**: `sensitivity`, axis sensitivities, `deadzone`, `smoothing`, `acceleration`
3. **Dwell click**: `dwellMs`, `dwellMoveTolerance`
4. **Blink timing**: `clickSensitivity`, `doubleBlinkWindowMs`, `consecutiveBlinkGapMs`, `longBlinkMs`
5. **Mouth typing timing**: advance/select/backspace cooldowns
6. **Head tilt scrolling**: enable + threshold + step + cooldown
7. **Voice**: `voiceEnabled`

### TrackingState

- Cursor coordinates (`x`, `y`)
- Confidence and source (`camera` or fallback)
- Gesture booleans
- Drag mode state

---

## 4) Deploy/Production Notes

1. Build command: `npm run build`
2. Bundler: Vite + TypeScript project references (`tsc -b`)
3. MediaPipe assets are pulled from explicit remote URLs; CORS/network access is required at runtime.
4. Browser must support:
   - `navigator.mediaDevices.getUserMedia`
   - Web Workers
   - `requestAnimationFrame`
5. Camera permissions must be granted by the end-user per origin.

### Production troubleshooting

- If camera feed fails only in production, validate HTTPS origin and permission prompts.
- If tracking is unstable in production, compare camera resolution/fps constraints across environments.
- If first-load delay is high, this is usually MediaPipe asset fetch + model initialization.

---

## 5) Evaluation Metrics (for demos/reports)

Suggested measurable metrics for classroom/project presentation:

1. **End-to-end latency**: head motion to cursor motion (ms)
2. **Steady-state jitter**: std-dev of cursor when user is still
3. **False click rate**: accidental click events per minute
4. **Target acquisition time**: average time to activate a fixed-size target
5. **Session fatigue proxy**: performance drift over 15-minute run

---

## 6) Related Docs

- `docs/ACCESSIBILITY_GUIDE.md`
- `docs/TYPING_SYSTEM.md`
- `docs/WHY_WE_STARTED.md`
- `CONTRIBUTING.md`
