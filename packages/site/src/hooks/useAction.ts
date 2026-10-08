import { useCallback, useState } from 'react';
import { useLog } from '@/context/LogContext';
import { useToast } from '@/context/ToastContext';
import { useI18n } from '@/i18n';
import { describeError, hasSep43Error } from '@/lib/errors';

/**
 * Runs `action`: its result goes to the log under `label` (already
 * translated); a SEP-43 error or a thrown error becomes a toast. `pending` is
 * true while it runs so callers can disable their control. An `undefined`
 * result prints nothing.
 */
export function useAction<Args extends unknown[]>(label: string, action: (...args: Args) => Promise<unknown>) {
  const { print } = useLog();
  const { notify } = useToast();
  const { t } = useI18n();
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (...args: Args) => {
      setPending(true);
      try {
        const result = await action(...args);
        if (hasSep43Error(result)) {
          notify(describeError(result.error, t));
        } else if (result !== undefined) {
          print(label, result);
        }
      } catch (error) {
        notify(describeError(error, t));
      } finally {
        setPending(false);
      }
    },
    [action, label, print, notify, t],
  );

  return { run, pending };
}
