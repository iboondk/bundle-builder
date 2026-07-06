import { formatMoney } from '@/lib/money';

interface PriceTagProps {
  /** Compare-at price in cents (struck). Omitted when absent. */
  compareAt?: number;
  /** Current price in cents. 0 displays as "FREE". */
  current: number;
  /** Optional suffix e.g. "/mo" for plans. */
  suffix?: string;
  /**
   * Visual tone. `card` (default) = struck compare-at in danger red + current in
   * muted gray (product cards). `review` = struck compare-at in gray + current in
   * purple (review-panel lines, per Figma Frame 1736).
   */
  tone?: 'card' | 'review';
}

/**
 * Price display: optional struck compare-at + current. Right-aligned, 16px on cards,
 * 14px in the review panel. Uses the type-scale tokens; see Figma Frame 1736.
 */
export function PriceTag({ compareAt, current, suffix, tone = 'card' }: PriceTagProps) {
  const isReview = tone === 'review';
  return (
    <div
      className={`flex flex-col items-end ${
        isReview ? 'text-line-name gap-[1px]' : 'text-price gap-[3px]'
      }`}
    >
      {compareAt !== undefined && compareAt !== current && (
        <span
          className={`leading-none line-through ${isReview ? 'text-gray-600' : 'text-danger'}`}
        >
          {formatMoney(compareAt)}{suffix ?? ''}
        </span>
      )}
      <span
        className={`leading-none ${isReview ? 'font-bold text-purple' : 'font-light text-muted'}`}
      >
        {formatMoney(current, { freeWhenZero: true })}{suffix ?? ''}
      </span>
    </div>
  );
}
