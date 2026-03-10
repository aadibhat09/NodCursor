import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { CalibrationData, CursorSettings } from '../types';

interface AppContextValue {
  settings: CursorSettings;
  setSettings: (updater: (prev: CursorSettings) => CursorSettings) => void;
  calibration: CalibrationData;
  setCalibration: (next: CalibrationData) => void;
}

const defaultSettings: CursorSettings = {
  cameraId: '',
  mirrorCamera: true,
  sensitivity: 1,
  deadzone: 0.03,
  smoothing: 0.7,
  dwellMs: 900,
  clickSensitivity: 0.22,
  stabilization: true,
  blinkEnabled: true,
  mouthEnabled: false,
  headTiltScrollEnabled: false,
  voiceEnabled: false,
  acceleration: 1.2
};

const defaultCalibration: CalibrationData = {
  centerX: 0.5,
  centerY: 0.5,
  leftX: 0.3,
  rightX: 0.7,
  upY: 0.3,
  downY: 0.7,
  calibrated: false
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<CursorSettings>(defaultSettings);
  const [calibration, setCalibration] = useState<CalibrationData>(defaultCalibration);

  const value = useMemo(
    () => ({
      settings,
      setSettings: (updater: (prev: CursorSettings) => CursorSettings) => {
        setSettingsState((prev) => {
          const next = updater(prev);
          localStorage.setItem('head-cursor-settings', JSON.stringify(next));
          return next;
        });
      },
      calibration,
      setCalibration
    }),
    [settings, calibration]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return ctx;
}
