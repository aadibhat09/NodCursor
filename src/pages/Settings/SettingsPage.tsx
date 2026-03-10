import { SettingsPanel } from '../../components/SettingsPanel/SettingsPanel';
import { Panel } from '../../components/common';
import { useAppContext } from '../../context/AppContext';
import { useCameraDevices } from '../../hooks/useCameraDevices';

export function SettingsPage() {
  const { settings, setSettings } = useAppContext();
  const { availableCameras } = useCameraDevices();

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <SettingsPanel
        settings={settings}
        onChange={(next) => setSettings(() => next)}
        cameras={availableCameras}
        onSelectCamera={(cameraId) => setSettings((prev) => ({ ...prev, cameraId }))}
      />
      <Panel title="Debug Mode" className="animate-float-in">
        <pre className="overflow-auto rounded-xl border border-app-accent/20 bg-app-panelAlt p-3 text-xs text-app-subtle">
          {JSON.stringify(settings, null, 2)}
        </pre>
      </Panel>
    </div>
  );
}
