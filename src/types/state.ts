/**
 * Bundle state contracts and invariants.
 *
 * A LineKey uniquely identifies a purchasable line: a product plus (optionally) a variant.
 * Format: `${productId}::${variantId ?? '_'}`. This is the reason each variant can hold an
 * independent quantity (the flagship requirement).
 */

import type { StepId } from './catalog';

export type LineKey = string; // `${productId}::${variantId ?? '_'}`

export interface BundleState {
  /** The single source of truth for quantities, keyed by LineKey. */
  quantities: Record<LineKey, number>;
  /** Currently selected variant per product id (view state; never mutates quantities). */
  activeVariant: Record<string, string>;
  /** The exclusively selected plan id, or null. */
  selectedPlanId: string | null;
  /** The single open accordion step, or null if all collapsed. */
  expandedStepId: StepId | null;
  /** Storage schema version for safe hydration. */
  version: 1;
}

export type Action =
  | { type: 'INCREMENT'; key: LineKey }
  | { type: 'DECREMENT'; key: LineKey }
  | { type: 'SET_QTY'; key: LineKey; qty: number }
  | { type: 'SELECT_VARIANT'; productId: string; variantId: string }
  | { type: 'SELECT_PLAN'; planId: string }
  | { type: 'TOGGLE_STEP'; stepId: StepId }
  | { type: 'HYDRATE'; state: BundleState }
  | { type: 'RESET' };

/** Build a LineKey from a product id and optional variant id. */
export function lineKey(productId: string, variantId?: string | null): LineKey {
  return `${productId}::${variantId ?? '_'}`;
}

/** Parse a LineKey back into its parts. variantId is null when the line has no variant. */
export function parseLineKey(key: LineKey): { productId: string; variantId: string | null } {
  const [productId, variantToken] = key.split('::');
  return {
    productId: productId ?? '',
    variantId: !variantToken || variantToken === '_' ? null : variantToken,
  };
}
