import { useMemo } from 'react';
import type { CalibrationData, CursorSettings } from '../types';
import { mapToViewport } from '../utils/calibration/mapToViewport';

export function useCursorMapping(rawX: number, rawY: number, calibration: CalibrationData, settings: CursorSettings) {
  return useMemo(() => {
    const mapped = mapToViewport(rawX, rawY, calibration);

    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const adaptiveMultiplier = viewportWidth < 430 ? 1.28 : viewportWidth < 900 ? 1.14 : 1;
    const verticalBoost = viewportWidth < 430 ? 1.55 : viewportWidth < 900 ? 1.38 : 1.26;

    const centerOffsetX = mapped.x - 0.5;
    const centerOffsetY = mapped.y - 0.5;
    const distance = Math.sqrt(centerOffsetX ** 2 + centerOffsetY ** 2);

    if (distance < settings.deadzone) {
      return { x: 0.5, y: 0.5 };
    }

    const acceleration = Math.pow(distance, settings.acceleration);
    const gain = settings.sensitivity * adaptiveMultiplier * (1 + acceleration);
    const x = 0.5 + centerOffsetX * gain;
    const y = 0.5 + centerOffsetY * gain * verticalBoost;

    return {
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y))
    };
  }, [rawX, rawY, calibration, settings.deadzone, settings.sensitivity, settings.acceleration]);
}
