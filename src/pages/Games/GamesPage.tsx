import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraView } from '../../components/CameraView/CameraView';
import { CursorOverlay } from '../../components/CursorOverlay/CursorOverlay';
import { GestureIndicators } from '../../components/GestureIndicators/GestureIndicators';
import { BigButton, Panel } from '../../components/common';
import { useAppContext } from '../../context/AppContext';
import { useDwellClick } from '../../hooks/useDwellClick';
import { useFaceTracking } from '../../hooks/useFaceTracking';
import { useGestureControls } from '../../hooks/useGestureControls';
import { useSmoothCursor } from '../../hooks/useSmoothCursor';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';

const targetCellCount = 9;
const memoryPadCount = 4;
const targetRoundSeconds = 30;

function nextIndex(max: number, previous?: number) {
  const candidate = Math.floor(Math.random() * max);
  if (previous === undefined || max < 2 || candidate !== previous) {
    return candidate;
  }
  return (candidate + 1) % max;
}

function dispatchAtCursor(type: string, x: number, y: number, button = 0) {
  const clientX = Math.round(x * window.innerWidth);
  const clientY = Math.round(y * window.innerHeight);
  const target = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
  if (!target) {
    return;
  }

  target.dispatchEvent(
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX,
      clientY,
      button
    })
  );
}

interface TargetRushState {
  running: boolean;
  score: number;
  best: number;
  streak: number;
  timeLeft: number;
  activeIndex: number;
}

interface MemoryMatchState {
  sequence: number[];
  progress: number;
  level: number;
  best: number;
  message: string;
}

function initialTargetRushState(): TargetRushState {
  return {
    running: false,
    score: 0,
    best: 0,
    streak: 0,
    timeLeft: targetRoundSeconds,
    activeIndex: nextIndex(targetCellCount)
  };
}

function initialMemoryMatchState(): MemoryMatchState {
  return {
    sequence: [nextIndex(memoryPadCount)],
    progress: 0,
    level: 1,
    best: 1,
    message: 'Repeat the shown pad order. Each clear adds one more step.'
  };
}

