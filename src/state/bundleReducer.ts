/**
 * Bundle reducer — actions and invariants.
 *
 * Enforces every invariant from the spec. Uses product metadata (required / fixed) from the
 * catalog and falls back to the seed state on RESET or version-mismatched HYDRATE.
 */

import type { Action, BundleState } from '@/types/state';
import { parseLineKey } from '@/types/state';
import type { Product } from '@/types/catalog';
import { createSeedState } from '@/data/seed';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Find a product by id in the catalog. */
function findProduct(catalog: Product[], productId: string): Product | undefined {
  return catalog.find((p) => p.id === productId);
}

/** True when the action key belongs to a fixed (immutable) product. */
function isFixed(actionKey: string, catalog: Product[]): boolean {
  const { productId } = parseLineKey(actionKey);
  return findProduct(catalog, productId)?.fixed === true;
}

/** True when the action key belongs to a required product (qty floor = 1). */
function isRequired(actionKey: string, catalog: Product[]): boolean {
  const { productId } = parseLineKey(actionKey);
  return findProduct(catalog, productId)?.required === true;
}

// ── reducer ──────────────────────────────────────────────────────────────────

export function bundleReducer(
  state: BundleState,
  action: Action,
  catalog: Product[],
  seed: BundleState = createSeedState(),
): BundleState {
  switch (action.type) {
    // ── quantity mutations ────────────────────────────────────────────────

    case 'INCREMENT': {
      // Fixed items are immutable — ignore.
      if (isFixed(action.key, catalog)) return state;
      const prev = state.quantities[action.key] ?? 0;
      return {
        ...state,
        quantities: { ...state.quantities, [action.key]: prev + 1 },
      };
    }

    case 'DECREMENT': {
      // Fixed items are immutable — ignore.
      if (isFixed(action.key, catalog)) return state;
      const floor = isRequired(action.key, catalog) ? 1 : 0;
      const prev = state.quantities[action.key] ?? 0;
      if (prev <= floor) return state; // invariant: clamp at floor
      return {
        ...state,
        quantities: { ...state.quantities, [action.key]: prev - 1 },
      };
    }

    case 'SET_QTY': {
      // Fixed items are immutable — ignore.
      if (isFixed(action.key, catalog)) return state;
      const floor = isRequired(action.key, catalog) ? 1 : 0;
      const clamped = Math.max(floor, action.qty);
      const prev = state.quantities[action.key] ?? 0;
      if (prev === clamped) return state;
      return {
        ...state,
        quantities: { ...state.quantities, [action.key]: clamped },
      };
    }

    // ── selection mutations (never touch quantities) ──────────────────────

    case 'SELECT_VARIANT': {
      // Invariant: changes ONLY activeVariant — quantities are untouched.
      if (state.activeVariant[action.productId] === action.variantId) return state;
      return {
        ...state,
        activeVariant: { ...state.activeVariant, [action.productId]: action.variantId },
      };
    }

    case 'SELECT_PLAN': {
      // Invariant: sets selectedPlanId only; quantities untouched.
      if (state.selectedPlanId === action.planId) return state;
      return { ...state, selectedPlanId: action.planId };
    }

    // ── accordion ──────────────────────────────────────────────────────────

    case 'TOGGLE_STEP': {
      // Invariant: single-open — toggling the open step collapses it; else open it.
      const next = state.expandedStepId === action.stepId ? null : action.stepId;
      return { ...state, expandedStepId: next };
    }

    // ── persistence ────────────────────────────────────────────────────────

    case 'HYDRATE': {
      // Invariant: replace only if versions match; otherwise fall back to seed.
      if (action.state.version === state.version) return action.state;
      return seed;
    }

    case 'RESET': {
      return seed;
    }

    default:
      return state;
  }
}
