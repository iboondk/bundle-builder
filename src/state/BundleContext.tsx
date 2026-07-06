/**
 * Bundle context — provider + typed hooks.
 *
 * Splits state and dispatch into separate contexts so components that only dispatch
 * (e.g. stepper buttons) don't re-render on every state change.
 */
/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { Action, BundleState } from '@/types/state';
import { bundleReducer } from './bundleReducer';
import { createSeedState } from '@/data/seed';
import { getCatalogSync } from '@/data/dataAccess';

// ── contexts ─────────────────────────────────────────────────────────────────

const BundleStateContext = createContext<BundleState | null>(null);
const BundleDispatchContext = createContext<Dispatch<Action> | null>(null);

// ── provider ─────────────────────────────────────────────────────────────────

export function BundleProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  /** Override the starting state (tests only). Defaults to the authoritative seed. */
  initialState?: BundleState;
}) {
  // Memoize catalog + seed once — they never change at runtime.
  const { catalog, seed } = useMemo(
    () => ({ catalog: getCatalogSync(), seed: createSeedState() }),
    [],
  );

  const [state, dispatch] = useReducer(
    (s: BundleState, a: Action) => bundleReducer(s, a, catalog, seed),
    initialState ?? seed,
  );

  return (
    <BundleStateContext.Provider value={state}>
      <BundleDispatchContext.Provider value={dispatch}>
        {children}
      </BundleDispatchContext.Provider>
    </BundleStateContext.Provider>
  );
}

// ── hooks ────────────────────────────────────────────────────────────────────

/** Read the current bundle state. Re-renders only when state changes. */
export function useBundle(): BundleState {
  const ctx = useContext(BundleStateContext);
  if (ctx === null) {
    throw new Error('useBundle must be used within a <BundleProvider>');
  }
  return ctx;
}

/** Get the dispatch function. Does NOT re-render on state changes. */
export function useBundleDispatch(): Dispatch<Action> {
  const ctx = useContext(BundleDispatchContext);
  if (ctx === null) {
    throw new Error('useBundleDispatch must be used within a <BundleProvider>');
  }
  return ctx;
}
