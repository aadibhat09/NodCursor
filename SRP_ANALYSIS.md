# NodCursor Single Responsibility Principle (SRP) Analysis

**Generated:** March 18, 2026  
**Focus:** Identifying components, hooks, context, pages, and utilities that violate SRP and require refactoring.

---

## Executive Summary

The NodCursor codebase has several areas with SRP violations, ranging from **moderate** to **critical**. The most critical violations occur in:

1. **`useFaceTracking` hook** — Combines MediaPipe initialization, camera stream management, adaptive lighting, worker coordination, and coordinate mapping
2. **`AppContext`** — Mixes settings management, calibration, phone mode detection, localStorage persistence, and migration logic
3. **`SettingsPanel` component** — Renders 25+ settings across multiple domains without logical grouping
4. **`useGestureControls` hook** — Handles 5+ independent gesture-to-action mappings in a single hook
5. **`voiceProfile.ts` utility** — Combines profile persistence, feature extraction, matching, and audio monitoring

The analysis below categorizes violations by severity and provides refactoring guidance.

---

## 1. COMPONENTS ANALYSIS (`src/components/`)

### ✅ `common.tsx` — **SRP COMPLIANT**
**Responsibilities:**
- `Panel`: Generic container component for sections
- `BigButton`: Generic styled button component

**Status:** ✅ Excellent — These are presentation-only primitives with single, focused responsibilities.

---

### ⚠️ `OnScreenKeyboard.tsx` — **MINOR SRP VIOLATION**
**Current Responsibilities:**
1. UI rendering (keyboard grid, toggle buttons, textarea)
2. Keyboard state management (shift state, selected index)
3. Keyboard key generation logic (`buildKeyboardKeys()`)
4. Event propagation to parent
5. Input formatting (text output display)

**Issues:**
- State management is tightly coupled with rendering
- Text input handling should potentially be separated

**Refactoring Suggestion:**
```typescript
// Extract key generation into a service:
// services/keyboardKeyService.ts
export function buildKeyboardKeys(shift: boolean): string[]

// Extract state management into a custom hook:
// hooks/useKeyboardState.ts
export function useKeyboardState(initialText: string, ...): KeyboardState

// OnScreenKeyboard becomes pure presentation:
// components/OnScreenKeyboard.tsx (presentation only)
```

---

### ✅ `VirtualButtons.tsx` — **SRP COMPLIANT**
**Responsibilities:**
- Render virtual action buttons
- Track local hover state for visual feedback
- Dispatch action events

**Status:** ✅ Good — Single, focused responsibility.

---

### ✅ `CalibrationUI.tsx` — **SRP COMPLIANT**
**Responsibilities:**
- Display calibration step progress
- Show visual feedback for calibration state

**Status:** ✅ Good — Presentation-only component.

---

### ✅ `CameraView.tsx` — **SRP COMPLIANT**
**Responsibilities:**
- Display video feed
- Show light quality metrics from adaptive lighting

**Status:** ✅ Good — Single responsibility.

---

### ✅ `CursorOverlay.tsx` — **SRP COMPLIANT**
**Responsibilities:**
- Render cursor position overlay with visual indicators

**Status:** ✅ Good — Pure presentation.

---

### ✅ `GestureIndicators.tsx` — **SRP COMPLIANT**
**Responsibilities:**
- Display gesture state indicators (blink, double-blink, mouth, etc.)

**Status:** ✅ Good — Presentation only.

---

### 🔴 `SettingsPanel.tsx` — **CRITICAL SRP VIOLATION**
**Current Responsibilities:**
1. Render cursor sensitivity controls (3 sliders: sensitivity, horizontal, vertical)
2. Render acceleration curve slider
3. Render smoothing controls (2 properties)
4. Render deadzone controls
5. Render dwell click controls (2 properties)
6. Render blink detection controls (4 properties)
7. Render double-blink controls (2 properties)
8. Render long blink controls
9. Render mouth gesture controls (4 properties)
10. Render head tilt scroll controls (3 properties)
11. Render voice command toggle
12. Render camera mirroring toggle
13. Camera selection UI
14. All input value formatting and display
15. All onChange handlers for 25+ individual settings

