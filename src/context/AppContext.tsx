import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { CalibrationData, CursorSettings } from '../types';

interface AppContextValue {
  settings: CursorSettings;
  setSettings: (updater: (prev: CursorSettings) => CursorSettings) => void;
  isPhoneMode: boolean;
  calibration: CalibrationData;
  setCalibration: (next: CalibrationData) => void;
}

const defaultSettings: CursorSettings = {
  cameraId: '',
  mirrorCamera: true,
  sensitivity: 1,
  horizontalSensitivity: 1,
  verticalSensitivity: 1,
  deadzone: 0.03,
  smoothing: 0.7,
  dwellMs: 900,
  dwellMoveTolerance: 0.02,
  clickSensitivity: 0.22,
  doubleBlinkWindowMs: 500,
  consecutiveBlinkGapMs: 450,
  longBlinkMs: 900,
  stabilization: true,
  blinkEnabled: true,
  mouthEnabled: false,
  mouthClickCooldownMs: 700,
  smileDoubleClickCooldownMs: 900,
  mouthTypingAdvanceCooldownMs: 240,
  mouthTypingSelectCooldownMs: 320,
  mouthTypingBackspaceCooldownMs: 300,
  headTiltScrollEnabled: false,
  tiltScrollThreshold: 0.06,
  tiltScrollStep: 110,
  tiltScrollCooldownMs: 260,
  voiceEnabled: false,
  acceleration: 1.2
};

const mobileDefaultSettings: CursorSettings = {
  ...defaultSettings,
  sensitivity: 0.9,
  horizontalSensitivity: 0.95,
  verticalSensitivity: 1.1,
  deadzone: 0.05,
  smoothing: 0.82,
  dwellMs: 700,
  dwellMoveTolerance: 0.03,
  clickSensitivity: 0.24,
  doubleBlinkWindowMs: 560,
  consecutiveBlinkGapMs: 500,
  longBlinkMs: 980,
  acceleration: 1.05,
  mouthEnabled: true,
  mouthClickCooldownMs: 760,
  smileDoubleClickCooldownMs: 980,
  mouthTypingAdvanceCooldownMs: 280,
  mouthTypingSelectCooldownMs: 360,
  mouthTypingBackspaceCooldownMs: 340,
  tiltScrollThreshold: 0.065,
  tiltScrollStep: 90,
  tiltScrollCooldownMs: 300
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

function safeLoadSettings(key: string, fallback: CursorSettings): CursorSettings {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as CursorSettings;
  } catch {
    return fallback;
  }
}

function safePersist(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [desktopSettings, setDesktopSettings] = useState<CursorSettings>(() => {
    if (typeof window === 'undefined') return defaultSettings;
    const fromDesktop = safeLoadSettings('head-cursor-settings-desktop', defaultSettings);
    const fromLegacy = safeLoadSettings('head-cursor-settings', fromDesktop);
    return { ...fromDesktop, ...fromLegacy };
  });

  const [mobileSettings, setMobileSettings] = useState<CursorSettings>(() => {
    if (typeof window === 'undefined') return mobileDefaultSettings;
    return safeLoadSettings('head-cursor-settings-mobile', mobileDefaultSettings);
  });

  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [calibration, setCalibration] = useState<CalibrationData>(defaultCalibration);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const migrationKey = 'head-cursor-mirror-flipped-v2';
    if (localStorage.getItem(migrationKey) === 'done') return;

    setDesktopSettings((prev) => {
      const next = { ...prev, mirrorCamera: true };
      safePersist('head-cursor-settings-desktop', next);
      return next;
    });

    setMobileSettings((prev) => {
      const next = { ...prev, mirrorCamera: true };
      safePersist('head-cursor-settings-mobile', next);
      return next;
    });

    safePersist('head-cursor-settings', { ...safeLoadSettings('head-cursor-settings', defaultSettings), mirrorCamera: true });
    localStorage.setItem(migrationKey, 'done');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Adaptive mode: phone profile if viewport is narrow or coarse pointer device.
    const media = window.matchMedia('(max-width: 768px), (pointer: coarse)');
    const update = () => setIsPhoneMode(media.matches);
    update();

    if (media.addEventListener) {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  const settings = isPhoneMode ? mobileSettings : desktopSettings;

  const value = useMemo(
    () => ({
      settings,
      isPhoneMode,
      setSettings: (updater: (prev: CursorSettings) => CursorSettings) => {
        if (isPhoneMode) {
          setMobileSettings((prev) => {
            const next = updater(prev);
            safePersist('head-cursor-settings-mobile', next);
            safePersist('head-cursor-settings', next);
            return next;
          });
          return;
        }

        setDesktopSettings((prev) => {
          const next = updater(prev);
          safePersist('head-cursor-settings-desktop', next);
          safePersist('head-cursor-settings', next);
          return next;
        });
      },
      calibration,
      setCalibration
    }),
    [settings, isPhoneMode, calibration]
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
