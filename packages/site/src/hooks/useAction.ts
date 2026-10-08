import { useCallback, useState } from 'react';
import { useLog } from '@/context/LogContext';
import { errorMessage, hasSep43Error } from '@/lib/log';

/**
 * Runs `action` and prints its result, SEP-43 error or thrown error to the log
 * under `label`. `pending` is true while it runs so callers can disable their
 * control. An `undefined` result prints nothing.
 */
export function useAction<Args extends unknown[]>(label: string, action: (...args: Args) => Promise<unknown>) {
  const { print } = useLog();
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (...args: Args) => {
      setPending(true);
      try {
        const result = await action(...args);
        if (hasSep43Error(result)) {
          print(`Error ${result.error.code}: ${label}`, result.error.message);
        } else if (result !== undefined) {
          print(label, result);
        }
      } catch (error) {
        print(`Error: ${label}`, errorMessage(error));
      } finally {
        setPending(false);
      }
    },
    [action, label, print],
  );

  return { run, pending };
}
