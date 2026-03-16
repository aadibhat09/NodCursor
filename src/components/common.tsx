import type { ReactNode } from 'react';
import { clsx } from 'clsx';

export function Panel({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  const titleId = `panel-${title.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <section
      className={clsx(
        'relative overflow-hidden rounded-2xl border border-app-accent/20 bg-app-panel p-4 shadow-glow transition duration-300 hover:border-app-accent/35 focus-within:border-app-accent/60 focus-within:shadow-[0_0_0_1px_rgba(156,216,255,0.3),0_10px_24px_rgba(99,197,255,0.12)]',
        className
      )}
      role="region"
      aria-labelledby={titleId}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-app-accent/40" />
      <h2 id={titleId} className="mb-3 text-lg font-display text-app-accent drop-shadow-sm">{title}</h2>
      {children}
    </section>
  );
}

export function BigButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'rounded-xl px-4 py-3 text-base font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0',
        variant === 'primary'
          ? 'bg-app-accentStrong text-app-bg shadow-glow hover:bg-app-accent disabled:bg-app-accent/50'
          : 'border border-app-accent/40 bg-app-panelAlt text-app-text hover:border-app-accent hover:bg-app-accent/10 disabled:border-app-accent/20 disabled:text-app-subtle'
      )}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {children}
    </button>
  );
}
