import { KalmanFilter2D } from './kalmanFilter';

interface Point {
  x: number;
  y: number;
}

/**
 * Three-stage smoothing pipeline as per meta-prompt requirements
 */
export class AdvancedSmoothingPipeline {
  private kalman: KalmanFilter2D;
  private exponentialState: Point;
  private outputState: Point;
  private lastUpdate: number;
  private alpha: number;
  private microDeadzone: number;

  constructor(
    alpha: number = 0.18,
    microDeadzone: number = 0.002
  ) {
    this.kalman = new KalmanFilter2D();
    this.exponentialState = { x: 0.5, y: 0.5 };
    this.outputState = { x: 0.5, y: 0.5 };
    this.lastUpdate = performance.now();
    this.alpha = alpha;
    this.microDeadzone = microDeadzone;
  }

  /**
   * Stage 1: Kalman filtering to reduce jitter from facial landmarks
   */
  private applyKalmanFilter(raw: Point, dt: number): Point {
    return this.kalman.filter(raw.x, raw.y, dt);
  }

  /**
   * Stage 2: Exponential smoothing for additional stability
   */
  private applyExponentialSmoothing(kalmanFiltered: Point): Point {
    this.exponentialState.x = this.exponentialState.x + this.alpha * (kalmanFiltered.x - this.exponentialState.x);
    this.exponentialState.y = this.exponentialState.y + this.alpha * (kalmanFiltered.y - this.exponentialState.y);

    return { ...this.exponentialState };
  }

  /**
   * Stage 3: Micro-deadzone stabilization to ignore tiny movements
   */
  private applyMicroDeadzone(smoothed: Point, previous: Point): Point {
    const dx = Math.abs(smoothed.x - previous.x);
    const dy = Math.abs(smoothed.y - previous.y);

    // If movement is below threshold, keep previous position
    if (dx < this.microDeadzone && dy < this.microDeadzone) {
      return previous;
    }

    return smoothed;
  }

  /**
   * Process raw position through three-stage pipeline
   * @param raw - Raw position from face tracking (0-1 normalized)
   * @returns Smoothed position
   */
  process(raw: Point): Point {
    const now = performance.now();
    const dt = Math.min((now - this.lastUpdate) / 1000, 0.1); // Cap at 100ms
    this.lastUpdate = now;

    // Stage 1: Kalman filter
    const kalmanFiltered = this.applyKalmanFilter(raw, dt);

    // Stage 2: Exponential smoothing
    const exponentialSmoothed = this.applyExponentialSmoothing(kalmanFiltered);

    // Stage 3: Micro-deadzone
    const final = this.applyMicroDeadzone(exponentialSmoothed, this.outputState);
    this.outputState = { ...final };

    return final;
  }

  /**
   * Reset smoothing state
   */
  reset(x: number = 0.5, y: number = 0.5): void {
    this.kalman.reset(x, y);
    this.exponentialState = { x, y };
    this.outputState = { x, y };
    this.lastUpdate = performance.now();
  }

  /**
   * Update smoothing parameters
   */
  setParameters(alpha?: number, microDeadzone?: number): void {
    if (alpha !== undefined) this.alpha = alpha;
    if (microDeadzone !== undefined) this.microDeadzone = microDeadzone;
  }
}
