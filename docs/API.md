# Internal Module API

## Hooks

- `useFaceTracking(settings, calibration)`
- `useCursorMapping(rawX, rawY, calibration, settings)`
- `useBlinkDetection(blink, doubleBlink, longBlink)`
- `useDwellClick(x, y, dwellMs, onClick)`
- `useVoiceCommands(enabled, handlers)`

## Worker Contract

`trackingWorker.ts` input payload:

- `point` normalized nose coordinates
- `smoothing` alpha value
- `blinkRatio`
- `mouthRatio`
- `smileRatio`
- `headTilt`
- `clickSensitivity`

Output payload:

- `x`, `y` smoothed normalized cursor coordinates
- `blink`, `doubleBlink`, `longBlink`
- `mouthOpen`, `smile`
- `headTilt`
- `dragMode`
