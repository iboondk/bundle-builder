/**
 * Money formatting — integer cents in, display string out.
 * All arithmetic elsewhere stays in integer cents; formatting happens only at the render edge.
 */

/**
 * Format integer cents as `$X.XX`. A `current` price of 0 is treated as "FREE" by callers
 * that pass `freeWhenZero` (matches the design's FREE labels for Sense Hub / Fast Shipping).
 */
export function formatMoney(cents: number, opts: { freeWhenZero?: boolean } = {}): string {
  if (opts.freeWhenZero && cents === 0) return 'FREE';
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const remainder = (abs % 100).toString().padStart(2, '0');
  return `${sign}$${dollars}.${remainder}`;
}

/** Convenience: money with a suffix like "/mo". */
export function formatMoneyWithSuffix(cents: number, suffix?: string): string {
  return suffix ? `${formatMoney(cents)}${suffix}` : formatMoney(cents);
}