**Issues:**
- **Massive component** — 300+ lines of nearly identical slider rendering
- **Multiple domains mixed** — Cursor control, gesture detection, voice, and scrolling settings all in one place
- **No logical grouping** — Settings should be grouped by feature area
- **Repeated patterns** — Same slider template repeated 20+ times
- **Difficult to maintain** — Changes to any setting require navigating large file

**Refactoring Suggestion:**
Extract into domain-specific sub-components:

```typescript
// components/SettingsPanel/index.tsx (container/orchestrator)
// components/SettingsPanel/CursorSettings.tsx (sensitivity, acceleration, smoothing)
// components/SettingsPanel/BlinkSettings.tsx (blink detection, timing thresholds)
// components/SettingsPanel/DwellSettings.tsx (dwell click configuration)
// components/SettingsPanel/MouthSettings.tsx (mouth gesture timings)
// components/SettingsPanel/HeadTiltSettings.tsx (head tilt scrolling)
// components/SettingsPanel/CameraSettings.tsx (camera selection, mirroring)
// components/SettingsPanel/VoiceSettings.tsx (voice toggle)
// components/SettingsPanel/SettingSlider.tsx (reusable slider component)

// Usage:
<SettingsPanel>
  <CursorSettings settings={settings} onChange={onChange} />
  <BlinkSettings settings={settings} onChange={onChange} />
  <MouthSettings settings={settings} onChange={onChange} />
  {/* ... etc */}
</SettingsPanel>
```

**Benefits:**
- Each sub-component has single responsibility
- Easier to test (can test one domain at a time)
- Easier to find settings
- Reusable setting group components
- Cleaner code organization

---

## 2. HOOKS ANALYSIS (`src/hooks/`)

### ✅ `useCameraDevices.ts` — **SRP COMPLIANT**
**Responsibilities:**
- Enumerate available camera devices

**Status:** ✅ Good — Single focus.

---

### ✅ `useBlinkDetection.ts` — **SRP COMPLIANT**
**Responsibilities:**
- Map raw blink signals to click action types

**Status:** ✅ Trivial but correct — Could be inlined but acceptable as utility.

---

### 🔴 `useFaceTracking.ts` — **CRITICAL SRP VIOLATION**
**Current Responsibilities:**
1. **MediaPipe Initialization**
   - Loads MediaPipe WASM from multiple CDN fallbacks
   - Creates FaceLandmarker instance
   - Handles model initialization errors

2. **Camera Stream Management**
   - Requests camera stream from device
   - Handles camera permission errors
   - Manages camera fallback logic (if named camera unavailable)
   - Generates camera-specific error messages

3. **Frame Processing Loop**
   - Manages requestAnimationFrame for video frame detection
   - Throttles detection rate based on quality
   - Detects face landmarks via MediaPipe
   - Monitors failed frame count and detects outliers

4. **Adaptive Lighting Management**
   - Samples video luma periodically
   - Tracks adaptive light state changes
   - Tunes camera constraints based on lighting recommendations
   - Updates UI with light quality metrics

5. **Web Worker Coordination**
   - Creates and manages tracking worker
   - Maintains worker settings references
   - Processes worker messages
   - Updates tracking state from worker output
   - Manages movement throttling (last state commit timing)

6. **Coordinate Mapping**
   - Calls `useCursorMapping` hook to apply calibration and sensitivity
   - Mirrors camera X-axis if mirrored setting enabled

7. **State Management**
   - Manages raw tracking state
   - Manages camera errors
   - Manages available cameras list
   - Manages light adaptation state
   - Manages video refs for refs

**Issues:**
- **Function is 300+ lines** — Extremely difficult to understand and maintain
- **5+ lifecycle concerns** — Each could be a separate hook
- **Tightly coupled logic** — Can't test lighting without camera, can't test worker without MediaPipe, etc.
- **Hard to debug** — Issues could originate from any of 7 concerns
- **Duplicated error handling** — Multiple try-catch blocks for different errors
- **Indirect dependencies** — Uses `useCursorMapping` internally but not obvious from signature

**Root Cause:**
The hook tries to be the central orchestrator for ALL face tracking infrastructure.

**Refactoring Suggestion:**
Split into focused hooks with clear dependencies:

