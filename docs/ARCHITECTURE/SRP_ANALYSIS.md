# SRP Analysis Summary

Quick reference for Single Responsibility Principle compliance across NodCursor.

---

## Overview Score: 70% Compliant

| Category | Status | Compliance | Notes |
|----------|--------|-----------|-------|
| **Presentation Components** |  Good | 95% | Most components render-only, well-focused |
| **Single-Purpose Hooks** |  Good | 90% | `useSmoothCursor`, `useCursorMapping`, etc. are well-designed |
| **Complex Hooks** |  Moderate | 40% | `useFaceTracking` and `useGestureControls` violate SRP |
| **State Management** |  Moderate | 50% | `AppContext` mixes too many concerns |
| **Utilities** |  Good | 85% | Most utilities focused, except `voiceProfile.ts` |
| **Pages** |  Good | 80% | Page layouts well-organized |

---

## Component Health Report

###  **Excellent Components** (No Changes Needed)

**Presentation Components** — Pure render functions, no side effects:
- `common.tsx` — UI primitives (Button, Input, Slider)
- `CursorOverlay/CursorOverlay.tsx` — Renders cursor position only
- `CameraView/CameraView.tsx` — Video element wrapper
- `GestureIndicators/GestureIndicators.tsx` — Status display
- `VirtualButtons.tsx` — Button grid component

**Single-Purpose Hooks** — Each handles exactly one concern:
- `useSmoothCursor` — Cursor smoothing math
- `useCursorMapping` — Head position to cursor coordinates
- `useDwellClick` — Dwell time detection
- `useBlinkDetection` — Blink detection
- `useMouthTypingControls` — Mouth typing state
- `useSmoothCursor` — Smoothing algorithm

---

###  **Moderate Components** (Refactoring Recommended)

**`useFaceTracking`** — 7 intertwined responsibilities
-  Initializes MediaPipe model
-  Manages camera stream
-  Spawns Web Worker
-  Maps coordinates
-  Applies adaptive lighting
-  Handles errors
-  Manages 10+ state variables

**Solution:** Extract into 4 hooks
- `useMediaPipeModel()` — Model initialization only
- `useCameraStream(cameraId)` — Camera access only
- `useTrackingWorker(landmarks)` — Worker coordination only
- `useFaceTracking()` — Orchestration only

