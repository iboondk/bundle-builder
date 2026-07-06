import { useState } from 'react';

/**
 * Placeholder checkout button. Shows a confirmation alert on click.
 * Full checkout flow is out of scope for this prototype.
 */
export function CheckoutButton() {
  const [confirmed, setConfirmed] = useState(false);

  const handleClick = () => {
    setConfirmed(true);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-center justify-center rounded-checkout bg-purple px-4 py-[13px] text-checkout font-bold text-white hover:opacity-90"
    >
      {confirmed ? '✓ Added to cart!' : 'Checkout'}
    </button>
  );
}
