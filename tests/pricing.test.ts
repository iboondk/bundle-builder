import { describe, it, expect } from 'vitest';
import {
  resolveUnit,
  lineCurrent,
  lineCompare,
  lineSavings,
  computeTotals,
  financingMonthly,
  FINANCING_MONTHS,
} from '@/lib/pricing';
import type { PricingLine } from '@/lib/pricing';
import { getCatalogSync, getProductById } from '@/data/dataAccess';
import { createSeedState } from '@/data/seed';
import { lineKey } from '@/types/state';
import { getTotals } from '@/state/selectors';

// ── unit-level pricing ───────────────────────────────────────────────────────

describe('resolveUnit', () => {
  it('returns product price when variant has no override', () => {
    const product = getProductById('wyze-cam-v4')!;
    const variant = product.variants![0]!;
    // variant has no price override → falls back to product.price
    expect(resolveUnit(product, variant)).toBe(product.price);
  });

  it('returns variant price when present', () => {
    const product = getProductById('wyze-cam-v4')!;
    const variant = { ...product.variants![0]!, price: { current: 1999 } };
    expect(resolveUnit(product, variant)).toBe(variant.price);
  });
});

describe('lineCurrent', () => {
  it('multiplies unit.current by qty', () => {
    expect(lineCurrent({ current: 2798 }, 1)).toBe(2798);
    expect(lineCurrent({ current: 3498 }, 2)).toBe(6996);
    expect(lineCurrent({ current: 0 }, 5)).toBe(0);
  });
});

describe('lineCompare', () => {
  it('uses compareAt when present', () => {
    expect(lineCompare({ compareAt: 3598, current: 2798 }, 1)).toBe(3598);
  });

  it('falls back to current when compareAt is absent', () => {
    expect(lineCompare({ current: 6998 }, 1)).toBe(6998);
  });
});

describe('lineSavings', () => {
  it('returns difference × qty when compareAt exists', () => {
    expect(lineSavings({ compareAt: 3598, current: 2798 }, 1, true)).toBe(800);
    expect(lineSavings({ compareAt: 3998, current: 3498 }, 2, true)).toBe(1000);
  });

  it('returns 0 when no compareAt', () => {
    expect(lineSavings({ current: 2999 }, 2, true)).toBe(0);
  });

  it('returns 0 when countsTowardSavings is false', () => {
    expect(lineSavings({ compareAt: 599, current: 0 }, 1, false)).toBe(0);
  });
});

// ── totals ───────────────────────────────────────────────────────────────────

describe('computeTotals', () => {
  it('sums an array of pricing lines', () => {
    const lines: PricingLine[] = [
      { unit: { compareAt: 1000, current: 800 }, qty: 1, countsTowardSavings: true },
      { unit: { current: 500 }, qty: 2, countsTowardSavings: true },
    ];
    const result = computeTotals(lines);
    expect(result.currentTotal).toBe(1800); // 800 + 1000
    expect(result.compareTotal).toBe(2000); // 1000 + 1000
    expect(result.savings).toBe(200); // (1000-800)*1 + 0
  });

  it('returns zeros for empty lines', () => {
    const result = computeTotals([]);
    expect(result).toEqual({ currentTotal: 0, compareTotal: 0, savings: 0 });
  });
});

// ── seed verification (BUILD_SPEC §8) ────────────────────────────────────────

describe('seed totals (BUILD_SPEC §8)', () => {
  const catalog = getCatalogSync();
  const seed = createSeedState();

  it('currentTotal = 20987 ($209.87)', () => {
    const totals = getTotals(seed, catalog);
    expect(totals.currentTotal).toBe(20987);
  });

  it('compareTotal = 26079 ($260.79)', () => {
    const totals = getTotals(seed, catalog);
    expect(totals.compareTotal).toBe(26079);
  });

  it('savings = 5092 ($50.92)', () => {
    const totals = getTotals(seed, catalog);
    expect(totals.savings).toBe(5092);
  });

  it('shipping compareAt ($5.99) is NOT in savings', () => {
    // Fast Shipping has compareAt 599 but countsTowardSavings=false → contributes 0
    const shipping = getProductById('fast-shipping')!;
    const savings = lineSavings(shipping.price, 1, false);
    expect(savings).toBe(0);
  });
});

// ── qty-change recompute ─────────────────────────────────────────────────────

describe('pricing recomputes on qty change', () => {
  const catalog = getCatalogSync();
  const seed = createSeedState();

  it('adding one more v4 increases currentTotal by 2798', () => {
    const before = getTotals(seed, catalog).currentTotal;
    const modified = {
      ...seed,
      quantities: {
        ...seed.quantities,
        [lineKey('wyze-cam-v4', 'white')]: 2, // was 1
      },
    };
    const after = getTotals(modified, catalog).currentTotal;
    expect(after - before).toBe(2798);
  });

  it('removing all motion sensors decreases currentTotal correctly', () => {
    const before = getTotals(seed, catalog).currentTotal;
    const modified = {
      ...seed,
      quantities: {
        ...seed.quantities,
        [lineKey('wyze-sense-motion')]: 0, // was 2
      },
    };
    const after = getTotals(modified, catalog).currentTotal;
    expect(before - after).toBe(5998); // 2 × 2999
  });
});

// ── financing ────────────────────────────────────────────────────────────────

describe('financingMonthly', () => {
  it('divides by FINANCING_MONTHS and rounds', () => {
    expect(FINANCING_MONTHS).toBe(12);
    expect(financingMonthly(20987)).toBe(Math.round(20987 / 12));
  });

  it('returns 0 for zero total', () => {
    expect(financingMonthly(0)).toBe(0);
  });
});
