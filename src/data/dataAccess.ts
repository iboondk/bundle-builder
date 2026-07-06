/**
 * Data-access layer — the single seam between the app and its data source.
 * Today it reads a bundled local JSON file; because the surface is async, swapping to a
 * REST/serverless API later is a one-line change here.
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

/** The typed product catalog. Imported JSON is validated by the type guard below in tests. */
const catalog = rawCatalog as Product[];

/**
 * Returns the full product catalog. Async by design so a future implementation can be:
 *   `return (await fetch('/api/catalog')).json();`
 */
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
