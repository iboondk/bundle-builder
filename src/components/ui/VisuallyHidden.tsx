import type { ReactNode } from 'react';

/**
 * Screen-reader-accessible text that is visually hidden.
 * Use for labels and descriptions that should only be announced by assistive tech.
 */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return (
    <span
      className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0"
      style={{ clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)', margin: '-1px' }}
    >
      {children}
    </span>
  );
}
