import { Fragment, type ReactNode } from 'react';

/** *bold*, ==highlight== and `code`: the only markup translations need. */
const TOKEN = /\*([^*]+)\*|==([^=]+)==|`([^`]+)`/gu;

/**
 * Renders a translated string's inline markup as elements, so word order can
 * differ per language without splitting sentences into fragments.
 */
export function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const [whole, bold, highlight, code] = match;
    parts.push(text.slice(last, match.index));
    if (bold !== undefined) parts.push(<strong>{bold}</strong>);
    else if (highlight !== undefined) parts.push(<mark>{highlight}</mark>);
    else parts.push(<code>{code}</code>);
    last = match.index + whole.length;
  }
  parts.push(text.slice(last));
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>{part}</Fragment>
      ))}
    </>
  );
}
