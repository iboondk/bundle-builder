import { MinusIcon, PlusIcon } from '@/components/ui/Icon';

interface QuantityStepperProps {
  /** Current quantity value. */
  value: number;
  /** Called when the user clicks +. */
  onIncrement: () => void;
  /** Called when the user clicks −. */
  onDecrement: () => void;
  /** Lowest allowed quantity. Required items floor at 1; − disables at this value. Default 0. */
  min?: number;
  /** Highest allowed quantity. + disables when value >= max. Default Infinity. */
  max?: number;
  /** When true, BOTH buttons are disabled (truly fixed items). Default false. */
  disabled?: boolean;
  /** Human-readable product name for aria-label ("Decrease quantity of ..."). */
  productName: string;
  /**
   * Visual variant. `card` (default) = minus with border, plus with gray-200 bg
   * (matches Figma product cards). `review` = both buttons white, no border
   * (matches Figma review lines).
   */
  variant?: 'card' | 'review';
}

/**
 * Reusable quantity stepper — the shared primitive for both ProductCard and ReviewLine.
 * Follows the stepper accessibility requirements (labelled ± buttons, disabled states).
 */
export function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  min = 0,
  max = Infinity,
  disabled = false,
  productName,
  variant = 'card',
}: QuantityStepperProps) {
  const decDisabled = disabled || value <= min;
  const incDisabled = disabled || value >= max;
  const isReview = variant === 'review';
  const atMin = value <= min;

  // ── Minus button styles ──────────────────────────────────────────────
  const minusClass = isReview
    ? disabled
      ? 'border border-gray-400 bg-gray-100'
      : 'bg-white'
    : atMin
      ? 'border-2 border-gray-300 bg-gray-200'
      : 'border-2 border-gray-300 bg-white';

  // ── Plus button styles ───────────────────────────────────────────────
  const plusClass = isReview
    ? disabled
      ? 'border border-gray-400 bg-gray-100'
      : 'bg-white'
    : 'bg-gray-200';

  return (
    <div className="flex items-center gap-[10px]" role="group" aria-label={`Quantity for ${productName}`}>
      <button
        type="button"
        className={`flex size-[20px] items-center justify-center rounded-stepper hover:opacity-80 disabled:opacity-40 ${minusClass}`}
        onClick={onDecrement}
        disabled={decDisabled}
        aria-disabled={decDisabled}
        aria-label={`Decrease quantity of ${productName}`}
      >
        <MinusIcon className={isReview ? 'h-[8px] w-[9px]' : 'h-[7px] w-[7px]'} />
      </button>

      <span
        className="min-w-[1ch] text-center font-medium text-stepper-num text-ink tabular-nums"
        aria-live="polite"
      >
        {value}
      </span>

      <button
        type="button"
        className={`flex size-[20px] items-center justify-center rounded-stepper hover:opacity-80 disabled:opacity-40 ${plusClass}`}
        onClick={onIncrement}
        disabled={incDisabled}
        aria-disabled={incDisabled}
        aria-label={`Increase quantity of ${productName}`}
      >
        <PlusIcon className="h-[7px] w-[7px]" />
      </button>
    </div>
  );
}
