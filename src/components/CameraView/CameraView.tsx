import type { RefObject } from 'react';
import { Panel } from '../common';
import type { AdaptiveLightState } from '../../utils/ml/adaptiveLightLearner';

export function CameraView({
  videoRef,
  cameraError,
  sourceLabel,
  mirrored = true,
  lightState = null
}: {
  videoRef: RefObject<HTMLVideoElement>;
  cameraError: string | null;
  sourceLabel: string;
  mirrored?: boolean;
  lightState?: AdaptiveLightState | null;
}) {
  const qualityPct = lightState ? Math.round(lightState.quality * 100) : null;

  return (
    <Panel title="Camera View" className="animate-float-in">
      <div className="relative overflow-hidden rounded-xl border border-app-accent/30 bg-black/60">
        <video
          ref={videoRef}
          className={`aspect-video w-full object-cover ${mirrored ? 'scale-x-[-1]' : ''}`}
          muted
          playsInline
          aria-label="Live camera feed"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-sm text-app-text">
          <div>Source: {sourceLabel}</div>
          {qualityPct !== null ? (
            <div className="text-xs text-app-subtle">
              Light quality: {qualityPct}% · {lightState?.recommendation}
            </div>
          ) : null}
        </div>
      </div>
      {cameraError ? <p className="mt-3 text-sm text-app-danger">{cameraError}</p> : null}
      <p className="mt-2 text-sm text-app-subtle">Camera frames are processed locally in your browser and are never uploaded.</p>
    </Panel>
  );
}
