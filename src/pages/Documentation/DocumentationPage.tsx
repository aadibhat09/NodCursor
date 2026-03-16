import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { Panel } from '../../components/common';
import { useAppContext } from '../../context/AppContext';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';

interface DocSection {
  id: string;
  title: string;
  summary: string;
  blocks: Array<{ heading: string; body: string[] }>;
}

const docSections: DocSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    summary: 'Quick orientation for first-time users and contributors.',
    blocks: [
      {
        heading: 'What NodCursor does',
        body: [
          'NodCursor is a browser-based assistive control system that maps head motion and facial gestures to cursor and input actions.',
          'Everything runs locally in the browser: camera frames, landmark tracking, smoothing, and gesture-to-event conversion.'
        ]
      },
      {
        heading: 'How to get started',
        body: [
          '1) Grant camera access, 2) run calibration, 3) test control in Demo, 4) tune sensitivity in Settings.',
          'Use the new sensitivity presets (Steady/Balanced/Responsive) as a baseline, then fine-tune per gesture.'
        ]
      }
    ]
  },
  {
    id: 'why-we-started',
    title: 'Why We Started',
    summary: 'The product motivation and accessibility problem statement.',
    blocks: [
      {
        heading: 'Problem we observed',
        body: [
          'Standard input devices assume reliable hand control, which excludes users with temporary or permanent motor constraints.',
          'Existing assistive options can be expensive, hardware-locked, or difficult to personalize quickly.'
        ]
      },
      {
        heading: 'NodCursor goal',
        body: [
          'Ship an open, low-friction tool that works with just a webcam and browser, without requiring proprietary hardware.',
          'Design controls that can be tuned to different fatigue profiles and movement ranges in a few minutes.'
        ]
      },
      {
        heading: 'Design principles',
        body: [
          'Local-first privacy, explicit customization, and redundant interaction modes (head, blink, mouth, dwell, voice).',
          'Progressive enhancement: usable on day one, then incrementally optimized for each person.'
        ]
      }
    ]
  },
  {
    id: 'typing-system',
    title: 'Typing System',
    summary: 'How mouth-typing works and what was optimized.',
    blocks: [
      {
        heading: 'Current interaction model',
        body: [
          'Mouth open advances key focus, smile selects the focused key, and double blink triggers backspace.',
          'Keyboard now includes punctuation and SHIFT, with smarter punctuation spacing and newline handling.'
        ]
      },
      {
        heading: 'Recent optimizations',
        body: [
          'Added per-gesture cooldown controls for Next-Key, Select, and Backspace to reduce accidental repeats.',
          'Cooldown settings are user-tunable in Accessibility Controls for different facial mobility profiles.'
        ]
      },
      {
        heading: 'Tuning guidance',
        body: [
          'If typing skips keys, increase Next-Key cooldown. If selections duplicate, increase Select cooldown.',
          'If correction feels slow, decrease Backspace cooldown while keeping false triggers manageable.'
        ]
      }
    ]
  },
  {
    id: 'apis',
    title: 'APIs',
    summary: 'Developer-facing hooks and runtime architecture.',
    blocks: [
      {
        heading: 'Core hooks',
        body: [
          'useFaceTracking: camera stream + MediaPipe landmark capture + worker messaging.',
          'useCursorMapping/useSmoothCursor: calibrated mapping and motion smoothing for stable pointer movement.',
          'useGestureControls/useMouthTypingControls/useVoiceCommands: gesture and speech input adapters.'
        ]
      },
      {
        heading: 'Worker contract',
        body: [
          'trackingWorker accepts smoothed point input plus blink timing thresholds and returns normalized interaction signals.',
          'Blink thresholds and windows are runtime-configurable from Settings without forcing model re-initialization.'
        ]
      },
      {
        heading: 'References',
        body: [
          'See docs/API.md for the full technical reference and docs/ACCESSIBILITY_GUIDE.md for usage workflows.'
        ]
      }
    ]
  },
  {
    id: 'accessibility',
    title: 'Accessibility Guide',
    summary: 'Practical setup recommendations and troubleshooting paths.',
    blocks: [
      {
        heading: 'Setup essentials',
        body: [
          'Webcam at eye level, stable front lighting, and comfortable posture produce the most reliable tracking.',
          'Use separate desktop/phone profiles and recalibrate after major posture/camera changes.'
        ]
      },
      {
        heading: 'Common troubleshooting',
        body: [
          'Jitter: increase smoothing/deadzone. Slow cursor: increase sensitivity or reduce smoothing.',
          'False blinks: raise blink threshold. Missed blinks: lower threshold and ensure eyes are clearly visible.'
        ]
      }
    ]
  }
];

export function DocumentationPage() {
  const { settings } = useAppContext();
  const navigate = useNavigate();
  const { section } = useParams();

  const activeSection = docSections.find((item) => item.id === section) ?? docSections[0];

  useVoiceCommands(settings.voiceEnabled, {
    scrollUp:   () => window.scrollBy({ top: -200, behavior: 'smooth' }),
    scrollDown: () => window.scrollBy({ top:  200, behavior: 'smooth' }),
    navigate:   (path) => navigate(path)
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Panel title="Documentation Blog" className="animate-float-in h-fit">
        <div className="space-y-2">
          {docSections.map((item) => (
            <NavLink
              key={item.id}
              to={`/documentation/${item.id}`}
              className={({ isActive }) => [
                'block rounded-lg border px-3 py-2 text-sm transition',
                isActive
                  ? 'border-app-accent bg-app-accent/15 text-app-text shadow-glow'
                  : 'border-app-accent/20 bg-app-panelAlt text-app-subtle hover:border-app-accent/40 hover:text-app-text'
              ].join(' ')}
            >
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs opacity-90">{item.summary}</p>
            </NavLink>
          ))}
        </div>
      </Panel>

      <Panel title={activeSection.title} className="animate-float-in">
        <div className="space-y-4 text-sm text-app-subtle">
          <p>{activeSection.summary}</p>
          {activeSection.blocks.map((block) => (
            <div key={block.heading} className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-4">
              <h3 className="mb-2 text-base font-semibold text-app-text">{block.heading}</h3>
              <div className="space-y-2 text-xs">
                {block.body.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-3 text-xs">
            <p>
              Supplementary docs: docs/API.md, docs/ACCESSIBILITY_GUIDE.md, CONTRIBUTING.md, README.md
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