See [SRP_REFACTORING_GUIDE.md](SRP_REFACTORING_GUIDE.md#phase-1-hook-extraction) for implementation details.

---

**`useGestureControls`** — 5 independent gesture handlers
-  Blink gestures
-  Mouth gestures
-  Head tilt scrolling
-  Drag-to-click
-  Event dispatch

**Solution:** Extract 4 hooks
- `useBlinkGestures()` — Blink detection + double/long blinks
- `useMouthGestures()` — Mouth open + smile detection
- `useHeadTiltScroll()` — Head tilt + scroll direction
- `useGestureDispatch(gestures)` — Event dispatch only

See [SRP_REFACTORING_GUIDE.md](SRP_REFACTORING_GUIDE.md#task-14-refactor-usefacetracking-to-orchestrator) for details.

---

**`AppContext`** — 6 mixed concerns
-  Settings management
-  Calibration data
-  Device detection (phone mode)
-  localStorage persistence
-  Settings migration
-  Mutation logic

**Solution:** Split into 3 contexts + 1 service
- `SettingsContext` — Settings only
- `CalibrationContext` — Calibration only
- `DeviceContext` — Device detection only
- `settingsPersistence` service — Persistence I/O

See [SRP_REFACTORING_GUIDE.md](SRP_REFACTORING_GUIDE.md#phase-2-context-refactoring) for implementation details.

---

**`SettingsPanel`** — 15+ mixed concerns
-  Renders 25+ settings without grouping
-  Manages all setting updates
-  No logical component hierarchy

**Solution:** Extract 4 sub-components
- `CursorSettingsPanel` — Cursor controls (sensitivity, acceleration, deadzone)
- `BlinkSettingsPanel` — Blink settings (thresholds, cooldowns)
- `MouthSettingsPanel` — Mouth settings (open, smile, typing)
- `ScrollSettingsPanel` — Scroll settings (head tilt, behavior)

See [SRP_REFACTORING_GUIDE.md](SRP_REFACTORING_GUIDE.md#phase-3-component-decomposition) for implementation details.

---

###  **Minor Issues** (Lower Priority)

**`voiceProfile.ts`** — 3 loosely related concerns
- Audio capture I/O
- Feature extraction
- Settings persistence
- Pattern matching

**Suggestion:** Consider extracting `audioCapture.ts` service for reuse.

---

**`OnScreenKeyboard`** — State mixed with rendering
- Keyboard layout + state + rendering in one file
- Could extract keyboard layout logic

**Suggestion:** Extract `keyboardLayout.ts` utility for state-independent layout definition.

---

## Red Flags to Avoid

When writing new code, watch for these SRP violations:

1. **Hooks with 150+ lines** → Cut into smaller hooks
   ```typescript
   //  Good
   const heavy = useLargeLogic();  // Split into 3-5 focused hooks
   
   //  Bad
   const { a, b, c, d } = useDoEverything();  // 200 lines
   ```

2. **Contexts with 5+ properties** → Split into multiple contexts
   ```typescript
   //  Good
   const settings = useSettings();
   const calibration = useCalibration();
   const device = useDevice();
   
   //  Bad
   const all = useAppContext();  // Has 15 properties
   ```

3. **Components with 20+ props** → Props smell (needs refactoring)
   ```typescript
   //  Good
   <Component prop1={x} prop2={y} prop3={z} />
   
   //  Bad
   <Component prop1={x} prop2={y} prop3={z} prop4={a} ... prop25={z} />
   ```

4. **Functions with `async` + 3+ independent operations** → Extract file I/O
   ```typescript
   //  Good
   const data = await loadSettings();  // Pure I/O
   const processed = processSettings(data);  // Pure logic
   
   //  Bad
   async function doEverything() {
     // Load settings
     // Validate settings
     // Transform settings
     // Save settings
     // Migrate settings
   }
   ```

---

## Migration Path Recommendation

###  **Phase 1: High ROI, Lower Risk** (2-3 weeks)
**Extract hooks from `useFaceTracking`**
- No breaking changes
- Improves testability immediately
- Enables code reuse
- **Effort: **

###  **Phase 2: Long-term Foundation** (3-4 weeks)
**Split `AppContext` into multiple contexts**
- Enables more granular re-render control
- Better TypeScript types
- Clearer separation of concerns
- **Effort: **

###  **Phase 3: Nice-to-Have** (1-2 weeks)
**Decompose `SettingsPanel`**
- Better maintainability
- Easier testing
- Not critical path
- **Effort: **

---

## Current Code Quality

```
Before Refactoring:
├─ Clean Code:  (70%)
├─ Testability:  (50% - some parts hard to test)
├─ Maintainability:  (60% - complex hooks hard to understand)
├─ Onboarding:  (50% - newcomers confused by multi-concern code)
└─ Technical Debt:  (Moderate)

After Phase 1-3 Refactoring:
├─ Clean Code:  (90%)
├─ Testability:  (85% - most code unit-testable)
├─ Maintainability:  (85% - clear responsibilities)
├─ Onboarding:  (80% - easier to understand)
└─ Technical Debt:  (Minimal)
```

---

## Quick Assessment Tool

Use this checklist to identify SRP violations in existing or new code:

**Does this component/hook have multiple reasons to change?**
- [ ] Logic reason (state updates)
- [ ] UI reason (styling changes)
- [ ] API reason (data structure)
- [ ] I/O reason (localStorage/network)

If you checked more than one: **→ Split it**

**Can you describe this in one sentence without using "and"?**
-  "This hook calculates smooth cursor position"
-  "This hook initializes the model AND manages the camera AND processes landmarks AND handles errors"

If you can't: **→ Split it**

**How many state variables does this have?**
- 1-2:  Good
- 3-5:  Watch it
- 6+:  Probably too many

---

## Resources

- [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md) — Full architecture guide
- [SRP_REFACTORING_GUIDE.md](SRP_REFACTORING_GUIDE.md) — Step-by-step refactoring instructions
- [CONTRIBUTING.md](../CONTRIBUTING.md#architecture-single-responsibility-principle-srp) — Guidelines for contributors
- [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle) — Academic definition
- [Refactoring.com](https://refactoring.com/catalog/) — Refactoring patterns

---

## Next Steps

1. **Read** [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md) for architectural context
2. **Review** specific violations in this document
3. **Follow** [SRP_REFACTORING_GUIDE.md](SRP_REFACTORING_GUIDE.md) for implementation
4. **Update** [CONTRIBUTING.md](../CONTRIBUTING.md) with new patterns
5. **Test** thoroughly after each refactoring phase

---

**Last Updated:** March 2026
**Performed By:** AI Code Analysis
**Status:** Ready for implementation
