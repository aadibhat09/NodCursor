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
const dashPlayerX = 15;
const dashPlayerWidth = 6;
const dashPlayerHeight = 14;

const dashMilestones = [
  { title: 'Step 1', hint: 'Calibrate for stable cursor range.' },
  { title: 'Step 2', hint: 'Play Target Rush for precision.' },
  { title: 'Step 3', hint: 'Play Memory Match for rhythm.' },
  { title: 'Step 4', hint: 'Enable voice commands for hybrid control.' },
  { title: 'Step 5', hint: 'Tune dwell and blink timing in Settings.' },
  { title: 'Step 6', hint: 'Use Demo page to validate full workflow.' }
];

const fallbackDashMilestone = {
  title: 'Step',
  hint: 'Keep practicing to unlock the next training milestone.'
};

function getDashMilestone(index: number) {
  if (dashMilestones.length === 0) {
    return fallbackDashMilestone;
  }

  const normalizedIndex = Number.isFinite(index) ? Math.floor(index) : 0;
  const safeIndex = Math.min(Math.max(normalizedIndex, 0), dashMilestones.length - 1);
  return dashMilestones[safeIndex] ?? fallbackDashMilestone;
}

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

interface DashObstacle {
  id: number;
  x: number;
  width: number;
  height: number;
}

interface NextStepDashState {
  running: boolean;
  score: number;
  best: number;
  playerY: number;
  playerVelocity: number;
  speed: number;
  spawnInMs: number;
  obstacles: DashObstacle[];
  stepIndex: number;
  status: string;
}

