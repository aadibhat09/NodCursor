import type { CalibrationData } from '../../types';

function normalize(value: number, min: number, max: number) {
  if (max - min < 0.001) {
    return 0.5;
  }
  return (value - min) / (max - min);
}

export function mapToViewport(rawX: number, rawY: number, calibration: CalibrationData) {
  const x = normalize(rawX, calibration.leftX, calibration.rightX);
  const y = normalize(rawY, calibration.upY, calibration.downY);
  return {
    x: Math.min(1, Math.max(0, x)),
    y: Math.min(1, Math.max(0, y))
  };
}