```typescript
// 1. Core utility hooks (pure, no side effects)
export function useMediaPipeModel() {
  // Responsibility: Load and initialize MediaPipe model
  // Returns: { landmarker, error, isLoaded }
}

export function useCameraStream(cameraId: string) {
  // Responsibility: Acquire and manage camera MediaStream
  // Returns: { stream, error, availableCameras }
}

export function useAdaptiveLighting(videoRef: RefObject<HTMLVideoElement>) {
  // Responsibility: Sample video luminance and track light state
  // Returns: { lightState, quality, recommendation }
}

// 2. Composition hook
export function useTrackingWorker(settings: CursorSettings) {
  // Responsibility: Create and communicate with tracking worker
  // Returns: { workerRef, updateSettings }
}

// 3. High-level orchestrator
export function useFaceTracking(settings: CursorSettings, calibration: CalibrationData) {
  // Now coordinates the above hooks
  const mediapiped = useMediaPipeModel();
  const cameraStream = useCameraStream(settings.cameraId);
  const lighting = useAdaptiveLighting(videoRef);
  const worker = useTrackingWorker(settings);
  
  useEffect(() => {
    // Orchestrate video frame loop with all components
    // Much cleaner and more maintainable
  }, [mediapiped, cameraStream, lighting, worker]);
  
  return {
    state: /* computed from worker */,
    videoRef,
    cameraError: cameraStream.error,
    availableCameras: cameraStream.availableCameras,
    lightState: lighting.lightState
  };
}
```

**Benefits:**
- Each hook can be tested independently
- Easier to understand single responsibility of each
- Reusable error handling patterns
- Can swap implementations (e.g., different face detection library)
- Clearer dependency graph

**Implementation Priority:** HIGH 🔥

---

### ✅ `useCursorMapping.ts` — **SRP COMPLIANT**
**Responsibilities:**
- Map raw coordinates to viewport using calibration data
- Apply sensitivity, acceleration, and responsiveness adjustments

**Status:** ✅ Good — Single, clear responsibility.

---

### ✅ `useDwellClick.ts` — **SRP COMPLIANT**
**Responsibilities:**
- Implement dwell-to-click timer with movement tolerance

**Status:** ✅ Good — Single responsibility.

---

### 🔴 `useGestureControls.ts` — **CRITICAL SRP VIOLATION**
**Current Responsibilities:**
1. **Blink Gesture Handling**
   - Detect single blink → left click
   - Detect double blink → right click
   - Detect long blink → toggle drag mode

2. **Mouth Gesture Handling**
   - Detect mouth open → click
   - Detect smile → double click
   - Apply mouth cooldown timing

3. **Head Tilt Scroll Handling**
   - Track head tilt baseline
   - Detect tilt direction changes
   - Apply tilt threshold and cooldown
   - Implement adaptive neutral pose (moving average)
   - Dispatch scroll events

4. **Drag Mode Management**
   - Track drag state across frame updates
   - Dispatch mousedown/mouseup events
   - Handle drag during continuous tracking

5. **Event Dispatch Infrastructure**
   - Convert normalized coordinates to viewport coordinates
   - Create MouseEvent objects
   - Find element at cursor position
   - Dispatch events to target elements

**Issues:**
- **300+ lines** of intertwined logic
- **5 independent concerns** mixed together
- **Can't test one gesture without whole hook** — e.g., can't test blink logic without head tilt code parsing
- **Conditional execution** for each gesture type adds complexity
- **Separate state tracking** for each gesture (prev values, cooldowns, timelines)
- **Hard to enable/disable** individual gestures — must understand entire flow
- **Mouth cooldown conflicts** with other cooldown logic

**Refactoring Suggestion:**
Extract each gesture handler into a separate custom hook:

