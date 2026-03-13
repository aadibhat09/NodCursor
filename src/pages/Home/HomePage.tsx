import { Link, useNavigate } from 'react-router-dom';
import { BigButton, Panel } from '../../components/common';
import { useAppContext } from '../../context/AppContext';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';

export function HomePage() {
  const { settings } = useAppContext();
  const navigate = useNavigate();

  useVoiceCommands(settings.voiceEnabled, {
    scrollUp:   () => window.scrollBy({ top: -120, behavior: 'smooth' }),
    scrollDown: () => window.scrollBy({ top:  120, behavior: 'smooth' }),
    navigate:   (path) => navigate(path)
  });

  return (
    <div className="grid gap-4">
      <Panel title="NodCursor — Accessibility-First Cursor Control" className="animate-float-in">
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="max-w-2xl text-xl font-semibold leading-tight text-app-text sm:text-2xl">
              Hands-free computer control for people with motor limitations, built for the browser and ready to scale.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-app-subtle sm:text-base">
              NodCursor maps head movement to cursor motion, combines blink and voice actions, and keeps all processing on-device.
              It is designed as practical assistive technology, not a prototype toy.
            </p>

            <div className="mt-4 grid gap-2 text-sm text-app-subtle sm:grid-cols-3">
              <div className="rounded-xl border border-app-accent/20 bg-app-panelAlt/80 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-app-accent">On-Device</p>
                <p className="mt-1">Camera + voice pipelines run locally in the browser.</p>
              </div>
              <div className="rounded-xl border border-app-accent/20 bg-app-panelAlt/80 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-app-accent">Multimodal</p>
                <p className="mt-1">Head tracking, blinks, mouth gestures, voice, and dwell click.</p>
              </div>
              <div className="rounded-xl border border-app-accent/20 bg-app-panelAlt/80 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-app-accent">Browser-First</p>
                <p className="mt-1">No installer required. Works with modern webcam-enabled browsers.</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/calibration">
                <BigButton>Start Calibration</BigButton>
              </Link>
              <Link to="/demo">
                <BigButton variant="secondary">View Live Demo</BigButton>
              </Link>
              <Link to="/voice-personalization">
                <BigButton variant="secondary">Personalize Voice</BigButton>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-app-accent/25 bg-app-panelAlt/60 p-2 shadow-glow">
            <img
              src="/hero-illustration.svg"
              alt="Illustration of NodCursor assistive interaction interface"
              className="h-auto w-full rounded-xl"
              loading="eager"
            />
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="How It Helps" className="animate-float-in">
          <p className="mb-3 text-sm text-app-subtle">A practical interaction flow for daily tasks:</p>
          <ol className="space-y-2 text-sm text-app-subtle">
            <li className="rounded-lg border border-app-accent/15 bg-app-panelAlt/70 px-3 py-2">1. Calibrate personal head range in under a minute.</li>
            <li className="rounded-lg border border-app-accent/15 bg-app-panelAlt/70 px-3 py-2">2. Use precise cursor mapping with smoothing and deadzone control.</li>
            <li className="rounded-lg border border-app-accent/15 bg-app-panelAlt/70 px-3 py-2">3. Trigger actions via blink, dwell, mouth, and speaker-locked voice.</li>
          </ol>
        </Panel>

        <Panel title="Private by Design" className="animate-float-in">
          <img
            src="/privacy-illustration.svg"
            alt="Visual representation of local privacy protections"
            className="mb-3 h-auto w-full rounded-xl border border-app-accent/20"
            loading="lazy"
          />
          <ul className="space-y-2 text-sm text-app-subtle">
            <li className="rounded-lg border border-app-accent/15 bg-app-panelAlt/70 px-3 py-2">No video frames are uploaded or stored remotely.</li>
            <li className="rounded-lg border border-app-accent/15 bg-app-panelAlt/70 px-3 py-2">Voice profile is saved locally in browser storage.</li>
          </ul>
        </Panel>

        <Panel title="Built to Perform" className="animate-float-in">
          <img
            src="/performance-illustration.svg"
            alt="Visual graph indicating real-time interaction performance"
            className="mb-3 h-auto w-full rounded-xl border border-app-accent/20"
            loading="lazy"
          />
          <ul className="space-y-2 text-sm text-app-subtle">
            <li className="rounded-lg border border-app-accent/15 bg-app-panelAlt/70 px-3 py-2">Web Workers keep tracking computations off the main UI thread.</li>
            <li className="rounded-lg border border-app-accent/15 bg-app-panelAlt/70 px-3 py-2">Fallback pointer mode ensures continuity when camera is unavailable.</li>
          </ul>
        </Panel>
      </div>

      <Panel title="Pitch Flow" className="animate-float-in">
        <div className="grid gap-3 text-sm text-app-subtle sm:grid-cols-4">
          <div className="rounded-xl border border-app-accent/20 bg-app-panelAlt/70 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-app-accent">Problem</p>
            <p className="mt-1">Traditional mouse + keyboard usage is not accessible to everyone.</p>
          </div>
          <div className="rounded-xl border border-app-accent/20 bg-app-panelAlt/70 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-app-accent">Solution</p>
            <p className="mt-1">Multimodal assistive control with camera and voice in the browser.</p>
          </div>
          <div className="rounded-xl border border-app-accent/20 bg-app-panelAlt/70 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-app-accent">Trust</p>
            <p className="mt-1">Local-first processing and transparent open-source architecture.</p>
          </div>
          <div className="rounded-xl border border-app-accent/20 bg-app-panelAlt/70 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-app-accent">Next Step</p>
            <p className="mt-1">Run Calibration + Demo for live investor or stakeholder walkthroughs.</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
