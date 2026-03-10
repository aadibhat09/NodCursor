import { useEffect, useRef, useState } from 'react';
import { AdvancedSmoothingPipeline } from '../utils/smoothing/advancedSmoothing';

interface Point {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface SmoothCursorOptions {
  smoothing: number;
  stabilization?: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function smoothDamp(
  current: number,
  target: number,
  currentVelocity: number,
  smoothTime: number,
  maxSpeed: number,
  deltaTime: number
) {
  const safeSmoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / safeSmoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const delta = current - target;
  const maxDelta = maxSpeed * safeSmoothTime;
  const clampedDelta = clamp(delta, -maxDelta, maxDelta);
  const adjustedTarget = current - clampedDelta;
  const temp = (currentVelocity + omega * clampedDelta) * deltaTime;
  const nextVelocity = (currentVelocity - omega * temp) * exp;
  let nextPosition = adjustedTarget + (clampedDelta + temp) * exp;

  if ((target - current > 0) === (nextPosition > target)) {
    nextPosition = target;
    return {
      position: nextPosition,
      velocity: 0
    };
  }

  return {
    position: nextPosition,
    velocity: nextVelocity
  };
}

/**
 * Hook implementing continuous requestAnimationFrame-driven cursor motion
 * with critically damped interpolation for mouse-like movement.
 */
export function useSmoothCursor(targetPosition: Point, options: SmoothCursorOptions) {
  const [cursorPosition, setCursorPosition] = useState<Point>({ x: 0.5, y: 0.5 });
  const smoothingRef = useRef<AdvancedSmoothingPipeline>(new AdvancedSmoothingPipeline());
  const animationRef = useRef<number>();
  const interpolatedRef = useRef<Point>({ x: targetPosition.x, y: targetPosition.y });
  const targetRef = useRef<Point>(targetPosition);
  const velocityRef = useRef<Velocity>({ x: 0, y: 0 });
  const lastFrameRef = useRef<number>(performance.now());

  useEffect(() => {
    targetRef.current = targetPosition;
  }, [targetPosition.x, targetPosition.y]);

  useEffect(() => {
    const normalizedSmoothing = clamp(options.smoothing, 0.1, 0.9);
    const pipelineAlpha = lerp(0.3, 0.12, normalizedSmoothing);
    const deadzone = lerp(0.0008, 0.0032, normalizedSmoothing);
    smoothingRef.current.setParameters(pipelineAlpha, deadzone);
  }, [options.smoothing]);

  useEffect(() => {
    const animate = () => {
      const now = performance.now();
      const dt = Math.min((now - lastFrameRef.current) / 1000, 0.05);
      lastFrameRef.current = now;
      const normalizedSmoothing = clamp(options.smoothing, 0.1, 0.9);
      const smoothedTarget = options.stabilization === false
        ? targetRef.current
        : smoothingRef.current.process(targetRef.current);
      const smoothTime = lerp(0.06, 0.16, normalizedSmoothing);
      const maxSpeed = lerp(6, 2.8, normalizedSmoothing);
      const nextX = smoothDamp(
        interpolatedRef.current.x,
        smoothedTarget.x,
        velocityRef.current.x,
        smoothTime,
        maxSpeed,
        dt
      );
      const nextY = smoothDamp(
        interpolatedRef.current.y,
        smoothedTarget.y,
        velocityRef.current.y,
        smoothTime,
        maxSpeed,
        dt
      );

      interpolatedRef.current = {
        x: clamp(nextX.position, 0, 1),
        y: clamp(nextY.position, 0, 1)
      };
      velocityRef.current = {
        x: nextX.velocity,
        y: nextY.velocity
      };

      // Update state (triggers re-render)
      setCursorPosition({ ...interpolatedRef.current });

      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate);
    };

    lastFrameRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [options.smoothing, options.stabilization]);

  useEffect(() => {
    interpolatedRef.current = { x: targetPosition.x, y: targetPosition.y };
    velocityRef.current = { x: 0, y: 0 };
    smoothingRef.current.reset(targetPosition.x, targetPosition.y);
    setCursorPosition({ x: targetPosition.x, y: targetPosition.y });
  }, []);

  return cursorPosition;
}
