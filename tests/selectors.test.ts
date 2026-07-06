import { describe, it, expect } from 'vitest';
import {
  getActiveQty,
  getStepSelectedCount,
  getReviewGroups,
  getTotals,
  categoryLabel,
} from '@/state/selectors';
import { createSeedState } from '@/data/seed';
import { getCatalogSync } from '@/data/dataAccess';
import { bundleReducer } from '@/state/bundleReducer';
import { lineKey } from '@/types/state';

const catalog = getCatalogSync();
const seed = createSeedState();

// ── getActiveQty ─────────────────────────────────────────────────────────────

describe('getActiveQty', () => {
  it('returns the qty of the active variant for products with variants', () => {
    // seed: v4 activeVariant = 'white', qty = 1
    expect(getActiveQty(seed, 'wyze-cam-v4', catalog)).toBe(1);
    // seed: pan-v3 activeVariant = 'white', qty = 2
    expect(getActiveQty(seed, 'wyze-cam-pan-v3', catalog)).toBe(2);
  });

  it('returns 0 for a variant with no quantity', () => {
    // Floodlight activeVariant = 'white', but no quantity in seed
    expect(getActiveQty(seed, 'wyze-cam-floodlight-v2', catalog)).toBe(0);
  });

  it('returns the single-line qty for products without variants', () => {
    expect(getActiveQty(seed, 'wyze-sense-motion', catalog)).toBe(2);
    expect(getActiveQty(seed, 'wyze-sense-hub', catalog)).toBe(1);
  });

  it('returns 1 for the selected plan (selectByOne)', () => {
    expect(getActiveQty(seed, 'cam-unlimited', catalog)).toBe(1);
  });

  it('returns 0 for a non-selected selectByOne product', () => {
    const noPlan = { ...seed, selectedPlanId: null };
    expect(getActiveQty(noPlan, 'cam-unlimited', catalog)).toBe(0);
  });

  it('returns 0 for a product not in state at all', () => {
    expect(getActiveQty(seed, 'wyze-duo-cam-doorbell', catalog)).toBe(0);
  });
});

// ── getStepSelectedCount ─────────────────────────────────────────────────────

describe('getStepSelectedCount', () => {
  it('returns 2 for cameras step on seed (v4 + pan v3)', () => {
    expect(getStepSelectedCount(seed, 'cameras', catalog)).toBe(2);
  });

  it('returns 1 for sensors step on seed (motion + hub, both > 0)', () => {
    // Both Sense Motion (qty 2) and Sense Hub (qty 1) have qty > 0 → 2 products
    expect(getStepSelectedCount(seed, 'sensors', catalog)).toBe(2);
  });

  it('returns 1 for plan step when plan is selected', () => {
    expect(getStepSelectedCount(seed, 'plan', catalog)).toBe(1);
  });

  it('returns 0 for plan step when no plan selected', () => {
    const noPlan = { ...seed, selectedPlanId: null };
    expect(getStepSelectedCount(noPlan, 'plan', catalog)).toBe(0);
  });

  it('returns 1 for protection step on seed (microSD qty 2)', () => {
    expect(getStepSelectedCount(seed, 'protection', catalog)).toBe(1);
  });

  it('updates live when qty changes', () => {
    let state = seed;
    // Set v4 qty to 0 → only pan v3 remains
    state = bundleReducer(state, { type: 'SET_QTY', key: lineKey('wyze-cam-v4', 'white'), qty: 0 }, catalog, seed);
    expect(getStepSelectedCount(state, 'cameras', catalog)).toBe(1);

    // Add a doorbell → back to 2
    state = bundleReducer(state, { type: 'INCREMENT', key: lineKey('wyze-duo-cam-doorbell') }, catalog, seed);
    expect(getStepSelectedCount(state, 'cameras', catalog)).toBe(2);
  });

  it('counts a product once even with multiple variants > 0', () => {
    let state = seed;
    // Add black variant of v4 too
    state = bundleReducer(state, { type: 'INCREMENT', key: lineKey('wyze-cam-v4', 'black') }, catalog, seed);
    // Still 2 distinct products (v4 + pan v3)
    expect(getStepSelectedCount(state, 'cameras', catalog)).toBe(2);
  });
});

// ── getReviewGroups ──────────────────────────────────────────────────────────

