import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { formatLogValue } from '@/lib/log';
import type { LogEntry } from '@/types';

type LogContextValue = {
  entry: LogEntry | null;
  /** Replaces the log with `label` and the formatted `value`. */
  print: (label: string, value: unknown) => void;
};

const LogContext = createContext<LogContextValue | null>(null);

export function LogProvider({ children }: { children: ReactNode }) {
  const [entry, setEntry] = useState<LogEntry | null>(null);
  const print = useCallback((label: string, value: unknown) => {
    setEntry({ label, text: formatLogValue(value) });
  }, []);
  const value = useMemo(() => ({ entry, print }), [entry, print]);
  return <LogContext value={value}>{children}</LogContext>;
}

export function useLog(): LogContextValue {
  const log = useContext(LogContext);
  if (!log) throw new Error('useLog must be used inside <LogProvider>');
  return log;
}
