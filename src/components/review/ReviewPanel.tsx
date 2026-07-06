import { useMemo } from 'react';
import { useBundle } from '@/state/BundleContext';
import { getReviewGroups, getTotals } from '@/state/selectors';
import { getCatalogSync } from '@/data/dataAccess';
import { formatMoney } from '@/lib/money';
import { ReviewGroup } from './ReviewGroup';
import { SavingsNote } from './SavingsNote';
import { FinancingChip } from './FinancingChip';
import { GuaranteeBadge } from './GuaranteeBadge';
import { CheckoutButton } from './CheckoutButton';
import { SaveForLater } from './SaveForLater';
import { PriceTag } from '@/components/product/PriceTag';
import type { Product } from '@/types/catalog';

const catalog = getCatalogSync();

function getShippingProduct(): Product | undefined {
  return catalog.find((p) => p.category === 'shipping');
}

interface ReviewPanelProps {
  saveNow?: () => void;
}

export function ReviewPanel({ saveNow }: ReviewPanelProps) {
  const state = useBundle();
  const groups = useMemo(() => getReviewGroups(state, catalog), [state]);
  const totals = useMemo(() => getTotals(state, catalog), [state]);
  const shipping = getShippingProduct();

  return (
    <aside id="review-panel" aria-label="Order review" className="lg:sticky lg:top-8">
      {/* ── Card container ── */}
      <div className="rounded-card bg-lavender-surface px-[32px] py-[32px] -mx-4 rounded-none md:-mx-6 md:rounded-card lg:mx-0">

        {/* ── Header ── */}
        <div className="mb-[32px]">
          <p className="mb-[6px] text-eyebrow font-normal uppercase tracking-[0.36px] text-gray-700">
            Review
          </p>
          <h2 className="mb-[6px] font-semibold text-step-title leading-none text-ink-title">
            Your security system
          </h2>
          <p className="text-line-name font-medium leading-[1.3] text-muted-2">
            Review your personalized protection system designed to keep what matters most safe.
          </p>
        </div>

        {/* ── Two-column body (tablet only; desktop review is narrow sidebar) ── */}
        <div className="grid grid-cols-1 gap-[32px] md:grid-cols-[1.1fr_0.9fr] md:gap-[56px] md:items-start lg:grid-cols-1 lg:gap-[24px]">

          {/* ── LEFT: Product Column ── */}
          <div className="flex flex-col gap-[24px]">
            {groups.map((group) => (
              <ReviewGroup key={group.category} group={group} />
            ))}

            {shipping && (
              <div className="flex items-center gap-[12px] border-t border-gray-400 pt-[15px]">
                <img
                  src="/assets/icons/delivery.svg"
                  alt=""
                  className="size-[41px] shrink-0"
                  aria-hidden
                />
                <span className="flex-1 font-medium text-line-name text-ink">
                  {shipping.name}
                </span>
                <PriceTag
                  compareAt={shipping.price.compareAt}
                  current={shipping.price.current}
                  tone="review"
                />
              </div>
            )}
          </div>

          {/* ── RIGHT: Checkout Column ── */}
          <div className="flex flex-col gap-[24px]">
            {/* Return policy — hidden on desktop */}
            <div className="flex flex-col gap-[4px] lg:hidden">
              <h3 className="text-line-name font-semibold text-ink-title">
                30-day hassle-free returns
              </h3>
              <p className="text-desc leading-[1.4] text-gray-600">
                If you&rsquo;re not totally in love with the product, we will refund you 100%.
              </p>
            </div>

            {/* Guarantee badge + monthly payment */}
            <div className="flex items-start gap-[16px]">
              <GuaranteeBadge />
              <div className="flex flex-col items-start gap-[8px]">
                <FinancingChip currentTotal={totals.currentTotal} />
                <div className="flex items-baseline gap-[8px]">
                  {totals.compareTotal !== totals.currentTotal && (
                    <span className="text-total-strike font-medium text-gray-600 line-through">
                      {formatMoney(totals.compareTotal)}
                    </span>
                  )}
                  <span className="text-total-current font-bold text-purple">
                    {formatMoney(totals.currentTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Savings + Checkout */}
            <div className="flex flex-col gap-[8px]">
              <SavingsNote savings={totals.savings} />
              <CheckoutButton />
            </div>

            {/* Save for later */}
            <div className="text-center">
              {saveNow && <SaveForLater saveNow={saveNow} />}
            </div>
          </div>

        </div>
      </div>
    </aside>
  );
}
