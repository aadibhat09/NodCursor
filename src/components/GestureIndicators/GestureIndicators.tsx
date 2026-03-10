import { Panel } from '../common';

function Tag({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={[
        'rounded-full border px-3 py-1 text-xs font-semibold',
        active ? 'border-app-success bg-app-success/20 text-app-success' : 'border-app-accent/30 text-app-subtle'
      ].join(' ')}
    >
      {label}
    </span>
  );
}

export function GestureIndicators({
  blink,
  doubleBlink,
  longBlink,
  mouthOpen,
  smile,
  headTilt
}: {
  blink: boolean;
  doubleBlink: boolean;
  longBlink: boolean;
  mouthOpen: boolean;
  smile: boolean;
  headTilt: number;
}) {
  return (
    <Panel title="Gesture Controls" className="animate-float-in">
      <div className="flex flex-wrap gap-2">
        <Tag label="Blink" active={blink} />
        <Tag label="Double Blink" active={doubleBlink} />
        <Tag label="Long Blink / Drag" active={longBlink} />
        <Tag label="Mouth Open" active={mouthOpen} />
        <Tag label="Smile" active={smile} />
      </div>
      <p className="mt-3 text-sm text-app-subtle">Head tilt: {headTilt.toFixed(3)} (positive values can scroll down)</p>
    </Panel>
  );
}
