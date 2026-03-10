import { BigButton, Panel } from '../common';

const steps = ['Center your head', 'Look left', 'Look right', 'Look up', 'Look down'];
const progressBuckets = [
  'w-[0%]',
  'w-[10%]',
  'w-[20%]',
  'w-[30%]',
  'w-[40%]',
  'w-[50%]',
  'w-[60%]',
  'w-[70%]',
  'w-[80%]',
  'w-[90%]',
  'w-[100%]'
];

function progressToClass(value: number) {
  const bucket = Math.max(0, Math.min(10, Math.round(value * 10)));
  return progressBuckets[bucket];
}

export function CalibrationUI({
  step,
  onCapture,
  onReset,
  progress
}: {
  step: number;
  onCapture: () => void;
  onReset: () => void;
  progress: number;
}) {
  const progressClass = progressToClass(progress);

  return (
    <Panel title="Cursor Calibration" className="animate-float-in">
      <p className="text-sm text-app-subtle">Follow the guided sequence to personalize head range mapping.</p>
      <div className="mt-4 rounded-xl border border-app-accent/20 bg-app-panelAlt p-4">
        <p className="text-base font-semibold">Current step: {steps[Math.min(step, steps.length - 1)]}</p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-app-bg">
          <div className={`h-full bg-app-accentStrong transition-all ${progressClass}`} />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <BigButton onClick={onCapture}>Capture Position</BigButton>
        <BigButton onClick={onReset} variant="secondary">
          Reset Calibration
        </BigButton>
      </div>
    </Panel>
  );
}
