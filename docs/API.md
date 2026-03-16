# NodCursor API Reference

This file documents the current runtime APIs and settings model used by the app.

## Core Runtime Flow

1. `useFaceTracking` captures landmarks from MediaPipe and posts normalized signals to `trackingWorker`.
2. `trackingWorker` applies smoothing + blink state logic and returns gesture signals.
3. `useCursorMapping` converts normalized tracking coordinates to viewport coordinates.
4. `useSmoothCursor` applies motion smoothing for stable cursor movement.
5. `useGestureControls` and `useMouthTypingControls` convert signals into UI actions and synthetic pointer events.

## App Context

Location: `src/context/AppContext.tsx`

- `settings`: active `CursorSettings` profile (desktop or mobile auto-profile)
- `setSettings(updater)`: persisted settings update
- `calibration` + `setCalibration`: calibration state
- `isPhoneMode`: profile switch based on viewport/pointer media query

## Key Hooks

### `useFaceTracking(settings, calibration)`

Location: `src/hooks/useFaceTracking.ts`

Returns:

```ts
{
  state: TrackingState;
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraError: string | null;
  availableCameras: MediaDeviceInfo[];
}
```

Notes:

- Stream/model lifecycle depends on `cameraId` changes.
- Frequently tuned values are passed to worker via refs without reinitializing camera/model.

### `useCursorMapping(rawX, rawY, calibration, settings)`

Location: `src/hooks/useCursorMapping.ts`

- Applies calibration mapping + deadzone.
- Uses global sensitivity and axis-specific multipliers (`horizontalSensitivity`, `verticalSensitivity`).
- Applies acceleration curve and viewport adaptation.

### `useDwellClick(x, y, dwellMs, moveTolerance, onClick)`

Location: `src/hooks/useDwellClick.ts`

- Starts progress while cursor remains within `moveTolerance`.
- Triggers click callback at completion and resets progress.

### `useGestureControls(settings, input, handlers?, enabled?)`

Location: `src/hooks/useGestureControls.ts`

- Blink/double-blink/long-blink to pointer actions.
- Mouth/smile optional click actions with cooldown settings.
- Head-tilt scroll with threshold, cooldown, and step controls.

### `useMouthTypingControls(active, input, options)`

Location: `src/hooks/useMouthTypingControls.ts`

Input options:

```ts
{
  advanceCooldownMs: number;
  selectCooldownMs: number;
  backspaceCooldownMs: number;
}
```

Behavior:

- Mouth open advances key focus.
- Smile selects focused key.
- Double blink triggers backspace.
- Includes smart punctuation insertion and shift toggle support.

## Worker Contract

Location: `src/workers/trackingWorker.ts`

Input includes:

- `point`, `smoothing`, `clickSensitivity`
- `doubleBlinkWindowMs`, `consecutiveBlinkGapMs`, `longBlinkMs`
- `blinkRatio`, `mouthRatio`, `smileRatio`, `headTilt`

Output includes:

- cursor point, blink/double/long blink flags
- mouth/smile/headTilt signals
- drag mode signal

## Types

Location: `src/types.ts`

`CursorSettings` contains controls for:

- camera, mirroring, cursor speed, axis multipliers, deadzone, acceleration
- dwell timing + movement tolerance
- blink threshold + timing windows
- mouth gesture cooldowns and mouth-typing cooldowns
- tilt scroll threshold/step/cooldown
- toggles for stabilization, blink, mouth, tilt-scroll, and voice

## Documentation Map

