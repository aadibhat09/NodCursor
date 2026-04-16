# DS-IND-01: NodCursor Input Pipeline Integration for OCS Gamification

## Context and Goal

OCS games currently assume keyboard/mouse as primary input. NodCursor already provides stable head-pose cursor mapping, dwell-click, and gesture signals. This issue introduces a formal input pipeline that allows game sessions to switch between `keyboard-mouse`, `head-tracking`, and `hybrid` modes at runtime without restarting the game loop.

Primary objective: integrate NodCursor as a first-class input source while preserving existing engine behavior, collision flow, pause/resume lifecycle, and level transitions.

## Problem Definition

The existing engine is interaction-capable (`CanvasClickHandler`, `GameObject.handleClick()`), but it does not have an explicit abstraction for multi-modal inputs. Head-tracking can work today only through ad hoc event synthesis, which creates reliability risks:

- No centralized input mode state
- No standard failover policy when tracking quality degrades
- No contract for gesture-to-command mapping
- Potential listener duplication during `pause()`, `resume()`, and `transitionToLevel()`

## Design Principles

- Backward compatible: no regression for keyboard-only games
- Single source of truth: `GameControl` owns active input mode
- Reuse existing flow: route head-generated clicks through `CanvasClickHandler`
- Graceful degradation: automatic fallback to keyboard mode when tracking is stale
- Low coupling: game objects remain unaware of camera/tracking internals

## Architecture Proposal

### A) Input Control Plane

Add an input mode state machine in `GameControl`.

States:
- `keyboard-mouse`: only native keyboard/mouse interactions
- `head-tracking`: only NodCursor pointer/gesture events
- `hybrid`: both active; keyboard remains a guaranteed fallback

Transitions:
- User-selected via UI toggle
- System-driven via watchdog fallback (`head-tracking`/`hybrid` -> `keyboard-mouse`)
- Persisted across level transitions and pause/resume

### B) Data Plane (Event Routing)

1. NodCursor emits pointer frame `{x, y, confidence, dwellClick}`
2. Bridge validates confidence and throttling constraints
3. On dwell activation, bridge synthesizes click payload
4. Payload is sent to `CanvasClickHandler.handleCanvasClick(...)`
5. Handler resolves topmost canvas and dispatches `handleClick()` to matching `GameObject`

This keeps the same dispatch semantics as mouse clicks and avoids per-game special handlers.

### C) Command Plane (Gesture Mappings)

Optional gesture commands are mapped to high-level game actions (e.g., evaluate/reset) rather than low-level key events.

Example mapping:
- `blink-double` -> `ACTION_CONFIRM`
- `mouth-open-hold` -> `ACTION_RESET`

Games can opt in by implementing action handlers without requiring knowledge of gesture model details.

## Interface Contracts

```typescript
type InputMode = 'keyboard-mouse' | 'head-tracking' | 'hybrid';

interface HeadPointerEvent {
  x: number;              // viewport X
  y: number;              // viewport Y
  confidence: number;     // 0.0 - 1.0
  dwellClick: boolean;    // rising-edge preferred
  ts: number;             // epoch ms
}

interface NodCursorBridgeConfig {
  minConfidence: number;  // default: 0.65
  dwellCooldownMs: number; // default: 400
  staleTimeoutMs: number;  // default: 1500
}
```

## Engine Integration Details

### 1) `GameControl` ownership of input mode

```javascript
// GameControl.js (proposed extension)
class GameControl {
  constructor(game, levelClasses, options = {}) {
    // existing fields...
    this.inputMode = options.inputMode || 'keyboard-mouse';
    this.nodCursorBridge = options.nodCursorBridge || null;
  }

  setInputMode(mode) {
    const allowed = new Set(['keyboard-mouse', 'head-tracking', 'hybrid']);
    if (!allowed.has(mode) || mode === this.inputMode) return;

    this.inputMode = mode;
    const enableBridge = mode !== 'keyboard-mouse';

    if (this.nodCursorBridge) {
      this.nodCursorBridge.setEnabled(enableBridge);
      this.nodCursorBridge.setHybrid(mode === 'hybrid');
    }
  }

  pause() {
    // existing pause logic
    if (this.nodCursorBridge) this.nodCursorBridge.setPaused(true);
  }

  resume() {
    // existing resume logic
    if (this.nodCursorBridge) this.nodCursorBridge.setPaused(false);
  }
}
```

### 2) Bridge adapter with confidence gating and stale fallback

