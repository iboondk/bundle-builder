import { describe, it, expect, beforeEach } from 'vitest';
import { readBundle, writeBundle, clearBundle } from '@/lib/storage';
import { createSeedState } from '@/data/seed';
import type { BundleState } from '@/types/state';
import { lineKey } from '@/types/state';

// ── helpers ──────────────────────────────────────────────────────────────────

/** localStorage mock wraps the real thing but isolates tests. */
function setupStorage() {
  localStorage.clear();
  clearBundle();
}

beforeEach(setupStorage);

function makeState(overrides?: Partial<BundleState>): BundleState {
  return { ...createSeedState(), ...overrides };
}

// ── read/write round-trip ────────────────────────────────────────────────────

describe('storage read/write', () => {
  it('writes and reads back identical state', () => {
    const state = makeState();
    writeBundle(state);
    const restored = readBundle();
    expect(restored).toEqual(state);
  });

  it('returns null when nothing is saved', () => {
    expect(readBundle()).toBeNull();
  });

  it('preserves quantities, activeVariant, plan, and expanded step', () => {
    const state = makeState({
      quantities: { [lineKey('wyze-cam-v4', 'black')]: 5 },
      activeVariant: { 'wyze-cam-v4': 'black' },
      selectedPlanId: 'cam-unlimited',
      expandedStepId: 'sensors',
    });
    writeBundle(state);
    const restored = readBundle()!;
    expect(restored.quantities[lineKey('wyze-cam-v4', 'black')]).toBe(5);
    expect(restored.activeVariant['wyze-cam-v4']).toBe('black');
    expect(restored.selectedPlanId).toBe('cam-unlimited');
    expect(restored.expandedStepId).toBe('sensors');
  });
});

// ── version mismatch → null ──────────────────────────────────────────────────

describe('version mismatch', () => {
  it('returns null when stored version differs', () => {
    writeBundle(makeState());
    // Corrupt the stored version
    const raw = JSON.parse(localStorage.getItem('bundle-builder-v1')!);
    raw.version = 99;
    localStorage.setItem('bundle-builder-v1', JSON.stringify(raw));

    expect(readBundle()).toBeNull();
  });
});

// ── corruption → null ────────────────────────────────────────────────────────

describe('corruption handling', () => {
  it('returns null for invalid JSON', () => {
    localStorage.setItem('bundle-builder-v1', 'not-valid-json{{{');
    expect(readBundle()).toBeNull();
  });

  it('returns null for missing quantities field', () => {
    localStorage.setItem('bundle-builder-v1', JSON.stringify({ version: 1 }));
    expect(readBundle()).toBeNull();
  });

  it('returns null for non-object stored value', () => {
    localStorage.setItem('bundle-builder-v1', '"just a string"');
    expect(readBundle()).toBeNull();
  });
});

// ── clear ────────────────────────────────────────────────────────────────────

describe('clearBundle', () => {
  it('removes the stored state', () => {
    writeBundle(makeState());
    expect(readBundle()).not.toBeNull();
    clearBundle();
    expect(readBundle()).toBeNull();
  });
});

// ── localStorage disabled simulation ─────────────────────────────────────────

describe('storage resilience', () => {
  it('writeBundle does not throw when storage is full (simulated)', () => {
    // Simulate quota error by temporarily breaking setItem
    const orig = localStorage.setItem;
    localStorage.setItem = () => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    };
    expect(() => writeBundle(makeState())).not.toThrow();
    localStorage.setItem = orig;
  });

  it('readBundle does not throw when storage throws', () => {
    const orig = localStorage.getItem;
    localStorage.getItem = () => {
      throw new Error('SecurityError');
    };
    expect(readBundle()).toBeNull();
    localStorage.getItem = orig;
  });
});
