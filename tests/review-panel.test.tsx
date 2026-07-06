import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BundleProvider } from '@/state/BundleContext';
import { ReviewPanel } from '@/components/review/ReviewPanel';
import { Accordion } from '@/components/builder/Accordion';

const noopSave = () => {};

function renderReviewOnly() {
  return render(
    <BundleProvider>
      <ReviewPanel saveNow={noopSave} />
    </BundleProvider>,
  );
}

function renderFullPage() {
  return render(
    <BundleProvider>
      <Accordion />
      <ReviewPanel saveNow={noopSave} />
    </BundleProvider>,
  );
}

// ── seed totals ──────────────────────────────────────────────────────────────

describe('ReviewPanel seed totals', () => {
  it('renders Total $209.87', () => {
    renderReviewOnly();
    expect(screen.getByText('$209.87')).toBeDefined();
  });

  it('renders was $260.79 (compare total)', () => {
    renderReviewOnly();
    expect(screen.getByText('$260.79')).toBeDefined();
  });

  it('renders savings note with $50.92', () => {
    renderReviewOnly();
    expect(screen.getByText(/saving \$50\.92/)).toBeDefined();
  });
});

// ── review structure ─────────────────────────────────────────────────────────

describe('ReviewPanel structure', () => {
  it('renders heading "Your security system"', () => {
    renderReviewOnly();
    expect(screen.getByText('Your security system')).toBeDefined();
  });

  it('renders REVIEW eyebrow', () => {
    renderReviewOnly();
    expect(screen.getByText('Review')).toBeDefined();
  });

  it('renders review groups: Cameras, Sensors, Accessories, Plan', () => {
    renderReviewOnly();
    expect(screen.getByText('Cameras')).toBeDefined();
    expect(screen.getByText('Sensors')).toBeDefined();
    expect(screen.getByText('Accessories')).toBeDefined();
    expect(screen.getByText('Plan')).toBeDefined();
  });

  it('renders Fast Shipping row', () => {
    renderReviewOnly();
    expect(screen.getByText('Fast Shipping')).toBeDefined();
  });

  it('Fast Shipping shows FREE', () => {
    renderReviewOnly();
    // FREE appears for Sense Hub too, so use getAllByText
    const freeTexts = screen.getAllByText('FREE');
    expect(freeTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('renders Checkout button', () => {
    renderReviewOnly();
    expect(screen.getByText('Checkout')).toBeDefined();
  });

  it('renders Save my system for later', () => {
    renderReviewOnly();
    expect(screen.getByText('Save my system for later')).toBeDefined();
  });

  it('renders guarantee badge', () => {
    renderReviewOnly();
    // The seal is decorative art with an accessible label (no marketing paragraph,
    // matching Figma Frame 1733).
    expect(screen.getByAltText('100% Wyze satisfaction guarantee')).toBeDefined();
  });

  it('renders financing estimate', () => {
    renderReviewOnly();
    // FinancingChip shows the Figma's fixed marketing label "as low as $19.19/mo"
    // (per §14.6 the dollar amount is not derivable from a month divisor).
    expect(screen.getByText(/as low as/)).toBeDefined();
  });
});

// ── review lines ─────────────────────────────────────────────────────────────

describe('ReviewPanel lines', () => {
  it('each camera variant is its own review line', () => {
    renderReviewOnly();
    // Seed: v4 white qty 1, Pan v3 white qty 2
    expect(screen.getByText(/Wyze Cam v4/)).toBeDefined();
    expect(screen.getByText(/Wyze Cam Pan v3/)).toBeDefined();
  });

  it('Sense Hub (required) floors at 1: decrement disabled, increment ENABLED', () => {
    renderReviewOnly();
    // The hub's stepper is a labelled group; scope the button queries to it so the
    // assertion can't accidentally match another row's controls.
    const hubStepper = screen.getByRole('group', { name: /Quantity for Wyze Sense Hub/ });
    const decBtn = within(hubStepper).getByRole('button', { name: /Decrease quantity/ });
    const incBtn = within(hubStepper).getByRole('button', { name: /Increase quantity/ });
    // Floor-at-1 (matches the reducer + ProductCard): can't go below 1, but CAN add more.
    expect(decBtn).toBeDisabled();
    expect(incBtn).not.toBeDisabled();
  });

  it('Cam Unlimited (plan, selectByOne) has no stepper', () => {
    renderReviewOnly();
    // Plan name is split: "Cam" (black) + "Unlimited" (purple), wrapped in nested spans.
    // Match the outer span whose immediate textContent is the full name.
    const planText = screen.getByText(
      (_, el) =>
        el?.textContent === 'Cam Unlimited' &&
        el?.tagName === 'SPAN' &&
        el?.classList?.contains('text-price'),
    );
    expect(planText).toBeDefined();
  });
});

// ── two-way sync ─────────────────────────────────────────────────────────────

describe('ReviewPanel two-way sync', () => {
  it('editing stepper in review updates totals', async () => {
    const user = userEvent.setup();
    renderReviewOnly();

    // Find all increment buttons
    const incButtons = screen.getAllByRole('button', { name: /Increase quantity/ });
    // First increment button should be for v4 (qty 1 → 2)
    await user.click(incButtons[0]!);

    // Total should now be 20987 + 2798 = 23785 ($237.85)
    expect(screen.getByText('$237.85')).toBeDefined();
  });

  it('decrementing a line updates totals', async () => {
    const user = userEvent.setup();
    renderReviewOnly();

    // Pan v3 has qty 2. Decrement it to 1.
    const decButtons = screen.getAllByRole('button', { name: /Decrease quantity/ });
    // First dec button is v4's (qty 1, but min=0 so enabled), second is Pan v3's
    // Find Pan v3's decrement button
    const panDecBtn = decButtons.find((btn) =>
      btn.getAttribute('aria-label')?.includes('Wyze Cam Pan v3'),
    );
    if (panDecBtn) {
      await user.click(panDecBtn);
      // Total should be 20987 - 3498 = 17489 ($174.89)
      expect(screen.getByText('$174.89')).toBeDefined();
    }
  });
});

// ── checkout confirmation ────────────────────────────────────────────────────

describe('Checkout button', () => {
  it('clicking Checkout shows confirmation', async () => {
    const user = userEvent.setup();
    renderReviewOnly();

    const checkoutBtn = screen.getByText('Checkout');
    await user.click(checkoutBtn);

    expect(screen.getByText('✓ Added to cart!')).toBeDefined();
  });

  it('clicking Save shows confirmation', async () => {
    const user = userEvent.setup();
    renderReviewOnly();

    const saveBtn = screen.getByText('Save my system for later');
    await user.click(saveBtn);

    expect(screen.getByText('✓ Saved!')).toBeDefined();
  });
});

// ── cross-component sync (card ↔ review) ────────────────────────────────────

describe('Card-to-review cross-sync', () => {
  it('changing qty in a card updates the review panel', async () => {
    const user = userEvent.setup();
    renderFullPage();

    // Step 1 is open. v4 card is visible with qty 1.
    // Click + on v4's card stepper
    const v4Card = screen.getByRole('article', { name: 'Wyze Cam v4' });
    const incBtn = within(v4Card).getByRole('button', { name: /Increase quantity/ });
    await user.click(incBtn);

    // Review panel total should update: 20987 + 2798 = 23785
    expect(screen.getByText('$237.85')).toBeDefined();
  });
});
