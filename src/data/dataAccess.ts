/**
 * Data-access layer — the single seam between the app and its data source.
 * The app fetches the catalog from the backend API (`GET /api/catalog`, see
 * server/index.mjs) at startup via `loadCatalog()`, and falls back to the bundled
 * JSON if the API is unreachable so the UI never breaks.
 * See public/assets/README.md for the asset layout.
 */

import rawCatalog from './catalog.json';
import type { Product } from '@/types/catalog';

const ASSET_BASE = '/assets/products';

/**
 * Resolve a catalog asset reference to a servable URL. Kept in one place for easy CDN swap.
 * - Absolute paths ("/x") pass through.
 * - Sub-foldered refs ("swatches/x.png", "icons/y.svg") resolve under `/assets`.
 * - Bare filenames ("wyze-cam-v4.png") default to the products folder.
 */
export function resolveAssetUrl(ref: string): string {
  if (ref.startsWith('/')) return ref;
  return ref.includes('/') ? `/assets/${ref}` : `${ASSET_BASE}/${ref}`;
}

/**
 * Module-level catalog cache. Seeded with the bundled JSON so synchronous accessors
 * (and the test suite) always have data; `loadCatalog()` replaces it with the API
 * response at startup.
 */
let catalog = rawCatalog as Product[];

/**
 * Fetch the catalog from the backend API and populate the cache. Called once from
 * `main.tsx` before the app renders. On any failure (API down, timeout, bad payload)
 * it keeps the bundled fallback, so the UI still works from a clean clone.
 */
export async function loadCatalog(): Promise<Product[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('/api/catalog', { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as Product[];
    if (Array.isArray(data) && data.length > 0) catalog = data;
  } catch {
    // Keep the bundled fallback already in `catalog`.
  }
  return catalog;
}

/** Returns the full product catalog (from the cache populated by `loadCatalog`). */
export async function getCatalog(): Promise<Product[]> {
  return Promise.resolve(catalog);
}

/** Synchronous accessor for code paths that must run without awaiting (e.g. selectors/tests). */
export function getCatalogSync(): Product[] {
  return catalog;
}

/** Look up a single product by id. */
export function getProductById(id: string): Product | undefined {
  return catalog.find((p) => p.id === id);
}
