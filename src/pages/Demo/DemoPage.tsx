import { useCallback, useMemo, useState } from 'react';
import { CameraView } from '../../components/CameraView/CameraView';
import { CursorOverlay } from '../../components/CursorOverlay/CursorOverlay';
import { GestureIndicators } from '../../components/GestureIndicators/GestureIndicators';
import { SettingsPanel } from '../../components/SettingsPanel/SettingsPanel';
import { Panel } from '../../components/common';
import { useAppContext } from '../../context/AppContext';
import { useBlinkDetection } from '../../hooks/useBlinkDetection';
import { useDwellClick } from '../../hooks/useDwellClick';
import { useFaceTracking } from '../../hooks/useFaceTracking';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import { VirtualButtons } from '../../components/VirtualButtons';
import { useGestureControls } from '../../hooks/useGestureControls';
import { OnScreenKeyboard } from '../../components/OnScreenKeyboard';
import { useMouthTypingControls } from '../../hooks/useMouthTypingControls';
import { useSmoothCursor } from '../../hooks/useSmoothCursor';

function dispatchAtCursor(type: string, x: number, y: number, button = 0) {
  const clientX = Math.round(x * window.innerWidth);
  const clientY = Math.round(y * window.innerHeight);
  const target = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
  if (!target) {
    return;
  }
  target.dispatchEvent(
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX,
      clientY,
      button
    })
  );
}

