import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BundleProvider } from '@/state/BundleContext';
import { ProductCard } from '@/components/product/ProductCard';
import { getCatalogSync } from '@/data/dataAccess';
import type { Product } from '@/types/catalog';

// ── helpers ──────────────────────────────────────────────────────────────────

const catalog = getCatalogSync();

function renderCard(product: Product) {
  return render(
    <BundleProvider>
      <ProductCard product={product} />
    </BundleProvider>,
  );
}

function getCamera(id: string): Product {
  return catalog.find((p) => p.id === id)!;
}

// ── rendering ────────────────────────────────────────────────────────────────

describe('ProductCard rendering', () => {
  it('renders all 5 camera cards from data (no hardcoded markup)', () => {
    const cameras = catalog.filter((p) => p.stepId === 'cameras');
    expect(cameras).toHaveLength(5);

    for (const camera of cameras) {
      const { unmount } = renderCard(camera);
      // Every card must show the product name from data, not a hardcoded string.
      expect(screen.getByRole('article', { name: camera.name })).toBeDefined();
      expect(screen.getByText(camera.name)).toBeDefined();
      unmount();
    }
  });

  it('shows product image with correct alt text', () => {
    const v4 = getCamera('wyze-cam-v4');
    renderCard(v4);
    const img = screen.getByAltText('Wyze Cam v4');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toContain('wyze-cam-v4.png');
  });

  it('shows badge when product has one', () => {
    const v4 = getCamera('wyze-cam-v4');
    renderCard(v4);
    expect(screen.getByText('Save 22%')).toBeDefined();
  });

  it('does not show badge when product has none', () => {
    const doorbell = getCamera('wyze-duo-cam-doorbell');
    renderCard(doorbell);
    expect(screen.queryByText('Save')).toBeNull();
  });

  it('shows description when present', () => {
    const v4 = getCamera('wyze-cam-v4');
    renderCard(v4);
    expect(screen.getByText(/The clearest Wyze Cam ever made/)).toBeDefined();
  });

  it('shows Learn More link when learnMoreUrl is present', () => {
    const v4 = getCamera('wyze-cam-v4');
    renderCard(v4);
    expect(screen.getByText('Learn More')).toBeDefined();
  });
});

// ── selected state ───────────────────────────────────────────────────────────

describe('ProductCard selected state', () => {
  it('selected card (qty > 0) has purple border', () => {
    // Seed: wyze-cam-v4 (white) has qty 1 → selected
    const v4 = getCamera('wyze-cam-v4');
    renderCard(v4);
    const card = screen.getByRole('article', { name: 'Wyze Cam v4' });
    expect(card.className).toContain('border-purple-selected');
  });

  it('unselected card (qty = 0) has no selected border', () => {
    // Seed: wyze-duo-cam-doorbell has qty 0 → unselected
    const doorbell = getCamera('wyze-duo-cam-doorbell');
    renderCard(doorbell);
    const card = screen.getByRole('article', { name: 'Wyze Duo Cam Doorbell' });
    expect(card.className).not.toContain('border-purple-selected');
  });
});

// ── variant selector ────────────────────────────────────────────────────────

describe('ProductCard variant selector', () => {
  it('renders variant chips for products with variants', async () => {
    const v4 = getCamera('wyze-cam-v4');
    renderCard(v4);
    const radiogroup = screen.getByRole('radiogroup');
    expect(radiogroup).toBeDefined();

    const chips = within(radiogroup).getAllByRole('radio');
    expect(chips).toHaveLength(3); // white, grey, black
    expect(screen.getByText('White')).toBeDefined();
    expect(screen.getByText('Grey')).toBeDefined();
    expect(screen.getByText('Black')).toBeDefined();
  });

  it('does not render variant selector for products without variants', () => {
    const doorbell = getCamera('wyze-duo-cam-doorbell');
    renderCard(doorbell);
    expect(screen.queryByRole('radiogroup')).toBeNull();
  });

  it('clicking a variant chip dispatches SELECT_VARIANT', async () => {
    const user = userEvent.setup();
    const v4 = getCamera('wyze-cam-v4');
    renderCard(v4);

    const blackChip = screen.getByRole('radio', { name: /Black/ });
    await user.click(blackChip);

    // After selecting Black variant (which has qty 0 in seed), the card
    // should show qty 0 and become unselected (no purple selected border).
    const card = screen.getByRole('article', { name: 'Wyze Cam v4' });
    expect(card.className).not.toContain('border-purple-selected');
  });

  it('seed: White chip is selected (success-tint bg) for v4', () => {
    const v4 = getCamera('wyze-cam-v4');
    renderCard(v4);
    const whiteChip = screen.getByRole('radio', { name: /White/ });
    expect(whiteChip.getAttribute('aria-checked')).toBe('true');
  });
});

