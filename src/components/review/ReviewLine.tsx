import type { Product } from '@/types/catalog';
import { lineKey } from '@/types/state';
import { useBundleDispatch } from '@/state/BundleContext';
import { QuantityStepper } from '@/components/product/QuantityStepper';
import { PriceTag } from '@/components/product/PriceTag';
import { resolveAssetUrl } from '@/data/dataAccess';

function stockMax(productId: string, variantLabel?: string): number {
  if (productId === 'wyze-microsd-256') return 23;
  const color = variantLabel?.toLowerCase() ?? '';
  if (color === 'black') return 3;
  if (color === 'white') return 50;
  return Infinity;
}

interface ReviewLineProps {
  product: Product;
  variantId: string | null;
  qty: number;
}

/** Plan name with the tier word emphasised in purple, e.g. "Cam Unlimited". */
function PlanName({ name }: { name: string }) {
  const [first, ...rest] = name.split(' ');
  if (rest.length === 0) return <>{name}</>;
  return (
    <span className="text-price font-bold leading-none tracking-[-0.032px]">
      {first}{' '}
      <span className="text-purple">{rest.join(' ')}</span>
    </span>
  );
}

/**
 * A single line in a review group: 41×41 thumbnail, product name, stepper (or
 * disabled placeholder for required/plan), and price. Two-way sync via shared store.
 * See the Figma review panel.
 */
export function ReviewLine({ product, variantId, qty }: ReviewLineProps) {
  const dispatch = useBundleDispatch();

  const key = variantId ? lineKey(product.id, variantId) : lineKey(product.id);
  const variant = variantId ? product.variants?.find((v) => v.id === variantId) : undefined;
  const unitPrice = variant?.price ?? product.price;

  const isSelectByOne = product.selectByOne === true;
  const isRequired = product.required === true;
  const isFixed = product.fixed === true;

  // Figma review lines show the plain product name (no variant suffix). We keep the
  // variant in the stepper's a11y label so screen readers can still tell lines apart.
  const ariaName = variant ? `${product.name} — ${variant.label}` : product.name;

  // Prices in the review panel are LINE TOTALS (unit × qty), matching Figma Frame 1736.
  const q = Math.max(qty, 1);
  const lineCompareAt =
    unitPrice.compareAt !== undefined ? unitPrice.compareAt * q : undefined;
  const lineCurrent = unitPrice.current * q;

  const imageSrc = resolveAssetUrl(product.image);

  return (
    <div className="flex items-center gap-[16px] py-[2px]">
      {/* Thumbnail — white rounded tile, matches Figma review lines */}
      <div className="flex size-[41px] shrink-0 items-center justify-center overflow-hidden rounded-[5px] bg-white">
        <img src={imageSrc} alt="" className="h-full w-full object-contain" aria-hidden />
      </div>

      {/* Name + stepper */}
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className="block font-medium text-line-name text-ink truncate">
            {isSelectByOne ? <PlanName name={product.name} /> : product.name}
          </span>
          {variant && (
            <span className="block text-fine-print font-normal text-gray-500 truncate">
              {variant.label}
            </span>
          )}
        </div>

        {/* Stepper or disabled placeholder */}
        <div className="shrink-0">
          {isSelectByOne || isFixed ? (
            <div aria-hidden className="h-5 w-[72px]" />
          ) : (
            <QuantityStepper
              value={qty}
              onIncrement={() => dispatch({ type: 'INCREMENT', key })}
              onDecrement={() => dispatch({ type: 'DECREMENT', key })}
              min={isRequired ? 1 : 0}
              max={stockMax(product.id, variant?.label)}
              productName={ariaName}
              variant="review"
            />
          )}
        </div>
      </div>

      {/* Price */}
      <div className="shrink-0 text-right">
        <PriceTag
          compareAt={lineCompareAt}
          current={lineCurrent}
          suffix={unitPrice.suffix}
          tone="review"
        />
      </div>
    </div>
  );
}
