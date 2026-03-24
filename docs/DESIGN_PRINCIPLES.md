# NodCursor Design Principles

NodCursor follows core software design patterns to maintain a clean, maintainable, and scalable codebase. This document outlines the principles we follow and why they matter for accessibility and developer experience.

---

## Table of Contents

1. [Single Responsibility Principle (SRP)](#single-responsibility-principle-srp)
2. [Component Architecture](#component-architecture)
3. [Hook Organization](#hook-organization)
4. [State Management](#state-management)
5. [Current Architecture Health](#current-architecture-health)
6. [Refactoring Roadmap](#refactoring-roadmap)

---

## Single Responsibility Principle (SRP)

**Every module, component, or hook should have a single reason to change.**

SRP keeps code focused, testable, and reusable. In NodCursor, this means:

### ✅ **Good SRP: Focused Responsibility**

```tsx
// ✅ Good: Single concern - rendering smooth cursor
export function CursorOverlay({ x, y }: CursorOverlayProps) {
  return <div style={{ left: `${x}%`, top: `${y}%` }} />;
}

// ✅ Good: Single concern - managing smooth cursor math
function useSmoothCursor(rawX: number, rawY: number) {
  const [smoothX, setSmoothX] = useState(rawX);
  // ... smoothing logic only
  return { smoothX, smoothY };
}

// ✅ Good: Single concern - detecting blinks
export const eyeAspectRatio = (landmarks: FaceLandmarks) => {
  // ... EAR calculation only
};
```

### ❌ **Bad SRP: Multiple Responsibilities**

```tsx
// ❌ Bad: Mixing camera setup, MediaPipe, worker coordination, and state
hook useFaceTracking() {
  // - Initialize camera
  // - Load MediaPipe model
  // - Spawn Web Worker
  // - Map coordinates
  // - Handle errors
  // - Manage 10+ state variables
}

// ❌ Bad: AppContext doing settings, calibration, persistence, and device detection
interface AppContextValue {
  settings: CursorSettings;        // ← Settings responsibility
  calibration: CalibrationData;    // ← Calibration responsibility
  isPhoneMode: boolean;            // ← Device detection responsibility
  // + localStorage sync, migration logic...
}

// ❌ Bad: SettingsPanel rendering 15+ unrelated settings without grouping
<SettingsPanel>
  {/* Cursor controls, blink controls, mouth controls, scroll controls... */}
</SettingsPanel>
```

---

## Component Architecture

### 1. **Presentation Components** (View Layer)

Presentation components only render UI and pass events upward. They have no side effects.

```tsx
// ✅ Pure presentation - only renders props
interface CalibrationPointProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function CalibrationPoint({ label, isActive, onClick }: CalibrationPointProps) {
  return (
    <button onClick={onClick} className={isActive ? 'active' : ''}>
      {label}
    </button>
  );
}
```

**Components in this category:**
- `common.tsx` - UI primitives
- `CursorOverlay/CursorOverlay.tsx` - Cursor rendering
- `CameraView/CameraView.tsx` - Video element wrapper
- `GestureIndicators/GestureIndicators.tsx` - Status display
- `VirtualButtons.tsx` - Button grid

### 2. **Container Components** (Controller Layer)

Container components:
- Connect to hooks for logic
- Manage local state for UI interactions
- Orchestrate child components
- Handle events and side effects

```tsx
// ✅ Container: Manages calibration state and logic
export function CalibrationUI({ onComplete }: CalibrationUIProps) {
  const { calibration, setCalibration } = useContext(AppContext);
  const [currentStep, setCurrentStep] = useState(0);
  
  const handleCalibrationPoint = async (data: FaceData) => {
    // Process calibration data
    setCalibration({...});
  };
  
  return (
    <div>
      <CalibrationPoint label="Center" onClick={handleCalibrationPoint} />
      {/* ... */}
    </div>
  );
}
```

**Components in this category:**
- `CalibrationUI/CalibrationUI.tsx` - Calibration orchestration
- `SettingsPanel/SettingsPanel.tsx` - Settings management
- All page components in `pages/`

### 3. **Feature Components** (Feature-Specific)

Feature components combine presentation and logic for a specific feature:

```tsx
// ✅ Feature component: Self-contained keyboard behavior
export function OnScreenKeyboard(props: OnScreenKeyboardProps) {
  const { isOpen, selectedIndex, onKeyPress } = props;
  
  return (
    <aside className="keyboard">
      {/* Renders and handles keyboard-specific logic */}
    </aside>
  );
}
```

---

## Hook Organization

Hooks encapsulate logic and state management. Good hook design follows SRP: each hook does one thing.

### **Single-Purpose Hooks** ✅

These are well-designed and should serve as examples:

```tsx
// ✅ Single purpose: Calculate smooth cursor coordinates
export function useSmoothCursor(rawX: number, rawY: number, settings: CursorSettings) {
  const [smooth, setSmooth] = useState({ x: rawX, y: rawY });
  // ... smoothing algorithm only
  return smooth;
}

// ✅ Single purpose: Detect blinks and manage blink state
export function useBlinkDetection(landmarks: FaceLandmarks | null) {
  const [isBlink, setIsBlink] = useState(false);
  // ... blink detection logic only
  return { isBlink, confidence };
}

// ✅ Single purpose: Calculate cursor movement from head position
export function useCursorMapping(headData: HeadPosition, calibration: CalibrationData) {
  // ... coordinate mapping logic only
  return { cursorX, cursorY };
}
```

### **Complex Hooks Needing Refactoring** ⚠️

These hooks violate SRP and should be split:

#### 1. **useFaceTracking** (7 responsibilities)

**Current issues:**
- Initializes MediaPipe model
- Manages camera stream
- Spawns Web Worker for background processing
- Orchestrates coordinate mapping
- Applies adaptive lighting
- Handles all errors and edge cases
- Manages 10+ state variables

**Refactoring plan:**

```tsx
// NEW: Focused on MediaPipe model initialization
export function useMediaPipeModel() {
  const [model, setModel] = useState<FaceLandmarker | null>(null);
  const [modelLoading, setModelLoading] = useState(true);
  
  useEffect(() => {
    const initModel = async () => {
      const m = await FaceLandmarker.createFromOptions(/* ... */);
      setModel(m);
      setModelLoading(false);
    };
    initModel();
  }, []);
  
  return { model, modelLoading };
}

// NEW: Focused on camera stream management
export function useCameraStream(cameraId: string) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    // Camera setup logic only
  }, [cameraId]);
  
  return { stream, videoRef };
}

// NEW: Focused on Web Worker coordination
export function useTrackingWorker(landmarks: FaceLandmarks | null) {
  const [result, setResult] = useState(null);
  const workerRef = useRef<Worker | null>(null);
  
  useEffect(() => {
    // Worker communication only
  }, [landmarks]);
  
  return result;
}

// REFACTORED: Orchestrates the split hooks
export function useFaceTracking(cameraId: string, settings: CursorSettings) {
  const { model, modelLoading } = useMediaPipeModel();
  const { stream, videoRef } = useCameraStream(cameraId);
  const workerResult = useTrackingWorker(/* ... */);
  
  // Only orchestration logic here
  return { videoRef, faceLandmarks, isLoading };
}
```

#### 2. **useGestureControls** (5 independent gesture handlers)

**Current issues:**
- Manages blink detection
- Manages mouth open/smile gestures
- Manages head tilt scrolling
- Handles drag-to-click
- Dispatches all events

**Refactoring plan:**

```tsx
// NEW: Blink gesture logic
export function useBlinkGestures(landmarks: FaceLandmarks | null, settings: CursorSettings) {
  // Blink detection, double-blink, long-blink only
  return { isBlink, isDoubleBlink, isLongBlink };
}

// NEW: Mouth gesture logic
export function useMouthGestures(landmarks: FaceLandmarks | null, settings: CursorSettings) {
  // Mouth open, smile detection only
  return { isMouthOpen, isSmiling };
}

// NEW: Head tilt scroll logic
export function useHeadTiltScroll(headRotation: HeadRotation, settings: CursorSettings) {
  // Head tilt, scroll direction, throttling only
  return { scrollDirection, scrollAmount };
}

// NEW: Consolidate all gesture dispatch
export function useGestureDispatch(gestures: AllGestures) {
  // Dispatch events based on gestures
  // This is minimal and focused
}

// REFACTORED: Orchestrates gesture hooks
export function useGestureControls(landmarks, headData, settings) {
  const blinks = useBlinkGestures(landmarks, settings);
  const mouth = useMouthGestures(landmarks, settings);
  const scroll = useHeadTiltScroll(headData, settings);
  
  useGestureDispatch({ blinks, mouth, scroll });
}
```

---

## State Management

### **AppContext: Current Multi-Concern Design** ❌

```tsx
interface AppContextValue {
  // Settings responsibility
  settings: CursorSettings;
  setSettings: (updater: (prev: CursorSettings) => CursorSettings) => void;
  
  // Calibration responsibility
  calibration: CalibrationData;
  setCalibration: (next: CalibrationData) => void;
  
  // Device detection responsibility
  isPhoneMode: boolean;
  
  // Persistence (internal implementation detail)
  // + Migration logic (edge case complexity)
}
```

**Problems:**
1. Four unrelated concerns in one context
2. Mutation logic mixed with business logic
3. Migration and persistence scattered throughout
4. Hard to test individual concerns

### **Refactored Multi-Context Approach** ✅

```tsx
// 1. Settings context - only cursor settings
interface SettingsContextValue {
  settings: CursorSettings;
  updateSetting: <K extends keyof CursorSettings>(key: K, value: CursorSettings[K]) => void;
  resetToDefaults: () => void;
}

// 2. Calibration context - only calibration data
interface CalibrationContextValue {
  calibration: CalibrationData;
  addCalibrationPoint: (point: CalibrationPoint) => void;
  clearCalibration: () => void;
  isCalibrated: boolean;
}

// 3. Device context - only device detection
interface DeviceContextValue {
  isPhoneMode: boolean;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  pointerType: 'fine' | 'coarse';
}

// 4. External service - persistence logic only
export const settingsPersistence = {
  load: (key: string) => CursorSettings,
  save: (key: string, settings: CursorSettings) => void,
  migrate: (oldSettings: any) => CursorSettings
};
```

**Benefits:**
- Each context has one reason to change
- Easier to test and mock
- Clear separation of concerns
- Persistence is a pure service, not mixed into UI state

---

## Current Architecture Health

### **By Category**

| Area | Status | % Good | Issues |
|------|--------|--------|--------|
| **Presentation Components** | ✅ Good | 95% | Minor: Some could extract sub-components |
| **Single-Purpose Hooks** | ✅ Good | 90% | Good baseline implementations |
| **Multi-Purpose Hooks** | ⚠️ Moderate | 40% | `useFaceTracking`, `useGestureControls` need refactoring |
| **State Management** | ⚠️ Moderate | 50% | `AppContext` violates SRP, needs multi-context split |
| **Utilities** | ✅ Good | 85% | Minor: `voiceProfile.ts` mixes I/O with logic |
| **Overall** | ⚠️ Moderate | 70% | Good foundation; refactoring in progress |

### **Code Smells to Watch**

1. **Hooks with 200+ lines** → Likely violating SRP
2. **Contexts with 5+ properties** → Likely mixing concerns
3. **Components with 20+ props** → Likely doing too much
4. **Utilities that call multiple async APIs** → Likely mixing I/O with logic
5. **State updates in multiple places** → Likely missing abstraction

---

## Refactoring Roadmap

### **Phase 1: High-Impact, Lower-Risk** (2-3 sprints)

**Priority: Hook Extraction**

1. **Extract `useMediaPipeModel`** from `useFaceTracking`
   - ✅ No other files depend on internal model init
   - ✅ Independent and testable
   - Impact: Cleaner hook interface

2. **Extract `useCameraStream`** from `useFaceTracking`
   - ✅ Camera stream is re-usable
   - ✅ Separates device concerns from tracking
   - Impact: Enable camera-only features later

3. **Refactor `AppContext` → Multi-Context**
   - ⚠️ Medium risk: Used across many components
   - ✅ Non-breaking: Providers can wrap each other
   - 🔄 Strategy: Add new contexts, migrate incrementally

### **Phase 2: Medium-Impact** (3-4 sprints)

4. **Extract gesture hooks** from `useGestureControls`
   - Split into: `useBlinkGestures`, `useMouthGestures`, `useHeadTiltScroll`
   - Refactor main hook to orchestrate
   - Enable testing each gesture independently

5. **Refactor `SettingsPanel` component**
   - Extract domain-specific sub-components:
     - `CursorSettingsSubpanel`
     - `BlinkSettingsSubpanel`
     - `MouthSettingsSubpanel`
     - `ScrollSettingsSubpanel`
   - Keep parent as orchestrator

6. **Extract persistence service** from context
   - Create `src/services/settingsPersistence.ts`
   - Pure functions for load, save, migrate
   - No side effects in context

### **Phase 3: Lower-Priority, Good-to-Have** (Ongoing)

7. **Refactor `voiceProfile.ts`**
   - Extract audio I/O into `audioCapture.ts`
   - Extract feature extraction into `voiceFeatures.ts`
   - Simplify: core logic → pure functions

8. **Optimize `OnScreenKeyboard`**
   - Extract keyboard layout logic
   - Separate selection state from rendering

---

## Guidelines for New Code

### When Writing Components:

1. **Ask:** "Why would this component need to change?"
   - If there's more than one reason → split it

2. **Props over Context:** Pass data as props when possible
   - Context should be for global concerns only
   - Makes components more testable and reusable

3. **Separate UI from Logic:**
   ```tsx
   // ✅ Good: UI component + container
   const MyButton = ({ onClick, label }) => <button onClick={onClick}>{label}</button>;
   const MyButtonContainer = () => {
     const handleClick = () => { /* logic */ };
     return <MyButton onClick={handleClick} label="Click me" />;
   };
   
   // ❌ Bad: Mixed
   const MyButton = () => {
     const [state, setState] = useState();
     const { data } = useContext(AppContext);
     const handleClick = () => { /* complex logic */ };
     return <button onClick={handleClick}>{/* ... */}</button>;
   };
   ```

### When Writing Hooks:

1. **One Hook = One Concern**
   - If your hook has 2+ state variables doing different things → split
   - Exception: Related state that always changes together

2. **Avoid Orchestration in Hooks**
   - Hooks should provide logic, not coordinate other hooks
   - That's a job for components

3. **Pure Logic First**
   - Extract business logic to pure functions
   - Keep side effects in hooks minimal

```tsx
// ✅ Good: Pure function + side effect hook
const calculateSmoothedValue = (raw: number, prev: number, factor: number) => {
  return prev + (raw - prev) * factor;
};

export function useSmoothCursor(raw: number, factor: number) {
  const [smooth, setSmooth] = useState(raw);
  useEffect(() => {
    setSmooth(calculateSmoothedValue(raw, smooth, factor));
  }, [raw, factor]);
  return smooth;
}

// ❌ Bad: Business logic + side effects mixed
export function useSmoothCursor(raw: number, factor: number) {
  const [smooth, setSmooth] = useState(raw);
  const previousRef = useRef(raw);
  
  useEffect(() => {
    // Logic + side effect mixed
    previousRef.current = raw;
    setSmooth(prev => prev + (raw - prev) * factor);
  }, [raw, factor]);
  
  return smooth;
}
```

---

## Testing Guidelines

SRP makes testing easier:

```tsx
// ✅ Easy to test: Pure function
const result = eyeAspectRatio(mockLandmarks);
assert.equal(result, expectedValue);

// ✅ Easier to test: Single-concern hook
const { rerender } = render(<Component />, { wrapper: TestProvider });
expect(useSmoothCursor(0, 0.9)).toBe(0);
rerender(<Component />);
expect(useSmoothCursor(100, 0.9)).toBe(10);

// ❌ Hard to test: Multi-concern mixed
// Need to mock MediaPipe, spawn workers, manage streams, handle persistence, etc.
render(<App />, { wrapper: ComplexMockProvider });
```

---

## References

- [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle) — Wikipedia
- [Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) — Wikipedia
- [React Hooks Best Practices](https://legacy.reactjs.org/docs/hooks-rules.html)
- [Component Composition Strategies](https://kentcdodds.com/blog/application-state-management-with-react-hooks)

---

## Questions?

When in doubt about SRP, ask:
- **"What is this component/hook responsible for?"**
- **"Why would this need to change?"**
- **"Can I describe it in one sentence?"**

If you need multiple sentences or "and" appears multiple times → candidate for splitting.
