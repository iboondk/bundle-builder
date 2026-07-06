import { useCallback } from 'react';
import type { Product } from '@/types/catalog';
import { lineKey } from '@/types/state';
import { useBundle, useBundleDispatch } from '@/state/BundleContext';
import { getActiveQty } from '@/state/selectors';
import { getCatalogSync, resolveAssetUrl } from '@/data/dataAccess';
import { QuantityStepper } from './QuantityStepper';
import { PlanSelectButton } from './PlanSelectButton';
import { VariantSelector } from './VariantSelector';
import { DiscountBadge } from './DiscountBadge';
import { PriceTag } from './PriceTag';
import { LearnMoreLink } from './LearnMoreLink';

interface ProductCardProps {
  product: Product;
}

const catalog = getCatalogSync();

/** Stock caps per business rules */
function stockMax(productId: string, variantLabel?: string): number {
  if (productId === 'wyze-microsd-256') return 23;
  const color = variantLabel?.toLowerCase() ?? '';
  if (color === 'black') return 3;
  if (color === 'white') return 50;
  return Infinity;
}

/**
 * The reusable product card — see Figma node 68:9793.
 *
 * Data-driven: every element (badge, description, variants, price) renders only when
 * the product data defines it. No hardcoded product markup.
 */
export function ProductCard({ product }: ProductCardProps) {
  const state = useBundle();
  const dispatch = useBundleDispatch();

  const activeQty = getActiveQty(state, product.id, catalog);
  const selected = activeQty > 0;

  // The active variant id for this product (null if product has no variants).
  const activeVariantId: string | null =
    product.variants && product.variants.length > 0
      ? (state.activeVariant[product.id] ?? product.variants[0]!.id)
      : null;

  // LineKey for the active variant (or the variant-less product).
  const activeLineKey = activeVariantId
    ? lineKey(product.id, activeVariantId)
    : lineKey(product.id);

  const handleIncrement = useCallback(() => {
    dispatch({ type: 'INCREMENT', key: activeLineKey });
  }, [dispatch, activeLineKey]);

  const handleDecrement = useCallback(() => {
    dispatch({ type: 'DECREMENT', key: activeLineKey });
  }, [dispatch, activeLineKey]);

  const handleSelectVariant = useCallback(
    (variantId: string) => {
      dispatch({ type: 'SELECT_VARIANT', productId: product.id, variantId });
    },
    [dispatch, product.id],
  );

  const handleSelectPlan = useCallback(() => {
    dispatch({ type: 'SELECT_PLAN', planId: product.id });
  }, [dispatch, product.id]);

  const imageSrc = resolveAssetUrl(product.image);
  const isSelectByOne = product.selectByOne === true;
  const isRequired = product.required === true;

  // Determine the price for the active variant (falls back to product price).
  const activeVariant = activeVariantId
    ? product.variants?.find((v) => v.id === activeVariantId)
    : undefined;
  const unitPrice = activeVariant?.price ?? product.price;

  return (
    <article
      className={`flex items-center gap-card-gap overflow-hidden rounded-card bg-white p-card-pad md:flex-col md:items-start md:min-w-[200px] md:max-w-[240px] md:flex-shrink-0 lg:flex-row lg:items-center lg:min-w-0 lg:max-w-none lg:flex-shrink ${
        selected
          ? 'border-2 border-purple-selected'
          : ''
      }`}
      aria-label={product.name}
    >
      {/* ── Product image ─────────────────────────────────────────────── */}
      <div className="relative h-[137px] w-[101px] shrink-0 overflow-hidden rounded-product-img bg-white md:h-[160px] md:w-full lg:h-[137px] lg:w-[101px]">
        <img
          src={imageSrc}
          alt={product.name}
          className="h-full w-full object-contain"
        />
        {product.badge && <DiscountBadge label={product.badge} />}
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
        {/* Title + description + Learn More */}
        <div className="flex flex-col gap-[8px]">
          <h3 className="font-semibold text-card-title leading-none tracking-[0.6px] text-ink-title">
            {product.name}
          </h3>
          {(product.description || product.learnMoreUrl) && (
            <p className="text-desc font-medium leading-[1.3] text-muted-2">
              {product.description}
              {product.description && product.learnMoreUrl && ' '}
              {product.learnMoreUrl && <LearnMoreLink url={product.learnMoreUrl} />}
            </p>
          )}
        </div>

        {/* Variant selector */}
        {product.variants && product.variants.length > 0 && (
          <VariantSelector
            variants={product.variants}
            selectedVariantId={activeVariantId}
            onSelect={handleSelectVariant}
          />
        )}

        {/* Bottom row: stepper + price */}
        <div className="flex items-end justify-between gap-[6px]">
          {isSelectByOne ? (
            <PlanSelectButton
              selected={selected}
              onSelect={handleSelectPlan}
              productName={product.name}
            />
          ) : (
            <QuantityStepper
              value={activeQty}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              min={isRequired ? 1 : 0}
              max={stockMax(product.id, activeVariant?.label)}
              disabled={product.fixed === true}
              productName={product.name}
            />
          )}
          <PriceTag
            compareAt={unitPrice.compareAt}
            current={unitPrice.current}
            suffix={unitPrice.suffix}
          />
        </div>
      </div>
    </article>
  );
}