```typescript
// hooks/gestures/useBlinkGestures.ts
export function useBlinkGestures(
  settings: CursorSettings,
  input: GestureInput,
  onDispatch: (type: string, x: number, y: number) => void
) {
  // Blink to click, double-blink to right-click, long-blink to drag
  // Returns: { dragMode } or internal state only
}

// hooks/gestures/useMouthGestures.ts
export function useMouthGestures(
  settings: CursorSettings,
  input: GestureInput,
  onDispatch: (type: string, x: number, y: number) => void
) {
  // Mouth open to click, smile to double-click, cooldown management
}

// hooks/gestures/useHeadTiltGestures.ts
export function useHeadTiltGestures(
  settings: CursorSettings,
  input: GestureInput,
  onScroll: (direction: 'up' | 'down') => void
) {
  // Head tilt scroll handling with baseline tracking and cooldown
}

// hooks/gestures/useEventDispatch.ts
export function useEventDispatch() {
  // Shared infrastructure for dispatching mouse events
  return {
    dispatchMouse: (type: string, x: number, y: number, button) => void
  }
}

// Main orchestrator (cleaned up)
export function useGestureControls(
  settings: CursorSettings,
  input: GestureInput,
  handlers?: GestureHandlers,
  enabled = true
) {
  const dispatch = useEventDispatch();
  
  useBlinkGestures(settings, input, (type, x, y) => {
    dispatch.dispatchMouse(type, x, y);
    handlers?.onEvent?.(`${type} event`);
  });
  
  useMouthGestures(settings, input, (type, x, y) => {
    dispatch.dispatchMouse(type, x, y);
    handlers?.onEvent?.(`${type} event`);
  });
  
  useHeadTiltGestures(settings, input, (direction) => {
    window.scrollBy({ top: direction === 'down' ? 110 : -110 });
    handlers?.onEvent?.(direction === 'down' ? 'Scroll down' : 'Scroll up');
  });
}
```

**Benefits:**
- Each gesture type can be enabled/disabled independently
- Easier to test one gesture in isolation
- Easier to debug gesture-specific issues
- Reusable gesture patterns
- Clear gesture precedence/ordering

**Implementation Priority:** HIGH 🔥

---

### ✅ `useMouthTypingControls.ts` — **SRP COMPLIANT**
**Responsibilities:**
- Implement mouth-based keyboard navigation (advance, select, backspace)
- Track text input state
- Manage shift state
- Apply cooldown timing between gestures

**Status:** ⚠️ Acceptable — While mixing text management with gesture handling, the concerns are tightly coupled by design. Could be split but not critical.

---

### ✅ `useSmoothCursor.ts` — **SRP COMPLIANT**
**Responsibilities:**
- Animate smooth cursor movement using critically damped interpolation
- Manage animation frame loop
- Apply smoothing pipeline

**Status:** ✅ Good — Single responsibility.

---

### ✅ `useVoiceCommands.ts` — **SRP COMPLIANT**
**Responsibilities:**
- Initialize Web Speech API recognition session
- Map recognized phrases to action callbacks
- Handle speech recognition lifecycle

**Status:** ✅ Good — Single, cohesive responsibility. (Could theoretically split speech recognition setup from phrase matching, but integration is appropriate.)

---

## 3. CONTEXT ANALYSIS (`src/context/`)

### 🔴 `AppContext.tsx` — **CRITICAL SRP VIOLATION**
**Current Responsibilities:**
1. **Settings State Management** (25+ properties)
   - Desktop settings versioning and migration
   - Mobile settings versioning and migration
   - Settings persistence to localStorage
   - Settings retrieval and merging
   - Default settings for both device types

2. **Calibration State Management** (6 properties)
   - Calibration point tracking
   - Calibration status (calibrated flag)
   - Calibration persistence

3. **Device Detection**
   - Detect phone vs. desktop mode
   - Listen to media queries (viewport size, pointer type)
   - Switch between device profiles automatically
   - Store phone mode state

4. **LocalStorage Persistence**
   - Safe JSON serialization/deserialization
   - Quota and private mode error handling
   - Multi-key persistence (desktop, mobile, legacy)
   - Migration versioning and flags

5. **Settings Defaults**
   - Desktop defaults (18 modified values)
   - Mobile defaults (23 modified values over base)
   - Default calibration

6. **Migration Logic**
   - Handle legacy settings format
   - Update mirrorCamera during migration
   - Prevent double-migration with version flags

**Issues:**
- **500+ lines** of mixed concerns
- **Hard to test** — Can't test settings without calibration, device detection, etc.
- **Hard to modify settings** — Locating desired setting requires understanding entire context
- **Hard to change persistence strategy** — Would require significant refactoring
- **Hard to add new setting domains** — Need to modify context and add defaults everywhere
- **Circular dependencies risk** — If other contexts need settings, could create circular deps
- **Testing nightmare** — Must mock localStorage, matchMedia, calibration, etc. to test settings alone

**Refactoring Suggestion:**
Split into focused contexts:

