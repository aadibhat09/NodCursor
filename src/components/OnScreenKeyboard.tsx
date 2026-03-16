import { useMemo } from 'react';

interface OnScreenKeyboardProps {
  isOpen: boolean;
  text: string;
  selectedIndex: number;
  shift: boolean;
  typingMode: boolean;
  onToggleOpen: () => void;
  onToggleTypingMode: () => void;
  onKeyPress: (key: string) => void;
}

const keyboardRows = ['1234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

export function buildKeyboardKeys(shift: boolean) {
  const chars = keyboardRows.join('').split('');
  const alpha = shift ? chars.map((c) => c.toUpperCase()) : chars;
  const punctuation = [',', '.', '?', "'"];
  return [...alpha, ...punctuation, 'SHIFT', 'SPACE', 'BACKSPACE', 'CLEAR', 'ENTER'];
}

export function OnScreenKeyboard({
  isOpen,
  text,
  selectedIndex,
  shift,
  typingMode,
  onToggleOpen,
  onToggleTypingMode,
  onKeyPress
}: OnScreenKeyboardProps) {
  const keys = useMemo(() => buildKeyboardKeys(shift), [shift]);

  return (
    <aside className="fixed bottom-3 left-3 right-3 z-40 rounded-2xl border border-app-accent/30 bg-app-panel/95 p-3 shadow-glow backdrop-blur">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggleOpen}
          className="rounded-lg border border-app-accent/40 bg-app-panelAlt px-3 py-2 text-sm font-semibold"
        >
          {isOpen ? 'Hide Keyboard' : 'Show Keyboard'}
        </button>
        <button
          type="button"
          onClick={onToggleTypingMode}
          className="rounded-lg border border-app-accent/40 bg-app-panelAlt px-3 py-2 text-sm font-semibold"
          disabled={!isOpen}
        >
          {typingMode ? 'Stop Mouth Typing' : 'Start Mouth Typing'}
        </button>
        <span className="text-xs text-app-subtle">
          Mouth open: next key | Smile: select key | Double blink: backspace | SHIFT toggles case
        </span>
      </div>

      <textarea
        className="mb-3 h-20 w-full rounded-xl border border-app-accent/30 bg-app-panelAlt p-3 text-sm text-app-text"
        value={text}
        readOnly
        placeholder="Typed text appears here"
      />

      {isOpen ? (
        <div className="grid grid-cols-6 gap-2 md:grid-cols-10">
          {keys.map((key, index) => (
            <button
              key={key + index}
              type="button"
              onClick={() => onKeyPress(key)}
              className={[
                'rounded-lg border px-2 py-2 text-xs font-semibold transition',
                selectedIndex === index
                  ? 'border-app-success bg-app-success/20 text-app-success'
                  : 'border-app-accent/30 bg-app-panelAlt text-app-text hover:bg-app-accent/10'
              ].join(' ')}
            >
              {key}
            </button>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