- Product overview & story: `src/pages/Documentation/DocumentationPage.tsx` (`/documentation/*`)
- API details: `docs/API.md`
- Accessibility workflow: `docs/ACCESSIBILITY_GUIDE.md`
- Contribution guide: `CONTRIBUTING.md`
  onKeyPress: (key: string) => void;
}
```

**Returns:**
```typescript
{
  selectedIndex: number;          // Currently highlighted key (0-35)
  selectedKey: KeyboardKey;       // { label, value, type }
  advanceKey: () => void;         // Manually advance to next
  selectKey: () => void;          // Manually select current
  clearAll: () => void;           // Reset to index 0
}
```

**Gesture Mapping:**
- **Mouth Open** → Advance to next key (wraparound at end)
- **Smile** → Select highlighted key
- **Double Blink** → Backspace (delete last character)

---

## Utility Hooks

### useCameraDevices

**Purpose:** Lightweight camera enumeration without initializing MediaPipe.

**Location:** `src/hooks/useCameraDevices.ts`

**Returns:**
```typescript
{
  cameras: MediaDeviceInfo[];
  isLoading: boolean;
  error: string | null;
}
```

**Why Separate Hook?**
- Settings page needs camera list but not full tracking
- Avoids unnecessary MediaPipe initialization overhead
- Faster page load and lower resource usage

---

## Components

### CursorOverlay

**Purpose:** Visual indicator for head-controlled cursor position.

**Location:** `src/components/CursorOverlay.tsx`

**Props:**
```typescript
{
  x: number;              // Cursor X position (px)
  y: number;              // Cursor Y position (px)
  isDragging?: boolean;   // Show drag state styling
}
```

**Visual Elements:**
- Cyan circle (12px diameter) at cursor position
- Pulsing glow effect on hover
- Red border when dragging active
- Hardware-accelerated with `will-change: transform`

---

### CalibrationUI

**Purpose:** Multi-step guided calibration flow.

**Location:** `src/components/CalibrationUI.tsx`

**Props:**
```typescript
{
  currentStep: number;          // 0-4 (center, left, right, up, down)
  onCapture: () => void;        // Callback when user clicks "Capture"
  isComplete: boolean;          // Show completion state
}
```

**Calibration Steps:**
1. **Center** (step 0): Neutral head position
2. **Left** (step 1): Turn head left
3. **Right** (step 2): Turn head right
4. **Up** (step 3): Tilt head up
5. **Down** (step 4): Tilt head down

---

### SettingsPanel

**Purpose:** Centralized configuration for all tracking parameters.

**Location:** `src/components/SettingsPanel/SettingsPanel.tsx`

**Props:**
```typescript
{
  settings: CursorSettings;
  onUpdate: (newSettings: Partial<CursorSettings>) => void;
  cameras: MediaDeviceInfo[];
}
```

**Settings Exposed:**
- Cursor Control: Speed, Smoothing, Deadzone
- Gestures: Blink/Mouth/Smile toggles, Click Sensitivity
- Dwell Click: Enabled, Dwell Time
- Voice Commands: Enabled
- Head Tilt Scroll: Enabled, Tilt Threshold
- Camera: Device selection
- Debug: Debug Mode toggle

---

### OnScreenKeyboard

**Purpose:** Virtual keyboard for gesture-based typing.

**Location:** `src/components/OnScreenKeyboard.tsx`

**Props:**
```typescript
{
  selectedIndex: number;         // Highlighted key (0-35)
  onKeySelect: (key: string) => void;
  visible: boolean;
  typingMode: boolean;          // Show typing mode indicator
  currentText: string;          // Display entered text
}
```

**Keyboard Layout:**
- 26 letters (a-z)
- 10 numbers (0-9)
- 4 actions (SPACE, BACKSPACE, CLEAR, ENTER)

---

## Context & State

### AppContext

**Purpose:** Global application state for settings and calibration.

**Location:** `src/context/AppContext.tsx`

**Provided State:**
```typescript
{
  settings: CursorSettings;
  calibration: CalibrationData | null;
  setSettings: (settings: CursorSettings) => void;
  setCalibration: (calibration: CalibrationData) => void;
}
```

**CursorSettings Type:**
```typescript
{
  cursorSpeed: number;
  smoothing: number;
  deadzone: number;
  clickBlinkEnabled: boolean;
  mouthClickEnabled: boolean;
  smileDoubleClickEnabled: boolean;
  clickSensitivity: number;
  dwellClickEnabled: boolean;
  dwellTimeMs: number;
  voiceCommandsEnabled: boolean;
  headTiltScrollEnabled: boolean;
  tiltThreshold: number;
  debugMode: boolean;
  cameraId: string;
}
```

**CalibrationData Type:**
```typescript
{
  center: { x: number; y: number };
  left: { x: number; y: number };
  right: { x: number; y: number };
  up: { x: number; y: number };
  down: { x: number; y: number };
}
```

**Persistence:**
Settings and calibration saved to `localStorage`:
- Key: `nodcursor-settings`
- Key: `nodcursor-calibration`

---

## Types & Interfaces

### TrackingState

**Location:** `src/types.ts`

```typescript
interface TrackingState {
  landmarks: NormalizedLandmark[] | null;
  eyeState: { left: number; right: number };
  mouthState: { isOpen: boolean; smileDegree: number };
  headRotation: { roll: number };
  isTracking: boolean;
  error: string | null;
}
```

### GestureInput

```typescript
interface GestureInput {
  singleBlink: boolean;
  doubleBlink: boolean;
  longBlink: boolean;
  mouthOpen: boolean;
  smile: boolean;
}
```

### KeyboardKey

```typescript
type KeyType = 'LETTER' | 'NUMBER' | 'ACTION';

