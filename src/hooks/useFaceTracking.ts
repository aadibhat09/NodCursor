import { useEffect, useMemo, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { CursorSettings, TrackingState } from '../types';
import { useCursorMapping } from './useCursorMapping';
import type { CalibrationData } from '../types';
import { AdaptiveLightLearner, type AdaptiveLightState, sampleVideoLuma } from '../utils/ml/adaptiveLightLearner';

const MEDIAPIPE_WASM_CANDIDATES = [
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm',
  'https://unpkg.com/@mediapipe/tasks-vision@0.10.18/wasm',
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
] as const;
const MEDIAPIPE_FACE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

async function loadVisionResolver() {
  let lastError: unknown;
  for (const baseUrl of MEDIAPIPE_WASM_CANDIDATES) {
    try {
      return await FilesetResolver.forVisionTasks(baseUrl);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Failed to load MediaPipe vision WASM assets.');
}

function getCameraErrorMessage(error: unknown): string {
  if (!(error instanceof DOMException)) {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }
    return 'Camera is unavailable. Please check that a webcam is connected.';
  }

  if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
    return 'Camera permission was denied. Please allow camera access for this site and reload.';
  }

  if (error.name === 'NotFoundError') {
    return 'No camera was found. Please connect a webcam and try again.';
  }

  if (error.name === 'NotReadableError') {
    return 'Camera is already in use by another app. Close other camera apps and retry.';
  }

  if (error.name === 'OverconstrainedError') {
    return 'The selected camera is unavailable. Switched to default camera fallback.';
  }

  return error.message || 'Camera is unavailable. Please check browser/device camera settings.';
}

async function requestCameraStream(cameraId: string): Promise<MediaStream> {
  if (!cameraId) {
    return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: cameraId } },
      audio: false
    });
  } catch (error) {
    if (error instanceof DOMException && (error.name === 'OverconstrainedError' || error.name === 'NotFoundError')) {
      return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }
    throw error;
  }
}

function tuneCameraForRecommendation(track: MediaStreamTrack, recommendation: AdaptiveLightState['recommendation']) {
  const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & {
    brightness?: unknown;
    contrast?: unknown;
    exposureCompensation?: unknown;
  };

  if (!capabilities) {
    return;
  }

  const advanced: Record<string, number | string> = {};
  if ('exposureMode' in capabilities) {
    advanced.exposureMode = 'continuous';
  }
  if ('whiteBalanceMode' in capabilities) {
    advanced.whiteBalanceMode = 'continuous';
  }
  if ('focusMode' in capabilities) {
    advanced.focusMode = 'continuous';
  }

  if (recommendation === 'low-light') {
    advanced.exposureCompensation = 0.25;
    advanced.brightness = 0.22;
    advanced.contrast = 0.12;
  } else if (recommendation === 'bright') {
    advanced.exposureCompensation = -0.08;
    advanced.brightness = -0.06;
    advanced.contrast = 0.06;
  } else {
    advanced.exposureCompensation = 0;
    advanced.brightness = 0.05;
    advanced.contrast = 0.1;
  }

  track.applyConstraints({ advanced: [advanced] } as MediaTrackConstraints).catch(() => undefined);
}

interface UseFaceTrackingResult {
  state: TrackingState;
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraError: string | null;
  availableCameras: MediaDeviceInfo[];
  lightState: AdaptiveLightState | null;
}

const fallbackState: TrackingState = {
  x: 0.5,
  y: 0.5,
  confidence: 0,
  blink: false,
  doubleBlink: false,
  longBlink: false,
  mouthOpen: false,
  smile: false,
  headTilt: 0,
  dragMode: false,
  source: 'fallback'
};

