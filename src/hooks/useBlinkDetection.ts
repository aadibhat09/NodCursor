import { useMemo } from 'react';

export function useBlinkDetection(blink: boolean, doubleBlink: boolean, longBlink: boolean) {
  return useMemo(
    () => ({
      leftClick: blink,
      rightClick: doubleBlink,
      drag: longBlink
    }),
    [blink, doubleBlink, longBlink]
  );
}