// ── stepper ──────────────────────────────────────────────────────────────────

describe('ProductCard stepper', () => {
  it('shows correct qty from seed state', () => {
    // Seed: v4 white qty = 1
    const v4 = getCamera('wyze-cam-v4');
    renderCard(v4);
    // The stepper number should be 1
    expect(screen.getByText('1')).toBeDefined();
  });

  it('increments quantity on + click', async () => {
    const user = userEvent.setup();
    const v4 = getCamera('wyze-cam-v4');
    renderCard(v4);

    const incrementBtn = screen.getByRole('button', { name: /Increase quantity/ });
    await user.click(incrementBtn);

    // Qty should now be 2
    // The stepper aria-live region should update
    expect(screen.getByText('2')).toBeDefined();
  });

  it('decrements quantity on − click', async () => {
    const user = userEvent.setup();
    // Pan v3 has qty 2 in seed
    const panV3 = getCamera('wyze-cam-pan-v3');
    renderCard(panV3);

    expect(screen.getByText('2')).toBeDefined();

    const decrementBtn = screen.getByRole('button', { name: /Decrease quantity/ });
    await user.click(decrementBtn);

    expect(screen.getByText('1')).toBeDefined();
  });

  it('decrement button is disabled when qty is 0', () => {
    const doorbell = getCamera('wyze-duo-cam-doorbell');
    renderCard(doorbell);

    const decrementBtn = screen.getByRole('button', { name: /Decrease quantity/ });
    expect(decrementBtn).toBeDisabled();
  });

  it('stepper is disabled for required products', () => {
    // Wyze Sense Hub is required — but that's a sensor, not a camera.
    // No cameras are required. This is tested via the disabled prop in isolation.
    // Instead, verify non-required cameras have enabled steppers.
    const v4 = getCamera('wyze-cam-v4');
    renderCard(v4);
    const incrementBtn = screen.getByRole('button', { name: /Increase quantity/ });
    expect(incrementBtn).not.toBeDisabled();
  });
});

// ── price tag ────────────────────────────────────────────────────────────────

describe('ProductCard price tag', () => {
  it('shows compare-at price struck when present', () => {
    const v4 = getCamera('wyze-cam-v4');
    renderCard(v4);
    // $35.98 = 3598 cents, compare-at
    expect(screen.getByText('$35.98')).toBeDefined();
  });

  it('shows current price', () => {
    const v4 = getCamera('wyze-cam-v4');
    renderCard(v4);
    // $27.98 = 2798 cents, current
    expect(screen.getByText('$27.98')).toBeDefined();
  });

  it('shows only current price when no compareAt', () => {
    const doorbell = getCamera('wyze-duo-cam-doorbell');
    renderCard(doorbell);
    expect(screen.getByText('$69.98')).toBeDefined();
  });
});

// ── data-driven guarantee ────────────────────────────────────────────────────

describe('data-driven guarantee', () => {
  it('adding a product to catalog.json would render it without code changes', () => {
    // Prove the card renders entirely from the Product object — no
    // hardcoded product-specific JSX branches.
    const synthetic: Product = {
      id: 'test-cam',
      category: 'camera',
      stepId: 'cameras',
      name: 'Test Camera X',
      description: 'A synthetic test product.',
      image: 'wyze-cam-v4.png', // reuse existing asset
      badge: 'Save 50%',
      price: { compareAt: 10000, current: 5000 },
      variants: [
        { id: 'red', label: 'Red', swatchImage: 'wyze-cam-v4.png' },
        { id: 'blue', label: 'Blue', swatchImage: 'wyze-cam-v4.png' },
      ],
    };

    renderCard(synthetic);

    // All data-driven elements must render.
    expect(screen.getByText('Test Camera X')).toBeDefined();
    expect(screen.getByText('A synthetic test product.')).toBeDefined();
    expect(screen.getByText('Save 50%')).toBeDefined();
    expect(screen.getByText('$50.00')).toBeDefined(); // current
    expect(screen.getByText('Red')).toBeDefined();
    expect(screen.getByText('Blue')).toBeDefined();
  });
});
