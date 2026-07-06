import type { StepId } from '@/types/catalog';
import { useBundleDispatch } from '@/state/BundleContext';

interface NextButtonProps {
  /** The step to advance to. */
  nextStepId: StepId;
  /** Display title of the next step. */
  nextStepTitle: string;
}

/** Step order for determining what comes next. */
const STEP_ORDER: StepId[] = ['cameras', 'plan', 'sensors', 'protection'];

/**
 * "Next: {next step title}" button displayed at the bottom of an expanded step.
 * Advances the accordion and focuses the next step header.
 */
export function NextButton({ nextStepId, nextStepTitle }: NextButtonProps) {
  const dispatch = useBundleDispatch();

  const handleClick = () => {
    // Open the next step (single-open means this also collapses current).
    dispatch({ type: 'TOGGLE_STEP', stepId: nextStepId });

    // Focus the next step's header after the DOM updates.
    // We schedule this after paint via rAF.
    requestAnimationFrame(() => {
      const nextIndex = STEP_ORDER.indexOf(nextStepId);
      const headerButton = document.querySelector<HTMLButtonElement>(
        `[data-step-header="${nextIndex}"]`,
      );
      headerButton?.focus();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mx-auto mt-0 flex h-[39px] w-[242px] items-center justify-center rounded-next-btn border border-purple bg-lavender-surface font-semibold text-next-btn text-purple hover:opacity-80"
    >
      Next: {nextStepTitle}
    </button>
  );
}
