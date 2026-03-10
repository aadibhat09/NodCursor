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

export function useGestureControls(settings: CursorSettings, input: GestureInput, handlers?: GestureHandlers) {
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

  useEffect(() => {
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

    if (settings.headTiltScrollEnabled && now - lastScrollAt.current > 120) {
      const threshold = 0.025;
      if (input.headTilt > threshold) {
        window.scrollBy({ top: 90, behavior: 'smooth' });
        lastScrollAt.current = now;
      } else if (input.headTilt < -threshold) {
        window.scrollBy({ top: -90, behavior: 'smooth' });
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
