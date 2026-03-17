interface LightSample {
  brightness: number;
  contrast: number;
  timestamp: number;
}

export interface AdaptiveLightState {
  brightness: number;
  contrast: number;
  quality: number;
  recommendation: 'low-light' | 'balanced' | 'bright';
  detectionIntervalMs: number;
  blinkSensitivityMultiplier: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const samplerCache = new WeakMap<HTMLVideoElement, { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D }>();

export class AdaptiveLightLearner {
  private baselineBrightness = 0.5;
  private baselineContrast = 0.18;
  private confidence = 0;
  private readonly alpha = 0.08;
  private readonly warmupFrames = 35;

  update(sample: LightSample): AdaptiveLightState {
    const brightness = clamp(sample.brightness, 0, 1);
    const contrast = clamp(sample.contrast, 0, 1);

    this.baselineBrightness = this.baselineBrightness + this.alpha * (brightness - this.baselineBrightness);
    this.baselineContrast = this.baselineContrast + this.alpha * (contrast - this.baselineContrast);

    this.confidence = clamp(this.confidence + 1 / this.warmupFrames, 0, 1);

    const brightnessScore = 1 - Math.min(Math.abs(this.baselineBrightness - 0.55) / 0.55, 1);
    const contrastScore = clamp(this.baselineContrast / 0.25, 0, 1);
    const quality = clamp(brightnessScore * 0.65 + contrastScore * 0.35, 0, 1);

    const recommendation: AdaptiveLightState['recommendation'] =
      this.baselineBrightness < 0.4 ? 'low-light' : this.baselineBrightness > 0.72 ? 'bright' : 'balanced';

    const intervalByQuality = quality < 0.45 ? 56 : quality < 0.7 ? 44 : 33;
    const detectionIntervalMs = Math.round(intervalByQuality + (1 - this.confidence) * 10);

    const blinkSensitivityMultiplier = clamp(
      1 + (0.55 - this.baselineBrightness) * 0.16 + (0.18 - this.baselineContrast) * 0.24,
      0.9,
      1.15
    );

    return {
      brightness: this.baselineBrightness,
      contrast: this.baselineContrast,
      quality,
      recommendation,
      detectionIntervalMs,
      blinkSensitivityMultiplier
    };
  }
}

export function sampleVideoLuma(video: HTMLVideoElement): LightSample | null {
  const width = video.videoWidth;
  const height = video.videoHeight;

  if (!width || !height) {
    return null;
  }

  const sampleWidth = 32;
  const sampleHeight = 18;
  let sampler = samplerCache.get(video);
  if (!sampler) {
    const canvas = document.createElement('canvas');
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      return null;
    }
    sampler = { canvas, context };
    samplerCache.set(video, sampler);
  }

  if (sampler.canvas.width !== sampleWidth || sampler.canvas.height !== sampleHeight) {
    sampler.canvas.width = sampleWidth;
    sampler.canvas.height = sampleHeight;
  }

  if (!sampler.context) {
    return null;
  }

  sampler.context.drawImage(video, 0, 0, sampleWidth, sampleHeight);
  const frame = sampler.context.getImageData(0, 0, sampleWidth, sampleHeight).data;

  let sum = 0;
  let sumSquared = 0;
  const pixelCount = sampleWidth * sampleHeight;

  for (let index = 0; index < frame.length; index += 4) {
    const luma = (0.2126 * frame[index] + 0.7152 * frame[index + 1] + 0.0722 * frame[index + 2]) / 255;
    sum += luma;
    sumSquared += luma * luma;
  }

  const brightness = sum / pixelCount;
  const variance = Math.max(sumSquared / pixelCount - brightness * brightness, 0);
  const contrast = Math.sqrt(variance);

  return {
    brightness,
    contrast,
    timestamp: performance.now()
  };
}