import { Accordion } from '@/components/builder/Accordion';
import { ReviewPanel } from '@/components/review/ReviewPanel';
import { usePersistBundle } from '@/hooks/usePersistBundle';
import { SkipLink } from '@/components/ui/SkipLink';

/**
 * App shell (M0–M7).
 * - lg (≥1024px): builder 2-col grid | sticky review sidebar
 * - md (640–1023px): single column, review stacked below builder
 * - <640px (sm): single column, "Let's get started!" title visible
 *
 * M4: 4-step accordion in the left column.
 * M5: live review panel in the right column (two-way sync via shared context).
 * M6: persistence — hydrates on mount, autosaves on change, explicit save via hook.
 * M7: responsive — mobile title, stacking, touch targets.
 */
export function App() {
  const { saveNow } = usePersistBundle();

  return (
    <div className="min-h-screen w-full bg-white">
      <SkipLink />
      <main className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-6 md:py-8">
        {/* Mobile page title — hidden at md+ */}
        <h1 className="mb-4 text-step-title font-semibold text-ink-title lg:hidden">
          Let&rsquo;s get started!
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_399px] lg:items-start">
          {/* Left: builder column — 4-step accordion */}
          <section aria-label="Bundle builder">
            <Accordion />
          </section>

          {/* Right: review column (sticky sidebar on desktop only) */}
          <ReviewPanel saveNow={saveNow} />
        </div>
      </main>
    </div>
  );
}
