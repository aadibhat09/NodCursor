# NodCursor Accessibility Implementation Guide

This guide is intended for users, caregivers, therapists, and reviewers who need practical setup steps plus implementation-aware reasoning.

---

## 1) Accessibility Goals

NodCursor is designed around four goals:

1. **Hands-free control** for users with limited upper-limb mobility.
2. **Input redundancy** (head, blink, dwell, mouth, voice) so failure in one method does not block usage.
3. **Configurable effort** so the same system works for different motor ranges and fatigue levels.
4. **On-device processing** to preserve privacy and reduce setup complexity.

---

## 2) Minimum and Recommended Environment

### Minimum

- Webcam at 720p / 30fps
- Browser with WebRTC camera support
- Stable seated posture and front-facing light source

### Recommended

- Webcam at 1080p (or higher) with stable mount
- Diffuse light source in front of user
- Chrome or Edge for best voice command reliability
- Dedicated profile per user/device posture

---

## 3) Setup Procedure (Repeatable)

## 3.1 Physical setup

1. Camera at approximately eye level.
2. User centered in frame with head + shoulders visible.
3. Distance around 45–70 cm from camera.
4. Avoid strong backlighting and flickering light.

## 3.2 In-app setup

1. Open the app and grant camera permission.
2. Calibrate on `/calibration` using neutral posture.
3. Validate on `/demo`:
   - Cursor tracks movement smoothly.
   - Blink click can target large controls.
4. Fine-tune in `/settings`.

## 3.3 Recalibration trigger conditions

Recalibrate after any of the following:

- Seat height/angle changes
- Camera moved or swapped
- Major lighting change (time of day, room light, window glare)
- Sustained tracking drift over session

---

## 4) Interaction Channels and Best-fit Use

## 4.1 Head tracking

- Best for continuous pointer positioning.
- If jitter appears, increase smoothing and/or deadzone.
- If speed feels low, increase sensitivity and reduce smoothing slightly.

## 4.2 Blink actions

- Best for click and right-click with minimal head motion.
- If false positives occur: increase `clickSensitivity` and/or long-blink threshold.
- If misses occur: reduce `clickSensitivity` and improve eye lighting.

## 4.3 Dwell click

- Best fallback for users with inconsistent blink control.
- Increase `dwellMs` and tolerance for tremor-heavy motion.
- Decrease `dwellMs` for faster users after stabilization is reliable.

## 4.4 Mouth + smile actions

- Useful as a secondary channel for typing/control.
- Keep cooldowns moderate to avoid repeated accidental activations.

## 4.5 Voice commands

- Useful for discrete actions (`click`, navigation, scroll) and fatigue management.
- Recommended to pair with head tracking for hybrid control.

---

## 5) Clinical-style Tuning Profiles (Starting Points)

These are starting configurations; always personalize.

## 5.1 Low-range neck mobility

- Higher sensitivity
- Moderate smoothing
- Larger deadzone
- Medium dwell duration

Expected result: broader pointer travel from smaller head movement.

## 5.2 Tremor/spasticity dominant

- Lower sensitivity
- High smoothing
- Larger deadzone
- Longer dwell duration

Expected result: reduced unintended micro-motion clicks.

## 5.3 Fatigue-sensitive sessions

- Moderate sensitivity
- Moderate/high smoothing
- Enable voice commands
- Keep dwell as backup path

Expected result: alternate control channel reduces sustained neck strain.

---

## 6) Observable Quality Signals

Use these indicators during setup and training:

1. **Source indicator** shows `camera` in normal operation.
2. **Light quality indicator** should remain stable and not oscillate heavily.
3. **Event logs** should show intended actions with minimal false events.
4. **Target test** (demo/game buttons) should be repeatable within comfortable effort.

---

## 7) Failure Modes and Corrective Actions

## 7.1 Cursor drift while user is still

- Increase deadzone.
- Increase smoothing.
- Recalibrate center point.
- Improve lighting consistency (reduce shadows).

## 7.2 Frequent unintended clicks

- Raise blink sensitivity threshold value.
- Increase long-blink and double-blink timing windows.
- Confirm user is not compensating with involuntary squinting due to glare.

## 7.3 Missed clicks

- Lower blink sensitivity threshold value.
- Ensure eyes are visible (glasses glare or shadow can degrade reliability).
- Reduce over-smoothing if blinks are delayed.

## 7.4 Performance drops

- Close additional high-CPU tabs/apps.
- Reduce camera competition from other software.
- Re-open app to refresh model + stream lifecycle.

---

## 8) Caregiver / Instructor Workflow

1. Establish baseline with large on-screen targets.
2. Tune one axis at a time (speed → smoothing → deadzone).
3. Validate single click reliability before adding right-click/drag.
4. Add typing only after pointer control is stable.
5. Record final settings and calibration conditions for repeatability.

### Progress rubric (example)

- **Level 1**: stable cursor movement
- **Level 2**: reliable click activation
- **Level 3**: simple form input with on-screen keyboard
- **Level 4**: mixed tasks (scroll, right-click, drag, navigation)

---

## 9) Privacy and Safety Notes

- Camera data is processed locally in-browser.
- Settings are stored in local storage on the same device/browser profile.
- No remote biometric profile is created by the app runtime.

For user comfort and safety:

- Encourage regular neck/eye breaks.
- Avoid forcing range-of-motion outside comfort zone.
- Prioritize consistent posture over aggressive sensitivity.

---

## 10) Documentation Crosswalk

- Runtime internals and contracts: `docs/API.md`
- Mouth-typing internals and tuning: `docs/TYPING_SYSTEM.md`
- Project motivation/context: `docs/WHY_WE_STARTED.md`
- Contribution and process: `CONTRIBUTING.md`
