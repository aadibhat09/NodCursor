import { useState } from 'react';
import { clsx } from 'clsx';

const actions = ['Left Click', 'Right Click', 'Scroll', 'Drag Toggle'];

export function VirtualButtons({ onAction }: { onAction: (action: string) => void }) {
  const [hovered, setHovered] = useState<string>('');

  return (
    <aside className="fixed right-3 top-24 z-40 grid gap-2" role="toolbar" aria-label="Virtual action buttons">
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          onMouseEnter={() => {
            setHovered(action);
            onAction(action);
          }}
          onMouseLeave={() => setHovered('')}
          className={clsx(
            'rounded-xl border px-4 py-3 text-sm font-semibold transition duration-200 shadow-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent',
            hovered === action
              ? 'border-app-success bg-app-success/20 text-app-success'
              : 'border-app-accent/30 bg-app-panel text-app-text hover:border-app-accent/50 hover:bg-app-accent/15'
          )}
          aria-pressed={hovered === action}
        >
          {hovered === action ? `${action} ✓` : action}
        </button>
      ))}
    </aside>
  );
}
