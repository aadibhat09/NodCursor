# NodCursor Testing & Code Coverage Strategy

**Sprint 9 Goal:** Achieve >50% code coverage with comprehensive test suite  
**Target Coverage:** 60% unit tests + 45% integration tests + 40% component tests  
**Framework:** Vitest/Jest + React Testing Library  
**Date:** March 29, 2026

---

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Test Infrastructure Setup](#test-infrastructure-setup)
3. [Test Categories & Targets](#test-categories--targets)
4. [Critical Path Testing](#critical-path-testing)
5. [Coverage Goals by Module](#coverage-goals-by-module)
6. [Testing Procedures](#testing-procedures)
7. [CI/CD Integration](#cicd-integration)
8. [Known Testing Challenges](#known-testing-challenges)

---

## Testing Overview

### Why Testing Matters for NodCursor

This is a **real-time, safety-critical application** where accessibility depends on reliability:

1. **Accuracy**: Gesture misrecognition locks users out
2. **Performance**: Lag in cursor response breaks usability  
3. **Stability**: Crashes affect disabled users disproportionately
4. **Compatibility**: Must work across devices and browsers

### Test Pyramid

```
           □ E2E Tests (5-10%)
          □ □ Integration Tests (20-30%)
        □ □ □ Component Tests (30-40%)
      □ □ □ □ Unit Tests (40-60%)
```

---

## Test Infrastructure Setup

### Installation

```bash
# Install test dependencies
npm install --save-dev vitest @vitest/ui vitest-coverage-v8
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev jsdom
npm install --save-dev @types/vitest

# For mocking MediaPipe and TensorFlow
npm install --save-dev @testing-library/user-event
npm install --save-dev jest-canvas-mock
```

### Configuration: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'docs/',
        '**/*.d.ts',
      ],
      lines: 50,     // Minimum 50% line coverage
      functions: 50,
      branches: 45,  // Branches harder to cover
      statements: 50,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Setup File: `vitest.setup.ts`

```typescript
import '@testing-library/jest-dom'
import 'jest-canvas-mock'

// Mock MediaPipe (large library, not needed for unit tests)
vi.mock('@mediapipe/tasks-vision', () => ({
  FaceLandmarker: vi.fn(),
  FilesetResolver: vi.fn(() => ({
    then: vi.fn((cb) => cb({})),
  })),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Setup global test utilities
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

### npm Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch"
  }
}
```

---

## Test Categories & Targets

### Unit Tests: 60% Coverage Target

**Pure Functions Without Dependencies**

#### 1. **Calibration Utils** ([tests/utils/calibration/mapToViewport.test.ts](./mapToViewport.test.ts))

```typescript
import { describe, it, expect } from 'vitest'
import { mapToViewport } from '@/utils/calibration/mapToViewport'

describe('mapToViewport', () => {
  it('should map raw coordinates to viewport output', () => {
    const calibration = {
      topLeft: { raw: { x: 0, y: 0 }, screen: { x: 0, y: 0 } },
      bottomRight: { raw: { x: 100, y: 100 }, screen: { x: 1920, y: 1080 } },
    }
    const result = mapToViewport(50, 50, calibration)
    expect(result.x).toBe(960)
    expect(result.y).toBe(540)
  })

  it('should handle out-of-bounds coordinates with clamping', () => {
    const calibration = { /* ... */ }
    const result = mapToViewport(-10, -10, calibration)
    expect(result.x).toBeGreaterThanOrEqual(0)
    expect(result.y).toBeGreaterThanOrEqual(0)
  })

  it('should interpolate smoothly between calibration points', () => {
    // Test with multiple calibration points
    // Verify linear interpolation
  })
})
```

**Target:** 90% coverage
- Boundary conditions (min, max, out-of-bounds)
- Interpolation accuracy
- Edge cases (single point, collinear points)

#### 2. **Smoothing Algorithms** ([tests/utils/smoothing/kalmanFilter.test.ts](./kalmanFilter.test.ts))

```typescript
describe('KalmanFilter', () => {
  it('should reduce noise from noisy input signal', () => {
    const filter = new KalmanFilter({ q: 0.01, r: 4 })
    const noisySignal = [10, 12, 15, 14, 9, 11] // Noisy
    const smoothed = noisySignal.map(x => filter.update(x))
    
    // Verify smoother output
    const variance = calculateVariance(smoothed)
    expect(variance).toBeLessThan(calculateVariance(noisySignal))
  })

  it('should track signal with minimal lag', () => {
    const filter = new KalmanFilter()
    const step = [0, 5, 10, 10, 10] // Step change
    const outputs = step.map(x => filter.update(x))
    
    // Should track to ~10 within 3 samples
    expect(outputs[4]).toBeGreaterThan(8)
  })
})
```

**Target:** 85% coverage
- Noise reduction effectiveness
- Lag measurement
- Parameter sensitivity

#### 3. **Gesture Detection** ([tests/utils/gestureDetection/eyeAspectRatio.test.ts](./eyeAspectRatio.test.ts))

```typescript
describe('eyeAspectRatio', () => {
  it('should detect open eye (high EAR value)', () => {
    const openEyeLandmarks = [
      { x: 0, y: 0.5 }, // left
      { x: 0.2, y: 0.4 },
      { x: 0.4, y: 0.5 },
      { x: 0.6, y: 0.5 }, // right
      { x: 0.5, y: 0.3 },
      { x: 0.5, y: 0.7 },
    ]
    const ear = eyeAspectRatio(openEyeLandmarks)
    expect(ear).toBeGreaterThan(0.3) // Open eye threshold
  })

  it('should detect closed eye (low EAR value)', () => {
    const closedEyeLandmarks = [
      { x: 0, y: 0.5 },
      { x: 0.2, y: 0.5 },
      { x: 0.4, y: 0.5 },
      { x: 0.6, y: 0.5 },
      { x: 0.5, y: 0.5 },
      { x: 0.5, y: 0.5 },
    ]
    const ear = eyeAspectRatio(closedEyeLandmarks)
    expect(ear).toBeLessThan(0.15) // Closed eye threshold
  })
})
```

**Target:** 88% coverage
- Boundary conditions (EAR thresholds)
- Different eye shapes/orientations

#### 4. **Voice Profile** ([tests/utils/voiceProfile.test.ts](./voiceProfile.test.ts))

```typescript
describe('Voice Profile', () => {
  it('should create unique profile hash', () => {
    const profile1 = { baseFreq: 100, pitchRange: 30, speechRate: 150 }
    const profile2 = { baseFreq: 120, pitchRange: 35, speechRate: 160 }
    
    const hash1 = createProfileHash(profile1)
    const hash2 = createProfileHash(profile2)
    
    expect(hash1).not.toBe(hash2)
  })

  it('should persist and restore profile from storage', () => {
    const profile = { /* ... */ }
    saveVoiceProfile(profile)
    
    const restored = loadVoiceProfile()
    expect(restored).toEqual(profile)
  })
})
```

**Target:** 80% coverage
- Hash uniqueness
- Storage persistence
- Profile matching

### Integration Tests: 45% Coverage Target

#### 1. **Gesture Controls Hook** ([tests/hooks/useGestureControls.test.ts](./useGestureControls.test.ts))

```typescript
import { renderHook, act } from '@testing-library/react'
import { useGestureControls } from '@/hooks/useGestureControls'

describe('useGestureControls', () => {
  it('should detect single blink gesture and execute left click', () => {
    const handlers = {
      onLeftClick: vi.fn(),
      onRightClick: vi.fn(),
    }

    const { result } = renderHook(() =>
      useGestureControls(handlers, settings)
    )

    act(() => {
      result.current.processGesture({
        blink: true,
        doubleBlink: false,
        leftSmile: 0.5,
      })
    })

    expect(handlers.onLeftClick).toHaveBeenCalled()
  })

  it('should debounce rapid blink gestures', () => {
    const handlers = { onLeftClick: vi.fn() }
    const { result } = renderHook(() =>
      useGestureControls(handlers, settings)
    )

    act(() => {
      // Rapid blinks within debounce window
      for (let i = 0; i < 5; i++) {
        result.current.processGesture({ blink: true })
      }
    })

    // Should only click once
    expect(handlers.onLeftClick).toHaveBeenCalledTimes(1)
  })
})
```

**Target:** 70% coverage of useGestureControls
- Gesture detection accuracy
- Debouncing effectiveness
- Handler invocation

#### 2. **Face Tracking Hook** ([tests/hooks/useFaceTracking.test.ts](./useFaceTracking.test.ts))

```typescript
describe('useFaceTracking', () => {
  it('should initialize MediaPipe and detect faces', async () => {
    const mockCamera = { current: document.createElement('video') }
    
    const { result } = renderHook(() =>
      useFaceTracking(mockCamera, settings)
    )

    await act(async () => {
      await vi.waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })
    })
  })

  it('should handle camera errors gracefully', async () => {
    const mockCamera = { current: null }
    
    const { result } = renderHook(() =>
      useFaceTracking(mockCamera, settings)
    )

    await act(async () => {
      await vi.waitFor(() => {
        expect(result.current.error).toBeDefined()
      })
    })
  })
})
```

**Target:** 65% coverage of useFaceTracking
- Initialization flow
- Error handling
- State transitions

#### 3. **Smoothing Pipeline** ([tests/hooks/useSmoothCursor.test.ts](./useSmoothCursor.test.ts))

```typescript
describe('useSmoothCursor', () => {
  it('should apply multiple smoothing filters in sequence', () => {
    const rawCoords = Array.from({ length: 100 }, (_, i) => ({
      x: i + Math.random() * 2 - 1,
      y: i + Math.random() * 2 - 1,
    }))

    const { result } = renderHook(() =>
      useSmoothCursor(settings)
    )

    const smoothed = []
    rawCoords.forEach(coord => {
      act(() => {
        smoothed.push(result.current.smoothCoordinates(coord))
      })
    })

    // Verify smoothing reduced variance
    const rawVariance = calculateVariance(rawCoords.map(c => c.x))
    const smoothedVariance = calculateVariance(smoothed.map(c => c.x))
    expect(smoothedVariance).toBeLessThan(rawVariance)
  })
})
```

**Target:** 70% coverage
- Filter composition
- Variance reduction
- Performance (no lag spike)

### Component Tests: 40% Coverage Target

#### 1. **CursorOverlay Component** ([tests/components/CursorOverlay/CursorOverlay.test.tsx](./CursorOverlay.test.tsx))

```typescript
import { render, screen } from '@testing-library/react'
import { CursorOverlay } from '@/components/CursorOverlay/CursorOverlay'

describe('CursorOverlay', () => {
  it('should render cursor at provided coordinates', () => {
    render(
      <CursorOverlay
        x={50}
        y={30}
        isActive={true}
        isClicking={false}
      />
    )

    const cursor = screen.getByTestId('cursor-dot')
    const style = window.getComputedStyle(cursor)
    
    expect(style.left).toBe('50%')
    expect(style.top).toBe('30%')
  })

  it('should show click indicator when clicking', () => {
    const { rerender } = render(
      <CursorOverlay
        x={50}
        y={50}
        isActive={true}
        isClicking={false}
      />
    )

    expect(screen.queryByTestId('click-indicator')).not.toBeInTheDocument()

    rerender(
      <CursorOverlay
        x={50}
        y={50}
        isActive={true}
        isClicking={true}
      />
    )

    expect(screen.getByTestId('click-indicator')).toBeInTheDocument()
  })

  it('should hide when inactive', () => {
    const { container } = render(
      <CursorOverlay
        x={50}
        y={50}
        isActive={false}
        isClicking={false}
      />
    )

    const overlay = container.querySelector('[data-testid="cursor-overlay"]')
    expect(overlay).toHaveClass('opacity-0')
  })
})
```

**Target:** 80% coverage
- Position rendering
- State-dependent visibility
- Interactive states

#### 2. **Settings Panel** ([tests/components/SettingsPanel/SettingsPanel.test.tsx](./SettingsPanel.test.tsx))

```typescript
describe('SettingsPanel', () => {
  it('should render all settings controls', () => {
    render(
      <SettingsPanel
        settings={defaultSettings}
        onSettingChange={vi.fn()}
      />
    )

    expect(screen.getByLabelText(/sensitivity/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/smoothing/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/blink/i)).toBeInTheDocument()
  })

  it('should call onSettingChange when value updates', async () => {
    const handleChange = vi.fn()
    const { user } = render(
      <SettingsPanel
        settings={defaultSettings}
        onSettingChange={handleChange}
      />
    )

    const sensitivitySlider = screen.getByLabelText(/sensitivity/i)
    await user.tripleClick(sensitivitySlider)
    await user.keyboard('{Backspace}0.5{Enter}')

    expect(handleChange).toHaveBeenCalledWith(
      'sensitivity',
      0.5
    )
  })
})
```

**Target:** 75% coverage
- Control rendering
- Event handling
- Value updates

### E2E Tests: 5-10% Coverage

#### Critical User Workflows

```typescript
import { test, expect } from '@playwright/test'

test('user can calibrate and control cursor', async ({ page }) => {
  // 1. Navigate to calibration
  await page.goto('/calibration')
  
  // 2. Perform calibration points
  const calibrationButton = page.locator('text="Start Calibration"')
  await calibrationButton.click()
  
  // 3. Simulate face tracking (via mock)
  await page.evaluate(() => {
    // Mock face detection
    window.dispatchEvent(new CustomEvent('faceDetected', {
      detail: { landmarks: [...] }
    }))
  })
  
  // 4. Verify cursor appears
  const cursor = page.locator('[data-testid="cursor-dot"]')
  await expect(cursor).toBeVisible()
})
```

---

## Critical Path Testing

### Priority 1: Must Pass (Accessibility Critical)

1. **Calibration Accuracy** — Users locked out if maps incorrectly
```typescript
// Target: 100% accuracy within 10px tolerance
test('calibration maps points to within 10px', () => { /* ... */ })
```

2. **Blink Detection** — Primary input method
```typescript
// Target: 95% true-positive rate for blinks
test('detects genuine blinks with 95% accuracy', () => { /* ... */ })
```

3. **Cursor Smoothing** — Should not create lag or jitter
```typescript
// Target: <100ms latency, <5px jitter
test('smoothing maintains sub-100ms latency', () => { /* ... */ })
```

### Priority 2: Important (Feature Critical)

4. **Settings Persistence** — Users must not lose configuration
```typescript
test('settings persist after page reload', () => { /* ... */ })
```

5. **Gesture Debouncing** — Prevent accidental double-actions
```typescript
test('debouncing prevents unintended double-clicks', () => { /* ... */ })
```

### Priority 3: Nice to Have (Polish)

6. **UI Responsiveness** — Smooth animations on various devices
```typescript
test('cursor animation is smooth at 60fps', () => { /* ... */ })
```

---

## Coverage Goals by Module

| Module | Target | Current | Test Files | Priority |
|---|---|---|---|---|
| **utils/calibration/** | 90% | 0% | mapToViewport.test.ts | High High |
| **utils/smoothing/** | 85% | 0% | kalmanFilter.test.ts, exponential.test.ts | High High |
| **utils/gestureDetection/** | 88% | 0% | eyeAspectRatio.test.ts | High High |
| **utils/ml/** | 75% | 0% | adaptiveLightLearner.test.ts | Medium Medium |
| **utils/voiceProfile.ts** | 80% | 0% | voiceProfile.test.ts | Medium Medium |
| **hooks/useFaceTracking.ts** | 70% | 0% | useFaceTracking.test.ts | High High |
| **hooks/useGestureControls.ts** | 75% | 0% | useGestureControls.test.ts | High High |
| **hooks/useSmoothCursor.ts** | 75% | 0% | useSmoothCursor.test.ts | High High |
| **hooks/useCursorMapping.ts** | 80% | 0% | useCursorMapping.test.ts | Medium Medium |
| **components/CursorOverlay/** | 80% | 0% | CursorOverlay.test.tsx | Medium Medium |
| **components/SettingsPanel/** | 70% | 0% | SettingsPanel.test.tsx | Medium Medium |
| **components/GestureIndicators/** | 65% | 0% | GestureIndicators.test.tsx | Low Low |
| **context/AppContext.tsx** | 60% | 0% | AppContext.test.tsx | Medium Medium |
| **pages/** | 40% | 0% | Page integration tests | Low Low |

**Total Target:** >50% overall coverage (preferably 55-65%)

---

## Testing Procedures

### Manual Testing Checklist

Before each release, manual test these scenarios:

**Hardware/Browser Compatibility:**
- [ ] Firefox latest (Mac, Windows, Linux)
- [ ] Chrome latest (Mac, Windows, Linux)  
- [ ] Safari latest (Mac, iPad)
- [ ] Touchscreen devices (if available)
- [ ] Different camera types (built-in, USB, external)

**Accessibility:**
- [ ] Keyboard navigation (Tab, Arrow keys, Enter)
- [ ] Screen reader (VoiceOver/NVDA) compatibility
- [ ] High contrast mode activation
- [ ] Zoom levels (100%, 150%, 200%)

**User Workflows:**
- [ ] First-time setup (calibration → demo)
- [ ] Settings save/load persistence
- [ ] Gesture recognition across lighting conditions
- [ ] Settings import/export functionality (Sprint 9)

### Continuous Testing

```bash
# Run tests locally before push
npm run test:run

# Run tests in watch mode during development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Open coverage UI
npm run test:ui
```

---

## CI/CD Integration

### GitHub Actions Workflow: `.github/workflows/test.yml`

```yaml
name: Test & Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:run
      
      - name: Generate coverage
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: true
          verbose: true

      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          lcov-file: ./coverage/lcov.info
```

### Coverage Badge in README

```markdown
[![Coverage Status](https://codecov.io/gh/username/NodCursor/branch/main/graph/badge.svg)](https://codecov.io/gh/username/NodCursor)
```

---

## Known Testing Challenges

### 1. MediaPipe Mocking

**Challenge**: MediaPipe is a large native library; full loading in tests is slow

**Solution**:
```typescript
// Mock at top level for unit tests
vi.mock('@mediapipe/tasks-vision', () => ({
  FaceLandmarker: vi.fn(),
  FilesetResolver: Promise.resolve({}),
}))

// For integration tests, use real initialization with timeout
```

### 2. Camera Access

**Challenge**: Tests can't access real webcam

**Solution**:
```typescript
// Create mock MediaStream
const mockCanvas = document.createElement('canvas')
const mockStream = mockCanvas.captureStream() as MediaStream
```

### 3. Real-Time Gesture Timing

**Challenge**: Gesture detection depends on precise timing

**Solution**:
```typescript
// Use vi.useFakeTimers() for deterministic timing
vi.useFakeTimers()
const timer = vi.advanceTimersByTime(500)
vi.useRealTimers()
```

### 4. Canvas Rendering

**Challenge**: Canvas context can't be fully tested in jsdom

**Solution**:
```typescript
// Use jest-canvas-mock for basic verification
// For complex drawing, test with Playwright E2E
```

### 5. Performance Benchmarking

**Challenge**: Need to verify smoothing doesn't cause lag

**Solution**:
```typescript
// Use performance.now() for timing
const start = performance.now()
const result = kalmanFilter.update(input)
const duration = performance.now() - start
expect(duration).toBeLessThan(5) // Max 5ms per frame
```

---

## Success Criteria

Each test must:

-  Be **independent** (no test depends on another's result)
-  Be **deterministic** (same input → same output always)
-  Be **focused** (one concept per test)
-  Have **clear assertions** (specific expected values)
-  Be **fast** (unit tests <100ms, integration <500ms)
-  Have **meaningful names** (describe behavior, not implementation)

Example of good test name:
```typescript
it('should smooth rapid cursor movements and reduce pixel jitter by 80%', () => { /* ... */ })
```

Example of bad test name:
```typescript
it('works', () => { /* ... */ })
```

---

## Sprint 9 Timeline

**Week 34 (Day 1-2)**: Set up test infrastructure  
**Week 34 (Day 3-5)**: Write unit tests (target 30% coverage)  
**Week 35 (Day 1-2)**: Write integration tests (target 20% coverage)  
**Week 35 (Day 3-5)**: Component tests and polish (target 50%+ total)  
**Week 36**: Maintain coverage, final verification  

---

**Document Status:** v1.0 - Ready for implementation  
**Last Updated:** March 29, 2026  
**Maintained By:** NodCursor Development Team
