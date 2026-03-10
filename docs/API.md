# Internal Module API

## Hooks

- `useFaceTracking(settings, calibration)`
- `useCursorMapping(rawX, rawY, calibration, settings)`
- `useBlinkDetection(blink, doubleBlink, longBlink)`
- `useDwellClick(x, y, dwellMs, onClick)`
- `useVoiceCommands(enabled, handlers)`
- `useGestureControls(settings, input, handlers, enabled)`
- `useMouthTypingControls(active, input)`

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

## Keyboard And Gesture Modules

- `OnScreenKeyboard` renders the optional keyboard overlay.
- Mouth typing mode maps:
	mouth open -> next key focus
	smile -> commit key
	double blink -> backspace
