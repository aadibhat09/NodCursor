---
name: "Next Sprint: Add automated test suite (Vitest + Testing Library)"
about: "Backlog — NodCursor currently has zero automated tests. The SRP refactor is a prerequisite. This issue tracks the full test infrastructure setup."
title: " Next Sprint: Add automated test suite (Vitest + Testing Library)"
labels: ["testing", "next-sprint", "dx", "quality"]
assignees: ["aadibhat09"]
---

##  Priority: Next Sprint (requires SRP cleanup first)

NodCursor currently has **zero automated tests**. The SRP cleanup sprint (SRP-1 through SRP-6) is a prerequisite because isolated, pure functions and focused components are far easier to unit-test than 400+ line monoliths.

---

## Why Now?

```mermaid
flowchart LR
  SRP["SRP Cleanup\n(Sprint 1)"] -->|"pure functions\nfocused components"| Tests["Test Suite\n(Sprint 2)"]
  Tests --> CI["CI Green\nEvery PR"]
  CI --> Confidence["Ship with\nconfidence"]
```

---

## Previous Work Referenced

- **Issue #2** (@SanPranav, Task B): *"Validate default thresholds… If you change thresholds, document the rationale."* — tests would encode this validation automatically, replacing manual rationale notes.
- **Issue #4** (Design Research): *"Performance Profiling — measure latency and jitter across device/camera configurations."* — automated tests can guard against performance regressions.
- **Commit `0be341b`** (@SanPranav + @aadibhat09): threshold tuning commit — if automated tests had existed, this would have been caught by a failing test rather than requiring manual validation.

---

## Proposed Test Strategy

```mermaid
flowchart TD
  subgraph Unit[" Unit Tests — Vitest"]
    U1["exponentialSmoothing.ts\nconverges to target value"]
    U2["kalmanFilter.ts\nreduces variance over time"]
    U3["advancedSmoothing.ts\njitter threshold behavior"]
    U4["adaptiveLightLearner.ts\nlow-light / bright recommendations"]
    U5["mapToViewport.ts\nclamping, NaN guard, 5-point mapping"]
    U6["voiceProfile.ts\nfeature extraction determinism"]
    U7["trackingWorker pure functions\n(after SRP-6)"]
    U8["dispatchMouseEvent.ts\npointFromNormalized math"]
  end

  subgraph Component[" Component Tests — Vitest + @testing-library/react"]
    C1["SettingsPanel sub-components\n(after SRP-2): renders + onChange"]
    C2["GestureIndicators\nrenders correct gesture label"]
    C3["CursorOverlay\npositions correctly at x,y"]
    C4["CalibrationUI steps\nstep progression"]
  end

  subgraph Integration[" Integration Tests — Playwright"]
    I1["Calibration flow\n5-point capture → stored in context"]
    I2["Settings persistence\nchange → reload → verify localStorage"]
    I3["Demo page loads\ncamera permission mock"]
  end
```

---

## Recommended Stack

| Tool | Purpose |
|------|---------|
| `vitest` | Fast unit + component test runner (Vite-native) |
| `@testing-library/react` | Component testing |
| `@testing-library/user-event` | User interaction simulation |
| `jsdom` | Browser DOM simulation for unit tests |
| `playwright` | End-to-end integration tests |
| `@vitest/coverage-v8` | Coverage reporting |

---

## Acceptance Criteria

- [ ] `vitest` added to `devDependencies`; `npm run test` runs all unit + component tests
- [ ] Test coverage ≥ 60% for `src/utils/` (pure functions)
- [ ] `exponentialSmoothing`, `kalmanFilter`, `advancedSmoothing` have unit tests
- [ ] `adaptiveLightLearner` has unit tests for all three lighting recommendations
- [ ] `mapToViewport` has unit tests covering clamp and NaN guard cases
- [ ] At least one component test per major UI component
- [ ] CI (`ci.yml`) runs `npm run test` on every PR

---

**Labels:** `testing` `next-sprint` `dx` `quality`  
**Milestone:** Post-SRP Sprint — Q2 2026  
**Depends on:** SRP-1, SRP-2, SRP-3, SRP-6 (pure function extraction)  
**References:** [KANBAN_BOARD.md — NEXT-1](../../docs/KANBAN_BOARD.md#next-1-automated-test-suite)