export function DemoPage() {
  const { settings, setSettings, calibration } = useAppContext();
  const { state, videoRef, cameraError, availableCameras } = useFaceTracking(settings, calibration);
  
  // Apply continuous smoothing that preserves momentum without visible snapping.
  const smoothCursorPos = useSmoothCursor(
    { x: state.x, y: state.y },
    { smoothing: settings.smoothing, stabilization: settings.stabilization }
  );
  
  const actions = useBlinkDetection(state.blink, state.doubleBlink, state.longBlink);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [typingMode, setTypingMode] = useState(false);

  const appendEvent = useCallback((event: string) => {
    setEventLog((prev) => [new Date().toLocaleTimeString() + ' - ' + event, ...prev.slice(0, 10)]);
  }, []);

  const dwellProgress = useDwellClick(smoothCursorPos.x, smoothCursorPos.y, settings.dwellMs, () => appendEvent('Dwell click'));

  const voiceHandlers = useMemo(
    () => ({
      click: () => appendEvent('Voice click'),
      rightClick: () => appendEvent('Voice right click'),
      drag: () => appendEvent('Voice drag mode'),
      scrollUp: () => window.scrollBy({ top: -120, behavior: 'smooth' }),
      scrollDown: () => window.scrollBy({ top: 120, behavior: 'smooth' })
    }),
    [appendEvent]
  );

  useVoiceCommands(settings.voiceEnabled, voiceHandlers);

  const mouthTyping = useMouthTypingControls(typingMode && keyboardOpen, {
    mouthOpen: state.mouthOpen,
    smile: state.smile,
    doubleBlink: state.doubleBlink
  });

  useGestureControls(
    settings,
    {
      x: smoothCursorPos.x,
      y: smoothCursorPos.y,
      blink: state.blink,
      doubleBlink: state.doubleBlink,
      longBlink: state.longBlink,
      mouthOpen: state.mouthOpen,
      smile: state.smile,
      headTilt: state.headTilt
    },
    {
      onEvent: appendEvent
    },
    !typingMode
  );

  const [virtualDrag, setVirtualDrag] = useState(false);

  const handleVirtualAction = useCallback(
    (action: string) => {
      if (action === 'Left Click') {
        dispatchAtCursor('click', smoothCursorPos.x, smoothCursorPos.y, 0);
        appendEvent('Virtual left click');
      }
      if (action === 'Right Click') {
        dispatchAtCursor('contextmenu', smoothCursorPos.x, smoothCursorPos.y, 2);
        appendEvent('Virtual right click');
      }
      if (action === 'Scroll') {
        window.scrollBy({ top: 140, behavior: 'smooth' });
        appendEvent('Virtual scroll');
      }
      if (action === 'Drag Toggle') {
        if (!virtualDrag) {
          dispatchAtCursor('mousedown', smoothCursorPos.x, smoothCursorPos.y, 0);
          appendEvent('Virtual drag start');
        } else {
          dispatchAtCursor('mouseup', smoothCursorPos.x, smoothCursorPos.y, 0);
          appendEvent('Virtual drag end');
        }
        setVirtualDrag((prev) => !prev);
      }
    },
    [appendEvent, smoothCursorPos.x, smoothCursorPos.y, virtualDrag]
  );

  return (
    <>
      <CursorOverlay x={smoothCursorPos.x} y={smoothCursorPos.y} dwellProgress={dwellProgress} dragMode={state.dragMode} />
      <VirtualButtons onAction={handleVirtualAction} />
      <OnScreenKeyboard
        isOpen={keyboardOpen}
        text={mouthTyping.text}
        selectedIndex={mouthTyping.selectedIndex}
        shift={mouthTyping.shift}
        typingMode={typingMode}
        onToggleOpen={() => {
          setKeyboardOpen((prev) => !prev);
          if (keyboardOpen) {
            setTypingMode(false);
          }
        }}
        onToggleTypingMode={() => {
          setTypingMode((prev) => !prev);
          appendEvent(typingMode ? 'Mouth typing stopped' : 'Mouth typing started');
        }}
        onKeyPress={(key) => {
          if (key === 'ENTER') {
            appendEvent('Keyboard enter');
          }
          mouthTyping.applyKey(key);
        }}
      />
      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <CameraView
            videoRef={videoRef}
            cameraError={cameraError}
            sourceLabel={state.source}
            mirrored={settings.mirrorCamera}
          />
          <GestureIndicators
            blink={actions.leftClick}
            doubleBlink={actions.rightClick}
            longBlink={actions.drag}
            mouthOpen={state.mouthOpen}
            smile={state.smile}
            headTilt={state.headTilt}
          />
        </div>

        <div className="space-y-4">
          <SettingsPanel
            settings={settings}
            onChange={(next) => setSettings(() => next)}
            cameras={availableCameras}
            onSelectCamera={(cameraId) => setSettings((prev) => ({ ...prev, cameraId }))}
          />

          <Panel title="Demo Playground" className="animate-float-in">
            <div className="grid gap-3">
              <button className="rounded-xl bg-app-accentStrong p-3 text-app-bg" onClick={() => appendEvent('Button click')}>
                Test Button
              </button>
              <label className="space-y-2 text-sm">
                Slider Test
                <input className="w-full" type="range" />
              </label>
              <input
                className="rounded-lg border border-app-accent/30 bg-app-panelAlt p-2"
                type="text"
                placeholder="Typing input test"
              />
              <div className="h-32 overflow-auto rounded-xl border border-app-accent/30 bg-app-panelAlt p-3 text-sm text-app-subtle">
                <p className="mb-2">Scrollable container test.</p>
                <p className="mb-2">Move your head up/down with tilt scrolling enabled.</p>
                <p className="mb-2">This area validates scroll gestures and dwell interactions.</p>
                <p className="mb-2">Line 4</p>
                <p className="mb-2">Line 5</p>
                <p className="mb-2">Line 6</p>
                <p className="mb-2">Line 7</p>
                <p className="mb-2">Line 8</p>
                <p className="mb-2">Line 9</p>
                <p>Line 10</p>
              </div>
              <div className="rounded-xl border border-app-accent/30 bg-app-panelAlt p-3 text-xs text-app-subtle">
                <p className="mb-2 font-semibold text-app-text">Event log</p>
                {eventLog.length ? eventLog.map((line) => <p key={line}>{line}</p>) : <p>No events yet.</p>}
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
