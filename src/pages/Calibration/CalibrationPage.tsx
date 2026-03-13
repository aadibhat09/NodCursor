import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalibrationUI } from '../../components/CalibrationUI/CalibrationUI';
import { CameraView } from '../../components/CameraView/CameraView';
import { useAppContext } from '../../context/AppContext';
import { useFaceTracking } from '../../hooks/useFaceTracking';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';

const steps = ['center', 'left', 'right', 'up', 'down'] as const;

export function CalibrationPage() {
  const { settings, calibration, setCalibration } = useAppContext();
  const { state, videoRef, cameraError } = useFaceTracking(settings, calibration);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useVoiceCommands(settings.voiceEnabled, {
    scrollUp:   () => window.scrollBy({ top: -120, behavior: 'smooth' }),
    scrollDown: () => window.scrollBy({ top:  120, behavior: 'smooth' }),
    navigate:   (path) => navigate(path)
  });


  const progress = useMemo(() => step / (steps.length - 1), [step]);

  const captureStep = () => {
    const key = steps[Math.min(step, steps.length - 1)];

    setCalibration({
      ...calibration,
      centerX: key === 'center' ? state.x : calibration.centerX,
      centerY: key === 'center' ? state.y : calibration.centerY,
      leftX: key === 'left' ? state.x : calibration.leftX,
      rightX: key === 'right' ? state.x : calibration.rightX,
      upY: key === 'up' ? state.y : calibration.upY,
      downY: key === 'down' ? state.y : calibration.downY,
      calibrated: step >= steps.length - 1
    });

    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <CameraView
        videoRef={videoRef}
        cameraError={cameraError}
        sourceLabel={state.source}
        mirrored={settings.mirrorCamera}
      />
      <CalibrationUI
        step={step}
        progress={progress}
        onCapture={captureStep}
        onReset={() => {
          setStep(0);
          setCalibration({ ...calibration, calibrated: false });
        }}
      />
    </div>
  );
}