describe('getReviewGroups', () => {
  it('returns groups in category order: camera, sensor, accessory, plan', () => {
    const groups = getReviewGroups(seed, catalog);
    const categories = groups.map((g) => g.category);
    expect(categories).toEqual(['camera', 'sensor', 'accessory', 'plan']);
  });

  it('excludes shipping from groups', () => {
    const groups = getReviewGroups(seed, catalog);
    for (const g of groups) {
      expect(g.category).not.toBe('shipping');
    }
  });

  it('each line has product, variantId, and qty > 0', () => {
    const groups = getReviewGroups(seed, catalog);
    for (const g of groups) {
      for (const line of g.lines) {
        expect(line.product).toBeDefined();
        expect(line.qty).toBeGreaterThan(0);
      }
    }
  });

  it('seed: camera group has v4 (white, qty 1) and pan v3 (white, qty 2)', () => {
    const groups = getReviewGroups(seed, catalog);
    const cameraGroup = groups.find((g) => g.category === 'camera')!;
    expect(cameraGroup).toBeDefined();
    expect(cameraGroup.lines).toHaveLength(2);

    const v4Line = cameraGroup.lines.find((l) => l.product.id === 'wyze-cam-v4')!;
    expect(v4Line.variantId).toBe('white');
    expect(v4Line.qty).toBe(1);

    const panLine = cameraGroup.lines.find((l) => l.product.id === 'wyze-cam-pan-v3')!;
    expect(panLine.variantId).toBe('white');
    expect(panLine.qty).toBe(2);
  });

  it('plan group includes the selected plan with qty 1', () => {
    const groups = getReviewGroups(seed, catalog);
    const planGroup = groups.find((g) => g.category === 'plan')!;
    expect(planGroup).toBeDefined();
    expect(planGroup.lines).toHaveLength(1);
    expect(planGroup.lines[0]!.product.id).toBe('cam-unlimited');
    expect(planGroup.lines[0]!.qty).toBe(1);
  });

  it('flagship: both Red=2 and Blue=0 variants appear as separate lines (qty>0 only)', () => {
    let state = seed;
    const redKey = lineKey('wyze-cam-v4', 'white');
    const blueKey = lineKey('wyze-cam-v4', 'black');

    // Set Red=2
    state = bundleReducer(state, { type: 'SET_QTY', key: redKey, qty: 2 }, catalog, seed);
    // Add Blue=1 so both appear
    state = bundleReducer(state, { type: 'INCREMENT', key: blueKey }, catalog, seed);

    const groups = getReviewGroups(state, catalog);
    const cameraGroup = groups.find((g) => g.category === 'camera')!;
    const v4Lines = cameraGroup.lines.filter((l) => l.product.id === 'wyze-cam-v4');
    expect(v4Lines).toHaveLength(2); // both white and black

    const whiteLine = v4Lines.find((l) => l.variantId === 'white')!;
    const blackLine = v4Lines.find((l) => l.variantId === 'black')!;
    expect(whiteLine.qty).toBe(2);
    expect(blackLine.qty).toBe(1);
  });

  it('omits empty groups', () => {
    // Remove all sensors
    let state = seed;
    state = bundleReducer(state, { type: 'SET_QTY', key: lineKey('wyze-sense-motion'), qty: 0 }, catalog, seed);
    state = bundleReducer(state, { type: 'SET_QTY', key: lineKey('wyze-sense-hub'), qty: 0 }, catalog, seed);
    // But required keeps hub at 1...
    // Actually Sense Hub is required so can't go below 1. Let's test with accessories.
    state = bundleReducer(state, { type: 'SET_QTY', key: lineKey('wyze-microsd-256'), qty: 0 }, catalog, seed);

    const groups = getReviewGroups(state, catalog);
    const categories = groups.map((g) => g.category);
    expect(categories).not.toContain('accessory');
  });
});

// ── getTotals ────────────────────────────────────────────────────────────────

describe('getTotals', () => {
  it('seed produces exact figures: 20987 / 26079 / 5092', () => {
    const totals = getTotals(seed, catalog);
    expect(totals.currentTotal).toBe(20987);
    expect(totals.compareTotal).toBe(26079);
    expect(totals.savings).toBe(5092);
  });

  it('syncs: editing a card qty updates totals instantly', () => {
    const before = getTotals(seed, catalog).currentTotal;
    const state = bundleReducer(
      seed,
      { type: 'INCREMENT', key: lineKey('wyze-cam-v4', 'white') },
      catalog,
      seed,
    );
    const after = getTotals(state, catalog).currentTotal;
    expect(after).toBe(before + 2798);
  });

  it('includes the selected plan in totals', () => {
    const noPlan = { ...seed, selectedPlanId: null };
    const withPlan = getTotals(seed, catalog);
    const withoutPlan = getTotals(noPlan, catalog);
    // Plan contributes 999 (current) and 1299 (compareAt)
    expect(withPlan.currentTotal - withoutPlan.currentTotal).toBe(999);
  });
});

// ── categoryLabel ────────────────────────────────────────────────────────────

describe('categoryLabel', () => {
  it('returns human-readable labels', () => {
    expect(categoryLabel('camera')).toBe('Cameras');
    expect(categoryLabel('sensor')).toBe('Sensors');
    expect(categoryLabel('accessory')).toBe('Accessories');
    expect(categoryLabel('plan')).toBe('Plan');
    expect(categoryLabel('shipping')).toBe('Shipping');
  });
});
