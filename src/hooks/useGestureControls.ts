import { useEffect, useRef } from 'react';
import type { CursorSettings } from '../types';

interface GestureInput {
  x: number;
  y: number;
  blink: boolean;
  doubleBlink: boolean;
  longBlink: boolean;
  mouthOpen: boolean;
  smile: boolean;
  headTilt: number;
}

interface GestureHandlers {
  onEvent?: (event: string) => void;
}

function pointFromNormalized(x: number, y: number) {
  return {
    clientX: Math.round(x * window.innerWidth),
    clientY: Math.round(y * window.innerHeight)
  };
}

function dispatchMouse(type: string, x: number, y: number, button = 0) {
  const { clientX, clientY } = pointFromNormalized(x, y);
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

export function useGestureControls(
  settings: CursorSettings,
  input: GestureInput,
  handlers?: GestureHandlers,
  enabled = true
) {
  const prev = useRef({
    blink: false,
    doubleBlink: false,
    longBlink: false,
    mouthOpen: false,
    smile: false
  });

  const dragMode = useRef(false);
  const lastScrollAt = useRef(0);
  const mouthCooldownUntil = useRef(0);
  const tiltBaseline = useRef<number | null>(null);
  const tiltDirection = useRef<0 | 1 | -1>(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const now = performance.now();

    if (settings.blinkEnabled && input.blink && !prev.current.blink) {
      dispatchMouse('click', input.x, input.y, 0);
      handlers?.onEvent?.('Blink left click');
    }

    if (settings.blinkEnabled && input.doubleBlink && !prev.current.doubleBlink) {
      dispatchMouse('contextmenu', input.x, input.y, 2);
      handlers?.onEvent?.('Double blink right click');
    }

    if (settings.blinkEnabled && input.longBlink && !prev.current.longBlink) {
      dragMode.current = !dragMode.current;
      if (dragMode.current) {
        dispatchMouse('mousedown', input.x, input.y, 0);
        handlers?.onEvent?.('Long blink drag start');
      } else {
        dispatchMouse('mouseup', input.x, input.y, 0);
        handlers?.onEvent?.('Long blink drag end');
      }
    }

    if (dragMode.current) {
      dispatchMouse('mousemove', input.x, input.y, 0);
    }

    if (settings.mouthEnabled && now > mouthCooldownUntil.current) {
      if (input.mouthOpen && !prev.current.mouthOpen) {
        dispatchMouse('click', input.x, input.y, 0);
        handlers?.onEvent?.('Mouth click');
        mouthCooldownUntil.current = now + 700;
      } else if (input.smile && !prev.current.smile) {
        dispatchMouse('dblclick', input.x, input.y, 0);
        handlers?.onEvent?.('Smile double click');
        mouthCooldownUntil.current = now + 900;
      }
    }

    if (!settings.headTiltScrollEnabled) {
      tiltBaseline.current = null;
      tiltDirection.current = 0;
    }

    if (settings.headTiltScrollEnabled) {
      if (tiltBaseline.current === null) {
        tiltBaseline.current = input.headTilt;
      }

      // Keep a moving neutral pose so tiny posture drift does not trigger auto-scroll.
      tiltBaseline.current = tiltBaseline.current * 0.96 + input.headTilt * 0.04;
      const relativeTilt = input.headTilt - tiltBaseline.current;
      const threshold = 0.06;
      const nextDirection: 0 | 1 | -1 =
        relativeTilt > threshold ? 1 : relativeTilt < -threshold ? -1 : 0;

      if (nextDirection === 0) {
        tiltDirection.current = 0;
      }

      if (nextDirection !== 0 && nextDirection !== tiltDirection.current && now - lastScrollAt.current > 260) {
        tiltDirection.current = nextDirection;
        if (nextDirection === 1) {
          window.scrollBy({ top: 110, behavior: 'smooth' });
          handlers?.onEvent?.('Head tilt scroll down');
        } else {
          window.scrollBy({ top: -110, behavior: 'smooth' });
          handlers?.onEvent?.('Head tilt scroll up');
        }
        lastScrollAt.current = now;
      }
    }

    prev.current = {
      blink: input.blink,
      doubleBlink: input.doubleBlink,
      longBlink: input.longBlink,
      mouthOpen: input.mouthOpen,
      smile: input.smile
    };
  }, [
    enabled,
    input.blink,
    input.doubleBlink,
    input.longBlink,
    input.headTilt,
    input.mouthOpen,
    input.smile,
    input.x,
    input.y,
    settings.blinkEnabled,
    settings.headTiltScrollEnabled,
    settings.mouthEnabled,
    handlers
  ]);
}
