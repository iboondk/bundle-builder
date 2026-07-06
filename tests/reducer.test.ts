import { describe, it, expect } from 'vitest';
import { bundleReducer } from '@/state/bundleReducer';
import { createSeedState } from '@/data/seed';
import { getCatalogSync } from '@/data/dataAccess';
import { lineKey } from '@/types/state';
import type { BundleState } from '@/types/state';

const catalog = getCatalogSync();
const seed = createSeedState();

/** Shorthand: create a fresh seed for a test (so tests don't share mutable state). */
function freshSeed(): BundleState {
  return createSeedState();
}

// ── INCREMENT ────────────────────────────────────────────────────────────────

describe('INCREMENT', () => {
  it('adds 1 to an existing quantity', () => {
    const state = freshSeed();
    const next = bundleReducer(state, { type: 'INCREMENT', key: lineKey('wyze-cam-v4', 'white') }, catalog, seed);
    expect(next.quantities[lineKey('wyze-cam-v4', 'white')]).toBe(2);
  });

  it('sets quantity to 1 for a key not yet in state', () => {
    const state = freshSeed();
    const key = lineKey('wyze-cam-v4', 'black');
    const next = bundleReducer(state, { type: 'INCREMENT', key }, catalog, seed);
    expect(next.quantities[key]).toBe(1);
  });

  it('ignores fixed (immutable) products', () => {
    const state = freshSeed();
    const key = lineKey('fast-shipping');
    const next = bundleReducer(state, { type: 'INCREMENT', key }, catalog, seed);
    expect(next.quantities[key]).toBe(1); // unchanged (seed has 1)
  });
});

// ── DECREMENT ────────────────────────────────────────────────────────────────

describe('DECREMENT', () => {
  it('subtracts 1 from an existing quantity', () => {
    const state = freshSeed();
    const key = lineKey('wyze-cam-pan-v3', 'white');
    const next = bundleReducer(state, { type: 'DECREMENT', key }, catalog, seed);
    expect(next.quantities[key]).toBe(1); // was 2
  });

  it('clamps at 0 for normal products', () => {
    const state = freshSeed();
    // wyze-duo-cam-doorbell has qty 0 in seed; decrementing does nothing
    const key = lineKey('wyze-duo-cam-doorbell');
    const next = bundleReducer(state, { type: 'DECREMENT', key }, catalog, seed);
    expect(next.quantities[key] ?? 0).toBe(0);
  });

  it('clamps at 1 for required products (Sense Hub)', () => {
    const state = freshSeed();
    const key = lineKey('wyze-sense-hub');
    const next = bundleReducer(state, { type: 'DECREMENT', key }, catalog, seed);
    expect(next.quantities[key]).toBe(1); // unchanged — floor is 1
  });

  it('removes a line when qty reaches 0', () => {
    let state = freshSeed();
    // Add 1 to get a qty-1 line, then decrement
    state = bundleReducer(state, { type: 'INCREMENT', key: lineKey('wyze-duo-cam-doorbell') }, catalog, seed);
    expect(state.quantities[lineKey('wyze-duo-cam-doorbell')]).toBe(1);
    state = bundleReducer(state, { type: 'DECREMENT', key: lineKey('wyze-duo-cam-doorbell') }, catalog, seed);
    expect(state.quantities[lineKey('wyze-duo-cam-doorbell')] ?? 0).toBe(0);
  });

  it('ignores fixed (immutable) products', () => {
    const state = freshSeed();
    const key = lineKey('fast-shipping');
    const next = bundleReducer(state, { type: 'DECREMENT', key }, catalog, seed);
    expect(next.quantities[key]).toBe(1); // unchanged
  });
});

// ── SET_QTY ──────────────────────────────────────────────────────────────────

