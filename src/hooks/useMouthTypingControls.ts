import { useEffect, useMemo, useRef, useState } from 'react';
import { buildKeyboardKeys } from '../components/OnScreenKeyboard';

interface MouthTypingInput {
  mouthOpen: boolean;
  smile: boolean;
  doubleBlink: boolean;
}

export function useMouthTypingControls(active: boolean, input: MouthTypingInput) {
  const [text, setText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [shift, setShift] = useState(false);

  const keys = useMemo(() => buildKeyboardKeys(shift), [shift]);
  const prev = useRef({ mouthOpen: false, smile: false, doubleBlink: false });

  const applyKey = (key: string) => {
    if (key === 'SPACE') {
      setText((prevText) => prevText + ' ');
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
      setText((prevText) => prevText + '\n');
      return;
    }
    setText((prevText) => prevText + key);
  };

  useEffect(() => {
    if (!active) {
      return;
    }

    if (input.mouthOpen && !prev.current.mouthOpen) {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % keys.length);
    }

    if (input.smile && !prev.current.smile) {
      applyKey(keys[selectedIndex]);
      if (shift) {
        setShift(false);
      }
    }

    if (input.doubleBlink && !prev.current.doubleBlink) {
      applyKey('BACKSPACE');
    }

    prev.current = {
      mouthOpen: input.mouthOpen,
      smile: input.smile,
      doubleBlink: input.doubleBlink
    };
  }, [active, input.doubleBlink, input.mouthOpen, input.smile, keys, selectedIndex, shift]);

  return {
    text,
    selectedIndex,
    shift,
    setShift,
    setText,
    applyKey
  };
}