function createDashObstacle(idSeed: number): DashObstacle {
  return {
    id: idSeed,
    x: 106,
    width: 3.2 + Math.random() * 2.2,
    height: 10 + Math.random() * 12
  };
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

function initialNextStepDashState(): NextStepDashState {
  const firstMilestone = getDashMilestone(0);
  return {
    running: false,
    score: 0,
    best: 0,
    playerY: 0,
    playerVelocity: 0,
    speed: 24,
    spawnInMs: 1300,
    obstacles: [],
    stepIndex: 0,
    status: `${firstMilestone.title}: ${firstMilestone.hint}`
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
  const [nextStepDash, setNextStepDash] = useState<NextStepDashState>(initialNextStepDashState);
  const [dashFullscreen, setDashFullscreen] = useState(false);
  const [activity, setActivity] = useState<string[]>(['Ready. Start a round and use blink, dwell, or mouse input.']);
  const moveTimerRef = useRef<number | null>(null);
  const dashAnimationRef = useRef<number | null>(null);
  const dashLastFrameAtRef = useRef(0);
  const dashObstacleIdRef = useRef(0);
  const dashSignalStateRef = useRef({ blink: false, mouthOpen: false, tilt: false });
  const dashAnnouncedStepRef = useRef(0);

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

  const startNextStepDash = useCallback(() => {
    const firstMilestone = getDashMilestone(0);
    dashObstacleIdRef.current += 1;
    setNextStepDash((prev) => ({
      running: true,
      score: 0,
      best: prev.best,
      playerY: 0,
      playerVelocity: 0,
      speed: 24,
      spawnInMs: 1200,
      obstacles: [createDashObstacle(dashObstacleIdRef.current)],
      stepIndex: 0,
      status: `${firstMilestone.title}: ${firstMilestone.hint}`
    }));
    dashAnnouncedStepRef.current = 0;
    setDashFullscreen(true);
    appendActivity('Next Step Dash started');
  }, [appendActivity]);

  const triggerDashJump = useCallback(
    (source: 'blink' | 'mouth' | 'tilt' | 'space') => {
      setNextStepDash((prev) => {
        if (!prev.running || prev.playerY > 6) {
          return prev;
        }

        appendActivity(`Dash jump (${source})`);
        return {
          ...prev,
          playerVelocity: 225
        };
      });
    },
    [appendActivity]
  );

  useEffect(() => {
    const tiltThreshold = Math.max(0.12, settings.tiltScrollThreshold * 0.75);
    const tiltTriggered = Math.abs(state.headTilt) > tiltThreshold;

    if (state.blink && !dashSignalStateRef.current.blink) {
      triggerDashJump('blink');
    }

    if (state.mouthOpen && !dashSignalStateRef.current.mouthOpen) {
      triggerDashJump('mouth');
    }

    if (tiltTriggered && !dashSignalStateRef.current.tilt) {
      triggerDashJump('tilt');
    }

    dashSignalStateRef.current = {
      blink: state.blink,
      mouthOpen: state.mouthOpen,
      tilt: tiltTriggered
    };
  }, [settings.tiltScrollThreshold, state.blink, state.headTilt, state.mouthOpen, triggerDashJump]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        triggerDashJump('space');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [triggerDashJump]);

  useEffect(() => {
    if (!nextStepDash.running) {
      if (dashAnimationRef.current !== null) {
        cancelAnimationFrame(dashAnimationRef.current);
        dashAnimationRef.current = null;
      }
      return;
    }

    dashLastFrameAtRef.current = performance.now();

    const frame = (now: number) => {
      const dt = Math.min((now - dashLastFrameAtRef.current) / 1000, 0.05);
      dashLastFrameAtRef.current = now;

      let crashed = false;

      setNextStepDash((prev) => {
        if (!prev.running) {
          return prev;
        }

        let playerVelocity = prev.playerVelocity - 320 * dt;
        let playerY = prev.playerY + playerVelocity * dt;
        if (playerY <= 0) {
          playerY = 0;
          if (playerVelocity < 0) {
            playerVelocity = 0;
          }
        }

        const nextSpeed = Math.min(prev.speed + dt * 1.2, 36);
        let nextObstacles = prev.obstacles
          .map((obstacle) => ({
            ...obstacle,
            x: obstacle.x - nextSpeed * dt
          }))
          .filter((obstacle) => obstacle.x + obstacle.width > -6);

        let nextSpawnInMs = prev.spawnInMs - dt * 1000;
        if (nextSpawnInMs <= 0) {
          dashObstacleIdRef.current += 1;
          nextObstacles = [...nextObstacles, createDashObstacle(dashObstacleIdRef.current)];
          nextSpawnInMs = 1200 + Math.random() * 700;
        }

        const collision = nextObstacles.some((obstacle) => {
          const xOverlap = obstacle.x < dashPlayerX + dashPlayerWidth - 1.2 && obstacle.x + obstacle.width > dashPlayerX + 1.2;
          const yOverlap = playerY < obstacle.height - 1.5;
          return xOverlap && yOverlap;
        });

        const nextScore = prev.score + dt * 14;
        const stepIndex = Math.min(dashMilestones.length - 1, Math.floor(nextScore / 95));
        const milestone = getDashMilestone(stepIndex);

        if (collision) {
          crashed = true;
          return {
            ...prev,
            running: false,
            best: Math.max(prev.best, Math.floor(nextScore)),
            score: Math.floor(nextScore),
            status: `Crashed. ${milestone.title}: ${milestone.hint}`,
            playerY,
            playerVelocity,
            stepIndex,
            obstacles: nextObstacles
          };
        }

        return {
          ...prev,
          score: nextScore,
          playerY,
          playerVelocity,
          speed: nextSpeed,
          spawnInMs: nextSpawnInMs,
          obstacles: nextObstacles,
          stepIndex,
          status: `${milestone.title}: ${milestone.hint}`
        };
      });

      if (crashed) {
        appendActivity('Next Step Dash crash');
        return;
      }

      dashAnimationRef.current = requestAnimationFrame(frame);
    };

    dashAnimationRef.current = requestAnimationFrame(frame);

    return () => {
      if (dashAnimationRef.current !== null) {
        cancelAnimationFrame(dashAnimationRef.current);
        dashAnimationRef.current = null;
      }
    };
  }, [appendActivity, nextStepDash.running]);

  useEffect(() => {
    if (!nextStepDash.running) {
      return;
    }

    if (nextStepDash.stepIndex > dashAnnouncedStepRef.current) {
      dashAnnouncedStepRef.current = nextStepDash.stepIndex;
      appendActivity(`Unlocked ${getDashMilestone(nextStepDash.stepIndex).title}`);
    }
  }, [appendActivity, nextStepDash.running, nextStepDash.stepIndex]);

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

          <Panel title="Next Step Dash" className="animate-float-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="rounded-full border border-app-accent/20 bg-app-panelAlt px-4 py-2 text-app-subtle">
                  Score: {Math.floor(nextStepDash.score)}
                </div>
                <div className="rounded-full border border-app-accent/20 bg-app-panelAlt px-4 py-2 text-app-subtle">
                  Best: {nextStepDash.best}
                </div>
                <div className="rounded-full border border-app-accent/20 bg-app-panelAlt px-4 py-2 text-app-subtle">
                  Stage: {nextStepDash.stepIndex + 1}/{dashMilestones.length}
                </div>
              </div>
              <BigButton variant="secondary" onClick={startNextStepDash}>
                {nextStepDash.running ? 'Restart Dash' : 'Start Dash'}
              </BigButton>
            </div>

            <p className="mt-4 text-sm text-app-subtle">
              Geometry Dash-style run powered by your gestures. Blink, open mouth, or tilt your head to jump over spikes and reveal your next training step.
            </p>

            <div className="mt-4 rounded-2xl border border-app-accent/20 bg-app-panelAlt p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-app-subtle">Next Step Guide</p>
              <p className="mt-2 text-base font-semibold text-app-text">{nextStepDash.status}</p>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-app-accent/20 bg-app-bg/60">
              <div className="relative h-56 w-full">
                <div className="absolute left-0 right-0 bottom-6 h-px bg-app-accent/30" />

                <div
                  className="absolute w-7 rounded-md border border-app-success/50 bg-app-success/25"
                  style={{
                    left: `${dashPlayerX}%`,
                    bottom: `${24 + nextStepDash.playerY}px`,
                    height: `${dashPlayerHeight}px`
                  }}
                />

                {nextStepDash.obstacles.map((obstacle) => (
                  <div
                    key={obstacle.id}
                    className="absolute rounded-t-md border border-app-accent/60 bg-app-accent/30"
                    style={{
                      left: `${obstacle.x}%`,
                      bottom: '24px',
                      width: `${obstacle.width}%`,
                      height: `${obstacle.height}px`
                    }}
                  />
                ))}
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {dashFullscreen ? (
        <div className="fixed inset-0 z-50 bg-app-bg/95 p-4 md:p-6">
          <button
            type="button"
            onClick={() => setDashFullscreen(false)}
            className="absolute left-4 top-4 rounded-md border border-app-accent/30 bg-app-panelAlt px-3 py-2 text-sm text-app-text transition hover:border-app-accent hover:bg-app-accent/10"
          >
            Back
          </button>

          <div className="mx-auto mt-14 max-w-5xl">
            <Panel title="Next Step Dash" className="animate-float-in">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="rounded-full border border-app-accent/20 bg-app-panelAlt px-4 py-2 text-app-subtle">
                    Score: {Math.floor(nextStepDash.score)}
                  </div>
                  <div className="rounded-full border border-app-accent/20 bg-app-panelAlt px-4 py-2 text-app-subtle">
                    Best: {nextStepDash.best}
                  </div>
                  <div className="rounded-full border border-app-accent/20 bg-app-panelAlt px-4 py-2 text-app-subtle">
                    Stage: {nextStepDash.stepIndex + 1}/{dashMilestones.length}
                  </div>
                </div>
                <BigButton variant="secondary" onClick={startNextStepDash}>
                  {nextStepDash.running ? 'Restart Dash' : 'Start Dash'}
                </BigButton>
              </div>

              <p className="mt-4 text-sm text-app-subtle">
                Geometry Dash-style run powered by your gestures. Blink, open mouth, or tilt your head to jump over spikes and reveal your next training step.
              </p>

              <div className="mt-4 rounded-2xl border border-app-accent/20 bg-app-panelAlt p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-app-subtle">Next Step Guide</p>
                <p className="mt-2 text-base font-semibold text-app-text">{nextStepDash.status}</p>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-app-accent/20 bg-app-bg/60">
                <div className="relative h-[60vh] min-h-[360px] w-full">
                  <div className="absolute bottom-10 left-0 right-0 h-px bg-app-accent/30" />

                  <div
                    className="absolute w-8 rounded-md border border-app-success/50 bg-app-success/25"
                    style={{
                      left: `${dashPlayerX}%`,
                      bottom: `${40 + nextStepDash.playerY}px`,
                      height: `${dashPlayerHeight + 2}px`
                    }}
                  />

                  {nextStepDash.obstacles.map((obstacle) => (
                    <div
                      key={obstacle.id}
                      className="absolute rounded-t-md border border-app-accent/60 bg-app-accent/30"
                      style={{
                        left: `${obstacle.x}%`,
                        bottom: '40px',
                        width: `${obstacle.width}%`,
                        height: `${obstacle.height + 4}px`
                      }}
                    />
                  ))}
                </div>
              </div>
            </Panel>
          </div>
        </div>
      ) : null}
    </>
  );
}
