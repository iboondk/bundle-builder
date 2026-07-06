/**
 * In-brand "Learn More" link. Figma uses raw browser-blue (#00e);
 * we override with the brand purple.
 */
export function LearnMoreLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      className="text-purple underline decoration-from-font underline-offset-[2px] hover:opacity-80"
    >
      Learn More
    </a>
  );
}
