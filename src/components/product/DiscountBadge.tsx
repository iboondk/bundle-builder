/**
 * Purple discount badge absolutely positioned on the product image.
 * Only renders when a badge label is present (data-driven).
 */
export function DiscountBadge({ label }: { label: string }) {
  return (
    <span className="absolute left-0 top-0 inline-flex items-center justify-center rounded-badge bg-purple px-[6px] py-[2px] leading-none">
      <span className="font-semibold text-badge leading-none text-white whitespace-nowrap">
        {label}
      </span>
    </span>
  );
}