describe('SET_QTY', () => {
  it('sets quantity to the given value', () => {
    const state = freshSeed();
    const key = lineKey('wyze-cam-v4', 'white');
    const next = bundleReducer(state, { type: 'SET_QTY', key, qty: 5 }, catalog, seed);
    expect(next.quantities[key]).toBe(5);
  });

  it('clamps negative values at 0 (or 1 for required)', () => {
    const state = freshSeed();
    const normalKey = lineKey('wyze-sense-motion');
    const next = bundleReducer(state, { type: 'SET_QTY', key: normalKey, qty: -5 }, catalog, seed);
    expect(next.quantities[normalKey]).toBe(0);
  });

  it('clamps required products at 1', () => {
    const state = freshSeed();
    const key = lineKey('wyze-sense-hub');
    const next = bundleReducer(state, { type: 'SET_QTY', key, qty: 0 }, catalog, seed);
    expect(next.quantities[key]).toBe(1);
  });

  it('ignores fixed products', () => {
    const state = freshSeed();
    const key = lineKey('fast-shipping');
    const next = bundleReducer(state, { type: 'SET_QTY', key, qty: 999 }, catalog, seed);
    expect(next.quantities[key]).toBe(1); // unchanged
  });

  it('is a no-op when value equals current', () => {
    const state = freshSeed();
    const key = lineKey('wyze-cam-v4', 'white');
    const next = bundleReducer(state, { type: 'SET_QTY', key, qty: 1 }, catalog, seed);
    expect(next).toBe(state); // same reference
  });
});

// ── SELECT_VARIANT (flagship) ────────────────────────────────────────────────

describe('SELECT_VARIANT', () => {
  it('changes activeVariant only — never mutates quantities', () => {
    const state = freshSeed();
    const qtyBefore = { ...state.quantities };
    const next = bundleReducer(state, { type: 'SELECT_VARIANT', productId: 'wyze-cam-v4', variantId: 'black' }, catalog, seed);
    expect(next.activeVariant['wyze-cam-v4']).toBe('black');
    expect(next.quantities).toEqual(qtyBefore); // quantities untouched
  });

  it('is a no-op when variant is already selected', () => {
    const state = freshSeed();
    const next = bundleReducer(state, { type: 'SELECT_VARIANT', productId: 'wyze-cam-v4', variantId: 'white' }, catalog, seed);
    expect(next).toBe(state); // same reference
  });

  it('flagship: Red=2 → select Blue → Blue=0, Red=2, both lines exist', () => {
    // Build state: Red qty=2, Blue qty=0
    let state = freshSeed();
    const redKey = lineKey('wyze-cam-v4', 'white'); // "Red" = white variant
    const blueKey = lineKey('wyze-cam-v4', 'black'); // "Blue" = black variant

    // Set Red=2 (white variant)
    state = bundleReducer(state, { type: 'SET_QTY', key: redKey, qty: 2 }, catalog, seed);
    expect(state.quantities[redKey]).toBe(2);
    expect(state.quantities[blueKey] ?? 0).toBe(0);

    // Select Blue — must NOT change Red's qty
    state = bundleReducer(state, { type: 'SELECT_VARIANT', productId: 'wyze-cam-v4', variantId: 'black' }, catalog, seed);
    expect(state.quantities[redKey]).toBe(2); // Red still 2
    expect(state.quantities[blueKey] ?? 0).toBe(0); // Blue still 0
    expect(state.activeVariant['wyze-cam-v4']).toBe('black'); // active changed

    // Both lines should appear in review (one with qty 2, one with qty 0 — but only qty>0 renders)
    // This is verified in selectors test — here we just confirm the state invariant.
  });
});

// ── SELECT_PLAN ──────────────────────────────────────────────────────────────

describe('SELECT_PLAN', () => {
  it('sets selectedPlanId only — never mutates quantities', () => {
    const state = freshSeed();
    const qtyBefore = { ...state.quantities };
    const next = bundleReducer(state, { type: 'SELECT_PLAN', planId: 'cam-unlimited' }, catalog, seed);
    expect(next.selectedPlanId).toBe('cam-unlimited');
    expect(next.quantities).toEqual(qtyBefore);
  });

  it('is a no-op when plan is already selected', () => {
    const state = freshSeed();
    const next = bundleReducer(state, { type: 'SELECT_PLAN', planId: 'cam-unlimited' }, catalog, seed);
    expect(next).toBe(state);
  });
});

// ── TOGGLE_STEP ──────────────────────────────────────────────────────────────

