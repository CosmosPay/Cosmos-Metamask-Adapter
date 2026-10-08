/** *bold*, ==highlight==, `code` and [links](url): the only markup translations and documents need. */
export const MARKUP = /\*([^*]+)\*|==([^=]+)==|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/gu;

/** The text without its markup, for meta tags and structured data. */
export function plainText(text: string): string {
  return text.replace(MARKUP, (_match, bold?: string, highlight?: string, code?: string, label?: string) =>
    String(bold ?? highlight ?? code ?? label),
  );
}

/** The text as Markdown (for llms.txt); `link` turns each href into the URL to print. */
export function toMarkdown(text: string, link: (href: string) => string): string {
  return text.replace(
    MARKUP,
    (_match, bold?: string, highlight?: string, code?: string, label?: string, href?: string) => {
      if (bold !== undefined) return `**${bold}**`;
      if (highlight !== undefined) return highlight;
      if (code !== undefined) return `\`${code}\``;
      return `[${label}](${link(href ?? '')})`;
    },
  );
}