export function useFaceTracking(settings: CursorSettings, calibration: CalibrationData): UseFaceTrackingResult {
  const [raw, setRaw] = useState({ ...fallbackState });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [lightState, setLightState] = useState<AdaptiveLightState | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const lastStateCommitAtRef = useRef(0);
  const workerSettingsRef = useRef({
    smoothing: settings.smoothing,
    clickSensitivity: settings.clickSensitivity,
    doubleBlinkWindowMs: settings.doubleBlinkWindowMs,
    consecutiveBlinkGapMs: settings.consecutiveBlinkGapMs,
    longBlinkMs: settings.longBlinkMs
  });

  const mapped = useCursorMapping(
    raw.source === 'camera' && settings.mirrorCamera ? 1 - raw.x : raw.x,
    raw.y,
    calibration,
    settings
  );

  const state = useMemo(
    () => ({
      ...raw,
      x: mapped.x,
      y: mapped.y
    }),
    [raw, mapped.x, mapped.y]
  );

  useEffect(() => {
    workerSettingsRef.current = {
      smoothing: settings.smoothing,
      clickSensitivity: settings.clickSensitivity,
      doubleBlinkWindowMs: settings.doubleBlinkWindowMs,
      consecutiveBlinkGapMs: settings.consecutiveBlinkGapMs,
      longBlinkMs: settings.longBlinkMs
    };
  }, [
    settings.smoothing,
    settings.clickSensitivity,
    settings.doubleBlinkWindowMs,
    settings.consecutiveBlinkGapMs,
    settings.longBlinkMs
  ]);

  useEffect(() => {
    const worker = new Worker(new URL('../workers/trackingWorker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;
    worker.onmessage = (event) => {
      const data = event.data as Omit<TrackingState, 'confidence' | 'source'>;
      const now = performance.now();
      setRaw((prev) => {
        const next = {
          ...prev,
          ...data,
          x: data.x,
          y: data.y,
          confidence: Math.max(0.2, prev.confidence),
          source: 'camera' as const
        };

        const movement = Math.hypot(next.x - prev.x, next.y - prev.y);
        const gestureChanged =
          prev.blink !== next.blink ||
          prev.doubleBlink !== next.doubleBlink ||
          prev.longBlink !== next.longBlink ||
          prev.mouthOpen !== next.mouthOpen ||
          prev.smile !== next.smile ||
          prev.dragMode !== next.dragMode;

        if (!gestureChanged && movement < 0.0016 && now - lastStateCommitAtRef.current < 32) {
          return prev;
        }

        lastStateCommitAtRef.current = now;
        return next;
      });
    };

    return () => worker.terminate();
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let landmarker: FaceLandmarker | null = null;
    let frameId = 0;
    let mounted = true;
    let nextDetectionAt = 0;
    let failedFrames = 0;
    let lastLightSampleAt = 0;
    let lastConstraintTuneAt = 0;
    let outlierFrames = 0;
    let lastStablePoint: { x: number; y: number } | null = null;
    const lightLearner = new AdaptiveLightLearner();
    let adaptiveState: AdaptiveLightState | null = null;

    async function init() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!mounted) {
          return;
        }

        const cams = devices.filter((device) => device.kind === 'videoinput');
        setAvailableCameras(cams);

        const vision = await loadVisionResolver();
        if (!mounted) {
          return;
        }

        landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MEDIAPIPE_FACE_MODEL_URL
          },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 1
        });
        if (!mounted) {
          landmarker.close?.();
          return;
        }

        stream = await requestCameraStream(settings.cameraId);
        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        setCameraError(null);

        if (!videoRef.current) {
          return;
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const activeTrack = stream.getVideoTracks()[0] ?? null;

        const loop = (frameNow: number) => {
          if (!mounted || !videoRef.current || !landmarker) {
            return;
          }

          if (frameNow < nextDetectionAt) {
            frameId = requestAnimationFrame(loop);
            return;
          }

          if (videoRef.current.readyState < 2) {
            nextDetectionAt = frameNow + 60;
            frameId = requestAnimationFrame(loop);
            return;
          }

          if (frameNow - lastLightSampleAt > 220) {
            const lightSample = sampleVideoLuma(videoRef.current);
            if (lightSample) {
              adaptiveState = lightLearner.update(lightSample);
              if (mounted) {
                setLightState((prev) => {
                  const nextAdaptive = adaptiveState;
                  if (!nextAdaptive) {
                    return prev;
                  }

                  if (!prev) {
                    return nextAdaptive;
                  }

                  const brightnessShift = Math.abs(prev.brightness - nextAdaptive.brightness);
                  const qualityShift = Math.abs(prev.quality - nextAdaptive.quality);
                  if (brightnessShift < 0.015 && qualityShift < 0.02 && prev.recommendation === nextAdaptive.recommendation) {
                    return prev;
                  }

                  return nextAdaptive;
                });
              }

              if (activeTrack && frameNow - lastConstraintTuneAt > 1800) {
                tuneCameraForRecommendation(activeTrack, adaptiveState.recommendation);
                lastConstraintTuneAt = frameNow;
              }
            }
            lastLightSampleAt = frameNow;
          }

          const result = landmarker.detectForVideo(videoRef.current, frameNow);
          const landmarks = result.faceLandmarks?.[0];
          const baseInterval = adaptiveState?.detectionIntervalMs ?? 40;

          if (!landmarks) {
            failedFrames += 1;
            nextDetectionAt = frameNow + Math.min(baseInterval + failedFrames * 3, 90);
            frameId = requestAnimationFrame(loop);
            return;
          }

          failedFrames = 0;

          const nose = landmarks[1] ?? { x: 0.5, y: 0.5 };
          const eyeLeftOuter = landmarks[33] ?? { x: nose.x, y: nose.y };
          const eyeRightOuter = landmarks[263] ?? { x: nose.x, y: nose.y };
          const eyeCenter = {
            x: (eyeLeftOuter.x + eyeRightOuter.x) / 2,
            y: (eyeLeftOuter.y + eyeRightOuter.y) / 2
          };

          const stablePoint = {
            x: nose.x * 0.74 + eyeCenter.x * 0.26,
            y: nose.y * 0.74 + eyeCenter.y * 0.26
          };

          if (lastStablePoint) {
            const jump = Math.hypot(stablePoint.x - lastStablePoint.x, stablePoint.y - lastStablePoint.y);
            const jumpLimit = adaptiveState?.quality && adaptiveState.quality < 0.45 ? 0.075 : 0.095;
            if (jump > jumpLimit && outlierFrames < 2) {
              outlierFrames += 1;
              nextDetectionAt = frameNow + 16;
              frameId = requestAnimationFrame(loop);
              return;
            }
          }

          outlierFrames = 0;
          lastStablePoint = stablePoint;
          const eyeTop = landmarks[159]?.y ?? 0;
          const eyeBottom = landmarks[145]?.y ?? 0;
          const eyeLeft = landmarks[33]?.x ?? 0;
          const eyeRight = landmarks[133]?.x ?? 1;

          const mouthTop = landmarks[13]?.y ?? 0;
          const mouthBottom = landmarks[14]?.y ?? 0;
          const smileLeft = landmarks[61]?.x ?? 0;
          const smileRight = landmarks[291]?.x ?? 1;
          const browTilt = (landmarks[70]?.y ?? 0.5) - (landmarks[300]?.y ?? 0.5);

          workerRef.current?.postMessage({
            point: { x: stablePoint.x, y: stablePoint.y },
            smoothing: workerSettingsRef.current.smoothing,
            blinkRatio: Math.abs(eyeTop - eyeBottom) / Math.max(Math.abs(eyeLeft - eyeRight), 0.001),
            mouthRatio: Math.abs(mouthTop - mouthBottom),
            smileRatio: Math.abs(smileRight - smileLeft),
            headTilt: browTilt,
            clickSensitivity:
              workerSettingsRef.current.clickSensitivity * (adaptiveState?.blinkSensitivityMultiplier ?? 1),
            doubleBlinkWindowMs: workerSettingsRef.current.doubleBlinkWindowMs,
            consecutiveBlinkGapMs: workerSettingsRef.current.consecutiveBlinkGapMs,
            longBlinkMs: workerSettingsRef.current.longBlinkMs
          });

          nextDetectionAt = frameNow + baseInterval;
          frameId = requestAnimationFrame(loop);
        };

        frameId = requestAnimationFrame(loop);
      } catch (error) {
        if (!mounted) {
          return;
        }
        setCameraError(getCameraErrorMessage(error));
      }
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera API is not available in this browser.');
      return;
    }

    init();

    return () => {
      mounted = false;
      cancelAnimationFrame(frameId);
      stream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      landmarker?.close?.();
    };
  }, [settings.cameraId]);

  useEffect(() => {
    if (state.source === 'camera') {
      return;
    }

    const onMove = (event: MouseEvent) => {
      setRaw((prev) => ({
        ...prev,
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
        source: 'fallback',
        confidence: 0.2
      }));
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [state.source]);

  return { state, videoRef, cameraError, availableCameras, lightState };
}
