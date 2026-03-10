import type { RefObject } from 'react';
import { Panel } from '../common';

export function CameraView({
  videoRef,
  cameraError,
  sourceLabel
}: {
  videoRef: RefObject<HTMLVideoElement>;
  cameraError: string | null;
  sourceLabel: string;
}) {
  return (
    <Panel title="Camera View" className="animate-float-in">
      <div className="relative overflow-hidden rounded-xl border border-app-accent/30 bg-black/60">
        <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline aria-label="Live camera feed" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-sm text-app-text">
          Source: {sourceLabel}
        </div>
      </div>
      {cameraError ? <p className="mt-3 text-sm text-app-danger">{cameraError}</p> : null}
      <p className="mt-2 text-sm text-app-subtle">Camera frames are processed locally in your browser and are never uploaded.</p>
    </Panel>
  );
}
