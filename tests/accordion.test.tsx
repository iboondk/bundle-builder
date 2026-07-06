import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BundleProvider } from '@/state/BundleContext';
import { Accordion } from '@/components/builder/Accordion';
import { createSeedState } from '@/data/seed';
import type { BundleState } from '@/types/state';

function renderAccordion(initialState?: BundleState) {
  return render(
    <BundleProvider initialState={initialState}>
      <Accordion />
    </BundleProvider>,
  );
}

// ── accordion structure ──────────────────────────────────────────────────────

describe('Accordion structure', () => {
  it('renders all 4 steps', () => {
    renderAccordion();
    expect(screen.getByText('Choose your cameras')).toBeDefined();
    expect(screen.getByText('Choose your plan')).toBeDefined();
    expect(screen.getByText('Choose your sensors')).toBeDefined();
    expect(screen.getByText('Add extra protection')).toBeDefined();
  });

  it('shows STEP X OF 4 eyebrows', () => {
    renderAccordion();
    expect(screen.getByText('Step 1 of 4')).toBeDefined();
    expect(screen.getByText('Step 2 of 4')).toBeDefined();
    expect(screen.getByText('Step 3 of 4')).toBeDefined();
    expect(screen.getByText('Step 4 of 4')).toBeDefined();
  });

  it('headers are buttons with aria-expanded', () => {
    renderAccordion();
    const buttons = screen.getAllByRole('button').filter((b) => b.getAttribute('aria-expanded') !== null);
    expect(buttons.length).toBe(4);
  });
});

// ── single-open behaviour ────────────────────────────────────────────────────

describe('Accordion single-open', () => {
  it('Step 1 is open initially (seed)', () => {
    renderAccordion();
    const step1Btn = screen.getAllByRole('button').find(
      (b) => b.getAttribute('aria-expanded') === 'true',
    );
    expect(step1Btn).toBeDefined();
    expect(step1Btn!.textContent).toContain('Choose your cameras');
  });

  it('only one step is open at a time', async () => {
    const user = userEvent.setup();
    renderAccordion();

    // Click Step 2 header
    const step2Header = screen.getByText('Choose your plan').closest('button')!;
    await user.click(step2Header);

    // Now Step 2 should be expanded and Step 1 should be collapsed
    const expanded = screen.getAllByRole('button').filter(
      (b) => b.getAttribute('aria-expanded') === 'true',
    );
    expect(expanded.length).toBe(1);
    expect(expanded[0]!.textContent).toContain('Choose your plan');
  });

  it('toggling the open step collapses it', async () => {
    const user = userEvent.setup();
    renderAccordion();

    // Step 1 is open. Click it again.
    const step1Header = screen.getByText('Choose your cameras').closest('button')!;
    await user.click(step1Header);

    // No step should be expanded
    const expanded = screen.getAllByRole('button').filter(
      (b) => b.getAttribute('aria-expanded') === 'true',
    );
    expect(expanded.length).toBe(0);
  });
});

// ── selected counts ──────────────────────────────────────────────────────────

describe('Accordion selected counts', () => {
  it('shows "2 selected" on expanded cameras step (seed)', () => {
    renderAccordion();
    // Only expanded steps show the count. Step 1 (cameras) is open → "2 selected".
    const selectedCounts = screen.getAllByText('2 selected');
    expect(selectedCounts.length).toBe(1);
  });

  it('collapsed steps do not show "N selected" text', () => {
    renderAccordion();
    // Steps 2-4 are collapsed — their "1 selected" / "2 selected" labels are hidden.
    // Only cameras (expanded) shows "2 selected".
    expect(screen.queryByText('1 selected')).toBeNull();
  });

  it('count updates live when qty changes via stepper', async () => {
    const user = userEvent.setup();
    renderAccordion();

    // Step 1 is open. v4 has qty 1. Decrement it to 0.
    const v4Card = screen.getByRole('article', { name: 'Wyze Cam v4' });
    const decBtn = within(v4Card).getByRole('button', { name: /Decrease quantity/ });
    await user.click(decBtn);

    // Cameras should now show "1 selected" (only Pan v3 with qty 2).
    expect(screen.getByText('1 selected')).toBeDefined();
  });
});

// ── step content ─────────────────────────────────────────────────────────────

describe('Accordion step content', () => {
  it('Step 1 (cameras) panel contains its 5 camera cards', () => {
    renderAccordion();
    // Panels animate open/closed, so every step's panel is in the DOM; scope the
    // count to the cameras region. Step 1 has 5 cameras.
    const camerasPanel = screen.getByRole('region', { name: /choose your cameras/i });
    expect(within(camerasPanel).getAllByRole('article').length).toBe(5);
  });

  it('Step 1 cards include v4 (selected) and Pan v3 (selected)', () => {
    renderAccordion();
    const v4Card = screen.getByRole('article', { name: 'Wyze Cam v4' });
    const panCard = screen.getByRole('article', { name: 'Wyze Cam Pan v3' });
    expect(v4Card.className).toContain('border-purple-selected');
    expect(panCard.className).toContain('border-purple-selected');
  });

  it('Step 2 shows plan product with selectByOne behaviour (no stepper)', async () => {
    const user = userEvent.setup();
    renderAccordion();

    // Open Step 2
    const step2Header = screen.getByText('Choose your plan').closest('button')!;
    await user.click(step2Header);

    // Plan card should be visible
    const planCard = screen.getByRole('article', { name: 'Cam Unlimited' });
    expect(planCard).toBeDefined();

    // Plan should NOT have a stepper (selectByOne)
    const planStepperButtons = within(planCard).queryByRole('button', { name: /quantity/ });
    expect(planStepperButtons).toBeNull();
  });
});

