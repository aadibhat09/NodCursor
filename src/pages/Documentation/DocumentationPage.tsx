import { Panel } from '../../components/common';

export function DocumentationPage() {
  return (
    <div className="grid gap-4">
      <Panel title="NodCursor Documentation Blog" className="animate-float-in">
        <p className="text-app-subtle">
          This page documents what has been implemented so far in NodCursor and how each part helps accessibility and
          reliability.
        </p>
      </Panel>

      <Panel title="What Was Added" className="animate-float-in">
        <ul className="space-y-2 text-sm text-app-subtle">
          <li>React + TypeScript + Vite project setup with Tailwind styling.</li>
          <li>Head tracking pipeline using MediaPipe Face Landmarker and WebRTC webcam input.</li>
          <li>Web Worker post-processing for smoothing, blink states, and drag mode inference.</li>
          <li>Calibration flow for center, left, right, up, and down movement mapping.</li>
          <li>Demo playground with interactive controls for click, scroll, input, and event logging.</li>
          <li>Settings panel with sensitivity, smoothing, deadzone, dwell, gestures, and camera selection.</li>
          <li>Voice command hook for click, right click, drag, and scrolling commands.</li>
          <li>Functional gesture controls: blink click, double blink right click, long blink drag toggle.</li>
          <li>On-screen keyboard with mouth-driven typing navigation and selection.</li>
          <li>Fallback pointer behavior when camera access is unavailable.</li>
        </ul>
      </Panel>

      <Panel title="Console Warning Fixes" className="animate-float-in">
        <ul className="space-y-2 text-sm text-app-subtle">
          <li>Enabled React Router future flags to remove v7 migration warnings.</li>
          <li>Added explicit favicon asset and HTML link to avoid missing favicon 404 errors.</li>
          <li>Reduced MediaPipe noise by disabling unnecessary blendshape output and filtering known internal logs.</li>
          <li>Moved camera list retrieval in Settings to a lightweight devices hook to avoid unnecessary model startup.</li>
          <li>Head-tilt scrolling defaults to off and now uses anti-drift baseline logic.</li>
        </ul>
      </Panel>

      <Panel title="Current Architecture" className="animate-float-in">
        <p className="mb-3 text-sm text-app-subtle">
          Source layout focuses on modular accessibility features and clear extension points.
        </p>
        <pre className="overflow-auto rounded-xl border border-app-accent/20 bg-app-panelAlt p-3 text-xs text-app-subtle">
{`components/     UI building blocks
hooks/          tracking, gestures, dwell, voice, camera devices
workers/        off-main-thread tracking post-processing
pages/          Home, Demo, Calibration, Settings, Documentation
utils/          smoothing, calibration mapping, gesture helpers
context/        shared settings and calibration state`}
        </pre>
      </Panel>
    </div>
  );
}
