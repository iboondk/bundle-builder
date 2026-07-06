/**
 * Pricing rules. All arithmetic operates on integer cents; formatting happens at render.
 */

import type { Money, Product, Variant } from '@/types/catalog';

/** Number of months used for the financing estimate. */
export const FINANCING_MONTHS = 12;

/** Resolve the effective Money for a line, falling back from variant to product price. */
export function resolveUnit(product: Product, variant?: Variant): Money {
  return variant?.price ?? product.price;
}

/** Current-price total for a single line: unit.current × qty. */
export function lineCurrent(unit: Money, qty: number): number {
  return unit.current * qty;
}

/** Compare-at total for a single line: (unit.compareAt ?? unit.current) × qty. */
export function lineCompare(unit: Money, qty: number): number {
  return (unit.compareAt ?? unit.current) * qty;
}

/**
 * Savings contribution for a single line. Items without a compareAt contribute 0.
 * Lines with countsTowardSavings=false always contribute 0 (e.g. Fast Shipping).
 */
export function lineSavings(unit: Money, qty: number, countsTowardSavings: boolean): number {
  if (!countsTowardSavings) return 0;
  return ((unit.compareAt ?? unit.current) - unit.current) * qty;
}

/** A resolved line ready for total computation. */
export interface PricingLine {
  unit: Money;
  qty: number;
  countsTowardSavings: boolean;
}

/** Aggregate totals for a set of pricing lines. */
export function computeTotals(lines: PricingLine[]): {
  currentTotal: number;
  compareTotal: number;
  savings: number;
} {
  let currentTotal = 0;
  let compareTotal = 0;
  let savings = 0;
  for (const line of lines) {
    currentTotal += lineCurrent(line.unit, line.qty);
    compareTotal += lineCompare(line.unit, line.qty);
    savings += lineSavings(line.unit, line.qty, line.countsTowardSavings);
  }
  return { currentTotal, compareTotal, savings };
}

/** Estimated monthly financing: round(currentTotal / FINANCING_MONTHS). */
export function financingMonthly(currentTotal: number): number {
  return Math.round(currentTotal / FINANCING_MONTHS);
}
