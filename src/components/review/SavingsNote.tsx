import { formatMoney } from '@/lib/money';

interface SavingsNoteProps {
  savings: number;
}

/** "Congrats! You're saving $X.XX on your security bundle!" */
export function SavingsNote({ savings }: SavingsNoteProps) {
  if (savings <= 0) return null;

  return (
    <p className="text-center text-fine-print font-semibold leading-none tracking-[-0.056px] text-success">
      Congrats! You&rsquo;re saving {formatMoney(savings)} on your security bundle!
    </p>
  );
}
