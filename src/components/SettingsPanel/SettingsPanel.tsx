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
          <span className="text-sm text-app-subtle">Cursor Speed ({settings.sensitivity.toFixed(2)}x)</span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            value={settings.sensitivity}
            onChange={(e) => onChange({ ...settings, sensitivity: Number(e.target.value) })}
            className="w-full accent-app-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Horizontal Sensitivity ({settings.horizontalSensitivity.toFixed(2)}x)</span>
          <input
            type="range"
            min="0.6"
            max="1.8"
            step="0.05"
            value={settings.horizontalSensitivity}
            onChange={(e) => onChange({ ...settings, horizontalSensitivity: Number(e.target.value) })}
            className="w-full accent-app-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Vertical Sensitivity ({settings.verticalSensitivity.toFixed(2)}x)</span>
          <input
            type="range"
            min="0.6"
            max="1.8"
            step="0.05"
            value={settings.verticalSensitivity}
            onChange={(e) => onChange({ ...settings, verticalSensitivity: Number(e.target.value) })}
            className="w-full accent-app-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Acceleration Curve ({settings.acceleration.toFixed(2)})</span>
          <input
            type="range"
            min="0.9"
            max="1.8"
            step="0.05"
            value={settings.acceleration}
            onChange={(e) => onChange({ ...settings, acceleration: Number(e.target.value) })}
            className="w-full accent-app-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Smoothing Level ({settings.smoothing.toFixed(2)})</span>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={settings.smoothing}
            onChange={(e) => onChange({ ...settings, smoothing: Number(e.target.value) })}
            className="w-full accent-app-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Deadzone ({settings.deadzone.toFixed(2)})</span>
          <input
            type="range"
            min="0.01"
            max="0.2"
            step="0.01"
            value={settings.deadzone}
            onChange={(e) => onChange({ ...settings, deadzone: Number(e.target.value) })}
            className="w-full accent-app-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Dwell Click Time ({settings.dwellMs}ms)</span>
          <input
            type="range"
            min="400"
            max="2200"
            step="50"
            value={settings.dwellMs}
            onChange={(e) => onChange({ ...settings, dwellMs: Number(e.target.value) })}
            className="w-full accent-app-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Dwell Movement Tolerance ({settings.dwellMoveTolerance.toFixed(3)})</span>
          <input
            type="range"
            min="0.008"
            max="0.08"
            step="0.002"
            value={settings.dwellMoveTolerance}
            onChange={(e) => onChange({ ...settings, dwellMoveTolerance: Number(e.target.value) })}
            className="w-full accent-app-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Blink Threshold ({settings.clickSensitivity.toFixed(2)})</span>
          <input
            type="range"
            min="0.12"
            max="0.35"
            step="0.01"
            value={settings.clickSensitivity}
            onChange={(e) => onChange({ ...settings, clickSensitivity: Number(e.target.value) })}
            className="w-full accent-app-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Double Blink Window ({settings.doubleBlinkWindowMs}ms)</span>
          <input
            type="range"
            min="300"
            max="900"
            step="20"
            value={settings.doubleBlinkWindowMs}
            onChange={(e) => onChange({ ...settings, doubleBlinkWindowMs: Number(e.target.value) })}
            className="w-full accent-app-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Blink Gap Tolerance ({settings.consecutiveBlinkGapMs}ms)</span>
          <input
            type="range"
            min="250"
            max="800"
            step="20"
            value={settings.consecutiveBlinkGapMs}
            onChange={(e) => onChange({ ...settings, consecutiveBlinkGapMs: Number(e.target.value) })}
            className="w-full accent-app-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Long Blink Hold ({settings.longBlinkMs}ms)</span>
          <input
            type="range"
            min="550"
            max="1800"
            step="25"
            value={settings.longBlinkMs}
            onChange={(e) => onChange({ ...settings, longBlinkMs: Number(e.target.value) })}
            className="w-full accent-app-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Mouth Click Cooldown ({settings.mouthClickCooldownMs}ms)</span>
          <input
            type="range"
            min="250"
            max="1600"
            step="25"
            value={settings.mouthClickCooldownMs}
            onChange={(e) => onChange({ ...settings, mouthClickCooldownMs: Number(e.target.value) })}
            className="w-full accent-app-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Smile Double Click Cooldown ({settings.smileDoubleClickCooldownMs}ms)</span>
          <input
            type="range"
            min="300"
            max="1800"
            step="25"
            value={settings.smileDoubleClickCooldownMs}
            onChange={(e) => onChange({ ...settings, smileDoubleClickCooldownMs: Number(e.target.value) })}
            className="w-full accent-app-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Tilt Scroll Threshold ({settings.tiltScrollThreshold.toFixed(3)})</span>
          <input
            type="range"
            min="0.03"
            max="0.14"
            step="0.005"
            value={settings.tiltScrollThreshold}
            onChange={(e) => onChange({ ...settings, tiltScrollThreshold: Number(e.target.value) })}
            className="w-full accent-app-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Tilt Scroll Step ({settings.tiltScrollStep}px)</span>
          <input
            type="range"
            min="40"
            max="260"
            step="10"
            value={settings.tiltScrollStep}
            onChange={(e) => onChange({ ...settings, tiltScrollStep: Number(e.target.value) })}
            className="w-full accent-app-accent"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-app-subtle">Tilt Scroll Cooldown ({settings.tiltScrollCooldownMs}ms)</span>
          <input
            type="range"
            min="140"
            max="900"
            step="20"
            value={settings.tiltScrollCooldownMs}
            onChange={(e) => onChange({ ...settings, tiltScrollCooldownMs: Number(e.target.value) })}
            className="w-full accent-app-accent"
          />
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-app-accent/15 bg-app-panelAlt/60 px-3 py-2 transition hover:border-app-accent/30">
          <input
            type="checkbox"
            checked={settings.blinkEnabled}
            onChange={(e) => onChange({ ...settings, blinkEnabled: e.target.checked })}
            className="accent-app-accent"
          />
          <span>Blink detection</span>
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-app-accent/15 bg-app-panelAlt/60 px-3 py-2 transition hover:border-app-accent/30">
          <input
            type="checkbox"
            checked={settings.mouthEnabled}
            onChange={(e) => onChange({ ...settings, mouthEnabled: e.target.checked })}
            className="accent-app-accent"
          />
          <span>Mouth gesture click</span>
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-app-accent/15 bg-app-panelAlt/60 px-3 py-2 transition hover:border-app-accent/30">
          <input
            type="checkbox"
            checked={settings.headTiltScrollEnabled}
            onChange={(e) => onChange({ ...settings, headTiltScrollEnabled: e.target.checked })}
            className="accent-app-accent"
          />
          <span>Head tilt scroll</span>
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-app-accent/15 bg-app-panelAlt/60 px-3 py-2 transition hover:border-app-accent/30">
          <input
            type="checkbox"
            checked={settings.voiceEnabled}
            onChange={(e) => onChange({ ...settings, voiceEnabled: e.target.checked })}
            className="accent-app-accent"
          />
          <span>Voice commands</span>
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-app-accent/15 bg-app-panelAlt/60 px-3 py-2 transition hover:border-app-accent/30">
          <input
            type="checkbox"
            checked={settings.mirrorCamera}
            onChange={(e) => onChange({ ...settings, mirrorCamera: e.target.checked })}
            className="accent-app-accent"
          />
          <span>Flip camera preview</span>
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm text-app-subtle">Camera Selection</span>
          <select
            value={settings.cameraId}
            onChange={(e) => onSelectCamera(e.target.value)}
            className="w-full rounded-lg border border-app-accent/30 bg-app-panelAlt p-2 text-app-text transition focus:border-app-accent focus:outline-none"
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