```typescript
// contexts/SettingsContext.tsx
interface SettingsContextValue {
  settings: CursorSettings;
  setSettings: (updater: (prev: CursorSettings) => CursorSettings) => void;
}
export const SettingsProvider: React.FC<{ children: ReactNode }>;
export function useSettings(): CursorSettings;

// contexts/CalibrationContext.tsx
interface CalibrationContextValue {
  calibration: CalibrationData;
  setCalibration: (next: CalibrationData) => void;
}
export const CalibrationProvider: React.FC<{ children: ReactNode }>;
export function useCalibration(): CalibrationContextValue;

// contexts/DeviceContext.tsx (or hook)
export function useDeviceMode(): { isPhoneMode: boolean };

// services/settingsPersistence.ts
export function createSettingsPersistence() {
  return {
    load: (key: string) => CursorSettings,
    save: (key: string, settings: CursorSettings) => void,
    migrate: () => void
  };
}

// App.tsx
<SettingsProvider>
  <CalibrationProvider>
    <DeviceDetectionProvider>
      {/*...*/}
    </DeviceDetectionProvider>
  </CalibrationProvider>
</SettingsProvider>
```

**Benefits:**
- Each context has single responsibility
- Can test settings independently of calibration
- Can swap persistence implementation (IndexedDB, etc.)
- Can add new contexts without touching existing ones
- Cleaner provider composition

**Implementation Priority:** HIGH 🔥

---

## 4. PAGE COMPONENTS ANALYSIS (`src/pages/`)

### ✅ `HomePage.tsx` — **SRP COMPLIANT**
**Responsibilities:**
- Render marketing/information content
- Provide navigation via voice commands

**Status:** ✅ Good — Marketing page, focused on content.

---

### ⚠️ `DemoPage.tsx` — **LARGE ORCHESTRATOR (Acceptable)**
**Responsibilities:**
1. Orchestrate all tracking hooks
2. Manage event logging
3. Manage keyboard state
4. Manage typing mode
5. Compose gesture handling
6. Coordinate multiple interaction modalities

**Analysis:**
This is a **legitimate orchestrator/container component**. Its responsibility is to coordinate multiple features into a cohesive interactive demo. This is appropriate for a page-level component.

**However, it could be improved:**
- Extract event logging into a custom hook (`useEventLog`)
- Extract keyboard UI logic into a sub-component
- Extract event dispatch logic into a composable utility

```typescript
// Refactored:
export function DemoPage() {
  const { state, videoRef, cameraError, lightState } = useFaceTracking(...);
  const { log: appendEvent, logs: eventLog } = useEventLog();
  
  return (
    <>
      <CursorOverlay {...} />
      <VirtualButtons onAction={(action) => {/* ... */}} />
      <KeyboardUI 
        active={keyboardOpen} 
        typing={typingMode}
        onEvent={appendEvent}
      />
      <div className="grid gap-4">
        <CameraView {...} />
        <EventLog events={eventLog} />
      </div>
    </>
  );
}
```

**Status:** ⚠️ Acceptable but could be cleaner — Extract sub-concerns into hooks/sub-components if this grows further.

---

### ✅ `CalibrationPage.tsx` — **SRP COMPLIANT**
**Responsibilities:**
- Manage calibration flow (step progression)
- Capture calibration points

**Status:** ✅ Good — Single flow coordination.

---

### ⚠️ `SettingsPage.tsx` — **MODERATE ISSUES**
**Responsibilities:**
1. Render SettingsPanel (problematic component!)
2. Apply sensitivity presets (Steady, Balanced, Responsive)
3. Preset selection differs by device mode
4. Provide testing shortcuts
5. Render diagnostics panel

**Issues:**
- Inherits problems from SettingsPanel component
- Preset logic (device-aware) could be extracted
- Diagnostics rendering is separate concern

**Refactoring Suggestion:**
```typescript
// Extract preset application logic
export function useSensitivityPresets(isPhoneMode: boolean) {
  return {
    applyPreset: (preset: 'steady' | 'balanced' | 'responsive') => CursorSettings
  };
}

// Extract diagnostics into separate component
<DiagnosticsPanel settings={settings} />
```

**Status:** ⚠️ Moderate — Will improve once SettingsPanel is refactored.

---

### ⚠️ `GamesPage.tsx` — **LARGE ORCHESTRATOR (Functional)**
**Responsibilities:**
1. Manage Target Rush game state
2. Manage Memory Match game state
3. Orchestrate tracking hooks
4. Coordinate gesture input
5. Render both games

**Analysis:**
Large page component but justified for game logic coordination. Could extract game state management into custom hooks:

```typescript
export function useTargetRushGame() {
  const [state, setState] = useState<TargetRushState>(...);
  return { state, start, reset, /* ... */ };
}

export function useMemoryMatchGame() {
  const [state, setState] = useState<MemoryMatchState>(...);
  return { state, playSequence, checkProgress, /* ... */ };
}
```

**Status:** ⚠️ Acceptable but could extract game logic — Not critical.

---

### ✅ `VoicePersonalizationPage.tsx` — **SRP COMPLIANT**
**Responsibilities:**
- Manage voice profile enrollment
- Manage voice profile verification
- Display profile status and live matching

**Status:** ✅ Good — Single feature focus.

---

### ✅ `DocumentationPage.tsx` — **SRP COMPLIANT**
**Responsibilities:**
- Render documentation content
- Handle section navigation

**Status:** ✅ Good — Content display.

---

## 5. UTILITIES ANALYSIS (`src/utils/`)

### 🔴 `voiceProfile.ts` — **CRITICAL SRP VIOLATION**
**Current Responsibilities:**
1. **Voice Profile Persistence**
   - Load profile from localStorage
   - Save profile to localStorage
   - Clear profile from storage
   - Type definitions and versioning

2. **Audio Stream Acquisition**
   - Request microphone access
   - Configure audio constraints (echo cancellation, noise suppression, auto gain)
   - Manage audio context lifecycle
   - Handle AudioContext creation/closing

3. **Audio Feature Extraction**
   - Compute RMS energy from time-domain samples
   - Extract spectral centroid from frequency data
   - Normalize band energy for frequency ranges (low/mid/high)
   - Clamp values to [0,1] range
   - Perform bin-to-Hz frequency conversion

4. **Voice Profile Building**
   - Compute mean features from samples
   - Compute standard deviation for each feature
   - Build profile with threshold
   - Include metadata (version, timestamp, sample count)

5. **Voice Profile Matching**
   - Compute z-scores for sample vs. profile
   - Aggregate z-scores into match score
   - Compare against threshold

6. **Voice Monitoring Loop**
   - Create requestAnimationFrame loop
   - Periodically sample frequency and time-domain data
   - Call feature extraction callback
   - Handle lifecycle cleanup

**Issues:**
- **Mixing orthogonal concerns** — Audio I/O, signal processing, persistence, matching
- **Hard to test** — Can't test feature extraction without audio stream
- **Hard to reuse** — Voice profile matching should be independent of enrollment
- **Hard to modify** — Changing FFT size affects multiple areas
- **Hard to parallelize** — Feature extraction could run in Web Worker

**Refactoring Suggestion:**
Extract into focused modules:

```typescript
// services/voiceStorage.ts
export interface VoiceProfile { /* ... */ }
export function loadVoiceProfile(): VoiceProfile | null
export function saveVoiceProfile(profile: VoiceProfile): void
export function clearVoiceProfile(): void

// services/audioFeatureExtractor.ts
export type AudioFeature = [number, number, number, number, number];
export function extractVoiceFeature(
  freqBins: Uint8Array,
  timeBins: Uint8Array,
  fftSize: number,
  sampleRate: number
): AudioFeature | null

export function normalizeAudioFeature(raw: AudioFeature): AudioFeature

// services/voiceProfileBuilder.ts
export function buildVoiceProfile(samples: AudioFeature[]): VoiceProfile

// services/voiceProfileMatcher.ts
export interface VoiceMatchResult { score: number; isMatch: boolean }
export function matchVoiceProfile(
  profile: VoiceProfile,
  sample: AudioFeature
): VoiceMatchResult

// hooks/useAudioStream.ts
export function useAudioStream() {
  // Responsibility: Audio I/O management only
  return { analyser, isRunning, error }
}

// hooks/useVoiceFeatureMonitor.ts
export function useVoiceFeatureMonitor(
  analyser: AnalyserNode | null,
  onFeature: (feature: AudioFeature) => void
) {
  // Responsibility: Feature extraction loop only
}

// Combined for enrollment:
export async function startVoiceFeatureMonitor(
  onFeature: (feature: AudioFeature) => void
): Promise<VoiceFeatureMonitor> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { /* ... */ } });
  const context = new AudioContext();
  const analyser = context.createAnalyser();
  // ... wire up
  
  const loop = () => {
    const freqData = new Uint8Array(analyser.frequencyBinCount);
    const timeData = new Uint8Array(analyser.fftSize);
    analyser.getByteFrequencyData(freqData);
    analyser.getByteTimeDomainData(timeData);
    
    const feature = extractVoiceFeature(freqData, timeData, analyser.fftSize, context.sampleRate);
    if (feature) onFeature(feature);
    
    requestAnimationFrame(loop);
  };
  
  requestAnimationFrame(loop);
  return { stop: () => { /* cleanup */ } };
}
```

