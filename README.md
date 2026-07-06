# Bundle Builder — Wyze Home Security

A single-page **Bundle Builder** for assembling a home-security system. Left: a 4-step accordion to pick cameras, a plan, sensors, and accessories. Right: a live review panel ("Your security system") with totals, savings, and financing that recalculate in real time. State persists to `localStorage` and restores on reload.
https://bundle-builder-puce.vercel.app/
---

## Quick start

```bash
git clone <this-repo>
cd bundle-builder
npm install
npm run dev
```

Open **http://localhost:5173**.

## Scripts

| Command | Does |
|---------|------|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run typecheck` | `tsc --noEmit` (strict TypeScript) |
| `npm run lint` | ESLint (zero-warnings policy) |
| `npm test` | Vitest + React Testing Library (unit + integration) |
| `npm run format` | Prettier |

## Tech stack

Vite · React 18 · TypeScript (strict) · Tailwind CSS · Context API + `useReducer` · Vitest + React Testing Library · ESLint + Prettier · npm

**No** Redux, Zustand, Jotai, date/money libraries, or UI kits. Only the approved dependencies from the frozen spec.

## Architecture

```
src/
  app/            App.tsx — page shell, responsive grid, persistence hook
  components/
    builder/      Accordion, StepHeader, NextButton, StepIcon
    product/      ProductCard, QuantityStepper, VariantSelector, PriceTag,
                  DiscountBadge, LearnMoreLink
    review/       ReviewPanel, ReviewGroup, ReviewLine, CheckoutButton,
                  SavingsNote, FinancingChip, GuaranteeBadge, SaveForLater
    ui/           Icon, VisuallyHidden, SkipLink
  state/          bundleReducer.ts, BundleContext.tsx, selectors.ts
  data/           catalog.json, dataAccess.ts, seed.ts
  lib/            pricing.ts, storage.ts, money.ts
  types/          catalog.ts, state.ts
  hooks/          usePersistBundle.ts
  styles/         index.css (Tailwind + @font-face)
tests/            mirrors src — unit + integration tests
```

### Data flow

1. **`catalog.json`** → `dataAccess.ts` — single source of truth for products, prices, variants.
2. **`createSeedState()`** → `bundleReducer` — initial quantities, active variants, plan selection.
3. **User actions** → dispatch → `bundleReducer` enforces invariants (clamping, required/fixed guards, variant independence, single-open accordion).
4. **`selectors.ts`** derives review groups & totals from state + catalog (pure functions).
5. **`usePersistBundle`** hydrates on mount, autosaves on change (800ms debounce), explicit save via "Save my system for later".

### Key contracts

- **LineKey** = `${productId}::${variantId ?? '_'}` — produces one quantity slot per (product, variant).
- **Money** = integer cents everywhere. Format only at render (`lib/money.ts`).
- **`SELECT_VARIANT`** never touches quantities — the flagship invariant.

## Documented tradeoffs & decisions

1. **Fonts.** Gilroy (the Figma design font) is **fully self-hosted** from `public/fonts/` for the five weights the UI uses — 300 Light, 400 Regular, 500 Medium, 600 SemiBold, 700 Bold. No external font CDN; `font-sans` is `['Gilroy', 'system-ui', …]`.
2. **Pan v3 price normalization.** Figma's card lists $39.98/$34.98 but its review line lists $28.99/$23.99. We use the review-consistent unit prices ($28.99/$23.99) so the seeded Total and Savings match the design exactly — a discovered mock inconsistency.
3. **Steps 2–4 expanded UIs not in Figma.** Only Step 1 is expanded in the design file. Steps 2–4 are rendered by reusing `ProductCard` from catalog data, styled consistently with Step 1. The Plan step uses the `selectByOne` (radio) card behaviour.
4. **No tablet artboard.** The `md` breakpoint (640–1023px) is our engineered bridge — cards go 2-up, review stacks below builder, no sticky sidebar.
5. **"Learn More" colour.** Figma uses raw browser-blue (`#00e`). We style it in-brand (purple, `#4E2FD2`) and document the override.
6. **Financing $/mo is an estimate.** Computed as `Math.round(currentTotal / 12)`. Not a derivable exact figure — the mock's $19.19 doesn't cleanly divide. Documented as an estimate.
7. **Shipping.** Fast Shipping displays `$5.99 → FREE` but is excluded from headline savings ($50.92) — matching the mock. Its `countsTowardSavings: false` flag excludes it from all numerical totals.
8. **Checkout is a placeholder.** Clicking "Checkout" shows a confirmation toast ("✓ Added to cart!"). No payment/purchase flow — out of scope per brief.
9. **Variant swatches reuse product images.** No per-colour source art exists in the Figma file. `swatchImage` points at the product image as a fallback. Documented in `public/assets/README.md`.
10. **Touch targets ≥ 40px.** Stepper buttons and variant chips use `min-h-[40px] min-w-[40px]` — exceeding WCAG 2.5.5 minimums — even though the Figma specifies smaller desktop sizes.

## Accessibility

- **Skip link:** first Tab stop → jumps to review panel.
- **Accordion:** `<button>` headers with `aria-expanded` + `aria-controls`; panels are `role="region"` with `aria-labelledby`. Keyboard: Enter/Space to toggle. Single-open enforced.
- **Variant selector:** WAI-ARIA radiogroup pattern — `role="radiogroup"` + `role="radio"` + `aria-checked`. Roving tabindex with Arrow/Home/End navigation.
- **Quantity stepper:** `aria-label` on ± buttons, `aria-live="polite"` on the quantity value, `disabled` + `aria-disabled`.
- **Live totals:** `aria-live="polite"` + `aria-atomic` on the totals row so screen readers announce price changes.
- **Focus ring:** `:focus-visible` → 2px purple outline on all interactive elements.
- **Colour contrast:** Purple (`#4E2FD2`) on white passes AAA. Muted greys (`#575757`, `#6F7882`) on white/lavender (`#ECEEFD`) pass AA for their text sizes.

## API-readiness

The data layer (`dataAccess.ts`) exposes an `async getCatalog(): Promise<Product[]>` function. Today it resolves the bundled JSON synchronously. Swapping to a `fetch('/api/catalog')` call is a one-line change — the rest of the app is already async-tolerant. Image URLs are resolved through `resolveAssetUrl(filename)`, centralised for a CDN swap.

## Deploy

```bash
npm run build   # → dist/
```

`dist/` is a static SPA — deploy to any static host (Vercel, Netlify, Cloudflare Pages, S3+CloudFront). No server, no SSR, no environment variables required.
