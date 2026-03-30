import { useEffect, useRef } from 'react';

const SCROLL_TRIGGER_THRESHOLD = 100; // pixels from edge to trigger scroll
const MAX_SCROLL_SPEED = 20; // maximum pixels to scroll per frame

export function useAutoScroll(cursorY: number, enabled: boolean = true) {
  const scrollFrameRef = useRef<number>();
  const lastScrollTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const performScroll = () => {
      const now = Date.now();
      // Throttle to ~60fps for better performance
      if (now - lastScrollTimeRef.current < 16) {
        scrollFrameRef.current = requestAnimationFrame(performScroll);
        return;
      }
      lastScrollTimeRef.current = now;

      const pixelY = cursorY * window.innerHeight;

      // Check if cursor is near bottom of screen
      if (pixelY > window.innerHeight - SCROLL_TRIGGER_THRESHOLD) {
        const distanceFromEdge = window.innerHeight - pixelY;
        const scrollFraction = 1 - distanceFromEdge / SCROLL_TRIGGER_THRESHOLD;
        const scrollAmount = MAX_SCROLL_SPEED * scrollFraction;
        window.scrollBy({
          top: scrollAmount,
          behavior: 'auto'
        });
        console.log('Scrolling down:', scrollAmount);
      }
      // Check if cursor is near top of screen
      else if (pixelY < SCROLL_TRIGGER_THRESHOLD) {
        const scrollFraction = 1 - pixelY / SCROLL_TRIGGER_THRESHOLD;
        const scrollAmount = MAX_SCROLL_SPEED * scrollFraction;
        window.scrollBy({
          top: -scrollAmount,
          behavior: 'auto'
        });
        console.log('Scrolling up:', scrollAmount);
      }

      scrollFrameRef.current = requestAnimationFrame(performScroll);
    };

    scrollFrameRef.current = requestAnimationFrame(performScroll);

    return () => {
      if (scrollFrameRef.current) {
        cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, [cursorY, enabled]);
}
