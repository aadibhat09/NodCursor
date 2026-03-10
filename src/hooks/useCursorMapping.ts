import { useMemo } from 'react';
import type { CalibrationData, CursorSettings } from '../types';
import { mapToViewport } from '../utils/calibration/mapToViewport';

export function useCursorMapping(rawX: number, rawY: number, calibration: CalibrationData, settings: CursorSettings) {
  return useMemo(() => {
    const mapped = mapToViewport(rawX, rawY, calibration);

    const centerOffsetX = mapped.x - 0.5;
    const centerOffsetY = mapped.y - 0.5;
    const distance = Math.sqrt(centerOffsetX ** 2 + centerOffsetY ** 2);

    if (distance < settings.deadzone) {
      return { x: 0.5, y: 0.5 };
    }

    const acceleration = Math.pow(distance, settings.acceleration);
    const x = 0.5 + centerOffsetX * settings.sensitivity * (1 + acceleration);
    const y = 0.5 + centerOffsetY * settings.sensitivity * (1 + acceleration);

    return {
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y))
    };
  }, [rawX, rawY, calibration, settings.deadzone, settings.sensitivity, settings.acceleration]);
}
