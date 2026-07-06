/**
 * Bundle selectors — pure functions: they read state
 * and catalog and return derived data. They never mutate inputs.
 */

import type { BundleState } from '@/types/state';
import { lineKey, parseLineKey } from '@/types/state';
import type { Category, Product, StepId } from '@/types/catalog';
import { computeTotals, resolveUnit } from '@/lib/pricing';
import type { PricingLine } from '@/lib/pricing';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Build a map from product id → Product for O(1) lookup. */
function productMap(catalog: Product[]): Map<string, Product> {
  const m = new Map<string, Product>();
  for (const p of catalog) m.set(p.id, p);
  return m;
}

/** All quantity lines (from quantities map + selected plan), with qty > 0. */
interface RawLine {
  productId: string;
  variantId: string | null;
  qty: number;
}

function* allRawLines(state: BundleState, catalog: Product[]): Generator<RawLine> {
  const byId = productMap(catalog);

  // 1. Lines from the quantities map.
  for (const [key, qty] of Object.entries(state.quantities)) {
    if (qty <= 0) continue;
    const { productId, variantId } = parseLineKey(key);
    yield { productId, variantId, qty };
  }

  // 2. selectByOne products tracked via selectedPlanId (not in quantities).
  if (state.selectedPlanId) {
    const plan = byId.get(state.selectedPlanId);
    if (plan?.selectByOne) {
      // Only add if the plan isn't already present in quantities (defensive).
      const planKey = lineKey(state.selectedPlanId);
      if (!(planKey in state.quantities) || (state.quantities[planKey] ?? 0) <= 0) {
        yield { productId: state.selectedPlanId, variantId: null, qty: 1 };
      }
    }
  }
}

// ── public selectors ─────────────────────────────────────────────────────────

/**
 * Quantity of the product's active variant (or the single line for products without variants).
 * For selectByOne products (plan) tracked via selectedPlanId, returns 1 if selected, else 0.
 */
export function getActiveQty(state: BundleState, productId: string, catalog: Product[]): number {
  const product = productMap(catalog).get(productId);

  // selectByOne products are tracked via selectedPlanId, not quantities.
  if (product?.selectByOne) {
    return state.selectedPlanId === productId ? 1 : 0;
  }

  const variantId = state.activeVariant[productId] ?? null;
  const key = variantId ? lineKey(productId, variantId) : lineKey(productId);
  return state.quantities[key] ?? 0;
}

/**
 * Count of distinct products in a step with total qty > 0. A product counts once even
 * when multiple of its variants have qty > 0.
 */
export function getStepSelectedCount(
  state: BundleState,
  stepId: StepId,
  catalog: Product[],
): number {
  let count = 0;
  for (const product of catalog) {
    if (product.stepId !== stepId) continue;

    if (product.selectByOne) {
      if (state.selectedPlanId === product.id) count++;
      continue;
    }

    // Sum quantities across all variant lines for this product.
    const total = totalProductQty(state, product);
    if (total > 0) count++;
  }
  return count;
}

/** Sum of quantities across all variant lines for a product. */
function totalProductQty(state: BundleState, product: Product): number {
  if (product.variants && product.variants.length > 0) {
    let total = 0;
    for (const v of product.variants) {
      total += state.quantities[lineKey(product.id, v.id)] ?? 0;
    }
    return total;
  }
  return state.quantities[lineKey(product.id)] ?? 0;
}

// ── review groups ────────────────────────────────────────────────────────────

/** One line in a review group. */
export interface ReviewLine {
  product: Product;
  variantId: string | null;
  qty: number;
}

/** A labelled group of review lines sharing a category. */
export interface ReviewGroup {
  category: Category;
  lines: ReviewLine[];
}

/** Category display order for review groups. Shipping is excluded from groups. */
const CATEGORY_ORDER: Category[] = ['camera', 'sensor', 'accessory', 'plan'];

/** Group label overrides (camelCase → human). */
const CATEGORY_LABELS: Record<Category, string> = {
  camera: 'Cameras',
  sensor: 'Sensors',
  accessory: 'Accessories',
  plan: 'Plan',
  shipping: 'Shipping',
};

/** Human-readable label for a review group category. */
export function categoryLabel(category: Category): string {
  return CATEGORY_LABELS[category];
}

/**
 * Build the review-panel groups: one group per category (in order), one line per
 * (product, variant) with qty > 0. Lines are never merged across variants.
 * Shipping is excluded — it renders in the totals area.
 */
export function getReviewGroups(state: BundleState, catalog: Product[]): ReviewGroup[] {
  const byId = productMap(catalog);
  const groups = new Map<Category, ReviewLine[]>();

  // Initialise empty groups in display order.
  for (const cat of CATEGORY_ORDER) {
    groups.set(cat, []);
  }

  for (const raw of allRawLines(state, catalog)) {
    const product = byId.get(raw.productId);
    if (!product) continue;

    // Shipping lines render in the totals area, not as a group.
    if (product.category === 'shipping') continue;

    const cat = product.category;
    let groupLines = groups.get(cat);
    // Categories not in CATEGORY_ORDER (shouldn't happen) get their own group.
    if (!groupLines) {
      groupLines = [];
      groups.set(cat, groupLines);
    }

    groupLines.push({
      product,
      variantId: raw.variantId,
      qty: raw.qty,
    });
  }

  // Return only non-empty groups in display order.
  const result: ReviewGroup[] = [];
  for (const cat of CATEGORY_ORDER) {
    const lines = groups.get(cat);
    if (lines && lines.length > 0) {
      result.push({ category: cat, lines });
    }
  }
  // Append any extra categories beyond the standard order.
  for (const [cat, lines] of groups) {
    if (!CATEGORY_ORDER.includes(cat) && lines.length > 0) {
      result.push({ category: cat, lines });
    }
  }

  return result;
}

// ── totals ───────────────────────────────────────────────────────────────────

export interface BundleTotals {
  currentTotal: number;
  compareTotal: number;
  savings: number;
}

/**
 * Compute bundle totals from review-group lines only (quantities + selected plan).
 * Shipping (countsTowardSavings=false) is excluded from ALL totals — its compareAt
 * does not inflate the "was" price, matching the seed's authoritative $238.81 figure.
 */
export function getTotals(state: BundleState, catalog: Product[]): BundleTotals {
  const byId = productMap(catalog);
  const lines: PricingLine[] = [];

  for (const raw of allRawLines(state, catalog)) {
    const product = byId.get(raw.productId);
    if (!product) continue;

    // Lines with countsTowardSavings=false (shipping) render in the totals UI area
    // but are not part of the numerical totals per the spec's seed verification.
    if (product.countsTowardSavings === false) continue;

    const variant = raw.variantId
      ? product.variants?.find((v) => v.id === raw.variantId)
      : undefined;
    const unit = resolveUnit(product, variant);

    lines.push({
      unit,
      qty: raw.qty,
      countsTowardSavings: true,
    });
  }

  return computeTotals(lines);
}
