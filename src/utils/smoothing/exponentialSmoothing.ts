export interface SmoothPoint {
  x: number;
  y: number;
}

export function exponentialSmooth(prev: SmoothPoint, next: SmoothPoint, alpha: number): SmoothPoint {
  const clamped = Math.min(0.95, Math.max(0.05, alpha));
  return {
    x: prev.x * clamped + next.x * (1 - clamped),
    y: prev.y * clamped + next.y * (1 - clamped)
  };
}
