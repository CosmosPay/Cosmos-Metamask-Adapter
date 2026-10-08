import type { LogEntry } from '@/types';

/** Output of the last action. */
export function LogPanel({ entry }: { entry: LogEntry | null }) {
  return (
    <pre className="log" aria-live="polite">
      {entry && `${entry.label}\n${entry.text}`}
    </pre>
  );
}
