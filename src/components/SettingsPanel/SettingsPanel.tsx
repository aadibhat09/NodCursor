import { Panel } from '../common';
import type { CursorSettings } from '../../types';

export function SettingsPanel({
  settings,
  onChange,
  cameras,
  onSelectCamera
}: {
  settings: CursorSettings;
  onChange: (next: CursorSettings) => void;
  cameras: MediaDeviceInfo[];
  onSelectCamera: (id: string) => void;
}) {
  return (
    <Panel title="Accessibility Controls" className="animate-float-in">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Cursor Speed</span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            value={settings.sensitivity}
            onChange={(e) => onChange({ ...settings, sensitivity: Number(e.target.value) })}
            className="w-full"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Smoothing Level</span>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={settings.smoothing}
            onChange={(e) => onChange({ ...settings, smoothing: Number(e.target.value) })}
            className="w-full"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Deadzone</span>
          <input
            type="range"
            min="0.01"
            max="0.2"
            step="0.01"
            value={settings.deadzone}
            onChange={(e) => onChange({ ...settings, deadzone: Number(e.target.value) })}
            className="w-full"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Dwell Click Time (ms)</span>
          <input
            type="range"
            min="400"
            max="2200"
            step="50"
            value={settings.dwellMs}
            onChange={(e) => onChange({ ...settings, dwellMs: Number(e.target.value) })}
            className="w-full"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.blinkEnabled}
            onChange={(e) => onChange({ ...settings, blinkEnabled: e.target.checked })}
          />
          <span>Blink detection</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.mouthEnabled}
            onChange={(e) => onChange({ ...settings, mouthEnabled: e.target.checked })}
          />
          <span>Mouth gesture click</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.headTiltScrollEnabled}
            onChange={(e) => onChange({ ...settings, headTiltScrollEnabled: e.target.checked })}
          />
          <span>Head tilt scroll</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.voiceEnabled}
            onChange={(e) => onChange({ ...settings, voiceEnabled: e.target.checked })}
          />
          <span>Voice commands</span>
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm text-app-subtle">Camera Selection</span>
          <select
            value={settings.cameraId}
            onChange={(e) => onSelectCamera(e.target.value)}
            className="w-full rounded-lg border border-app-accent/30 bg-app-panelAlt p-2"
          >
            <option value="">Default Camera</option>
            {cameras.map((camera, idx) => (
              <option key={camera.deviceId || idx} value={camera.deviceId}>
                {camera.label || `Camera ${idx + 1}`}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Panel>
  );
}