// ── Next button ──────────────────────────────────────────────────────────────

describe('Next button', () => {
  it('Step 1 shows Next button pointing to Step 2', () => {
    renderAccordion();
    expect(screen.getByText('Next: Choose your plan')).toBeDefined();
  });

  it('clicking Next advances to the next step', async () => {
    const user = userEvent.setup();
    renderAccordion();

    const nextBtn = screen.getByText('Next: Choose your plan').closest('button')!;
    await user.click(nextBtn);

    // Step 2 should now be expanded
    const expanded = screen.getAllByRole('button').filter(
      (b) => b.getAttribute('aria-expanded') === 'true',
    );
    expect(expanded.length).toBe(1);
    expect(expanded[0]!.textContent).toContain('Choose your plan');
  });

  it('does not render a Next button in the last step (protection)', () => {
    renderAccordion();
    // The last step's panel has no "Next:" button (nowhere further to advance).
    const protectionPanel = screen.getByRole('region', { name: /add extra protection/i });
    expect(within(protectionPanel).queryByText(/^Next:/)).toBeNull();
  });
});

// ── keyboard accessibility ───────────────────────────────────────────────────

describe('Accordion keyboard accessibility', () => {
  it('headers are keyboard-focusable (native <button>)', () => {
    renderAccordion();
    const buttons = document.querySelectorAll<HTMLButtonElement>('[data-step-header]');
    expect(buttons.length).toBe(4);
    for (const btn of buttons) {
      expect(btn.tagName).toBe('BUTTON');
      // Native buttons are automatically keyboard-operable (Enter/Space)
    }
  });

  it('headers have aria-controls pointing to existing panels', () => {
    renderAccordion();
    const buttons = screen.getAllByRole('button').filter(
      (b) => b.getAttribute('aria-expanded') !== null,
    );
    for (const btn of buttons) {
      const controlsId = btn.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();
      const panel = document.getElementById(controlsId!);
      expect(panel).toBeTruthy();
      expect(panel!.getAttribute('role')).toBe('region');
    }
  });
});

// ── plan exclusive selection ─────────────────────────────────────────────────

describe('Plan exclusive selection (selectByOne)', () => {
  it('plan card exposes a radio reflecting the seed selection', async () => {
    const user = userEvent.setup();
    renderAccordion();

    const step2Header = screen.getByText('Choose your plan').closest('button')!;
    await user.click(step2Header);

    // Seed selects cam-unlimited → the radio is checked and the card is selected.
    const planRadio = screen.getByRole('radio', { name: /Select Cam Unlimited/ });
    expect(planRadio.getAttribute('aria-checked')).toBe('true');
    const planCard = screen.getByRole('article', { name: 'Cam Unlimited' });
    expect(planCard.className).toContain('border-purple-selected');
    expect(screen.getByText('$9.99/mo')).toBeDefined();
  });

  it('clicking the plan actually selects it (unselected → selected)', async () => {
    const user = userEvent.setup();
    // Start with NO plan selected, plan step open, so we can observe the transition.
    const noPlan: BundleState = {
      ...createSeedState(),
      selectedPlanId: null,
      expandedStepId: 'plan',
    };
    renderAccordion(noPlan);

    const planRadio = screen.getByRole('radio', { name: /Select Cam Unlimited/ });
    expect(planRadio.getAttribute('aria-checked')).toBe('false');
    expect(screen.getByRole('article', { name: 'Cam Unlimited' }).className).not.toContain(
      'border-purple-selected',
    );

    await user.click(planRadio);

    // After clicking, the plan becomes selected (SELECT_PLAN wired through).
    expect(screen.getByRole('radio', { name: /Select Cam Unlimited/ }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('article', { name: 'Cam Unlimited' }).className).toContain(
      'border-purple-selected',
    );
  });
});

// ── required product (Sense Hub) ─────────────────────────────────────────────

describe('Required product (Sense Hub)', () => {
  it('Sense Hub stepper has min=1 (can increase, not decrease below 1)', async () => {
    const user = userEvent.setup();
    renderAccordion();

    // Navigate to Step 3 (Sensors)
    const step3Header = screen.getByText('Choose your sensors').closest('button')!;
    await user.click(step3Header);

    // Sense Hub should be visible with qty 1
    const hubCard = screen.getByRole('article', { name: 'Wyze Sense Hub (Required)' });
    expect(hubCard).toBeDefined();

    // Try decrementing — button should be disabled (value <= min=1)
    const decBtn = within(hubCard).getByRole('button', { name: /Decrease quantity/ });
    expect(decBtn).toBeDisabled();
  });
});
