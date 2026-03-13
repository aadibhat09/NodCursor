import { Link } from 'react-router-dom';
import { SettingsPanel } from '../../components/SettingsPanel/SettingsPanel';
import { BigButton, Panel } from '../../components/common';
import { useAppContext } from '../../context/AppContext';
import { useCameraDevices } from '../../hooks/useCameraDevices';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const { settings, setSettings, calibration, setCalibration } = useAppContext();
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
                    sensitivity: 1,
                    deadzone: 0.03,
                    smoothing: 0.7,
                    dwellMs: 900,
                    clickSensitivity: 0.22,
                    stabilization: true,
                    blinkEnabled: true,
                    mouthEnabled: false,
                    headTiltScrollEnabled: false,
                    voiceEnabled: false,
                    acceleration: 1.2
                  }));
                }}
              >
                Restore Default Settings
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
