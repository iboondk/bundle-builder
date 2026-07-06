interface PlanSelectButtonProps {
  /** Whether this plan is the currently selected one. */
  selected: boolean;
  /** Select this plan (dispatches SELECT_PLAN). */
  onSelect: () => void;
  /** Product name for the accessible label. */
  productName: string;
}

/**
 * Selection control for a `selectByOne` product (the plan). Radio semantics:
 * clicking selects this plan exclusively via SELECT_PLAN. Occupies the
 * stepper's slot in the card's bottom row.
 */
export function PlanSelectButton({ selected, onSelect, productName }: PlanSelectButtonProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      aria-label={`Select ${productName}`}
      className={`flex h-[24px] items-center justify-center rounded-stepper px-4 font-semibold text-variant-label uppercase tracking-[0.6px] transition-colors ${
        selected
          ? 'bg-purple text-white'
          : 'border border-gray-400 bg-white text-ink-title hover:border-gray-500'
      }`}
    >
      {selected ? 'Selected' : 'Select'}
    </button>
  );
}
