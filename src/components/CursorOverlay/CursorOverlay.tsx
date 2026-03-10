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
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
        aria-hidden="true"
      >
        <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-app-accent bg-app-bg/80 shadow-glow">
          <div className="h-2 w-2 rounded-full bg-app-accent" />
        </div>
        <div className="mt-2 h-1.5 w-12 overflow-hidden rounded-full bg-app-panelAlt">
          <div
            className="h-full bg-app-success transition-[width]"
            style={{ width: `${Math.max(0, Math.min(100, dwellProgress * 100))}%` }}
          />
        </div>
        {dragMode ? <p className="mt-1 text-xs font-semibold text-app-danger">Drag mode</p> : null}
      </div>
    </div>
  );
}
