import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BigButton, Panel } from '../../components/common';
import { useAppContext } from '../../context/AppContext';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';

export function HomePage() {
  const { settings } = useAppContext();
  const navigate = useNavigate();
  const assetBase = import.meta.env.BASE_URL;

  useVoiceCommands(settings.voiceEnabled, {
    scrollUp:   () => window.scrollBy({ top: -120, behavior: 'smooth' }),
    scrollDown: () => window.scrollBy({ top:  120, behavior: 'smooth' }),
    navigate:   (path) => navigate(path)
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal-on-scroll'));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-14 pb-12 md:space-y-20 md:pb-16">
      <Panel title="NodCursor — Accessibility-First Cursor Control" className="animate-float-in p-7 md:p-10">
        <div className="grid min-h-[58vh] gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <p className="max-w-2xl text-2xl font-semibold leading-tight text-app-text sm:text-3xl lg:text-4xl">
              Hands-free computer control for people with motor limitations, built for the browser and ready to scale.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-app-subtle sm:text-lg">
              NodCursor maps head movement to cursor motion, combines blink and voice actions, and keeps all processing on-device.
              It is designed as practical assistive technology, not a prototype toy.
            </p>

            <div className="mt-8 grid gap-4 text-sm text-app-subtle md:grid-cols-3">
              <div className="rounded-xl border border-app-accent/20 bg-app-panelAlt/80 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-app-accent">On-Device</p>
                <p className="mt-1">Camera + voice pipelines run locally in the browser.</p>
              </div>
              <div className="rounded-xl border border-app-accent/20 bg-app-panelAlt/80 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-app-accent">Multimodal</p>
                <p className="mt-1">Head tracking, blinks, mouth gestures, voice, and dwell click.</p>
              </div>
              <div className="rounded-xl border border-app-accent/20 bg-app-panelAlt/80 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-app-accent">Browser-First</p>
                <p className="mt-1">No installer required. Works with modern webcam-enabled browsers.</p>
              </div>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
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

          <div className="reveal-on-scroll reveal-right rounded-2xl border border-app-accent/25 bg-app-panelAlt/60 p-3 shadow-glow">
            <img
              src={`${assetBase}hero-illustration.svg`}
              alt="Illustration of NodCursor assistive interaction interface"
              className="h-auto w-full rounded-xl"
              loading="eager"
            />
          </div>
        </div>
      </Panel>

      <Panel title="Private by Design" className="animate-float-in p-7 md:p-10">
        <div className="grid min-h-[52vh] gap-9 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <img
            src={`${assetBase}privacy-illustration.svg`}
            alt="Visual representation of local privacy protections"
            className="reveal-on-scroll reveal-left h-auto w-full rounded-xl border border-app-accent/20"
            loading="lazy"
          />
          <div className="reveal-on-scroll reveal-right space-y-4 text-app-subtle">
            <p className="text-lg text-app-text">Privacy is a core product feature, not a checklist item.</p>
            <p className="leading-relaxed">
              NodCursor processes camera and voice signals locally, reducing risk and improving trust for users,
              families, clinicians, and organizations evaluating assistive solutions.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="rounded-lg border border-app-accent/15 bg-app-panelAlt/70 px-4 py-3">No video frames are uploaded or stored remotely.</li>
              <li className="rounded-lg border border-app-accent/15 bg-app-panelAlt/70 px-4 py-3">Voice profile stays in browser local storage only.</li>
              <li className="rounded-lg border border-app-accent/15 bg-app-panelAlt/70 px-4 py-3">Permissions remain under direct user browser control.</li>
            </ul>
          </div>
        </div>
      </Panel>

      <Panel title="Built to Perform" className="animate-float-in p-7 md:p-10">
        <div className="grid min-h-[52vh] gap-9 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="reveal-on-scroll reveal-left space-y-4 text-app-subtle">
            <p className="text-lg text-app-text">Responsive enough for real-time interaction and demos.</p>
            <p className="leading-relaxed">
              Landmark analysis and gesture interpretation are optimized for smooth cursor control without locking up the UI.
              The experience remains reliable across fallback modes and lower-end devices.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="rounded-lg border border-app-accent/15 bg-app-panelAlt/70 px-4 py-3">Web Workers keep heavy tracking off the main thread.</li>
              <li className="rounded-lg border border-app-accent/15 bg-app-panelAlt/70 px-4 py-3">Smoothing + stabilization controls adapt to user preference.</li>
              <li className="rounded-lg border border-app-accent/15 bg-app-panelAlt/70 px-4 py-3">Fallback pointer mode keeps sessions usable if camera drops.</li>
            </ul>
          </div>

          <img
            src={`${assetBase}performance-illustration.svg`}
            alt="Visual graph indicating real-time interaction performance"
            className="reveal-on-scroll reveal-right h-auto w-full rounded-xl border border-app-accent/20"
            loading="lazy"
          />
        </div>
      </Panel>

      <Panel title="Pitch Flow" className="animate-float-in p-7 md:p-10">
        <div className="grid gap-4 text-sm text-app-subtle md:grid-cols-2">
          <div className="reveal-on-scroll reveal-left rounded-xl border border-app-accent/20 bg-app-panelAlt/70 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-app-accent">Problem</p>
            <p className="mt-1">Traditional mouse + keyboard usage is not accessible to everyone.</p>
          </div>
          <div className="reveal-on-scroll reveal-right rounded-xl border border-app-accent/20 bg-app-panelAlt/70 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-app-accent">Solution</p>
            <p className="mt-1">Multimodal assistive control with camera and voice in the browser.</p>
          </div>
          <div className="reveal-on-scroll reveal-left rounded-xl border border-app-accent/20 bg-app-panelAlt/70 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-app-accent">Trust</p>
            <p className="mt-1">Local-first processing and transparent open-source architecture.</p>
          </div>
          <div className="reveal-on-scroll reveal-right rounded-xl border border-app-accent/20 bg-app-panelAlt/70 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-app-accent">Next Step</p>
            <p className="mt-1">Run Calibration + Demo for live investor or stakeholder walkthroughs.</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
