const blockedPatterns = [
  'FaceBlendshapesGraph acceleration to xnnpack',
  'Created TensorFlow Lite XNNPACK delegate for CPU',
  'inference_feedback_manager.cc:121',
  'landmark_projection_calculator.cc:189',
  'Graph successfully started running.',
  'OpenGL error checking is disabled',
  'GL version:'
];

function shouldBlock(args: unknown[]) {
  return args.some((arg) => {
    if (typeof arg !== 'string') {
      return false;
    }
    return blockedPatterns.some((pattern) => arg.includes(pattern));
  });
}

export function filterNoisyLogs() {
  const warn = console.warn.bind(console);
  const info = console.info.bind(console);
  const log = console.log.bind(console);

  console.warn = (...args: unknown[]) => {
    if (shouldBlock(args)) {
      return;
    }
    warn(...args);
  };

  console.info = (...args: unknown[]) => {
    if (shouldBlock(args)) {
      return;
    }
    info(...args);
  };

  console.log = (...args: unknown[]) => {
    if (shouldBlock(args)) {
      return;
    }
    log(...args);
  };
}