```javascript
// NodCursorBridge.js
export class NodCursorBridge {
  constructor(gameControl, config = {}) {
    this.gameControl = gameControl;
    this.enabled = false;
    this.hybrid = false;
    this.paused = false;

    this.minConfidence = config.minConfidence ?? 0.65;
    this.dwellCooldownMs = config.dwellCooldownMs ?? 400;
    this.staleTimeoutMs = config.staleTimeoutMs ?? 1500;

    this.lastTrackTs = 0;
    this.lastDwellTs = 0;
  }

  setEnabled(v) { this.enabled = !!v; }
  setHybrid(v) { this.hybrid = !!v; }
  setPaused(v) { this.paused = !!v; }

  onHeadPointer(evt) {
    if (!this.enabled || this.paused) return;
    if (!evt || evt.confidence < this.minConfidence) return;

    this.lastTrackTs = evt.ts || Date.now();

    const now = Date.now();
    const cooldownPassed = now - this.lastDwellTs > this.dwellCooldownMs;
    if (evt.dwellClick && cooldownPassed) {
      this.lastDwellTs = now;
      this.dispatchSyntheticClick(evt.x, evt.y);
    }
  }

  dispatchSyntheticClick(clientX, clientY) {
    const click = {
      clientX,
      clientY,
      preventDefault() {}
    };
    this.gameControl?._canvasClickHandler?.handleCanvasClick(click);
  }

  watchdogTick() {
    if (!this.enabled || this.paused) return;
    if (Date.now() - this.lastTrackTs > this.staleTimeoutMs) {
      this.gameControl?.setInputMode('keyboard-mouse');
    }
  }
}
```

### 3) GameObject-level behavior (LightBoard example)

```javascript
class LightBoardGameObject extends GameObject {
  constructor(data, gameEnv) {
    super(gameEnv);
    this.message = "Mode-aware controls active";
  }

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const localY = event.clientY - rect.top;

    // Preserve deterministic click zones for accessibility.
    if (localY < rect.height / 2) {
      this.evaluateBoard();
    } else {
      this.resetBoard();
    }
  }
}
```

## Why This Is Beneficial (Operational Scenarios)

- Accessibility baseline: users with motor limitations can play through head motion + dwell selection.
- Context switching: hybrid mode enables handoff between assistive and standard inputs during long sessions.
- Classroom demos: instructors can demonstrate inclusive interaction without branching code paths.
- Input resilience: watchdog fallback prevents soft-lock when camera stream quality drops.

## Failure Modes and Mitigations

- Duplicate clicks from noisy dwell signal
  - Mitigation: rising-edge logic + `dwellCooldownMs`
- Ghost input while paused
  - Mitigation: bridge-level paused gate set by `GameControl.pause()`/`resume()`
- Input loss after level transition
  - Mitigation: bridge instance retained by `GameControl`; mode reapplied post-transition
- Repeated fallback flapping
  - Mitigation: hysteresis window and minimum stable tracking time before auto-reenable

## Performance and Reliability Targets

- Synthetic click dispatch latency: target < 16ms p95
- Dwell false-positive rate: target < 2% in test sessions
- Input mode transition time: target < 1 frame
- No increase in dropped frames during normal gameplay (< 2% delta)

## Verification Strategy

### Unit Coverage
- Bridge confidence gate and cooldown logic
- Watchdog fallback timing
- Mode transition guards and idempotency

### Integration Coverage
- Dwell click -> `CanvasClickHandler` -> `GameObject.handleClick()` path
- Pause/resume with active head-tracking
- Transition between levels while preserving selected input mode

### Manual Accessibility QA
- Head-tracking-only playthrough of LightBoard for 10 minutes
- Hybrid mode stress test with alternating keyboard/head input
- Forced tracking degradation test to confirm fallback reliability

## Delivery Plan

Phase 1: Core plumbing
- Add mode state and bridge attachment in `GameControl`
- Add bridge adapter and watchdog

Phase 2: Game validation
- Integrate LightBoard click zones and messaging
- Verify no regressions in keyboard/mouse behavior

Phase 3: Instrumentation and docs
- Log mode changes, fallback events, and click dispatch stats
- Document integration contract for other OCS games

## Completion Criteria

- [ ] Runtime mode toggle works (`keyboard-mouse`, `head-tracking`, `hybrid`)
- [ ] Head pointer + dwell consistently trigger `GameObject.handleClick()`
- [ ] Keyboard behavior remains unchanged in baseline mode
- [ ] Pause/resume and level transitions preserve stable input handling
- [ ] Watchdog fallback activates under stale tracking and recovers cleanly
- [ ] LightBoard demo validated with accessibility scenario checklist

## Ownership and Traceability

Milestone: Sprint 9

Assignees:
- @aadibhat09
- @SanPranav

Labels:
- `accessibility`
- `gamification-engine`
- `nodcursor-integration`
- `input-systems`
- `individual-issue`

Related Docs:
- [DS #2 Checkpoint Calendar](../DATA_STRUCTURES/DS_2_CALENDAR.md)
- [DS #2 Wednesday Checkpoint](../DATA_STRUCTURES/DS_2_WEDNESDAY_CHECKPOINT.md)
- [Project Management Views](../PROJECT_MANAGEMENT/PROJECT_MANAGEMENT.md)
