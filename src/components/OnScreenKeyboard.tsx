import { useMemo } from 'react';
import { clsx } from 'clsx';

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
    <aside
      className="fixed bottom-3 left-3 right-3 z-40 rounded-2xl border border-app-accent/30 bg-app-panel/95 p-4 shadow-glow backdrop-blur"
      role="region"
      aria-label="On-screen keyboard"
    >
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleOpen}
            className={clsx(
              'rounded-lg px-3 py-2 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent',
              isOpen
                ? 'border border-app-accent/60 bg-app-accent/15 text-app-accent'
                : 'border border-app-accent/40 bg-app-panelAlt text-app-text hover:border-app-accent/60'
            )}
            aria-pressed={isOpen}
          >
            {isOpen ? '✓ Keyboard Open' : '✕ Keyboard Closed'}
          </button>
          <button
            type="button"
            onClick={onToggleTypingMode}
            disabled={!isOpen}
            className={clsx(
              'rounded-lg px-3 py-2 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent disabled:opacity-50 disabled:cursor-not-allowed',
              typingMode && isOpen
                ? 'border border-app-success/60 bg-app-success/15 text-app-success'
                : 'border border-app-accent/40 bg-app-panelAlt text-app-text hover:border-app-accent/60'
            )}
            aria-pressed={typingMode && isOpen}
          >
            {typingMode ? '🎯 Mouth Typing' : '⚪ Mouth Mode'}
          </button>
        </div>
        <p className="text-xs leading-relaxed text-app-subtle">
          📖 <span className="font-semibold">Mouth open</span> = next key | <span className="font-semibold">Smile</span> = select key | <span className="font-semibold">Double blink</span> = backspace
        </p>
      </div>

      <textarea
        className="mb-3 h-20 w-full resize-none rounded-xl border border-app-accent/30 bg-app-panelAlt p-3 text-sm text-app-text focus:border-app-accent/60 focus:ring-2 focus:ring-app-accent/20"
        value={text}
        readOnly
        aria-label="Typed text output"
        placeholder="Typed text appears here..."
      />

      {isOpen ? (
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
          {keys.map((key, index) => (
            <button
              key={key + index}
              type="button"
              onClick={() => onKeyPress(key)}
              className={clsx(
                'rounded-lg border px-1.5 py-1.5 text-xs font-semibold transition duration-150 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-app-accent',
                selectedIndex === index
                  ? 'border-app-success bg-app-success/25 text-app-success ring-2 ring-app-success/40'
                  : 'border-app-accent/25 bg-app-panelAlt text-app-text hover:border-app-accent/50 hover:bg-app-accent/10'
              )}
              aria-pressed={selectedIndex === index}
              disabled={false}
            >
              {key}
            </button>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
