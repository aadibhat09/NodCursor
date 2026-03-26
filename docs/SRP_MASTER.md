# SRP Master Guide: All Implementations & Improvements

> **Single Responsibility Principle (SRP)** — Each module, component, and hook has exactly one reason to change.

## Overview

This document tracks all SRP implementations across the NodCursor codebase, showing where we've applied SRP, what problems it solved, and where to apply it next.

---

## ✅ Completed SRP Implementations

### 1. **Documentation Page Component Refactoring**

**Files:**
- [src/pages/Documentation/DocumentationPage.tsx](../../src/pages/Documentation/DocumentationPage.tsx)

**What was the problem?**
The original DocumentationPage handled:
- Displaying docs in a grid layout
- Managing navigation between docs
- Rendering markdown content inline
- Search/filtering logic

**SRP Solution:**
- **Separated concerns** into focused components:
  - `DocumentationPage` → Only manages kanban board state & filtering
  - `DocModal` → Only responsible for displaying a single doc in a modal
  - `getCategorizedDocs()` → Only organizes docs by category
  - Extract functions → Title, summary, icons, categorization

**Benefits:**
✓ Easier to test each responsibility independently  
✓ DocModal can be reused elsewhere  
✓ Filtering logic is isolated and maintainable  
✓ Adding new categories doesn't affect the modal  

**Code Location:**
```typescript
// Before: 200+ lines handling everything
export function DocumentationPage() {
  // mixing navigation, display, filtering, rendering
}

// After: Clear separation
- DocModal({ doc, onClose }) // Displays single doc
- DocumentationPage() // Manages board state
- getCategorizedDocs() // Organizes data
- getDocIcon() // Returns SVG icons
- extractTitle() // Parses markdown
```

---

### 2. **Commit-to-Issue Generation System**

**Files:**
- [src/utils/commitToIssue.ts](../../src/utils/commitToIssue.ts)

**What was the problem?**
Commits and issues are managed separately, breaking workflow continuity.

**SRP Solution:**
- **`parseCommitMessage()`** → Only parses conventional commit format
- **`generateCommitIssues()`** → Only generates issue objects from commits
- **`CommitIssue` interface** → Single source of truth for commit-based issues

**Benefits:**
✓ Issues auto-sync with commits  
✓ Each function has one job  
✓ Easy to parse different commit formats  
✓ Workflow + communication automatically established  

**Usage:**
```typescript
// Auto-generate issues from commits
const commitIssues = generateCommitIssues(200);
// Creates issues #200-#204 from recent commits
```

---

## 🔄 In-Progress SRP Refactoring

### Hook Decomposition

**File:** [src/hooks/useFaceTracking.ts](../../src/hooks/useFaceTracking.ts)

**Current Issues:**
- 441 lines handling 6 distinct responsibilities
- MediaPipe loading, camera management, adaptive lighting, error handling all mixed together

**Next Steps:**
1. Extract `useMediaPipeLoader()` — Only handles model loading
2. Extract `useCameraStream()` — Only manages camera setup
3. Extract `useAdaptiveLighting()` — Only handles lighting adjustments
4. Keep `useFaceTracking()` as orchestrator using the above hooks

---

### Settings Panel Component

**File:** [src/components/SettingsPanel/SettingsPanel.tsx](../../src/components/SettingsPanel/SettingsPanel.tsx)

**Current Issues:**
- 40+ controls in one component
- Handles display, state management, and validation simultaneously

**SRP Breakdown:**
- `SettingsPanel` → Parent container, layout only
- `SettingsGroup` → Groups related settings
- `SettingControl` → Single setting input
- `useSettingsState()` → Pure state management

---

### Games Page

**File:** [src/pages/Games/GamesPage.tsx](../../src/pages/Games/GamesPage.tsx)

**Current Issues:**
- Two games (Target Rush + Memory Match) mixed with tracking logic
- 300+ lines handling game state, rendering, and tracking

**SRP Breakdown:**
- `GamesPage` → Routing and navigation only
- `TargetRushGame` → Just Target Rush game logic
- `MemoryMatchGame` → Just Memory Match game logic
- `useGameTracking()` → Shared tracking for metrics

---

### Tracking Worker

**File:** [src/workers/trackingWorker.ts](../../src/workers/trackingWorker.ts)

**Current Issues:**
- Smoothing, blink detection, and gesture detection mixed together
- 200+ lines of multi-concern logic

**SRP Breakdown:**
- `smoothingWorker` → Only smooths coordinates
- `blinkDetectionWorker` → Only detects blinks
- `gestureDetectionWorker` → Only detects gestures
- Or use sub-modules within the worker

---

### App Context (State Management)

**File:** [src/context/AppContext.tsx](../../src/context/AppContext.tsx)

**Current Issues:**
- Settings, calibration, and device detection in one context
- Mixing concerns makes state harder to reason about

