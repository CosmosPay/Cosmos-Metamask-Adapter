import { HighlightedCode } from '@/components/HighlightedCode';
import type { LogEntry } from '@/types';

/** Output of the last action; results (JSON) in syntax colors, messages as plain text. */
export function LogPanel({ entry }: { entry: LogEntry | null }) {
  return (
    <pre className="log" aria-live="polite">
      {entry && (
        <>
          {`${entry.label}\n`}
          {/^[[{]/u.test(entry.text) ? <HighlightedCode code={entry.text} language="json" /> : entry.text}
        </>
      )}
    </pre>
  );
}
