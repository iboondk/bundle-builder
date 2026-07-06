import type { StepId } from '@/types/catalog';
import { TriangleDown } from '@/components/ui/Icon';
import { StepIcon } from './StepIcon';

interface StepHeaderProps {
  stepId: StepId;
  title: string;
  selectedCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  /** ID for the controlled panel (aria-controls). */
  panelId: string;
  /** ID for this header button (aria-labelledby target). */
  headerId: string;
  /** Index for data attribute (used by NextButton to focus). */
  stepIndex: number;
}

/**
 * Accordion step header row — clickable button with category icon, title, selected
 * count (expanded only), and filled triangle indicator. When expanded it is transparent
 * (it lives inside the lavender step panel); when collapsed it is a white row bounded
 * by thin dividers.
 * The STEP X OF 4 eyebrow is rendered by AccordionStep (always on the white page).
 */
export function StepHeader({
  stepId,
  title,
  selectedCount,
  isExpanded,
  onToggle,
  panelId,
  headerId,
  stepIndex,
}: StepHeaderProps) {
  return (
    <button
      id={headerId}
      type="button"
      onClick={onToggle}
      aria-expanded={isExpanded}
      aria-controls={panelId}
      data-step-header={stepIndex}
      className={`flex w-full items-center ${
        isExpanded ? 'pb-[10px]' : 'border-y border-ink-title py-5'
      }`}
    >
      <StepIcon stepId={stepId} className="h-[26px] w-[26px] shrink-0" />
      <span className="ml-[8px] flex-1 text-left font-semibold text-step-title text-ink">
        {title}
      </span>
      <span className="ml-2 flex items-center gap-[4px]">
        {/* "N selected" badge — only shown when the step is expanded */}
        {isExpanded && (
          <span className="font-medium text-line-name whitespace-nowrap text-purple">
            {selectedCount} selected
          </span>
        )}
        <span
          className={`flex h-3 w-3 items-center justify-center transition-transform ${
            isExpanded ? 'rotate-180 text-purple' : 'text-gray-500'
          }`}
          aria-hidden
        >
          <TriangleDown className="h-[10px] w-[10px]" />
        </span>
      </span>
    </button>
  );
}
