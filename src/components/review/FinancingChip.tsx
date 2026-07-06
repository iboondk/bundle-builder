interface FinancingChipProps {
  currentTotal: number;
}

/**
 * "as low as $19.19/mo" financing pill — purple chip above the totals, matching
 * Figma Frame 1733 exactly. This is the Figma's fixed marketing label (not derivable
 * from any clean month divisor of the total), so it is shown verbatim rather than computed.
 */
export function FinancingChip({ currentTotal }: FinancingChipProps) {
  if (currentTotal <= 0) return null;

  return (
    <span className="inline-flex items-center justify-center rounded-[3px] bg-purple px-[8px] py-[5px] text-badge font-medium leading-none tracking-[-0.6px] text-white whitespace-nowrap">
      as low as $19.19/mo
    </span>
  );
}
