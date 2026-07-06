import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BundleProvider, useBundle } from '@/state/BundleContext';
import { usePersistBundle } from '@/hooks/usePersistBundle';
import { writeBundle, clearBundle } from '@/lib/storage';
import { createSeedState } from '@/data/seed';
import { lineKey, type BundleState } from '@/types/state';

/**
 * Integration test for M6 acceptance "Save → reload → identical UI": proves the
 * usePersistBundle hook actually hydrates saved state into a mounted tree (the
 * storage round-trip is covered separately in storage.test.ts).
 */
function Harness() {
  usePersistBundle();
  const state = useBundle();
  return (
    <div>
      <span data-testid="expanded">{state.expandedStepId ?? 'none'}</span>
      <span data-testid="v4qty">{state.quantities[lineKey('wyze-cam-v4', 'white')] ?? 0}</span>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  clearBundle();
});

describe('usePersistBundle hydrate-on-mount', () => {
  it('restores saved state into the UI on mount (not the seed)', async () => {
    // Distinct from the seed (seed: expandedStepId "cameras", v4 white qty 1).
    const saved: BundleState = {
      ...createSeedState(),
      expandedStepId: 'protection',
      quantities: { ...createSeedState().quantities, [lineKey('wyze-cam-v4', 'white')]: 7 },
    };
    writeBundle(saved);

    render(
      <BundleProvider>
        <Harness />
      </BundleProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('expanded').textContent).toBe('protection');
    });
    expect(screen.getByTestId('v4qty').textContent).toBe('7');
  });

  it('shows the seed when storage is empty', () => {
    render(
      <BundleProvider>
        <Harness />
      </BundleProvider>,
    );
    expect(screen.getByTestId('expanded').textContent).toBe('cameras');
    expect(screen.getByTestId('v4qty').textContent).toBe('1');
  });

  it('falls back to the seed when the stored version mismatches', async () => {
    writeBundle(createSeedState());
    const raw = JSON.parse(localStorage.getItem('bundle-builder-v1')!);
    raw.version = 99;
    raw.expandedStepId = 'protection';
    localStorage.setItem('bundle-builder-v1', JSON.stringify(raw));

    render(
      <BundleProvider>
        <Harness />
      </BundleProvider>,
    );

    // readBundle rejects the version → no HYDRATE → seed remains.
    await waitFor(() => {
      expect(screen.getByTestId('expanded').textContent).toBe('cameras');
    });
  });
});
