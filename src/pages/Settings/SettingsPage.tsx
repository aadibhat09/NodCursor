import { Link } from 'react-router-dom';
import { SettingsPanel } from '../../components/SettingsPanel/SettingsPanel';
import { BigButton, Panel } from '../../components/common';
import { useAppContext } from '../../context/AppContext';
import { useCameraDevices } from '../../hooks/useCameraDevices';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import { useNavigate } from 'react-router-dom';

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
                  setSettings(() => ({
                    cameraId: '',
                    mirrorCamera: true,
                    sensitivity: isPhoneMode ? 0.9 : 1,
                    deadzone: isPhoneMode ? 0.05 : 0.03,
                    smoothing: isPhoneMode ? 0.82 : 0.7,
                    dwellMs: isPhoneMode ? 700 : 900,
                    clickSensitivity: isPhoneMode ? 0.24 : 0.22,
                    stabilization: true,
                    blinkEnabled: true,
                    mouthEnabled: isPhoneMode,
                    headTiltScrollEnabled: false,
                    voiceEnabled: false,
                    acceleration: isPhoneMode ? 1.05 : 1.2
                  }));
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
