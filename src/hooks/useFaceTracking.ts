import { useEffect, useMemo, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { CursorSettings, TrackingState } from '../types';
import { useCursorMapping } from './useCursorMapping';
import type { CalibrationData } from '../types';

interface UseFaceTrackingResult {
  state: TrackingState;
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraError: string | null;
  availableCameras: MediaDeviceInfo[];
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const workerRef = useRef<Worker | null>(null);

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
    const worker = new Worker(new URL('../workers/trackingWorker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;
    worker.onmessage = (event) => {
      const data = event.data as Omit<TrackingState, 'confidence' | 'source'>;
      setRaw((prev) => ({
        ...prev,
        ...data,
        x: data.x,
        y: data.y,
        confidence: Math.max(0.2, prev.confidence),
        source: 'camera'
      }));
    };

    return () => worker.terminate();
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let frameId = 0;
    let mounted = true;

    async function init() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter((device) => device.kind === 'videoinput');
        if (mounted) {
          setAvailableCameras(cams);
        }

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
          },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 1
        });

        stream = await navigator.mediaDevices.getUserMedia({
          video: settings.cameraId ? { deviceId: { exact: settings.cameraId } } : true,
          audio: false
        });

        if (!videoRef.current) {
          return;
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const loop = () => {
          if (!videoRef.current) {
            return;
          }

          const result = landmarker.detectForVideo(videoRef.current, performance.now());
          const landmarks = result.faceLandmarks?.[0];

          if (!landmarks) {
            frameId = requestAnimationFrame(loop);
            return;
          }

          const nose = landmarks[1] ?? { x: 0.5, y: 0.5 };
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
            point: { x: nose.x, y: nose.y },
            smoothing: settings.smoothing,
            blinkRatio: Math.abs(eyeTop - eyeBottom) / Math.max(Math.abs(eyeLeft - eyeRight), 0.001),
            mouthRatio: Math.abs(mouthTop - mouthBottom),
            smileRatio: Math.abs(smileRight - smileLeft),
            headTilt: browTilt,
            clickSensitivity: settings.clickSensitivity
          });

          frameId = requestAnimationFrame(loop);
        };

        frameId = requestAnimationFrame(loop);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Camera is unavailable';
        setCameraError(message);
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
    };
  }, [settings.cameraId, settings.smoothing, settings.clickSensitivity]);

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

  return { state, videoRef, cameraError, availableCameras };
}
