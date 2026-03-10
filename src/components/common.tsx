import type { ReactNode } from 'react';
import { clsx } from 'clsx';

export function Panel({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={clsx('rounded-2xl border border-app-accent/20 bg-app-panel p-4 shadow-glow', className)}>
      <h2 className="mb-3 text-lg font-display text-app-accent">{title}</h2>
      {children}
    </section>
  );
}

export function BigButton({
  children,
  onClick,
  variant = 'primary'
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'rounded-xl px-4 py-3 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent',
        variant === 'primary'
          ? 'bg-app-accentStrong text-app-bg hover:bg-app-accent'
          : 'border border-app-accent/40 bg-app-panelAlt text-app-text hover:bg-app-accent/10'
      )}
    >
      {children}
    </button>
  );
}