interface KeyboardKey {
  label: string;    // Display text
  value: string;    // Actual character to insert
  type: KeyType;
}
```

---

## Workers

### trackingWorker

**Purpose:** Off-thread processing for smoothing and gesture state machines.

**Location:** `src/workers/trackingWorker.ts`

**Input Message:**
```typescript
{
  type: 'smooth';
  data: {
    landmarks: NormalizedLandmark[];
    eyeState: { left: number; right: number };
    mouthState: { isOpen: boolean; smileDegree: number };
    headRotation: { roll: number };
    smoothing: number;
  }
}
```

**Output Message:**
```typescript
{
  type: 'smoothed';
  landmarks: NormalizedLandmark[];
  eyeState: { left: number; right: number };
  mouthState: { isOpen: boolean; smileDegree: number };
  headRotation: { roll: number };
  blinkState: {
    singleBlink: boolean;
    doubleBlink: boolean;
    longBlink: boolean;
  };
}
```

**Smoothing Algorithm:**
```typescript
// Exponential Moving Average
smoothedValue = alpha * currentValue + (1 - alpha) * previousValue
```

**Why Web Worker?**
- Offloads processing from main thread
- Prevents UI jank during intensive computation
- Maintains 60fps camera processing

---

## Utilities

### dispatchMouseEvent

**Purpose:** Programmatically create and dispatch DOM mouse events.

**Location:** `src/hooks/useGestureControls.ts`

**Signature:**
```typescript
function dispatchMouseEvent(
  type: 'click' | 'mousedown' | 'mouseup' | 'contextmenu',
  x: number,
  y: number
): void
```

**Implementation:**
```typescript
const element = document.elementFromPoint(x, y);
if (element) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y
  });
  element.dispatchEvent(event);
}
```

---

### buildKeyboardKeys

**Purpose:** Generate keyboard layout array.

**Location:** `src/components/OnScreenKeyboard.tsx`

**Returns:**
```typescript
KeyboardKey[]  // 36 keys total
```

---

## Performance Considerations

### Optimization Techniques

**Web Worker Processing:**
- Smoothing runs off main thread
- Prevents UI blocking during computation
- Maintains 60fps camera updates

**Transform-based Positioning:**
```typescript
// Use transform instead of left/top for 60fps
transform: `translate(${x}px, ${y}px)`;
will-change: transform;
```

**MediaPipe Optimization:**
- Disabled `outputFaceBlendshapes` (reduces processing)
- VIDEO mode instead of IMAGE (optimized for streams)
- Limited landmark subset for cursor (only nose tip)

---

**For questions or contributions, see [README.md](../README.md#contributing) and [ACCESSIBILITY_GUIDE.md](./ACCESSIBILITY_GUIDE.md).**
