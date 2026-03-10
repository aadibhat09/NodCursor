import { useEffect, useState } from 'react';

export function useCameraDevices() {
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    let active = true;

    async function loadCameras() {
      if (!navigator.mediaDevices?.enumerateDevices) {
        return;
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      if (!active) {
        return;
      }
      setAvailableCameras(devices.filter((device) => device.kind === 'videoinput'));
    }

    loadCameras();

    return () => {
      active = false;
    };
  }, []);

  return { availableCameras };
}
