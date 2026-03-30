import { useEffect, useRef } from 'react';

const SCROLL_TRIGGER_THRESHOLD = 80; // pixels from edge to trigger scroll
const MAX_SCROLL_SPEED = 15; // maximum pixels to scroll per frame

export function useAutoScroll(cursorY: number) {
  const scrollFrameRef = useRef<number>();

  useEffect(() => {
    const performScroll = () => {
      const pixelY = cursorY * window.innerHeight;

      // Check if cursor is near bottom of screen
      if (pixelY > window.innerHeight - SCROLL_TRIGGER_THRESHOLD) {
        const distanceFromEdge = window.innerHeight - pixelY;
        const scrollAmount = MAX_SCROLL_SPEED * (1 - distanceFromEdge / SCROLL_TRIGGER_THRESHOLD);
        window.scrollBy(0, scrollAmount);
      }
      // Check if cursor is near top of screen
      else if (pixelY < SCROLL_TRIGGER_THRESHOLD) {
        const scrollAmount = MAX_SCROLL_SPEED * (1 - pixelY / SCROLL_TRIGGER_THRESHOLD);
        window.scrollBy(0, -scrollAmount);
      }

      scrollFrameRef.current = requestAnimationFrame(performScroll);
    };

    scrollFrameRef.current = requestAnimationFrame(performScroll);

    return () => {
      if (scrollFrameRef.current) {
        cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, [cursorY]);
}
