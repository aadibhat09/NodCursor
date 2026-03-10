# Accessibility Guide

## Setup

1. Install dependencies with `npm install`.
2. Start with `npm run dev`.
3. Open `/calibration` before using `/demo`.

## Usage

- Keep your face centered and well lit.
- Tune sensitivity and smoothing in Settings.
- Use dwell click if blink gestures are difficult.
- Enable voice commands for redundant control.
- Blink triggers left click, double blink triggers right click, and long blink toggles drag mode.
- Open the on-screen keyboard in Demo to type with facial gestures:
	mouth open cycles key focus, smile selects key, and double blink backspaces.

## Troubleshooting

- No camera feed: verify browser permission and camera availability.
- Jittery cursor: increase smoothing and deadzone.
- Missed blinks: raise click sensitivity threshold.
- Voice commands missing: use Chrome/Edge and ensure microphone permissions.
- Page scrolling unexpectedly: keep head-tilt scroll disabled in Settings unless needed.
- Keyboard gesture typing too fast: pause mouth-open motion between key steps.

## Accessibility Considerations

- Large controls and high contrast styling are default.
- Most controls are keyboard reachable.
- Debug mode is visible in Settings for caregiver support.
