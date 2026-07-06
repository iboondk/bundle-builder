/**
 * Skip-to-content link — first focusable element on the page.
 * Lets keyboard users bypass navigation/accordion to reach the review panel.
 * Visually hidden until focused (appears on first Tab press).
 */
export function SkipLink() {
  return (
    <a
      href="#review-panel"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-card focus:bg-purple focus:px-4 focus:py-2 focus:text-white focus:no-underline"
    >
      Skip to review panel
    </a>
  );
}
