import { Fragment, type ReactNode } from 'react';
import { SnapText } from '@/components/SnapText';

/** *bold*, ==highlight== and `code`: the only markup translations need. */
const TOKEN = /\*([^*]+)\*|==([^=]+)==|`([^`]+)`/gu;

/** Prose (not code) goes through SnapText, so "Snap" gets its hover circle wherever it is. */
const prose = (text: string) => <SnapText text={text} />;

/**
 * Renders a translated string's inline markup as elements, so word order can
 * differ per language without splitting sentences into fragments.
 */
export function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const [whole, bold, highlight, code] = match;
    parts.push(prose(text.slice(last, match.index)));
    if (bold !== undefined) parts.push(<strong>{prose(bold)}</strong>);
    else if (highlight !== undefined) parts.push(<mark>{prose(highlight)}</mark>);
    else parts.push(<code>{code}</code>);
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
