const xBuckets = [
  'left-[0%]',
  'left-[10%]',
  'left-[20%]',
  'left-[30%]',
  'left-[40%]',
  'left-[50%]',
  'left-[60%]',
  'left-[70%]',
  'left-[80%]',
  'left-[90%]',
  'left-[100%]'
];

const yBuckets = [
  'top-[0%]',
  'top-[10%]',
  'top-[20%]',
  'top-[30%]',
  'top-[40%]',
  'top-[50%]',
  'top-[60%]',
  'top-[70%]',
  'top-[80%]',
  'top-[90%]',
  'top-[100%]'
];

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

function toBucket(value: number) {
  return Math.max(0, Math.min(10, Math.round(value * 10)));
}

export function CursorOverlay({
  x,
  y,
  dwellProgress,
  dragMode
}: {
  x: number;
  y: number;
  dwellProgress: number;
  dragMode: boolean;
}) {
  const xClass = xBuckets[toBucket(x)];
  const yClass = yBuckets[toBucket(y)];
  const progressClass = progressBuckets[toBucket(dwellProgress)];

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div className={`absolute ${xClass} ${yClass} -translate-x-1/2 -translate-y-1/2`} aria-hidden="true">
        <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-app-accent bg-app-bg/80 shadow-glow">
          <div className="h-2 w-2 rounded-full bg-app-accent" />
        </div>
        <div className="mt-2 h-1.5 w-12 overflow-hidden rounded-full bg-app-panelAlt">
          <div className={`h-full bg-app-success transition-all ${progressClass}`} />
        </div>
        {dragMode ? <p className="mt-1 text-xs font-semibold text-app-danger">Drag mode</p> : null}
      </div>
    </div>
  );
}
