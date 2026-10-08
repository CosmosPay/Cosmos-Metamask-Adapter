import { Fragment, type ReactNode } from 'react';
import { SnapText } from '@/components/SnapText';

/** *bold*, ==highlight==, `code` and [links](url): the only markup translations and documents need. */
const TOKEN = /\*([^*]+)\*|==([^=]+)==|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/gu;

/** Prose (not code) goes through SnapText, so "Snap" gets its hover circle wherever it is. */
const prose = (text: string) => <SnapText text={text} />;

/** Site pages open in place; anything else in a new tab. */
const link = (label: string, href: string) =>
  href.startsWith('/') ? (
    <a href={href}>{prose(label)}</a>
  ) : (
    <a href={href} target="_blank" rel="noreferrer">
      {prose(label)}
    </a>
  );

/**
 * Renders a translated string's inline markup as elements, so word order can
 * differ per language without splitting sentences into fragments.
 */
export function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const [whole, bold, highlight, code, label, href] = match;
    parts.push(prose(text.slice(last, match.index)));
    if (bold !== undefined) parts.push(<strong>{prose(bold)}</strong>);
    else if (highlight !== undefined) parts.push(<mark>{prose(highlight)}</mark>);
    else if (code !== undefined) parts.push(<code>{code}</code>);
    else parts.push(link(label ?? '', href ?? ''));
    last = match.index + whole.length;
  }
  parts.push(prose(text.slice(last)));
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>{part}</Fragment>
      ))}
    </>
  );
}
