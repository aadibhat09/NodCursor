/**
 * Kalman Filter for 2D cursor position tracking
 * State vector: [x, y, velocityX, velocityY]
 */

export class KalmanFilter2D {
  private state: number[]; // [x, y, vx, vy]
  private P: number[][]; // Error covariance matrix (4x4)
  private Q: number; // Process noise
  private R: number; // Measurement noise

  constructor(initialX: number = 0.5, initialY: number = 0.5) {
    // Initial state: position at center, zero velocity
    this.state = [initialX, initialY, 0, 0];
    
    // Initial error covariance (high uncertainty)
    this.P = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
    
    // Process noise (how much we trust our model)
    this.Q = 0.001;
    
    // Measurement noise (how much we trust measurements)
    this.R = 0.05;
  }

  /**
   * Predict next state based on motion model
   * @param dt - time delta in seconds
   */
  private predict(dt: number): void {
    // State transition: x' = x + vx*dt, y' = y + vy*dt
    const newX = this.state[0] + this.state[2] * dt;
    const newY = this.state[1] + this.state[3] * dt;
    
    this.state[0] = newX;
    this.state[1] = newY;
    // Velocity remains constant in prediction
    
    // Update error covariance: P' = P + Q
    for (let i = 0; i < 4; i++) {
      this.P[i][i] += this.Q;
    }
  }

  /**
   * Update state with new measurement
   * @param measuredX - measured x position
   * @param measuredY - measured y position
   */
  private update(measuredX: number, measuredY: number): void {
    // Kalman gain for position measurements
    const Kx = this.P[0][0] / (this.P[0][0] + this.R);
    const Ky = this.P[1][1] / (this.P[1][1] + this.R);
    
    // Update state with measurement
    const innovationX = measuredX - this.state[0];
    const innovationY = measuredY - this.state[1];
    
    this.state[0] += Kx * innovationX;
    this.state[1] += Ky * innovationY;
    
    // Update velocity estimate based on innovation
    this.state[2] = innovationX * 30; // Assume 30 FPS for velocity
    this.state[3] = innovationY * 30;
    
    // Update error covariance: P' = (I - K) * P
    this.P[0][0] *= (1 - Kx);
    this.P[1][1] *= (1 - Ky);
  }

  /**
   * Filter new measurement and return smoothed position
   * @param measuredX - raw x position (0-1)
   * @param measuredY - raw y position (0-1)
   * @param dt - time delta in seconds (default: 1/60)
   * @returns Filtered position {x, y}
   */
  filter(measuredX: number, measuredY: number, dt: number = 1/60): { x: number; y: number } {
    this.predict(dt);
    this.update(measuredX, measuredY);
    
    return {
      x: this.state[0],
      y: this.state[1]
    };
  }

  /**
   * Reset filter to new position
   */
  reset(x: number = 0.5, y: number = 0.5): void {
    this.state = [x, y, 0, 0];
    this.P = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
  }
}