**Benefits:**
- Each module has single responsibility
- Audio feature extraction is testable without audio setup
- Profile matching logic is testable independently
- Profile persistence can be swapped (IndexedDB, etc.)
- Audio I/O can be mocked for testing
- Feature extraction could move to Web Worker in future

**Implementation Priority:** MEDIUM 📌

---

### ✅ `calibration/mapToViewport.ts` — **SRP COMPLIANT**
**Responsibilities:**
- Normalize raw coordinates based on calibration boundaries
- Clamp results to viewport bounds

**Status:** ✅ Good — Single transformation function.

---

### ✅ `gestureDetection/eyeAspectRatio.ts` — **SRP COMPLIANT**
**Responsibilities:**
- Calculate eye aspect ratio from landmark positions

**Status:** ✅ Good — Single calculation function.

---

### ⚠️ `ml/adaptiveLightLearner.ts` — **MINOR SRP VIOLATION**
**Current Responsibilities:**
1. **Adaptive Light State Tracking**
   - Update baseline brightness/contrast with exponential smoothing
   - Track confidence growth
   - Compute quality scores
   - Generate recommendations

2. **Video Sampling**
   - Create canvas sampler for video
   - Sample video frame at fixed resolution (32x18)
   - Extract luma values from pixels
   - Compute brightness and contrast statistics
   - Manage sampler cache

**Issues:**
- Video sampling logic is separate from learning logic
- Could be tested independently
- Cache management complicates the class

**Refactoring Suggestion:**
```typescript
// Separate video sampling
export function sampleVideoLuma(video: HTMLVideoElement): LightSample | null { /* ... */ }

// Focus class on learning only
export class AdaptiveLightLearner {
  update(sample: LightSample): AdaptiveLightState { /* ... */ }
}

// Use separately:
const sampler = useSamplerCache();
const lightSample = sampleVideoLuma(videoRef.current);
const adaptiveState = lightLearner.update(lightSample);
```

**Status:** ⚠️ Acceptable — Not critical, but cleaner separation possible.

---

### ✅ `smoothing/advancedSmoothing.ts` — **SRP COMPLIANT**
**Responsibilities:**
- Implement 3-stage smoothing pipeline (Kalman → exponential → micro-deadzone)

**Status:** ✅ Good — Single pipeline orchestrator.

---

### ✅ `smoothing/exponentialSmoothing.ts` — **SRP COMPLIANT**
**Responsibilities:**
- Apply exponential smoothing to coordinates

**Status:** ✅ Good — Single utility function.

---

### ✅ `smoothing/kalmanFilter.ts` — **SRP COMPLIANT**
**Responsibilities:**
- Implement Kalman filter for 2D position tracking

**Status:** ✅ Good — Single algorithm implementation.

---

### ✅ `filterNoisyLogs.ts` — **SRP COMPLIANT**
**Responsibilities:**
- Filter known noisy console messages

**Status:** ✅ Good — Single utility.

---

## Summary by Severity

### 🔴 CRITICAL — Immediate Attention Required
| Location | Responsibility Count | Issue |
|----------|----------------------|-------|
| `useFaceTracking` | 7 | Orchestrates MediaPipe, camera, worker, lighting, mapping, error handling, state management |
| `AppContext` | 6 | Mixes settings, calibration, device detection, persistence, defaults, migration |
| `SettingsPanel` | 15+ | Renders 25+ settings across 5+ domains without logical grouping |
| `useGestureControls` | 5 | Handles blink, mouth, head tilt, drag, event dispatch in single hook |

### ⚠️ MODERATE — Refactoring Recommended
| Location | Responsibility Count | Issue |
|----------|----------------------|-------|
| `OnScreenKeyboard` | 5 | State management mixed with rendering and event handling |
| `voiceProfile.ts` | 6 | Combines persistence, audio I/O, feature extraction, matching, monitoring |
| `SettingsPage` | 4 | Settings rendering, presets, device detection, diagnostics |
| `ml/adaptiveLightLearner` | 2 | Video sampling mixed with learning algorithm |

