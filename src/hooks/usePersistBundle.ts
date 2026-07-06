import { useEffect, useRef, useCallback } from 'react';
import { useBundle, useBundleDispatch } from '@/state/BundleContext';
import { readBundle, writeBundle } from '@/lib/storage';

/** Debounce delay in ms for autosave. Kept short (800ms) so writes feel instant. */
const AUTOSAVE_DELAY = 800;

/**
 * Persistence hook — hydrates on mount, autosaves on state change (debounced),
 * and exposes `saveNow()` for explicit saves. Two-way:
 * - Mount → HYDRATE from localStorage (version-checked; mismatch → seed fallback in reducer).
 * - State change → debounced writeBundle.
 */
export function usePersistBundle(): { saveNow: () => void } {
  const state = useBundle();
  const dispatch = useBundleDispatch();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Hydrate on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const saved = readBundle();
    if (saved) {
      dispatch({ type: 'HYDRATE', state: saved });
    }
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Autosave on state change (debounced) ──────────────────────────────
  useEffect(() => {
    // Clear any pending save.
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    // Schedule a new debounced write.
    timerRef.current = setTimeout(() => {
      writeBundle(state);
      timerRef.current = null;
    }, AUTOSAVE_DELAY);

    // Cleanup on unmount or before next effect runs.
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state]);

  // ── Explicit save (instant) ───────────────────────────────────────────
  const saveNow = useCallback(() => {
    // Flush any pending debounced save first.
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    writeBundle(state);
  }, [state]);

  return { saveNow };
}