export function GamesPage() {
  const { settings, calibration } = useAppContext();
  const { state, videoRef, cameraError, lightState } = useFaceTracking(settings, calibration);
  const smoothCursorPos = useSmoothCursor(
    { x: state.x, y: state.y },
    { smoothing: settings.smoothing, stabilization: settings.stabilization }
  );
  const [targetRush, setTargetRush] = useState<TargetRushState>(initialTargetRushState);
  const [memoryMatch, setMemoryMatch] = useState<MemoryMatchState>(initialMemoryMatchState);
  const [activity, setActivity] = useState<string[]>(['Ready. Start a round and use blink, dwell, or mouse input.']);
  const moveTimerRef = useRef<number | null>(null);

  const appendActivity = useCallback((message: string) => {
    setActivity((prev) => [message, ...prev].slice(0, 8));
  }, []);

  const handleDwellClick = useCallback(() => {
    dispatchAtCursor('click', smoothCursorPos.x, smoothCursorPos.y, 0);
    appendActivity('Dwell click');
  }, [appendActivity, smoothCursorPos.x, smoothCursorPos.y]);

  const dwellProgress = useDwellClick(
    smoothCursorPos.x,
    smoothCursorPos.y,
    settings.dwellMs,
    settings.dwellMoveTolerance,
    handleDwellClick
  );

  const navigate = useNavigate();

  useVoiceCommands(settings.voiceEnabled, {
    click: () => {
      dispatchAtCursor('click', smoothCursorPos.x, smoothCursorPos.y, 0);
      appendActivity('Voice click');
    },
    rightClick: () => {
      dispatchAtCursor('contextmenu', smoothCursorPos.x, smoothCursorPos.y, 2);
      appendActivity('Voice right click');
    },
    scrollUp:   () => window.scrollBy({ top: -120, behavior: 'smooth' }),
    scrollDown: () => window.scrollBy({ top:  120, behavior: 'smooth' }),
    navigate:   (path) => navigate(path)
  });

  useGestureControls(
    settings,
    {
      x: smoothCursorPos.x,
      y: smoothCursorPos.y,
      blink: state.blink,
      doubleBlink: state.doubleBlink,
      longBlink: state.longBlink,
      mouthOpen: state.mouthOpen,
      smile: state.smile,
      headTilt: state.headTilt
    },
    {
      onEvent: appendActivity
    }
  );

  useEffect(() => {
    if (!targetRush.running) {
      return;
    }

    const timer = window.setInterval(() => {
      setTargetRush((prev) => {
        if (prev.timeLeft <= 1) {
          return {
            ...prev,
            running: false,
            timeLeft: 0,
            best: Math.max(prev.best, prev.score)
          };
        }

        return {
          ...prev,
          timeLeft: prev.timeLeft - 1
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [targetRush.running]);

  useEffect(() => {
    if (!targetRush.running) {
      if (moveTimerRef.current !== null) {
        window.clearInterval(moveTimerRef.current);
        moveTimerRef.current = null;
      }
      return;
    }

    moveTimerRef.current = window.setInterval(() => {
      setTargetRush((prev) => ({
        ...prev,
        activeIndex: nextIndex(targetCellCount, prev.activeIndex),
        streak: 0
      }));
    }, 1500);

    return () => {
      if (moveTimerRef.current !== null) {
        window.clearInterval(moveTimerRef.current);
        moveTimerRef.current = null;
      }
    };
  }, [targetRush.running]);

  useEffect(() => {
    if (targetRush.timeLeft === 0 && !targetRush.running && targetRush.score > 0) {
      appendActivity(`Target Rush finished with ${targetRush.score} points.`);
    }
  }, [appendActivity, targetRush.running, targetRush.score, targetRush.timeLeft]);

  const startTargetRush = useCallback(() => {
    setTargetRush({
      running: true,
      score: 0,
      best: targetRush.best,
      streak: 0,
      timeLeft: targetRoundSeconds,
      activeIndex: nextIndex(targetCellCount)
    });
    appendActivity('Target Rush started');
  }, [appendActivity, targetRush.best]);

  const handleTargetPress = useCallback(
    (index: number) => {
      setTargetRush((prev) => {
        if (!prev.running) {
          return prev;
        }

        if (index !== prev.activeIndex) {
          appendActivity('Target Rush miss');
          return {
            ...prev,
            streak: 0
          };
        }

        const nextScore = prev.score + 1;
        appendActivity(`Target Rush hit ${nextScore}`);
        return {
          ...prev,
          score: nextScore,
          best: Math.max(prev.best, nextScore),
          streak: prev.streak + 1,
          activeIndex: nextIndex(targetCellCount, prev.activeIndex)
        };
      });
    },
    [appendActivity]
  );

  const resetMemoryMatch = useCallback(() => {
    setMemoryMatch(initialMemoryMatchState());
    appendActivity('Memory Match reset');
  }, [appendActivity]);

  const handleMemoryPress = useCallback(
    (index: number) => {
      setMemoryMatch((prev) => {
        if (index !== prev.sequence[prev.progress]) {
          appendActivity('Memory Match miss');
          return {
            sequence: [nextIndex(memoryPadCount)],
            progress: 0,
            level: 1,
            best: prev.best,
            message: 'Wrong pad. Sequence restarted from one step.'
          };
        }

        const nextProgress = prev.progress + 1;
        if (nextProgress < prev.sequence.length) {
          appendActivity(`Memory Match step ${nextProgress}`);
          return {
            ...prev,
            progress: nextProgress,
            message: `Correct. ${prev.sequence.length - nextProgress} step(s) left in this round.`
          };
        }

        const nextLevel = prev.level + 1;
        appendActivity(`Memory Match cleared level ${prev.level}`);
        return {
          sequence: [...prev.sequence, nextIndex(memoryPadCount)],
          progress: 0,
          level: nextLevel,
          best: Math.max(prev.best, nextLevel),
          message: `Level ${prev.level} cleared. Pattern extended to ${prev.sequence.length + 1} steps.`
        };
      });
    },
    [appendActivity]
  );

  return (
    <>
      <CursorOverlay x={smoothCursorPos.x} y={smoothCursorPos.y} dwellProgress={dwellProgress} dragMode={state.dragMode} />
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <Panel title="Games Arena" className="animate-float-in overflow-hidden">
            <div className="space-y-4">
              <div className="rounded-2xl border border-app-accent/20 bg-app-panelAlt p-4">
                <p className="text-base font-semibold text-app-text">Train with the same head cursor you use across the app.</p>
                <p className="mt-2 text-sm text-app-subtle">
                  Use dwell clicks, blink clicks, or the fallback mouse to play. Larger targets and short rounds make this page useful for calibration practice, not just novelty.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-app-accent/20 bg-app-panelAlt p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-app-subtle">Mode</p>
                  <p className="mt-2 text-lg font-semibold text-app-text">Live cursor play</p>
                </div>
                <div className="rounded-2xl border border-app-accent/20 bg-app-panelAlt p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-app-subtle">Source</p>
                  <p className="mt-2 text-lg font-semibold text-app-text">{state.source}</p>
                </div>
                <div className="rounded-2xl border border-app-accent/20 bg-app-panelAlt p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-app-subtle">Dwell</p>
                  <p className="mt-2 text-lg font-semibold text-app-text">{settings.dwellMs} ms</p>
                </div>
              </div>
            </div>
          </Panel>

          <CameraView
            videoRef={videoRef}
            cameraError={cameraError}
            sourceLabel={state.source}
            mirrored={settings.mirrorCamera}
            lightState={lightState}
          />

          <GestureIndicators
            blink={state.blink}
            doubleBlink={state.doubleBlink}
            longBlink={state.longBlink}
            mouthOpen={state.mouthOpen}
            smile={state.smile}
            headTilt={state.headTilt}
          />

          <Panel title="Activity Log" className="animate-float-in">
            <div className="space-y-2 text-sm text-app-subtle">
              {activity.map((entry, index) => (
                <p key={`${entry}-${index}`}>{entry}</p>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Target Rush" className="animate-float-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="rounded-full border border-app-accent/20 bg-app-panelAlt px-4 py-2 text-app-subtle">Time: {targetRush.timeLeft}s</div>
                <div className="rounded-full border border-app-accent/20 bg-app-panelAlt px-4 py-2 text-app-subtle">Score: {targetRush.score}</div>
                <div className="rounded-full border border-app-accent/20 bg-app-panelAlt px-4 py-2 text-app-subtle">Streak: {targetRush.streak}</div>
                <div className="rounded-full border border-app-accent/20 bg-app-panelAlt px-4 py-2 text-app-subtle">Best: {targetRush.best}</div>
              </div>
              <BigButton onClick={startTargetRush}>{targetRush.running ? 'Restart Round' : 'Start Round'}</BigButton>
            </div>
            <p className="mt-4 text-sm text-app-subtle">
              Hit the glowing tile before it relocates. This round is tuned for head movement accuracy and quick blink or dwell activation.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {Array.from({ length: targetCellCount }, (_, index) => {
                const active = index === targetRush.activeIndex;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleTargetPress(index)}
                    className={[
                      'aspect-square rounded-2xl border text-left transition',
                      active
                        ? 'border-app-success bg-app-success/20 text-app-text shadow-glow'
                        : 'border-app-accent/20 bg-app-panelAlt text-app-subtle hover:border-app-accent/50 hover:bg-app-accent/10'
                    ].join(' ')}
                  >
                    <div className="flex h-full flex-col justify-between p-4">
                      <span className="text-xs uppercase tracking-[0.18em]">Tile {index + 1}</span>
                      <span className="text-lg font-semibold">{active ? 'Hit me' : 'Idle'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title="Memory Match" className="animate-float-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="rounded-full border border-app-accent/20 bg-app-panelAlt px-4 py-2 text-app-subtle">Level: {memoryMatch.level}</div>
                <div className="rounded-full border border-app-accent/20 bg-app-panelAlt px-4 py-2 text-app-subtle">Best: {memoryMatch.best}</div>
                <div className="rounded-full border border-app-accent/20 bg-app-panelAlt px-4 py-2 text-app-subtle">Progress: {memoryMatch.progress}/{memoryMatch.sequence.length}</div>
              </div>
              <BigButton variant="secondary" onClick={resetMemoryMatch}>Reset Pattern</BigButton>
            </div>
            <div className="mt-4 rounded-2xl border border-app-accent/20 bg-app-panelAlt p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-app-subtle">Pattern</p>
              <p className="mt-2 text-lg font-semibold text-app-text">{memoryMatch.sequence.map((value) => value + 1).join(' - ')}</p>
              <p className="mt-2 text-sm text-app-subtle">{memoryMatch.message}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {Array.from({ length: memoryPadCount }, (_, index) => {
                const expected = memoryMatch.sequence[memoryMatch.progress] === index;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleMemoryPress(index)}
                    className={[
                      'min-h-36 rounded-3xl border p-5 text-left transition',
                      expected
                        ? 'border-app-accent bg-app-accent/15 text-app-text shadow-glow'
                        : 'border-app-accent/20 bg-app-panelAlt text-app-subtle hover:border-app-accent/60 hover:bg-app-accent/10'
                    ].join(' ')}
                  >
                    <p className="text-xs uppercase tracking-[0.18em]">Pad {index + 1}</p>
                    <p className="mt-6 text-3xl font-semibold text-app-text">{index + 1}</p>
                  </button>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
