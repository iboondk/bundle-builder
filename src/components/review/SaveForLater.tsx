import { useState } from 'react';

interface SaveForLaterProps {
  /** Persist callback from usePersistBundle. */
  saveNow: () => void;
}

/**
 * "Save my system for later" link. Calls the persistence hook's saveNow
 * (which writes to versioned localStorage) and shows a brief confirmation.
 */
export function SaveForLater({ saveNow }: SaveForLaterProps) {
  const [saved, setSaved] = useState(false);

  const handleClick = () => {
    saveNow();
    setSaved(true);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-line-name italic font-light tracking-[-0.016px] leading-[1.2] text-muted-3 underline decoration-from-font underline-offset-[2px] hover:opacity-80"
    >
      {saved ? '✓ Saved!' : 'Save my system for later'}
    </button>
  );
}
