import { useEffect, useRef, useState } from 'react';

export function useDwellClick(x: number, y: number, dwellMs: number, moveTolerance: number, onClick: () => void) {
  const [progress, setProgress] = useState(0);
  const lastPoint = useRef({ x, y });
  const startedAt = useRef<number>(performance.now());

  useEffect(() => {
    const distance = Math.hypot(x - lastPoint.current.x, y - lastPoint.current.y);
    if (distance > moveTolerance) {
      lastPoint.current = { x, y };
      startedAt.current = performance.now();
      setProgress(0);
      return;
    }

    const raf = requestAnimationFrame(function tick() {
      const elapsed = performance.now() - startedAt.current;
      const next = Math.min(1, elapsed / dwellMs);
      setProgress(next);
      if (next >= 1) {
        onClick();
        startedAt.current = performance.now();
        setProgress(0);
      } else {
        requestAnimationFrame(tick);
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [x, y, dwellMs, moveTolerance, onClick]);

  return progress;
}
