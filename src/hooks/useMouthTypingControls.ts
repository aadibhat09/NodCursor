import { useEffect, useMemo, useRef, useState } from 'react';
import { buildKeyboardKeys } from '../components/OnScreenKeyboard';

interface MouthTypingInput {
  mouthOpen: boolean;
  smile: boolean;
  doubleBlink: boolean;
}

interface MouthTypingOptions {
  advanceCooldownMs: number;
  selectCooldownMs: number;
  backspaceCooldownMs: number;
}

const punctuationKeys = new Set([',', '.', '?', "'"]);

export function useMouthTypingControls(active: boolean, input: MouthTypingInput, options: MouthTypingOptions) {
  const [text, setText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [shift, setShift] = useState(false);

  const keys = useMemo(() => buildKeyboardKeys(shift), [shift]);
  const prev = useRef({ mouthOpen: false, smile: false, doubleBlink: false });
  const cooldowns = useRef({ advanceUntil: 0, selectUntil: 0, backspaceUntil: 0 });

  const applyKey = (key: string) => {
    if (key === 'SHIFT') {
      setShift((prevShift) => !prevShift);
      return;
    }
    if (key === 'SPACE') {
      setText((prevText) => (prevText.endsWith(' ') || prevText.length === 0 ? prevText : `${prevText} `));
      return;
    }
    if (key === 'BACKSPACE') {
      setText((prevText) => prevText.slice(0, -1));
      return;
    }
    if (key === 'CLEAR') {
      setText('');
      return;
    }
    if (key === 'ENTER') {
      setText((prevText) => `${prevText.trimEnd()}\n`);
      return;
    }

    if (punctuationKeys.has(key)) {
      setText((prevText) => {
        const trimmed = prevText.trimEnd();
        return `${trimmed}${key} `;
      });
      return;
    }

    setText((prevText) => prevText + key);
  };

  useEffect(() => {
    if (!active) {
      return;
    }

    const now = performance.now();

    if (input.mouthOpen && !prev.current.mouthOpen && now >= cooldowns.current.advanceUntil) {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % keys.length);
      cooldowns.current.advanceUntil = now + options.advanceCooldownMs;
    }

    if (input.smile && !prev.current.smile && now >= cooldowns.current.selectUntil) {
      applyKey(keys[selectedIndex]);
      if (shift) {
        setShift(false);
      }
      cooldowns.current.selectUntil = now + options.selectCooldownMs;
    }

    if (input.doubleBlink && !prev.current.doubleBlink && now >= cooldowns.current.backspaceUntil) {
      applyKey('BACKSPACE');
      cooldowns.current.backspaceUntil = now + options.backspaceCooldownMs;
    }

    prev.current = {
      mouthOpen: input.mouthOpen,
      smile: input.smile,
      doubleBlink: input.doubleBlink
    };
  }, [
    active,
    input.doubleBlink,
    input.mouthOpen,
    input.smile,
    keys,
    selectedIndex,
    shift,
    options.advanceCooldownMs,
    options.selectCooldownMs,
    options.backspaceCooldownMs
  ]);

  return {
    text,
    selectedIndex,
    shift,
    setShift,
    setText,
    applyKey
  };
}
