import { Link } from 'react-router-dom';
import { BigButton, Panel } from '../../components/common';

export function HomePage() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <Panel title="Accessible Head Tracking Cursor" className="animate-float-in">
        <p className="max-w-2xl text-base leading-relaxed text-app-text">
          This browser-first tool helps users control cursor actions with head motion, blinks, and optional voice commands.
          It is designed for people with motor impairments or limited hand mobility.
        </p>
        <div className="mt-4 grid gap-2 text-sm text-app-subtle">
          <p>1. Open Calibration to map your personal movement range.</p>
          <p>2. Use the Demo Playground to test click, drag, scroll, and typing.</p>
          <p>3. Jump into Games to practice speed, precision, and dwell control.</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/calibration">
            <BigButton>Start Calibration</BigButton>
          </Link>
          <Link to="/demo">
            <BigButton variant="secondary">Open Demo Playground</BigButton>
          </Link>
          <Link to="/games">
            <BigButton variant="secondary">Play Games</BigButton>
          </Link>
        </div>
      </Panel>

      <Panel title="Privacy & Permissions" className="animate-float-in">
        <ul className="space-y-2 text-sm text-app-subtle">
          <li>Camera processing runs locally in your browser.</li>
          <li>No video frames are uploaded, stored, or shared.</li>
          <li>You can stop camera access at any time in browser settings.</li>
          <li>Fallback pointer mode works if camera access fails.</li>
        </ul>
      </Panel>
    </div>
  );
}
