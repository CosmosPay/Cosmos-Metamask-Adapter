import { highlight, type CodeLanguage } from '@/lib/highlight';

/**
 * A `<code>` with syntax colors (`.tok-*` in CSS, at AAA contrast in both
 * themes). Plain stretches stay text; colored ones are inline spans, so screen
 * readers still read each line as one.
 */
export function HighlightedCode({ code, language }: { code: string; language: CodeLanguage }) {
  return (
    <code translate="no">
      {highlight(code, language).map(({ kind, text }, index) =>
        kind === 'plain' ? (
          text
        ) : (
          <span key={index} className={`tok-${kind}`}>
            {text}
          </span>
        ),
      )}
    </code>
  );
}