### ✅ GOOD — No Changes Needed
- `common.tsx` — Presentation primitives
- `VirtualButtons.tsx` — Button rendering
- `CameraView.tsx`, `CursorOverlay.tsx`, `GestureIndicators.tsx` — UI rendering
- `useCameraDevices.ts`, `useBlinkDetection.ts`, `useCursorMapping.ts`, `useDwellClick.ts` — Single-purpose hooks
- `useSmoothCursor.ts`, `useVoiceCommands.ts` — Cohesive hook implementations
- `useMouthTypingControls.ts` — Tight coupling is justified
- `HomePage.tsx`, `CalibrationPage.tsx`, `VoicePersonalizationPage.tsx`, `DocumentationPage.tsx` — Focused page components
- Most utility files — Single algorithms or utilities

---

## Recommended Refactoring Roadmap

### Phase 1: CRITICAL (Blocks other improvements)
**Priority:** 🔥 **Do First**

1. **Split `useFaceTracking`** into:
   - `useMediaPipeModel` (model init)
   - `useCameraStream` (stream management)
   - `useAdaptiveLighting` (lighting sampling)
   - `useTrackingWorker` (worker coordination)
   - Orchestrate in main hook

2. **Split `AppContext`** into:
   - `SettingsContext` + `settingsPersistence` service
   - `CalibrationContext`
   - `DeviceDetectionProvider` or hook
   - Use provider composition

### Phase 2: HIGH (Major SRP violations)
**Priority:** 🔴 **Do Soon**

3. **Refactor `SettingsPanel`** into:
   - `CursorSettings`, `BlinkSettings`, `DwellSettings`, `MouthSettings`, `HeadTiltSettings`, `CameraSettings`, `VoiceSettings` subcomponents
   - Extract `SettingSlider` reusable component
   - Container component orchestrates sub-components

4. **Split `useGestureControls`** into:
   - `useBlinkGestures`
   - `useMouthGestures`
   - `useHeadTiltGestures`
   - `useEventDispatch` utility
   - Main hook orchestrates

### Phase 3: MODERATE (Nice to have)
**Priority:** 📌 **Do When Convenient**

5. **Refactor `voiceProfile.ts`** into modules:
   - `voiceStorage.ts`
   - `audioFeatureExtractor.ts`
   - `voiceProfileBuilder.ts`
   - `voiceProfileMatcher.ts`
   - `useAudioStream.ts` hook

6. **Improve `OnScreenKeyboard`**:
   - Extract state management to `useKeyboardState`
   - Extract key generation to service
   - Simplify component to presentation

7. **Extract game logic** from `GamesPage`:
   - `useTargetRushGame`
   - `useMemoryMatchGame`

---

## Benefits After Refactoring

| Aspect | Before | After |
|--------|--------|-------|
| **Testability** | 🔴 Hard to test mixed concerns | ✅ Test each concern in isolation |
| **Reusability** | 🔴 Tightly coupled components | ✅ Composable, reusable modules |
| **Maintainability** | 🔴 Hard to find/change code | ✅ Clear organization and locations |
| **Debugging** | 🔴 Issues span multiple concerns | ✅ Narrow down to specific module |
| **Onboarding** | 🔴 New devs overwhelmed | ✅ Clear responsibility boundaries |
| **Performance** | ℹ️ Same (will improve slightly with Worker separation) | ✅ Can optimize specific concerns |
| **Feature Flags** | 🔴 Hard to disable features independently | ✅ Easy to toggle individual features |

---

## Conclusion

The NodCursor codebase demonstrates good architectural patterns in many areas but suffers from **SRP violations in critical orchestrator components and utilities**. The violations stem from:

1. **Over-centralization** — One component/hook trying to handle too many concerns
2. **Mixing infrastructure with business logic** — Settings, persistence, device detection in one context
3. **Utility sprawl** — Diverse concerns bundled in monolithic utility files

**Recommended approach:**
- Start with Phase 1 refactoring to **unlock testability**
- Follow with Phase 2 to **improve maintainability**
- Phase 3 items can be done incrementally

The refactoring will significantly improve code quality, testability, and developer experience without requiring any external dependency changes.