**SRP Breakdown:**
- `SettingsContext` → User settings only
- `CalibrationContext` → Calibration state only
- `DeviceContext` → Camera/device detection only

---

## 📋 SRP Principles Applied

### Principle 1: One Reason to Change

Each module should only need to change if one specific responsibility changes:

```typescript
// ✓ GOOD: Single reason to change
export function DocModal({ doc, onClose }) {
  // Only changes if modal display logic changes
  return <modal>...</modal>;
}

// ✗ BAD: Multiple reasons to change
export function DocumentationViewer() {
  // Changes if: layout changes, display changes, filtering changes, etc.
}
```

### Principle 2: Dependency Injection

Pass data and handlers in, not pulling from context:

```typescript
// ✓ GOOD: Props as dependencies
<DocModal doc={doc} onClose={handleClose} />

// ✗ BAD: Context dependency
function DocModal() {
  const { selectedDoc } = useContext(DocContext);
  // Binds to specific context structure
}
```

### Principle 3: Focused Exports

Keep files focused - one main export per file:

```typescript
// ✓ GOOD: Clear single export
export function useBlinkDetection() {
  // Only blink detection logic
}

// ✗ BAD: Multiple responsibilities
export {
  trackFace,
  detectGestures,
  smoothCoordinates,
  detectBlinks
}
```

---

## 📊 SRP Metrics

| Component | Lines | Responsibilities | Status |
|-----------|-------|------------------|--------|
| DocumentationPage | 250 | 2 (was 5) | ✅ Refactored |
| DocModal | 50 | 1 | ✅ New |
| useFaceTracking | 441 | 6 | 🔄 Needs refactor |
| SettingsPanel | 350+ | 3+ | 🔄 Needs refactor |
| GamesPage | 300+ | 4 | 🔄 Needs refactor |
| trackingWorker | 200+ | 3 | 🔄 Needs refactor |
| AppContext | 150+ | 3 | 🔄 Needs refactor |

---

## 🎯 Benefits of SRP Implementation

### For Development
- ✓ Easier to understand what each file does
- ✓ Faster to locate bugs
- ✓ Simpler to add new features
- ✓ Less unexpected side effects

### For Testing
- ✓ Each unit is testable in isolation
- ✓ Mock dependencies are straightforward
- ✓ Test coverage is more meaningful

### For Maintenance
- ✓ Changes to one concern don't break others
- ✓ Code review is easier to focus
- ✓ Refactoring is lower-risk

---

## 🛠️ How to Apply SRP

### Process

1. **Identify responsibilities** — List what the module does
2. **Group by reason to change** — What would cause changes?
3. **Extract** — Create new modules for each responsibility
4. **Compose** — Have original module orchestrate the extracted ones

### Example: useFaceTracking Refactoring

```typescript
// Step 1: Identify 6 responsibilities
// 1. Load MediaPipe model
// 2. Manage camera stream
// 3. Process facial landmarks
// 4. Smooth coordinates
// 5. Apply adaptive lighting
// 6. Handle errors

// Step 2: Extract each responsibility
export function useMediaPipeLoader() { /* ... */ }
export function useCameraStream() { /* ... */ }
export function useFacialLandmarks() { /* ... */ }
export function useSmoothingPipeline() { /* ... */ }
export function useAdaptiveLighting() { /* ... */ }
export function useTrackingErrorHandler() { /* ... */ }

// Step 3: Compose in original hook
export function useFaceTracking() {
  const model = useMediaPipeLoader();
  const stream = useCameraStream();
  const landmarks = useFacialLandmarks(stream, model);
  const smoothed = useSmoothingPipeline(landmarks);
  const adjusted = useAdaptiveLighting(smoothed);
  useTrackingErrorHandler();
  
  return smoothed;
}
```

---

## 📚 References

- **SRP Principle** — Part of SOLID principles
- **Module Cohesion** — "Things that change together belong together"
- **Related Docs**:
  - [SRP Analysis](./SRP_ANALYSIS.md) — Detailed analysis of violations
  - [SRP Refactoring Guide](./SRP_REFACTORING_GUIDE.md) — Step-by-step refactoring
  - [Design Principles](./DESIGN_PRINCIPLES.md) — Architecture philosophy

---

## 🚀 Next Steps

1. **Phase 1 (Current)** — Refactor DocumentationPage ✅
2. **Phase 2** — Decompose useFaceTracking into focused hooks
3. **Phase 3** — Extract SettingsPanel into sub-components
4. **Phase 4** — Separate GamesPage by game type
5. **Phase 5** — Optimize trackingWorker with sub-modules
6. **Phase 6** — Split AppContext into domain-specific contexts

---

**Last Updated:** March 26, 2026  
**Maintained By:** @aadibhat09 · @SanPranav
