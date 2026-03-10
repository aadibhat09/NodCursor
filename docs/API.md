# NodCursor API Reference

**Comprehensive technical documentation for developers**

---

## Table of Contents

1. [Core Hooks](#core-hooks)
2. [Gesture Hooks](#gesture-hooks)
3. [Utility Hooks](#utility-hooks)
4. [Components](#components)
5. [Context & State](#context--state)
6. [Types & Interfaces](#types--interfaces)
7. [Workers](#workers)
8. [Utilities](#utilities)

---

## Core Hooks

### useFaceTracking

**Purpose:** Core integration with MediaPipe Face Landmarker for facial recognition and tracking.

**Location:** `src/hooks/useFaceTracking.ts`

**Returns:**
```typescript
{
  landmarks: NormalizedLandmark[] | null;  // 478 facial landmarks
  error: string | null;                    // Error message if tracking fails
  isLoading: boolean;                      // True during MediaPipe initialization
  eyeState: { left: number; right: number }; // Blink ratios (0-1)
  mouthState: { isOpen: boolean; smileDegree: number };
  headRotation: { roll: number };         // Head tilt angle in degrees
  startTracking: () => void;              // Begin camera capture
  stopTracking: () => void;               // Stop camera and cleanup
  availableCameras: MediaDeviceInfo[];    // List of camera devices
}
```

**Key Features:**
- Uses global `cameraId` from `AppContext` settings
- Initializes MediaPipe FaceLandmarker with WASM runtime
- Sends tracking data to Web Worker for smoothing
- Automatically restarts when cameraId changes
- Disables blendshapes to reduce MediaPipe verbose logging
- Computes eye aspect ratios for blink detection
- Computes mouth aspect ratio for gesture detection
- Calculates head roll from nose-to-eye-center rotation

**Usage Example:**
```typescript
const { landmarks, eyeState, startTracking, stopTracking } = useFaceTracking();

useEffect(() => {
  startTracking();
  return () => stopTracking();
}, []);
```

---

### useCursorMapping

**Purpose:** Transform nose landmark position to viewport coordinates.

**Location:** `src/hooks/useCursorMapping.ts`

**Parameters:**
```typescript
landmarks: NormalizedLandmark[] | null  // From useFaceTracking
calibration: CalibrationData | null     // From AppContext
settings: CursorSettings                // From AppContext
```

**Returns:**
```typescript
{
  x: number;  // Viewport X coordinate (px)
  y: number;  // Viewport Y coordinate (px)
}
```

**Algorithm:**
1. Extract nose tip position (landmark[1])
2. Apply deadzone filtering (ignore micro-movements)
3. Map calibrated range to viewport dimensions
4. Apply sensitivity multiplier
5. Clamp to screen bounds

**Deadzone Implementation:**
```typescript
const dx = Math.abs(noseX - prevNoseX);
const dy = Math.abs(noseY - prevNoseY);
if (dx < deadzone && dy < deadzone) {
  return prevCursorPosition; // Ignore small movements
}
```

---

### useBlinkDetection

**Purpose:** Interpret eye state into blink events (single, double, long).

**Location:** `src/hooks/useBlinkDetection.ts`

**Parameters:**
```typescript
eyeState: { left: number; right: number }  // From useFaceTracking
clickBlinkEnabled: boolean                  // From settings
clickSensitivity: number                    // From settings (0.15-0.35)
```

**Returns:**
```typescript
{
  onSingleBlink: (callback: () => void) => void;
  onDoubleBlink: (callback: () => void) => void;
  onLongBlink: (callback: () => void) => void;
}
```

**Event Triggers:**
- **Single Blink**: Eye closes for < 300ms, then opens
- **Double Blink**: Two single blinks within 450ms window
- **Long Blink**: Eyes held closed > 900ms

**State Machine:**
```
OPEN → (blink) → CLOSED → (release < 300ms) → SINGLE
                       → (hold > 900ms) → LONG
SINGLE → (blink within 450ms) → DOUBLE
```

---

### useDwellClick

**Purpose:** Trigger clicks by hovering cursor over target for duration.

**Location:** `src/hooks/useDwellClick.ts`

**Parameters:**
```typescript
cursorPos: { x: number; y: number }
dwellTimeMs: number          // 400-2200ms
isEnabled: boolean
```

**Returns:**
```typescript
{
  startDwell: (target: HTMLElement) => void;
  cancelDwell: () => void;
  dwellProgress: number;     // 0-1 for UI progress bar
}
```

**How It Works:**
1. User hovers cursor over element
2. Timer starts counting to `dwellTimeMs`
3. If cursor stays within bounds, click dispatched
4. If cursor leaves, timer resets

---

### useVoiceCommands

**Purpose:** Speech recognition for voice command triggers.

**Location:** `src/hooks/useVoiceCommands.ts`

**Parameters:**
```typescript
isEnabled: boolean
```

**Returns:**
```typescript
{
  listening: boolean;
  lastCommand: string | null;
  onCommand: (command: string, callback: () => void) => void;
}
```

**Supported Commands:**
- "click" → Left click
- "right click" → Right click
- "drag" → Toggle drag mode
- "scroll up" → Page scroll up
- "scroll down" → Page scroll down

**Browser Support:**
- Chrome: ✅ Full support
- Edge: ✅ Full support
- Firefox: ❌ No Web Speech API
- Safari: ⚠️ Limited support

---

## Gesture Hooks

### useGestureControls

**Purpose:** Convert gesture states into actual DOM mouse events.

**Location:** `src/hooks/useGestureControls.ts`

**Parameters:**
```typescript
{
  cursorPos: { x: number; y: number };
  gestureInput: {
    singleBlink: boolean;
    doubleBlink: boolean;
    longBlink: boolean;
    mouthOpen: boolean;
    smile: boolean;
  };
  headRotation: { roll: number };
  settings: CursorSettings;
  enabled?: boolean;  // Default: true
}
```

**Features:**
- **Blink → Click**: Single blink dispatches MouseEvent at cursor position
- **Double Blink → Right Click**: Context menu trigger
- **Long Blink → Drag**: Toggle drag mode with visual feedback
- **Mouth → Click** (optional): Mouth open triggers click
- **Smile → Double Click** (optional): Smile triggers double-click
- **Head Tilt → Scroll** (optional): Roll angle scrolls page

**Anti-Drift Scrolling:**
```typescript
const baseline = 0.96 * prevBaseline + 0.04 * currentRoll;
const deviation = Math.abs(currentRoll - baseline);

if (deviation > threshold) {
  window.scrollBy(0, sign * scrollSpeed);
}
```

---

### useMouthTypingControls

**Purpose:** Navigate on-screen keyboard using facial gestures.

**Location:** `src/hooks/useMouthTypingControls.ts`

**Parameters:**
```typescript
{
  mouthState: { isOpen: boolean; smileDegree: number };
  doubleBlink: boolean;
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
