import { useRef, type KeyboardEvent } from 'react';
import type { Variant } from '@/types/catalog';
import { resolveAssetUrl } from '@/data/dataAccess';

// ── VariantChip ────────────────────────────────────────────────────────────

interface VariantChipProps {
  variant: Variant;
  selected: boolean;
  /** Whether this chip is the group's single tab stop (roving tabindex). */
  tabbable: boolean;
  onSelect: () => void;
  chipRef: (el: HTMLButtonElement | null) => void;
}

function VariantChip({ variant, selected, tabbable, onSelect, chipRef }: VariantChipProps) {
  const swatchSrc = resolveAssetUrl(variant.swatchImage);

  return (
    <button
      ref={chipRef}
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={tabbable ? 0 : -1}
      onClick={onSelect}
      className={`flex h-[26px] items-center gap-1 rounded-chip border-[0.5px] py-px transition-colors ${
        selected
          ? 'border-success bg-success-tint px-[3px]'
          : 'border-[#ccc] bg-white px-[5px] hover:border-gray-500'
      }`}
    >
      <img
        src={swatchSrc}
        alt=""
        className="h-[20px] w-[21px] rounded-[4px] object-cover"
        aria-hidden
      />
      <span className="font-medium text-variant-label text-ink-title whitespace-nowrap">
        {variant.label}
      </span>
    </button>
  );
}

// ── VariantSelector ────────────────────────────────────────────────────────

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string | null;
  onSelect: (variantId: string) => void;
}

/**
 * Radio-group of variant chips. Only rendered when a product has variants.
 * Implements the WAI-ARIA radiogroup keyboard
 * model — a single tab stop (roving tabindex) with Arrow/Home/End navigation
 * that both moves focus and selects, matching native radio behaviour.
 */
export function VariantSelector({ variants, selectedVariantId, onSelect }: VariantSelectorProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedIndex = variants.findIndex((v) => v.id === selectedVariantId);
  // When nothing is selected, the first chip holds the tab stop so the group
  // stays reachable via Tab.
  const tabbableIndex = selectedIndex >= 0 ? selectedIndex : 0;

  function move(nextIndex: number) {
    const next = variants[nextIndex];
    if (!next) return;
    onSelect(next.id);
    refs.current[nextIndex]?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const count = variants.length;
    const from = selectedIndex >= 0 ? selectedIndex : 0;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        move((from + 1) % count);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        move((from - 1 + count) % count);
        break;
      case 'Home':
        e.preventDefault();
        move(0);
        break;
      case 'End':
        e.preventDefault();
        move(count - 1);
        break;
      default:
        break;
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Color"
      className="flex gap-[6px] flex-wrap"
      onKeyDown={handleKeyDown}
    >
      {variants.map((variant, i) => (
        <VariantChip
          key={variant.id}
          variant={variant}
          selected={variant.id === selectedVariantId}
          tabbable={i === tabbableIndex}
          onSelect={() => onSelect(variant.id)}
          chipRef={(el) => {
            refs.current[i] = el;
          }}
        />
      ))}
    </div>
  );
}
