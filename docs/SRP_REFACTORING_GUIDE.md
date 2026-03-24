# SRP Refactoring Guide

This document provides specific, actionable refactoring steps to improve Single Responsibility Principle (SRP) compliance in NodCursor.

---

## Table of Contents

1. [Phase 1: Hook Extraction (High-Value, Lower-Risk)](#phase-1-hook-extraction)
2. [Phase 2: Context Refactoring (Medium-Risk, Long-term)](#phase-2-context-refactoring)
3. [Phase 3: Component Decomposition (Lower-Priority)](#phase-3-component-decomposition)
4. [Testing Strategy](#testing-strategy)
5. [Migration Checklist](#migration-checklist)

---

## Phase 1: Hook Extraction

### Goal: Break down `useFaceTracking` into focused, reusable hooks

**Current status:** 7-in-1 hook
**Target:** 4 specialized hooks + 1 orchestrator

### Task 1.1: Extract `useMediaPipeModel`

**File:** `src/hooks/useMediaPipeModel.ts` (new)

**Responsibility:** Initialize and manage MediaPipe FaceLandmarker model

**Implementation:**

```typescript
import { useEffect, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

interface UseMediaPipeModelResult {
  model: FaceLandmarker | null;
  isLoading: boolean;
  error: Error | null;
}

export function useMediaPipeModel(): UseMediaPipeModelResult {
  const [model, setModel] = useState<FaceLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initModel = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm`
        );

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/vision/face_landmarker/float16/latest/face_landmarker.task`,
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numFaces: 1
        });

        setModel(faceLandmarker);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize MediaPipe'));
      } finally {
        setIsLoading(false);
      }
    };

    initModel();

    return () => {
      // Cleanup if needed
    };
  }, []);

  return { model, isLoading, error };
}
```

**Testing:**

```typescript
describe('useMediaPipeModel', () => {
  it('should initialize model on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useMediaPipeModel());
    
    expect(result.current.isLoading).toBe(true);
    
    await waitForNextUpdate();
    
    expect(result.current.model).not.toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should set error on initialization failure', async () => {
    // Mock FilesetResolver to throw
    const expectedError = new Error('Model load failed');
    
    // Test error handling
  });
});
```

**Migration Path:**
- Create new hook with @new comments
- Update `useFaceTracking` to use it
- Test independently
- Remove old initialization code

---

### Task 1.2: Extract `useCameraStream`

**File:** `src/hooks/useCameraStream.ts` (new)

**Responsibility:** Manage camera access and media stream lifecycle

**Implementation:**

```typescript
import { useEffect, useRef, useState } from 'react';

interface UseCameraStreamResult {
  stream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  error: Error | null;
  isLoading: boolean;
}

export function useCameraStream(cameraId: string): UseCameraStreamResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setupCamera = async () => {
      try {
        setIsLoading(true);
        
        // Stop existing stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: cameraId ? { exact: cameraId } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Wait for video to be ready
          await new Promise(resolve => {
            videoRef.current!.onloadedmetadata = resolve;
          });
        }

        setStream(mediaStream);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to access camera'));
        setStream(null);
      } finally {
        setIsLoading(false);
      }
    };

    setupCamera();

    return () => {
      // Cleanup on unmount or cameraId change
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraId]);

  return { stream, videoRef, error, isLoading };
}
```

**Why this is valuable:**
- Reusable for camera-preview-only features
- Easier to test camera permissions and device list
- Isolates error handling for camera access
- Can be used in other contexts (streaming, etc.)

---

### Task 1.3: Extract `useTrackingWorker`

**File:** `src/hooks/useTrackingWorker.ts` (new)

**Responsibility:** Coordinate Web Worker for background processing

**Implementation:**

```typescript
import { useEffect, useRef, useState } from 'react';
import type { FaceLandmarks } from '../types';

interface TrackingWorkerResult {
  processedLandmarks: FaceLandmarks | null;
  isProcessing: boolean;
}

export function useTrackingWorker(
  landmarks: FaceLandmarks | null,
  settings: CursorSettings
): TrackingWorkerResult {
  const workerRef = useRef<Worker | null>(null);
  const [processedLandmarks, setProcessedLandmarks] = useState<FaceLandmarks | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize worker once
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/trackingWorker.ts', import.meta.url)
    );

    workerRef.current.onmessage = (event) => {
      setProcessedLandmarks(event.data);
      setIsProcessing(false);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Process landmarks with worker
  useEffect(() => {
    if (!landmarks || !workerRef.current) return;

    setIsProcessing(true);
    workerRef.current.postMessage({
      landmarks,
      settings
    });
  }, [landmarks, settings]);

  return { processedLandmarks, isProcessing };
}
```

**Key benefits:**
- Clean separation of worker lifecycle
- Testable independently
- Easy to add worker pooling later
- Clear message protocol

---

### Task 1.4: Refactor `useFaceTracking` to Orchestrator

**File:** `src/hooks/useFaceTracking.ts` (refactored)

**Before:**
```typescript
// 150+ lines, 7 concerns mixed together
export function useFaceTracking(cameraId: string, settings: CursorSettings) {
  // - Model init
  // - Camera setup
  // - Worker management
  // - Coordinate mapping
  // - Adaptive lighting
  // - Error handling
  // - 10+ useState calls
  // ...
}
```

**After:**
```typescript
import { useEffect, useState } from 'react';
import { useMediaPipeModel } from './useMediaPipeModel';
import { useCameraStream } from './useCameraStream';
import { useTrackingWorker } from './useTrackingWorker';
import { useCursorMapping } from './useCursorMapping';
import type { FaceLandmarks } from '../types';

interface UseFaceTrackingResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  faceLandmarks: FaceLandmarks | null;
  isLoading: boolean;
  error: Error | null;
}

export function useFaceTracking(
  cameraId: string,
  settings: CursorSettings
): UseFaceTrackingResult {
  // Compose specialized hooks
  const { model, isLoading: modelLoading, error: modelError } = useMediaPipeModel();
  const { stream, videoRef, error: cameraError, isLoading: cameraLoading } = useCameraStream(cameraId);
  const { processedLandmarks } = useTrackingWorker(/* ... */, settings);
  const { mappedCoordinates } = useCursorMapping(processedLandmarks, settings);

  const [faceLandmarks, setFaceLandmarks] = useState<FaceLandmarks | null>(null);
  const [error, setError] = useState<Error | null>(modelError || cameraError);

  // Main orchestration: run MediaPipe on video frames
  useEffect(() => {
    if (!model || !videoRef.current || !stream) return;

    let animationId: number;

    const process = () => {
      try {
        const results = model.detectForVideo(videoRef.current!, performance.now());
        const landmarks = results.faceLandmarks[0];
        setFaceLandmarks(landmarks || null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Processing error'));
      }

      animationId = requestAnimationFrame(process);
    };

    animationId = requestAnimationFrame(process);

    return () => cancelAnimationFrame(animationId);
  }, [model, stream, videoRef]);

  return {
    videoRef,
    faceLandmarks: mappedCoordinates || faceLandmarks,
    isLoading: modelLoading || cameraLoading,
    error: error || modelError || cameraError
  };
}
```

**After refactoring:** ~40 lines (vs. ~150 before)

**Key improvements:**
- Clear responsibilities
- Each hook can be tested independently
- Easy to swap components (e.g., use different model)
- Easy to add/remove features (adaptive lighting, etc.)

---

## Phase 2: Context Refactoring

### Goal: Split `AppContext` into domain-specific contexts

**Current status:** 1 context with 6 concerns
**Target:** 3-4 specialized contexts + 1 external service

### Task 2.1: Create `SettingsContext`

**File:** `src/context/SettingsContext.tsx` (new)

**Responsibility:** Cursor settings only (no persistence, no device detection)

```typescript
import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import type { CursorSettings } from '../types';

interface SettingsContextValue {
  settings: CursorSettings;
  updateSetting: <K extends keyof CursorSettings>(
    key: K,
    value: CursorSettings[K]
  ) => void;
  updateMultiple: (updates: Partial<CursorSettings>) => void;
  resetToDefaults: (defaults: CursorSettings) => void;
  isModified: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

interface SettingsProviderProps {
  children: React.ReactNode;
  initialSettings: CursorSettings;
}

export function SettingsProvider({ children, initialSettings }: SettingsProviderProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [original, setOriginal] = useState(initialSettings);

  const updateSetting = useCallback(<K extends keyof CursorSettings>(
    key: K,
    value: CursorSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateMultiple = useCallback((updates: Partial<CursorSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetToDefaults = useCallback((defaults: CursorSettings) => {
    setSettings(defaults);
    setOriginal(defaults);
  }, []);

  const isModified = JSON.stringify(settings) !== JSON.stringify(original);

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      updateMultiple,
      resetToDefaults,
      isModified
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
```

### Task 2.2: Create `CalibrationContext`

**File:** `src/context/CalibrationContext.tsx` (new)

**Responsibility:** Calibration data only

```typescript
import { createContext, useContext, useState } from 'react';
import type { CalibrationData } from '../types';

interface CalibrationContextValue {
  calibration: CalibrationData;
  updateCalibrationPoint: (key: keyof CalibrationData, value: number) => void;
  setCalibration: (data: CalibrationData) => void;
  resetCalibration: () => void;
  isCalibrated: boolean;
}

const CalibrationContext = createContext<CalibrationContextValue | null>(null);

const DEFAULT_CALIBRATION: CalibrationData = {
  centerX: 0.5,
  centerY: 0.5,
  leftX: 0.3,
  rightX: 0.7,
  upY: 0.3,
  downY: 0.7,
  calibrated: false
};

export function CalibrationProvider({ children }: { children: React.ReactNode }) {
  const [calibration, setCalibration] = useState<CalibrationData>(DEFAULT_CALIBRATION);

  const updateCalibrationPoint = (key: keyof CalibrationData, value: number) => {
    setCalibration(prev => ({ ...prev, [key]: value }));
  };

  const resetCalibration = () => {
    setCalibration(DEFAULT_CALIBRATION);
  };

  const isCalibrated = calibration.calibrated;

  return (
    <CalibrationContext.Provider value={{
      calibration,
      updateCalibrationPoint,
      setCalibration,
      resetCalibration,
      isCalibrated
    }}>
      {children}
    </CalibrationContext.Provider>
  );
}

export function useCalibration() {
  const context = useContext(CalibrationContext);
  if (!context) {
    throw new Error('useCalibration must be used within CalibrationProvider');
  }
  return context;
}
```

### Task 2.3: Create `DeviceContext`

**File:** `src/context/DeviceContext.tsx` (new)

**Responsibility:** Device detection only (phone mode, pointer type, etc.)

```typescript
import { createContext, useContext, useEffect, useState } from 'react';

interface DeviceContextValue {
  isPhoneMode: boolean;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  pointerType: 'fine' | 'coarse';
  isSupported: boolean;
}

const DeviceContext = createContext<DeviceContextValue | null>(null);

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [pointerType, setPointerType] = useState<'fine' | 'coarse'>('fine');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Detect phone mode
    const phoneMedia = window.matchMedia('(max-width: 768px), (pointer: coarse)');
    const updatePhoneMode = () => setIsPhoneMode(phoneMedia.matches);
    updatePhoneMode();

    phoneMedia.addEventListener?.('change', updatePhoneMode);
    return () => phoneMedia.removeEventListener?.('change', updatePhoneMode);
  }, []);

  useEffect(() => {
    // Detect pointer type
    const coarseMedia = window.matchMedia('(pointer: coarse)');
    setPointerType(coarseMedia.matches ? 'coarse' : 'fine');
  }, []);

  useEffect(() => {
    // Check browser support
    const supported = !!(
      navigator.mediaDevices?.getUserMedia &&
      typeof Worker !== 'undefined'
    );
    setIsSupported(supported);
  }, []);

  const deviceType = isPhoneMode ? 'mobile' : 'desktop';

  return (
    <DeviceContext.Provider value={{
      isPhoneMode,
      deviceType,
      pointerType,
      isSupported
    }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within DeviceProvider');
  }
  return context;
}
```

### Task 2.4: Create `settingsPersistence` Service

**File:** `src/services/settingsPersistence.ts` (new)

**Responsibility:** localStorage I/O, migrations, serialization only

```typescript
import type { CursorSettings } from '../types';

const DESKTOP_SETTINGS_KEY = 'head-cursor-settings-desktop';
const MOBILE_SETTINGS_KEY = 'head-cursor-settings-mobile';
const LEGACY_SETTINGS_KEY = 'head-cursor-settings';
const MIGRATION_KEY = 'head-cursor-mirror-flipped-v2';

export const settingsPersistence = {
  /**
   * Load settings from localStorage with fallback to defaults
   */
  load: (key: string, defaults: CursorSettings): CursorSettings => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaults;
      return { ...defaults, ...JSON.parse(raw) } as CursorSettings;
    } catch {
      return defaults;
    }
  },

  /**
   * Save settings to localStorage
   */
  save: (key: string, settings: CursorSettings): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(settings));
      return true;
    } catch {
      // Quota exceeded, private mode, etc.
      return false;
    }
  },

  /**
   * Migrate old settings format to current
   */
  migrate: (oldSettings: any): CursorSettings => {
    // Add migration logic here as needed
    return oldSettings;
  },

  /**
   * Load with migration from legacy keys
   */
  loadWithMigration: (desktopDefaults: CursorSettings, mobileDefaults: CursorSettings) => {
    const hasRun = localStorage.getItem(MIGRATION_KEY) === 'done';

    const desktop = this.load(DESKTOP_SETTINGS_KEY, desktopDefaults);
    const legacy = this.load(LEGACY_SETTINGS_KEY, desktop);
    const finalDesktop = { ...desktop, ...legacy };

    if (!hasRun) {
      // Mark camera mirroring corrected
      const mirrored = { ...finalDesktop, mirrorCamera: true };
      this.save(DESKTOP_SETTINGS_KEY, mirrored);
      this.save(MOBILE_SETTINGS_KEY, { ...mobileDefaults, mirrorCamera: true });
      localStorage.setItem(MIGRATION_KEY, 'done');
      return { desktop: mirrored, mobile: { ...mobileDefaults, mirrorCamera: true } };
    }

    const mobile = this.load(MOBILE_SETTINGS_KEY, mobileDefaults);
    return { desktop: finalDesktop, mobile };
  }
};
```

### Task 2.5: Update `App.tsx` to use new contexts

**Before:**
```typescript
<AppProvider>
  {/* Everything uses single context */}
</AppProvider>
```

**After:**
```typescript
<DeviceProvider>
  <SettingsProvider initialSettings={loadedSettings}>
    <CalibrationProvider>
      <App />
    </CalibrationProvider>
  </SettingsProvider>
</DeviceProvider>
```

**Migration checklist:**
- [ ] Create 3 new context files
- [ ] Create persistence service
- [ ] Update App.tsx wrapper
- [ ] Replace `useContext(AppContext)` with `useSettings()`, `useCalibration()`, `useDevice()`
- [ ] Test each context independently
- [ ] Remove old `AppContext` entirely

---

## Phase 3: Component Decomposition

### Goal: Break down `SettingsPanel` into domain-specific sub-panels

**Current issue:** Single component rendering 25+ settings without logical grouping

**Refactoring strategy:**

```
SettingsPanel (container)
├── CursorSettingsPanel (sensitivity, acceleration, deadzone)
├── BlinkSettingsPanel (blink thresholds, cooldowns)
├── MouthSettingsPanel (open, smile, typing modes)
└── ScrollSettingsPanel (head tilt, scroll behavior)
```

### Example: Extract `BlinkSettingsPanel`

**File:** `src/components/SettingsPanel/BlinkSettingsPanel.tsx` (new)

```typescript
import { useSettings } from '../../context/SettingsContext';

export function BlinkSettingsPanel() {
  const { settings, updateSetting } = useSettings();

  return (
    <div className="space-y-4 rounded-lg border border-app-accent/20 bg-app-panel p-4">
      <h3 className="text-lg font-semibold">Blink Detection</h3>

      <div>
        <label htmlFor="blink-enabled">
          <input
            id="blink-enabled"
            type="checkbox"
            checked={settings.blinkEnabled}
            onChange={e => updateSetting('blinkEnabled', e.target.checked)}
          />
          Enable Blink Gestures
        </label>
      </div>

      {settings.blinkEnabled && (
        <>
          <Slider
            label="Click Sensitivity"
            value={settings.clickSensitivity}
            min={0.1}
            max={0.5}
            step={0.01}
            onChange={v => updateSetting('clickSensitivity', v)}
            help="Lower = easier to trigger"
          />

          <Slider
            label="Double Blink Window (ms)"
            value={settings.doubleBlinkWindowMs}
            min={200}
            max={800}
            step={50}
            onChange={v => updateSetting('doubleBlinkWindowMs', v)}
            help="Max time between blinks to count as double"
          />
          {/* More blink-related settings */}
        </>
      )}
    </div>
  );
}
```

Benefits of this approach:
- Each sub-panel is independently testable
- Settings grouped logically
- Easier to hide/show sections
- Reduces main component complexity

---

## Testing Strategy

### For Extracted Hooks

```typescript
describe('useMediaPipeModel', () => {
  it('initializes model on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(useMediaPipeModel);
    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.model).toBeTruthy();
  });
});

describe('useCameraStream', () => {
  it('requests camera permission', async () => {
    const { result } = renderHook(() => useCameraStream('camera-id'));
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
  });
});
```

### For Split Contexts

```typescript
describe('SettingsContext', () => {
  it('updates individual setting', () => {
    const wrapper = ({ children }) => (
      <SettingsProvider initialSettings={defaultSettings}>
        {children}
      </SettingsProvider>
    );
    const { result } = renderHook(useSettings, { wrapper });
    
    act(() => {
      result.current.updateSetting('sensitivity', 1.5);
    });
    
    expect(result.current.settings.sensitivity).toBe(1.5);
  });
});
```

---

## Migration Checklist

### Pre-Refactoring
- [ ] Current tests passing
- [ ] Feature branch created
- [ ] Documentation reviewed

### Phase 1: Hook Extraction
- [ ] `useMediaPipeModel` created and tested
- [ ] `useCameraStream` created and tested
- [ ] `useTrackingWorker` created and tested
- [ ] `useFaceTracking` refactored to orchestrator
- [ ] All usages updated
- [ ] Demo page tested

### Phase 2: Context Refactoring
- [ ] `SettingsContext` created
- [ ] `CalibrationContext` created
- [ ] `DeviceContext` created
- [ ] `settingsPersistence` service created
- [ ] `App.tsx` updated with new providers
- [ ] All usages of `AppContext` migrated
- [ ] Settings page tested
- [ ] Calibration page tested
- [ ] Mobile detection verified

### Phase 3: Component Decomposition
- [ ] `CursorSettingsPanel` extracted
- [ ] `BlinkSettingsPanel` extracted
- [ ] `MouthSettingsPanel` extracted
- [ ] `ScrollSettingsPanel` extracted
- [ ] Settings page tested
- [ ] All settings editable and persistent

### Post-Refactoring
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Performance benchmarks maintained
- [ ] Code review completed
- [ ] Documentation updated
- [ ] PR merged to develop

---

## Expected Outcomes

After completing these refactorings:

**Better Code:**
- 30% fewer lines in hooks (complexity reduction)
- Each file has single, clear responsibility
- Easier to understand data flow
- Simpler error handling

**Better Testing:**
- Can test hooks in isolation
- Can mock individual contexts
- Clearer test boundaries
- Easier to add new tests

**Better Maintenance:**
- Easier to locate bugs
- Easier to add features
- Onboarding new contributors faster
- Reduces technical debt

**Better Performance:**
- Fewer re-renders (context splitting)
- More granular memoization possible
- Easier to optimize bottlenecks

---

## Questions & Help

- **"Why split contexts instead of using Redux?"** → Redux adds complexity; context split is simpler and sufficient for NodCursor's needs.
- **"Will this break existing code?"** → Provide compatibility shims in transition period if needed.
- **"How long will this take?"** → Phase 1: 1-2 sprints, Phase 2: 2-3 sprints, Phase 3: 1-2 sprints.
- **"Should we do all phases?"** → Start with Phase 1 (highest ROI). Phases 2-3 are optional but recommended.

---

**Need help?** Open an issue or discussion in the repository!
