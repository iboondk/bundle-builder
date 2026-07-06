import type { StepId } from '@/types/catalog';

interface StepIconProps {
  stepId: StepId;
  className?: string;
}

/** Exported Figma step-header icons (gray line icons). Plan falls back to an inline gray shield. */
const ICON_SRC: Partial<Record<StepId, string>> = {
  cameras: '/assets/icons/step-cameras.svg',
  sensors: '/assets/icons/step-sensors.svg',
  protection: '/assets/icons/step-protection.svg',
};

/** 26×26 category icon for each step. Uses the real Figma assets; decorative (aria-hidden). */
export function StepIcon({ stepId, className }: StepIconProps) {
  const src = ICON_SRC[stepId];
  if (src) {
    return <img src={src} alt="" aria-hidden className={className} />;
  }
  // Plan — gray shield outline only (no checkmark). Matches Figma step-header icon.
  return (
    <svg className={`text-gray-700 ${className ?? ''}`} width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <path d="M13 3L22 7V13.5C22 18 18.5 22 13 23.5C7.5 22 4 18 4 13.5V7L13 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
