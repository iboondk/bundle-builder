/**
 * Inline SVG icons. No icon-library dependency.
 * Each icon takes a className for sizing/coloring via Tailwind.
 */

interface IconProps {
  className?: string;
}

/** 12×12 minus used in the stepper − button. Colour inherits via currentColor. */
export function MinusIcon({ className }: IconProps) {
  return (
    <svg
      className={`text-ink ${className ?? ''}`}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <rect x="2" y="5.25" width="8" height="1.5" rx="0.75" fill="currentColor" />
    </svg>
  );
}

/** 12×12 plus used in the stepper + button. Colour inherits via currentColor. */
export function PlusIcon({ className }: IconProps) {
  return (
    <svg
      className={`text-ink ${className ?? ''}`}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <rect x="2" y="5.25" width="8" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="5.25" y="2" width="1.5" height="8" rx="0.75" fill="currentColor" />
    </svg>
  );
}

/** Chevron used in accordion step headers (M4) and optionally elsewhere. */
export function ChevronDown({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Filled triangle — solid (not outlined). Points down; rotate 180° for up. */
export function TriangleDown({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="currentColor"
      aria-hidden
    >
      <path d="M1 3L5 7L9 3Z" />
    </svg>
  );
}
