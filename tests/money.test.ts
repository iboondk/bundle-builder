import { describe, it, expect } from 'vitest';
import { formatMoney, formatMoneyWithSuffix } from '@/lib/money';

describe('formatMoney', () => {
  it('formats cents as $X.XX', () => {
    expect(formatMoney(2798)).toBe('$27.98');
    expect(formatMoney(18789)).toBe('$187.89');
    expect(formatMoney(5)).toBe('$0.05');
    expect(formatMoney(100)).toBe('$1.00');
  });

  it('renders 0 as FREE only when freeWhenZero is set', () => {
    expect(formatMoney(0)).toBe('$0.00');
    expect(formatMoney(0, { freeWhenZero: true })).toBe('FREE');
  });

  it('appends a suffix when provided', () => {
    expect(formatMoneyWithSuffix(999, '/mo')).toBe('$9.99/mo');
    expect(formatMoneyWithSuffix(999)).toBe('$9.99');
  });
});
