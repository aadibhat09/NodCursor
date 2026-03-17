# NodCursor Typing System Specification

This document explains the on-screen keyboard subsystem in technical detail, including gesture mapping, cooldown model, state transitions, and tuning strategy.

---

## 1) Purpose

The typing system enables text entry without physical keyboard/mouse input by converting facial gestures into deterministic keyboard navigation and selection actions.

Primary use cases:

1. Short commands and form input.
2. Communication assistance for users with limited hand mobility.
3. Redundant input channel when pointer click reliability is degraded.

---

## 2) Core Interaction Mapping

Default mapping:

- **Mouth open** → advance highlighted key
- **Smile** → select highlighted key
- **Double blink** → backspace

This design separates navigation and confirmation to reduce accidental text entry.

---

## 3) State Model

## 3.1 Runtime state dimensions

1. **Keyboard visibility** (`isOpen`)
2. **Typing mode enabled** (`typingMode`)
3. **Current text buffer** (`text`)
4. **Current key index** (`selectedIndex`)
5. **Shift state** (`shift`)

## 3.2 High-level transitions

1. Closed → Open (UI toggle)
2. Open + Typing off → Typing on (gesture input active)
3. Typing on + mouth open event → `selectedIndex++`
4. Typing on + smile event → append/execute selected key
5. Typing on + double blink → backspace
6. Open → Closed resets typing mode (safety behavior)

---

## 4) Cooldown Architecture

Three independent cooldown timers are used to suppress repeated triggers from one physical gesture:

- `mouthTypingAdvanceCooldownMs`
- `mouthTypingSelectCooldownMs`
- `mouthTypingBackspaceCooldownMs`

### Why independent cooldowns?

A single global cooldown is simpler but causes cross-channel interference (e.g., smile blocked by recent mouth-open). Independent timers preserve responsiveness while still preventing gesture bounce.

---

## 5) Text Composition Rules

Implementation goals:

1. Keep text entry predictable.
2. Avoid unintentional punctuation spacing issues.
3. Support lightweight editing without full keyboard complexity.

Current behavior includes:

- Backspace from double blink
- Enter/newline handling
- Shift toggle for character case mode
- Punctuation support for basic sentence composition

---

## 6) Reliability Tuning

## 6.1 If key focus advances too fast

- Increase `mouthTypingAdvanceCooldownMs`
- Verify mouth-open threshold stability via camera lighting
- Reduce user overexertion (large mouth motion can cause repeated threshold crossings)

## 6.2 If key selection duplicates

- Increase `mouthTypingSelectCooldownMs`
- Evaluate smile threshold quality under current light
- Reduce over-sensitive facial expression intensity during selection

## 6.3 If backspace feels delayed

- Decrease `mouthTypingBackspaceCooldownMs` in small increments
- Ensure double-blink timing is not too strict in global blink settings

---

## 7) Human Factors and Fatigue Considerations

1. Long sessions should alternate typing and pointer tasks.
2. Mouth-open only navigation can be tiring; voice/pointer hybrid operation is recommended.
3. For users with asymmetric control (e.g., weak smile activation), increase select cooldown and rely more on dwell/pointer where possible.

---

## 8) Validation Protocol (for demos/reports)

A reproducible evaluation approach:

1. **Warmup**: 2 minutes of gesture acclimation.
2. **Task A**: Type fixed phrase (e.g., 30–50 chars).
3. **Task B**: Correct 5 forced errors using backspace.
4. **Task C**: Enter mixed-case + punctuation sentence.

Record:

- Time to complete
- Error count before correction
- Number of accidental selects/advances
- User-reported fatigue (1–5 scale)

---

## 9) Integration Points

Primary integration path:

1. `useFaceTracking` generates gesture signals.
2. `useMouthTypingControls` converts signals into keyboard state/actions.
3. `OnScreenKeyboard` renders selection and text UI.
4. `DemoPage` coordinates keyboard visibility/typing mode toggles and logs events.

---

## 10) Future Extensions (Implementation Candidates)

1. Adaptive cooldown tuning based on observed false trigger rate.
2. Word prediction row to reduce gesture count per sentence.
3. Row/column scanning mode for users with reduced gesture variety.
4. Phrase macros for repeated communication tasks.

---

## 11) Related Documentation

- Runtime contracts and architecture: `docs/API.md`
- Accessibility setup and practical tuning: `docs/ACCESSIBILITY_GUIDE.md`
