import { useMemo, useId } from 'react';
import type { StepId } from '@/types/catalog';
import { useBundle, useBundleDispatch } from '@/state/BundleContext';
import { getStepSelectedCount } from '@/state/selectors';
import { getCatalogSync } from '@/data/dataAccess';
import { ProductCard } from '@/components/product/ProductCard';
import { StepHeader } from './StepHeader';
import { NextButton } from './NextButton';

// ── Step metadata ───────────────────────────────────────────────────────────

interface StepMeta {
  stepId: StepId;
  title: string;
}

const STEPS: StepMeta[] = [
  { stepId: 'cameras', title: 'Choose your cameras' },
  { stepId: 'plan', title: 'Choose your plan' },
  { stepId: 'sensors', title: 'Choose your sensors' },
  { stepId: 'protection', title: 'Add extra protection' },
];

const STEP_NUMBER: Record<StepId, number> = {
  cameras: 1,
  plan: 2,
  sensors: 3,
  protection: 4,
};

// ── AccordionStep ───────────────────────────────────────────────────────────

interface AccordionStepProps {
  stepMeta: StepMeta;
  stepIndex: number;
}

function AccordionStep({ stepMeta, stepIndex }: AccordionStepProps) {
  const state = useBundle();
  const dispatch = useBundleDispatch();
  const catalog = useMemo(() => getCatalogSync(), []);
  const panelId = useId();
  const headerId = useId();

  const isExpanded = state.expandedStepId === stepMeta.stepId;
  const selectedCount = getStepSelectedCount(state, stepMeta.stepId, catalog);

  // Products belonging to this step.
  const stepProducts = useMemo(
    () => catalog.filter((p) => p.stepId === stepMeta.stepId),
    [catalog, stepMeta.stepId],
  );

  const handleToggle = () => {
    dispatch({ type: 'TOGGLE_STEP', stepId: stepMeta.stepId });
  };

  // Next step info (null for the last step).
  const nextStep: StepMeta | null = stepIndex < STEPS.length - 1 ? STEPS[stepIndex + 1]! : null;

  return (
    <section>
      {/* Collapsed: eyebrow above, no panel. Expanded: everything inside the lavender panel. */}
      {!isExpanded && (
        <p className="mb-[6px] text-eyebrow font-semibold uppercase tracking-[0.36px] text-gray-600">
          Step {STEP_NUMBER[stepMeta.stepId]} of 4
        </p>
      )}

      <div className={isExpanded ? 'rounded-card bg-lavender-surface px-[15px] pt-[15px] pb-[20px]' : ''}>
        {/* When expanded, the eyebrow + thin line sit inside the panel before the header */}
        {isExpanded && (
          <>
            <p className="text-eyebrow font-semibold uppercase tracking-[0.36px] text-ink-title pb-[18px]">
              Step {STEP_NUMBER[stepMeta.stepId]} of 4
            </p>
            <hr className="border-ink-title mb-[18px]" />
          </>
        )}

        <StepHeader
          stepId={stepMeta.stepId}
          title={stepMeta.title}
          selectedCount={selectedCount}
          isExpanded={isExpanded}
          onToggle={handleToggle}
          panelId={panelId}
          headerId={headerId}
          stepIndex={stepIndex}
        />

        {/* Collapsible panel with smooth open/close animation */}
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
            isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-[15px] pt-[15px]">
              {/* Step products — 2-up grid; a lone trailing card is centered */}
              <div className="grid grid-cols-1 gap-[15px] md:flex md:flex-nowrap md:overflow-x-auto lg:grid lg:grid-cols-2 lg:gap-4 lg:[&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:mx-auto lg:[&>*:last-child:nth-child(odd)]:w-[calc(50%-8px)]">
                {stepProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Next button (not for last step) */}
              {nextStep && (
                <NextButton
                  nextStepId={nextStep.stepId}
                  nextStepTitle={nextStep.title}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Accordion ───────────────────────────────────────────────────────────────

/**
 * The 4-step accordion builder. Single-open: only one step expanded at a time.
 * Each step renders product cards from catalog data via ProductCard.
 * See the Figma builder column.
 */
export function Accordion() {
  return (
    <div className="flex flex-col gap-5">
      {STEPS.map((stepMeta, index) => (
        <AccordionStep key={stepMeta.stepId} stepMeta={stepMeta} stepIndex={index} />
      ))}
    </div>
  );
}
