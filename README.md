# NodCursor

Browser-based head-tracking cursor control system for users with motor impairments and limited hand mobility.

## Accessibility Mission

This project aims to make cursor interaction possible with webcam head movement, facial gestures, dwell timing, and optional voice commands. It is built for accessibility-first experiences and quick setup with no native install.

## Demo GIF

Add a GIF at `docs/demo.gif` after running the app and recording a short session.

![Demo Placeholder](docs/demo.gif)

## Features

- Head tracking via MediaPipe Face Landmarker
- Cursor mapping with calibration range and smoothing
- Dwell click, blink click, double blink, long blink drag
- Optional mouth gesture and voice command triggers
- Head tilt scroll support
- Gesture-driven on-screen keyboard with mouth typing mode
- On-screen virtual action buttons
- Demo playground page for interaction testing
- Dark, high-contrast, large-control UI

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- WebRTC camera input
- MediaPipe Tasks Vision
- TensorFlow.js (included for lightweight ML extension)
- Web Worker processing pipeline

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox (camera support available, speech API may vary)
- Safari (limited Web Speech feature support)

## Privacy Model

- All camera processing is local in browser.
- No frames are uploaded or persisted.
- Users control camera permission in browser settings.

## Quick Start

```bash
npm install
npm run dev
```

Open the local URL in your browser and grant camera access when prompted.

## App Pages

- `/` Home overview and privacy explanation
- `/demo` full interactive test playground
- `/calibration` guided range capture
- `/settings` controls, toggles, camera selection, debug mode
- `/documentation` in-app development and accessibility blog

## Architecture

```text
src/
  components/
    CameraView/
    CursorOverlay/
    CalibrationUI/
    SettingsPanel/
    GestureIndicators/
  hooks/
    useFaceTracking.ts
    useCursorMapping.ts
    useBlinkDetection.ts
    useDwellClick.ts
    useVoiceCommands.ts
    useGestureControls.ts
    useMouthTypingControls.ts
  utils/
    smoothing/
    calibration/
    gestureDetection/
  workers/
    trackingWorker.ts
  pages/
    Home/
    Demo/
    Calibration/
    Settings/
  context/
    AppContext.tsx
```

## Performance Notes

- Landmark post-processing runs in a Web Worker.
- UI thread remains responsive with requestAnimationFrame loops.
- Fallback pointer mode is provided when camera access fails.

## Contribution Guide

1. Fork or clone.
2. Create a feature branch.
3. Keep accessibility and keyboard usability first.
4. Run `npm run build` before opening a PR.

## Documentation Checklist

See `docs/ACCESSIBILITY_GUIDE.md` and `.github/ISSUE_TEMPLATE/documentation-setup-usage-accessibility-guide.md`.
