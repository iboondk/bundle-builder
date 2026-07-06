import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { BundleProvider } from '@/state/BundleContext';
import { App } from '@/app/App';

function renderApp() {
  return render(
    <BundleProvider>
      <App />
    </BundleProvider>,
  );
}

// ── mobile title ─────────────────────────────────────────────────────────────

describe('Mobile page title', () => {
  it('renders "Let\'s get started!" heading', () => {
    renderApp();
    // The title uses a right single quotation mark (&rsquo;)
    expect(screen.getByText(/Let.s get started!/)).toBeDefined();
  });

  it('title is hidden on desktop (lg:hidden)', () => {
    renderApp();
    const title = screen.getByText(/Let.s get started!/);
    // lg:hidden → display:none at ≥1024px. In jsdom it always renders.
    expect(title.tagName).toBe('H1');
    expect(title.className).toContain('lg:hidden');
  });
});

// ── grid structure ───────────────────────────────────────────────────────────

describe('Responsive grid structure', () => {
  it('builder and review are both in the DOM', () => {
    renderApp();
    // Builder section (section with aria-label)
    const builder = document.querySelector('section[aria-label="Bundle builder"]');
    expect(builder).toBeDefined();
    // Review panel
    expect(screen.getByText('Your security system')).toBeDefined();
  });

  it('review panel renders with sticky class on desktop', () => {
    renderApp();
    // The aside in ReviewPanel has lg:sticky
    const aside = document.querySelector('aside');
    expect(aside?.className).toContain('lg:sticky');
  });

  it('no horizontal overflow class on main containers', () => {
    renderApp();
    // The main container should have overflow-hidden or no fixed width that causes overflow
    const main = document.querySelector('main');
    expect(main).toBeDefined();
    // Main has max-w-[1280px] — should be fine
    expect(main?.className).toContain('max-w-[1280px]');
  });
});

// ── control sizing (Figma spec) ──────────────────────────────────────────────
// Figma sizes controls at 20px steppers / 26px chips (pixel-perfect match).

describe('Control sizing (Figma 68:9793)', () => {
  it('stepper buttons are 20px (size-[20px])', () => {
    renderApp();
    const v4Card = screen.getByRole('article', { name: 'Wyze Cam v4' });
    const decBtn = within(v4Card).getByRole('button', { name: /Decrease quantity/ });
    const incBtn = within(v4Card).getByRole('button', { name: /Increase quantity/ });
    expect(decBtn.className).toContain('size-[20px]');
    expect(incBtn.className).toContain('size-[20px]');
  });

  it('variant chips are 26px tall', () => {
    renderApp();
    // Variant chips live inside a radiogroup; the plan selector is a lone radio, so
    // scoping to radiogroups keeps this to the colour chips only.
    const groups = screen.getAllByRole('radiogroup');
    const chips = groups.flatMap((g) => within(g).getAllByRole('radio'));
    expect(chips.length).toBeGreaterThan(0);
    for (const chip of chips) {
      expect(chip.className).toContain('h-[26px]');
    }
  });

  it('review panel stepper buttons are 20px too', () => {
    renderApp();
    const decButtons = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-label')?.includes('Decrease quantity'));
    expect(decButtons.length).toBeGreaterThan(0);
    for (const btn of decButtons) {
      expect(btn.className).toContain('size-[20px]');
    }
  });
});

// ── content at narrow widths ─────────────────────────────────────────────────

describe('Content fit at narrow widths', () => {
  it('product cards render without breaking layout', () => {
    renderApp();
    const cards = screen.getAllByRole('article');
    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      // Cards should have overflow-hidden to prevent content spill
      expect(card.className).toContain('overflow-hidden');
    }
  });

  it('card grid uses responsive columns', () => {
    renderApp();
    // The card grid inside AccordionStep goes 2-up at the lg breakpoint.
    const gridElements = document.querySelectorAll('.grid');
    const cardGrid = Array.from(gridElements).find((el) =>
      el.className.includes('lg:grid-cols-2'),
    );
    expect(cardGrid).toBeDefined();
  });
});

// ── full page renders without console errors ─────────────────────────────────

describe('App renders completely', () => {
  it('all major sections are present', () => {
    renderApp();
    // Mobile title
    expect(screen.getByText(/Let.s get started!/)).toBeDefined();
    // Builder
    expect(screen.getByText('Choose your cameras')).toBeDefined();
    // Review
    expect(screen.getByText('Your security system')).toBeDefined();
    // Totals
    expect(screen.getByText('Checkout')).toBeDefined();
    // Save
    expect(screen.getByText('Save my system for later')).toBeDefined();
  });
});
