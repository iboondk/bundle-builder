import { describe, it, expect } from 'vitest';
import { getCatalog, getCatalogSync, getProductById } from '@/data/dataAccess';
import type { Category, Product } from '@/types/catalog';

const CATEGORIES: Category[] = ['camera', 'sensor', 'accessory', 'plan', 'shipping'];

/** Minimal runtime type guard — proves catalog.json matches the Product contract. */
function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Record<string, unknown>;
  if (typeof p.id !== 'string' || typeof p.name !== 'string') return false;
  if (typeof p.image !== 'string') return false;
  if (!CATEGORIES.includes(p.category as Category)) return false;
  const price = p.price as Record<string, unknown> | undefined;
  if (!price || typeof price.current !== 'number' || !Number.isInteger(price.current)) return false;
  if (price.compareAt !== undefined && !Number.isInteger(price.compareAt)) return false;
  return true;
}

describe('catalog data', () => {
  it('getCatalog resolves all 10 products', async () => {
    const catalog = await getCatalog();
    expect(catalog).toHaveLength(10);
  });

  it('every entry satisfies the Product runtime guard', () => {
    for (const product of getCatalogSync()) {
      expect(isProduct(product), `invalid product: ${JSON.stringify(product)}`).toBe(true);
    }
  });

  it('all prices are integer cents', () => {
    for (const p of getCatalogSync()) {
      expect(Number.isInteger(p.price.current)).toBe(true);
      for (const v of p.variants ?? []) {
        if (v.price) expect(Number.isInteger(v.price.current)).toBe(true);
      }
    }
  });

  it('matches the authoritative seed figures (BUILD_SPEC §6)', () => {
    const v4 = getProductById('wyze-cam-v4');
    expect(v4?.price).toEqual({ compareAt: 3598, current: 2798 });
    expect(v4?.variants?.map((v) => v.id)).toEqual(['white', 'grey', 'black']);

    const hub = getProductById('wyze-sense-hub');
    expect(hub?.required).toBe(true);
    expect(hub?.price).toEqual({ compareAt: 2992, current: 0 });

    const plan = getProductById('cam-unlimited');
    expect(plan?.selectByOne).toBe(true);
    expect(plan?.price.suffix).toBe('/mo');

    const shipping = getProductById('fast-shipping');
    expect(shipping?.fixed).toBe(true);
    expect(shipping?.countsTowardSavings).toBe(false);
  });

  it('doorbell has no variant selector', () => {
    expect(getProductById('wyze-duo-cam-doorbell')?.variants).toBeUndefined();
  });
});
