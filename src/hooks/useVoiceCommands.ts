import { useEffect, useRef } from 'react';
import { loadVoiceProfile, matchVoiceProfile, startVoiceFeatureMonitor } from '../utils/voiceProfile';

// ---- Web Speech API type shims ------------------------------------------ //
interface SpeechResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
  length: number;
}

interface SpeechErrorEvent {
  error: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}
// -------------------------------------------------------------------------- //

export interface VoiceHandlers {
  /** Dispatch a left click at the current cursor position. */
  click?: () => void;
  /** Dispatch a right click / context menu at the current cursor position. */
  rightClick?: () => void;
  /** Toggle drag mode on/off. */
  drag?: () => void;
  /** Scroll the page upward. */
  scrollUp?: () => void;
  /** Scroll the page downward. */
  scrollDown?: () => void;
  /**
   * Navigate to a client-side route.
   * Receives the path string, e.g. '/demo', '/settings'.
   */
  navigate?: (path: string) => void;
}

// phrase → route path mapping (first match wins)
const NAV_MAP: [RegExp, string][] = [
  [/\b(go\s+to\s+|open\s+)?(home|home\s*page)\b/, '/'],
  [/\b(go\s+to\s+|open\s+)?(demo|playground|demo\s*page)\b/, '/demo'],
  [/\b(go\s+to\s+|open\s+)?(calibrat\w*|calibration\s*page)\b/, '/calibration'],
  [/\b(go\s+to\s+|open\s+)?(settings?|preferences)\b/, '/settings'],
  [/\b(go\s+to\s+|open\s+)?(games?|game\s*page)\b/, '/games'],
  [/\b(go\s+to\s+|open\s+)?(docs?|documentation)\b/, '/documentation/overview'],
  [/\b(go\s+to\s+|open\s+)?(voice|voice\s*profile|voice\s*personalization|personalize\s*voice)\b/, '/voice-personalization'],
];

/**
 * Starts a continuous Web Speech API recognition session and maps spoken
 * phrases to action callbacks.
 *
 * Handlers are stored in a ref so they are always fresh without restarting
 * the underlying recognition session. The session auto-restarts whenever the
 * browser ends it (most browsers stop after a few seconds of silence).
 *
 * @param enabled  Mirror of `settings.voiceEnabled`.
 * @param handlers Action callbacks – all fields are optional.
 */
export function useVoiceCommands(enabled: boolean, handlers: VoiceHandlers) {
  // Render-phase ref write: keep handlers current without restarting recognition.
  const handlersRef = useRef<VoiceHandlers>(handlers);
  handlersRef.current = handlers;

  const featureRef = useRef<[number, number, number, number, number] | null>(null);
  const profileRef = useRef(loadVoiceProfile());

  useEffect(() => {
    if (!enabled) return;

    profileRef.current = loadVoiceProfile();

    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let active = true;

    recognition.onresult = (event: SpeechResultEvent) => {
      const last = event.results[event.results.length - 1];
      const spoken = (last[0] as { transcript: string }).transcript.toLowerCase().trim();
      const h = handlersRef.current;

      const activeProfile = profileRef.current;
      if (activeProfile) {
        const feature = featureRef.current;
        if (!feature) {
          return;
        }

        const match = matchVoiceProfile(activeProfile, feature);
        if (!match.isMatch) {
          return;
        }
      }

      // Navigation checked first so "go to demo" doesn't match "click" accidentally.
      if (h.navigate) {
        for (const [pattern, path] of NAV_MAP) {
          if (pattern.test(spoken)) {
            h.navigate(path);
            return;
          }
        }
      }

      // "right click" before "click" to avoid partial substring match.
      if (/right[\s-]?click|context\s*menu/.test(spoken)) { h.rightClick?.(); return; }
      if (/\bclick\b|\bselect\b|\bpress\b/.test(spoken))  { h.click?.();      return; }
      if (/\bdrag\b|\bgrab\b/.test(spoken))               { h.drag?.();       return; }
      if (/scroll\s+up|go\s+up|move\s+up|page\s+up/.test(spoken))     { h.scrollUp?.();   return; }
      if (/scroll\s+down|go\s+down|move\s+down|page\s+down/.test(spoken)) { h.scrollDown?.(); return; }
    };

    recognition.onerror = (event: SpeechErrorEvent) => {
      // 'no-speech' and 'aborted' are normal; other errors disable auto-restart.
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        active = false;
      }
    };

    recognition.onend = () => {
      if (active) {
        try { recognition.start(); } catch { /* ignore double-start in strict mode */ }
      }
    };

    let monitorStopped = false;
    let monitorStop: (() => void) | undefined;

    void startVoiceFeatureMonitor((feature) => {
      featureRef.current = feature;
    })
      .then((monitor) => {
        if (monitorStopped) {
          monitor.stop();
          return;
        }
        monitorStop = monitor.stop;
      })
      .catch(() => {
        featureRef.current = null;
      });

    try { recognition.start(); } catch { /* ignore if already starting */ }

    return () => {
      active = false;
      monitorStopped = true;
      monitorStop?.();
      recognition.stop();
    };
  }, [enabled]); // Only restart the recognition session when enabled changes.
}
