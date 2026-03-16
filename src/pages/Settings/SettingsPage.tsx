import { Link } from 'react-router-dom';
import { SettingsPanel } from '../../components/SettingsPanel/SettingsPanel';
import { BigButton, Panel } from '../../components/common';
import { useAppContext } from '../../context/AppContext';
import { useCameraDevices } from '../../hooks/useCameraDevices';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import { useNavigate } from 'react-router-dom';

function buildDefaultSettings(isPhoneMode: boolean) {
  return {
    cameraId: '',
    mirrorCamera: true,
    sensitivity: isPhoneMode ? 0.9 : 1,
    horizontalSensitivity: isPhoneMode ? 0.95 : 1,
    verticalSensitivity: isPhoneMode ? 1.1 : 1,
    deadzone: isPhoneMode ? 0.05 : 0.03,
    smoothing: isPhoneMode ? 0.82 : 0.7,
    dwellMs: isPhoneMode ? 700 : 900,
    dwellMoveTolerance: isPhoneMode ? 0.03 : 0.02,
    clickSensitivity: isPhoneMode ? 0.24 : 0.22,
    doubleBlinkWindowMs: isPhoneMode ? 560 : 500,
    consecutiveBlinkGapMs: isPhoneMode ? 500 : 450,
    longBlinkMs: isPhoneMode ? 980 : 900,
    stabilization: true,
    blinkEnabled: true,
    mouthEnabled: isPhoneMode,
    mouthClickCooldownMs: isPhoneMode ? 760 : 700,
    smileDoubleClickCooldownMs: isPhoneMode ? 980 : 900,
    headTiltScrollEnabled: false,
    tiltScrollThreshold: isPhoneMode ? 0.065 : 0.06,
    tiltScrollStep: isPhoneMode ? 90 : 110,
    tiltScrollCooldownMs: isPhoneMode ? 300 : 260,
    voiceEnabled: false,
    acceleration: isPhoneMode ? 1.05 : 1.2
  };
}

function mergePreset(current: ReturnType<typeof buildDefaultSettings>, patch: Partial<ReturnType<typeof buildDefaultSettings>>) {
  return { ...current, ...patch };
}

