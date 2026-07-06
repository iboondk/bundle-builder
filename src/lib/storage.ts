import type { BundleState } from '@/types/state';

/** Storage key. Versioned in the key name for clean invalidation across releases. */
const STORAGE_KEY = 'bundle-builder-v1';

/** The only schema version this storage layer reads. */
const CURRENT_VERSION = 1;

/**
 * Read and validate a BundleState from localStorage.
 * Returns `null` when: storage is absent, parsing fails, version mismatches,
 * or localStorage is disabled/throwing.
 */
export function readBundle(): BundleState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    // Structural validation — must be an object with the expected version.
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('version' in parsed) ||
      (parsed as Record<string, unknown>).version !== CURRENT_VERSION
    ) {
      return null;
    }

    // Basic shape check: quantities must be present.
    const candidate = parsed as Record<string, unknown>;
    if (!candidate.quantities || typeof candidate.quantities !== 'object') {
      return null;
    }

    return parsed as BundleState;
  } catch {
    // localStorage disabled, quota exceeded, or corrupt JSON — all treated as "no saved state".
    return null;
  }
}

/**
 * Persist a BundleState to localStorage. Swallows errors silently so the app
 * never crashes when storage is disabled or full.
 */
export function writeBundle(state: BundleState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or disabled — user can still use the app.
  }
}

/** Remove any saved bundle state (useful for testing). */
export function clearBundle(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
