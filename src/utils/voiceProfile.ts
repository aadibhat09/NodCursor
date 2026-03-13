export interface VoiceProfile {
  version: 1;
  createdAt: number;
  sampleCount: number;
  mean: [number, number, number, number, number];
  std: [number, number, number, number, number];
  threshold: number;
}

export interface VoiceMatchResult {
  score: number;
  isMatch: boolean;
}

const STORAGE_KEY = 'head-cursor-voice-profile-v1';

export function loadVoiceProfile(): VoiceProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VoiceProfile;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.mean) || !Array.isArray(parsed.std)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveVoiceProfile(profile: VoiceProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearVoiceProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function binFrequency(index: number, fftSize: number, sampleRate: number): number {
  return (index * sampleRate) / fftSize;
}

function normalizeBandEnergy(
  bins: Uint8Array,
  fftSize: number,
  sampleRate: number,
  lowHz: number,
  highHz: number
): number {
  let energy = 0;
  let count = 0;

  for (let i = 0; i < bins.length; i += 1) {
    const hz = binFrequency(i, fftSize, sampleRate);
    if (hz < lowHz || hz > highHz) continue;
    energy += bins[i] / 255;
    count += 1;
  }

  return count ? energy / count : 0;
}

function clamp01(v: number): number {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

export function extractVoiceFeature(
  freqBins: Uint8Array,
  timeBins: Uint8Array,
  fftSize: number,
  sampleRate: number
): [number, number, number, number, number] | null {
  // Time-domain RMS for quick voice activity filtering.
  let sumSq = 0;
  for (let i = 0; i < timeBins.length; i += 1) {
    const centered = (timeBins[i] - 128) / 128;
    sumSq += centered * centered;
  }
  const rms = Math.sqrt(sumSq / Math.max(1, timeBins.length));
  if (rms < 0.02) {
    return null;
  }

  // Spectral centroid normalized to [0,1].
  let weighted = 0;
  let magnitudes = 0;
  for (let i = 0; i < freqBins.length; i += 1) {
    const mag = freqBins[i] / 255;
    const hz = binFrequency(i, fftSize, sampleRate);
    weighted += hz * mag;
    magnitudes += mag;
  }

  const nyquist = sampleRate / 2;
  const centroidNorm = magnitudes > 0 ? (weighted / magnitudes) / nyquist : 0;

  const lowBand = normalizeBandEnergy(freqBins, fftSize, sampleRate, 85, 320);
  const midBand = normalizeBandEnergy(freqBins, fftSize, sampleRate, 320, 1500);
  const highBand = normalizeBandEnergy(freqBins, fftSize, sampleRate, 1500, 4200);
  const total = clamp01((lowBand + midBand + highBand) / 3);

  return [clamp01(centroidNorm), clamp01(lowBand), clamp01(midBand), clamp01(highBand), total];
}

export function buildVoiceProfile(samples: Array<[number, number, number, number, number]>): VoiceProfile {
  const len = samples.length;
  const mean: [number, number, number, number, number] = [0, 0, 0, 0, 0];

  for (let i = 0; i < len; i += 1) {
    for (let j = 0; j < 5; j += 1) {
      mean[j] += samples[i][j];
    }
  }

  for (let j = 0; j < 5; j += 1) {
    mean[j] /= Math.max(1, len);
  }

  const variance = [0, 0, 0, 0, 0];
  for (let i = 0; i < len; i += 1) {
    for (let j = 0; j < 5; j += 1) {
      const delta = samples[i][j] - mean[j];
      variance[j] += delta * delta;
    }
  }

  const std: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (let j = 0; j < 5; j += 1) {
    std[j] = Math.max(0.02, Math.sqrt(variance[j] / Math.max(1, len)));
  }

  return {
    version: 1,
    createdAt: Date.now(),
    sampleCount: len,
    mean,
    std,
    threshold: 2.4
  };
}

export function matchVoiceProfile(
  profile: VoiceProfile,
  sample: [number, number, number, number, number]
): VoiceMatchResult {
  let sum = 0;
  for (let i = 0; i < 5; i += 1) {
    const z = Math.abs(sample[i] - profile.mean[i]) / profile.std[i];
    sum += z;
  }

  const score = sum / 5;
  return {
    score,
    isMatch: score <= profile.threshold
  };
}

export interface VoiceFeatureMonitor {
  stop: () => void;
}

export async function startVoiceFeatureMonitor(
  onFeature: (feature: [number, number, number, number, number]) => void
): Promise<VoiceFeatureMonitor> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1
    },
    video: false
  });

  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) {
    stream.getTracks().forEach((track) => track.stop());
    throw new Error('Web Audio API is unavailable in this browser.');
  }

  const context = new AudioContextCtor();
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.7;
  source.connect(analyser);

  const freq = new Uint8Array(analyser.frequencyBinCount);
  const time = new Uint8Array(analyser.fftSize);

  let raf = 0;
  let active = true;

  const loop = () => {
    if (!active) return;

    analyser.getByteFrequencyData(freq);
    analyser.getByteTimeDomainData(time);
    const feature = extractVoiceFeature(freq, time, analyser.fftSize, context.sampleRate);

    if (feature) {
      onFeature(feature);
    }

    raf = window.requestAnimationFrame(loop);
  };

  raf = window.requestAnimationFrame(loop);

  return {
    stop: () => {
      active = false;
      window.cancelAnimationFrame(raf);
      source.disconnect();
      analyser.disconnect();
      stream.getTracks().forEach((track) => track.stop());
      void context.close();
    }
  };
}