export function SettingsPage() {
  const { settings, setSettings, isPhoneMode, calibration, setCalibration } = useAppContext();
  const { availableCameras } = useCameraDevices();
  const navigate = useNavigate();

  useVoiceCommands(settings.voiceEnabled, {
    scrollUp:   () => window.scrollBy({ top: -120, behavior: 'smooth' }),
    scrollDown: () => window.scrollBy({ top:  120, behavior: 'smooth' }),
    navigate:   (path) => navigate(path)
  });


  return (
    <div className="grid gap-4">
      <SettingsPanel
        settings={settings}
        onChange={(next) => setSettings(() => next)}
        cameras={availableCameras}
        onSelectCamera={(cameraId) => setSettings((prev) => ({ ...prev, cameraId }))}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Adaptive Mode" className="animate-float-in">
          <div className="space-y-3 text-sm text-app-subtle">
            <p>
              Current profile:
              <span className="ml-2 rounded-full border border-app-accent/30 bg-app-accent/10 px-2 py-0.5 text-xs text-app-text">
                {isPhoneMode ? 'Phone mode (auto)' : 'Desktop mode (auto)'}
              </span>
            </p>
            <p>
              Mode switches automatically by screen characteristics (small viewport or coarse touch pointer).
              Desktop and phone settings are saved separately.
            </p>
          </div>
        </Panel>

        <Panel title="Sensitivity Presets" className="animate-float-in">
          <div className="space-y-3 text-sm text-app-subtle">
            <p>Start with a preset, then fine-tune individual sliders in Accessibility Controls.</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <BigButton
                variant="secondary"
                onClick={() => {
                  setSettings((prev) =>
                    mergePreset(prev, {
                      sensitivity: isPhoneMode ? 0.8 : 0.88,
                      horizontalSensitivity: isPhoneMode ? 0.85 : 0.92,
                      verticalSensitivity: isPhoneMode ? 0.95 : 0.96,
                      deadzone: isPhoneMode ? 0.065 : 0.045,
                      smoothing: isPhoneMode ? 0.88 : 0.82,
                      acceleration: isPhoneMode ? 0.98 : 1.06,
                      dwellMoveTolerance: isPhoneMode ? 0.04 : 0.028,
                      clickSensitivity: isPhoneMode ? 0.26 : 0.24
                    })
                  );
                }}
              >
                Steady
              </BigButton>
              <BigButton
                variant="secondary"
                onClick={() => {
                  setSettings((prev) =>
                    mergePreset(prev, {
                      sensitivity: isPhoneMode ? 0.9 : 1,
                      horizontalSensitivity: isPhoneMode ? 0.95 : 1,
                      verticalSensitivity: isPhoneMode ? 1.1 : 1,
                      deadzone: isPhoneMode ? 0.05 : 0.03,
                      smoothing: isPhoneMode ? 0.82 : 0.7,
                      acceleration: isPhoneMode ? 1.05 : 1.2,
                      dwellMoveTolerance: isPhoneMode ? 0.03 : 0.02,
                      clickSensitivity: isPhoneMode ? 0.24 : 0.22
                    })
                  );
                }}
              >
                Balanced
              </BigButton>
              <BigButton
                variant="secondary"
                onClick={() => {
                  setSettings((prev) =>
                    mergePreset(prev, {
                      sensitivity: isPhoneMode ? 1.05 : 1.18,
                      horizontalSensitivity: isPhoneMode ? 1.08 : 1.15,
                      verticalSensitivity: isPhoneMode ? 1.2 : 1.2,
                      deadzone: isPhoneMode ? 0.035 : 0.02,
                      smoothing: isPhoneMode ? 0.66 : 0.54,
                      acceleration: isPhoneMode ? 1.15 : 1.34,
                      dwellMoveTolerance: isPhoneMode ? 0.022 : 0.015,
                      clickSensitivity: isPhoneMode ? 0.22 : 0.2
                    })
                  );
                }}
              >
                Responsive
              </BigButton>
            </div>
          </div>
        </Panel>

        <Panel title="Testing Workspace" className="animate-float-in">
          <div className="space-y-4 text-sm text-app-subtle">
            <p>Use this section for testing and diagnostics so demo/play pages stay focused on interaction practice.</p>

            <div className="grid gap-2 sm:grid-cols-2">
              <Link to="/demo">
                <BigButton variant="secondary">Open Demo Playground</BigButton>
              </Link>
              <Link to="/games">
                <BigButton variant="secondary">Open Games</BigButton>
              </Link>
              <Link to="/calibration">
                <BigButton variant="secondary">Open Calibration</BigButton>
              </Link>
              <Link to="/voice-personalization">
                <BigButton variant="secondary">Voice Personalization</BigButton>
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              <BigButton
                variant="secondary"
                onClick={() => {
                  setCalibration({ ...calibration, calibrated: false });
                }}
              >
                Reset Calibration Flag
              </BigButton>
              <BigButton
                variant="secondary"
                onClick={() => {
                  setSettings(() => buildDefaultSettings(isPhoneMode));
                }}
              >
                Restore {isPhoneMode ? 'Phone' : 'Desktop'} Defaults
              </BigButton>
            </div>
          </div>
        </Panel>

        <Panel title="Diagnostics" className="animate-float-in">
          <div className="space-y-3">
            <p className="text-xs text-app-subtle">Live settings snapshot for debugging and reproducible tests.</p>
            <pre className="overflow-auto rounded-xl border border-app-accent/20 bg-app-panelAlt p-3 text-xs text-app-subtle">
              {JSON.stringify(settings, null, 2)}
            </pre>
          </div>
        </Panel>
      </div>
    </div>
  );
}