describe('TOGGLE_STEP', () => {
  it('opens a closed step', () => {
    const state = { ...freshSeed(), expandedStepId: null };
    const next = bundleReducer(state, { type: 'TOGGLE_STEP', stepId: 'sensors' }, catalog, seed);
    expect(next.expandedStepId).toBe('sensors');
  });

  it('collapses the open step when toggled again', () => {
    const state = freshSeed(); // expandedStepId = 'cameras'
    const next = bundleReducer(state, { type: 'TOGGLE_STEP', stepId: 'cameras' }, catalog, seed);
    expect(next.expandedStepId).toBeNull();
  });

  it('switches from one step to another (single-open)', () => {
    const state = freshSeed(); // cameras open
    const next = bundleReducer(state, { type: 'TOGGLE_STEP', stepId: 'plan' }, catalog, seed);
    expect(next.expandedStepId).toBe('plan');
  });
});

// ── HYDRATE ──────────────────────────────────────────────────────────────────

describe('HYDRATE', () => {
  it('replaces state when versions match', () => {
    const state = freshSeed();
    const hydrated: BundleState = {
      ...freshSeed(),
      quantities: { [lineKey('wyze-cam-v4', 'white')]: 99 },
    };
    const next = bundleReducer(state, { type: 'HYDRATE', state: hydrated }, catalog, seed);
    expect(next.quantities[lineKey('wyze-cam-v4', 'white')]).toBe(99);
  });

  it('falls back to seed when version mismatches', () => {
    const state = freshSeed();
    const badVersion: BundleState = { ...freshSeed(), version: 99 as 1 };
    const next = bundleReducer(state, { type: 'HYDRATE', state: badVersion }, catalog, seed);
    expect(next).toEqual(seed); // fell back to seed
  });
});

// ── RESET ─────────────────────────────────────────────────────────────────────

describe('RESET', () => {
  it('returns the seed state', () => {
    const state = freshSeed();
    // Mutate state first
    let next = bundleReducer(state, { type: 'SET_QTY', key: lineKey('wyze-cam-v4', 'white'), qty: 99 }, catalog, seed);
    expect(next.quantities[lineKey('wyze-cam-v4', 'white')]).toBe(99);

    // Reset
    next = bundleReducer(next, { type: 'RESET' }, catalog, seed);
    expect(next).toEqual(seed);
  });
});

// ── additional invariants ────────────────────────────────────────────────────

describe('state invariants (§7)', () => {
  it('quantity is always an integer ≥ 0', () => {
    let state = freshSeed();
    // Decrement a 0-qty product
    state = bundleReducer(state, { type: 'DECREMENT', key: lineKey('wyze-duo-cam-doorbell') }, catalog, seed);
    for (const qty of Object.values(state.quantities)) {
      expect(Number.isInteger(qty)).toBe(true);
      expect(qty).toBeGreaterThanOrEqual(0);
    }
  });

  it('required items never go below 1', () => {
    const state = freshSeed();
    const key = lineKey('wyze-sense-hub');
    // Try multiple decrements
    let next = state;
    for (let i = 0; i < 10; i++) {
      next = bundleReducer(next, { type: 'DECREMENT', key }, catalog, seed);
    }
    expect(next.quantities[key]).toBe(1);
  });

  it('fixed items ignore all quantity mutations', () => {
    const state = freshSeed();
    const key = lineKey('fast-shipping');
    const afterInc = bundleReducer(state, { type: 'INCREMENT', key }, catalog, seed);
    const afterDec = bundleReducer(state, { type: 'DECREMENT', key }, catalog, seed);
    const afterSet = bundleReducer(state, { type: 'SET_QTY', key, qty: 99 }, catalog, seed);
    expect(afterInc.quantities[key]).toBe(1);
    expect(afterDec.quantities[key]).toBe(1);
    expect(afterSet.quantities[key]).toBe(1);
  });

  it('SELECT_VARIANT does not mutate any quantity', () => {
    const state = freshSeed();
    const qtyBefore = { ...state.quantities };
    const next = bundleReducer(state, { type: 'SELECT_VARIANT', productId: 'wyze-battery-cam-pro', variantId: 'black' }, catalog, seed);
    expect(next.quantities).toEqual(qtyBefore);
  });
});
