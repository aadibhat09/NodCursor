import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BigButton, Panel } from '../../components/common';
import { useAppContext } from '../../context/AppContext';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import {
  buildVoiceProfile,
  clearVoiceProfile,
  loadVoiceProfile,
  matchVoiceProfile,
  saveVoiceProfile,
  startVoiceFeatureMonitor,
  type VoiceProfile
} from '../../utils/voiceProfile';

const ENROLL_MS = 6000;

export function VoicePersonalizationPage() {
  const { settings } = useAppContext();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<VoiceProfile | null>(() => loadVoiceProfile());
  const [status, setStatus] = useState('No voice profile enrolled yet.');
  const [enrolling, setEnrolling] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sampleCount, setSampleCount] = useState(0);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [isMatch, setIsMatch] = useState<boolean | null>(null);

  const monitorStopRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  useVoiceCommands(settings.voiceEnabled, {
    scrollUp: () => window.scrollBy({ top: -120, behavior: 'smooth' }),
    scrollDown: () => window.scrollBy({ top: 120, behavior: 'smooth' }),
    navigate: (path) => navigate(path)
  });

  const stopEnrollment = useCallback(() => {
    monitorStopRef.current?.();
    monitorStopRef.current = null;

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (countdownRef.current !== null) {
      window.clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    setEnrolling(false);
    setSecondsLeft(0);
  }, []);

  const startEnrollment = useCallback(async () => {
    if (enrolling) return;

    const samples: Array<[number, number, number, number, number]> = [];
    setStatus('Listening... speak naturally for 6 seconds.');
    setSampleCount(0);
    setEnrolling(true);
    setSecondsLeft(Math.ceil(ENROLL_MS / 1000));

    const begin = Date.now();
    countdownRef.current = window.setInterval(() => {
      const elapsed = Date.now() - begin;
      const left = Math.max(0, Math.ceil((ENROLL_MS - elapsed) / 1000));
      setSecondsLeft(left);
    }, 200);

    try {
      const monitor = await startVoiceFeatureMonitor((feature) => {
        samples.push(feature);
        setSampleCount(samples.length);
      });

      monitorStopRef.current = monitor.stop;

      timeoutRef.current = window.setTimeout(() => {
        monitor.stop();
        monitorStopRef.current = null;

        if (samples.length < 50) {
          setStatus('Not enough clean speech captured. Try again in a quieter spot.');
          setEnrolling(false);
          setSecondsLeft(0);
          return;
        }

        const next = buildVoiceProfile(samples);
        saveVoiceProfile(next);
        setProfile(next);
        setStatus('Voice profile saved locally. Voice commands are now speaker-locked.');
        setEnrolling(false);
        setSecondsLeft(0);
      }, ENROLL_MS);
    } catch {
      stopEnrollment();
      setStatus('Microphone access failed. Check browser microphone permissions and retry.');
    }
  }, [enrolling, stopEnrollment]);

  const resetProfile = useCallback(() => {
    clearVoiceProfile();
    setProfile(null);
    setLatestScore(null);
    setIsMatch(null);
    setStatus('Voice profile removed. Commands will accept any voice again.');
  }, []);

  // Live verifier while this page is open.
  useEffect(() => {
    if (!profile) {
      return;
    }

    let stop: (() => void) | null = null;
    let cancelled = false;

    void startVoiceFeatureMonitor((feature) => {
      const result = matchVoiceProfile(profile, feature);
      setLatestScore(result.score);
      setIsMatch(result.isMatch);
    })
      .then((monitor) => {
        if (cancelled) {
          monitor.stop();
          return;
        }
        stop = monitor.stop;
      })
      .catch(() => {
        setStatus('Unable to start live voice verifier.');
      });

    return () => {
      cancelled = true;
      stop?.();
    };
  }, [profile]);

  useEffect(() => () => stopEnrollment(), [stopEnrollment]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <Panel title="Voice Personalization" className="animate-float-in">
        <div className="space-y-4 text-sm text-app-subtle">
          <p>
            Train a local voice profile so commands only execute when your voice matches.
            This helps reduce accidental triggers from other speakers and background chatter.
          </p>

          <div className="rounded-xl border border-app-accent/20 bg-app-panelAlt p-3 text-xs">
            <p><strong>How it works:</strong> We capture frequency-based features from your microphone and store a compact profile in localStorage only.</p>
            <p className="mt-2">No raw audio is uploaded or persisted.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <BigButton onClick={startEnrollment}>{enrolling ? `Recording... ${secondsLeft}s` : 'Start Voice Enrollment'}</BigButton>
            <BigButton variant="secondary" onClick={resetProfile}>Clear Voice Profile</BigButton>
          </div>

          <div className="rounded-xl border border-app-accent/20 bg-app-panelAlt p-3 text-xs">
            <p><strong>Status:</strong> {status}</p>
            {enrolling ? <p className="mt-1"><strong>Captured samples:</strong> {sampleCount}</p> : null}
          </div>
        </div>
      </Panel>

      <Panel title="Verification" className="animate-float-in">
        <div className="space-y-3 text-xs text-app-subtle">
          <p><strong>Profile:</strong> {profile ? 'Enrolled' : 'Not enrolled'}</p>
          {profile ? <p><strong>Recorded:</strong> {new Date(profile.createdAt).toLocaleString()}</p> : null}
          {profile ? <p><strong>Frames in profile:</strong> {profile.sampleCount}</p> : null}
          {profile ? <p><strong>Threshold:</strong> {profile.threshold.toFixed(2)}</p> : null}

          {latestScore !== null ? (
            <div className="rounded-lg border border-app-accent/20 bg-app-panelAlt p-3">
              <p><strong>Live match score:</strong> {latestScore.toFixed(2)}</p>
              <p className="mt-1"><strong>Current voice:</strong> {isMatch ? 'Accepted' : 'Rejected'}</p>
            </div>
          ) : (
            <p>Speak while this page is open to view live match status.</p>
          )}
        </div>
      </Panel>
    </div>
  );
}
