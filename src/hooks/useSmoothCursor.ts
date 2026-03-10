import { useEffect, useRef, useState } from 'react';
import { AdvancedSmoothingPipeline } from '../utils/smoothing/advancedSmoothing';

interface Point {
  x: number;
  y: number;
}

/**
 * Hook implementing requestAnimationFrame-based cursor interpolation
 * with motion inertia as specified in meta-prompt
 */
export function useSmoothCursor(targetPosition: Point) {
  const [cursorPosition, setCursorPosition] = useState<Point>({ x: 0.5, y: 0.5 });
  const smoothingRef = useRef<AdvancedSmoothingPipeline>(new AdvancedSmoothingPipeline());
  const animationRef = useRef<number>();
  const interpolatedRef = useRef<Point>({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const animate = () => {
      // Apply three-stage smoothing pipeline to target
      const smoothedTarget = smoothingRef.current.process(targetPosition);

      // Motion interpolation with inertia (lerp factor 0.25)
      interpolatedRef.current.x += (smoothedTarget.x - interpolatedRef.current.x) * 0.25;
      interpolatedRef.current.y += (smoothedTarget.y - interpolatedRef.current.y) * 0.25;

      // Update state (triggers re-render)
      setCursorPosition({ ...interpolatedRef.current });

      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetPosition.x, targetPosition.y]);

  return cursorPosition;
}
