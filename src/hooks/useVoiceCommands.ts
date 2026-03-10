import { useEffect } from 'react';

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

interface VoiceHandlers {
  click: () => void;
  rightClick: () => void;
  drag: () => void;
  scrollUp: () => void;
  scrollDown: () => void;
}

export function useVoiceCommands(enabled: boolean, handlers: VoiceHandlers) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const spoken = event.results[event.results.length - 1][0].transcript.toLowerCase();
      if (spoken.includes('right click')) handlers.rightClick();
      if (spoken.includes('click')) handlers.click();
      if (spoken.includes('drag')) handlers.drag();
      if (spoken.includes('scroll up')) handlers.scrollUp();
      if (spoken.includes('scroll down')) handlers.scrollDown();
    };

    recognition.start();
    return () => recognition.stop();
  }, [enabled, handlers]);
}
