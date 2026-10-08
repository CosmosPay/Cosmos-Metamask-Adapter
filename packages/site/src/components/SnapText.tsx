import { Fragment } from 'react';

/** "Snap" as a whole word (not "Snaps"); the capture group keeps it in `split`'s output. */
const SNAP = /\b(Snap)\b/u;

/**
 * Text with every "Snap" wrapped so hovering it pops the brand circle behind
 * the word (`.snap-word` in CSS), like the wordmark does. Splitting on a
 * capturing pattern puts the matches at the odd indexes.
 */
export function SnapText({ text }: { text: string }) {
  return (
    <>
      {text.split(SNAP).map((part, index) =>
        index % 2 === 1 ? (
          <span key={index} className="snap-word">
            {part}
          </span>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}
