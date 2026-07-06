import type { ReviewGroup as ReviewGroupData } from '@/state/selectors';
import { categoryLabel } from '@/state/selectors';
import { ReviewLine } from './ReviewLine';

interface ReviewGroupProps {
  group: ReviewGroupData;
}

/**
 * A labelled group of review lines (e.g., "Cameras" → v4 line + Pan v3 line).
 * See the Figma review panel.
 */
export function ReviewGroup({ group }: ReviewGroupProps) {
  return (
    <div className="border-t border-gray-400 pt-[15px]">
      <p className="mb-[8px] font-normal text-eyebrow uppercase tracking-[0.36px] text-gray-500">
        {categoryLabel(group.category)}
      </p>
      <div className="flex flex-col gap-[12px]">
        {group.lines.map((line, i) => (
          <ReviewLine
            key={`${line.product.id}::${line.variantId ?? '_'}::${i}`}
            product={line.product}
            variantId={line.variantId}
            qty={line.qty}
          />
        ))}
      </div>
    </div>
  );
}
