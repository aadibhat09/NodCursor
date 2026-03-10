import { useState } from 'react';

const actions = ['Left Click', 'Right Click', 'Scroll', 'Drag Toggle'];

export function VirtualButtons({ onAction }: { onAction: (action: string) => void }) {
  const [hovered, setHovered] = useState<string>('');

  return (
    <aside className="fixed right-3 top-24 z-40 grid gap-2">
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          onMouseEnter={() => {
            setHovered(action);
            onAction(action);
          }}
          onMouseLeave={() => setHovered('')}
          className="rounded-xl border border-app-accent/30 bg-app-panel px-4 py-3 text-sm font-semibold text-app-text shadow-glow transition hover:bg-app-accent/20"
        >
          {hovered === action ? `${action} (hover)` : action}
        </button>
      ))}
    </aside>
  );
}
