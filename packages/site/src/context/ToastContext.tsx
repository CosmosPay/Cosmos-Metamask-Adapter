import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useI18n } from '@/i18n';

export type ToastInput = { title: string; message: string };

type Toast = ToastInput & { id: number; leaving: boolean };

type ToastContextValue = { notify: (toast: ToastInput) => void };

/** How long a toast stays up, and how long its exit animation runs (keep in sync with the CSS). */
const VISIBLE_MS = 6000;
const EXIT_MS = 220;
/** Older toasts make room once this many are showing. */
const MAX_TOASTS = 3;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const later = useCallback((ms: number, run: () => void) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      run();
    }, ms);
    timers.current.add(timer);
  }, []);

  // Plays the exit animation, then removes the toast.
  const dismiss = useCallback(
    (id: number) => {
      setToasts((current) => current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
      later(EXIT_MS, () => setToasts((current) => current.filter((toast) => toast.id !== id)));
    },
    [later],
  );

  const notify = useCallback(
    (input: ToastInput) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-(MAX_TOASTS - 1)), { ...input, id, leaving: false }]);
      later(VISIBLE_MS, () => dismiss(id));
    },
    [dismiss, later],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);
  return (
    <ToastContext value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext>
  );
}

function Toaster({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  const { t } = useI18n();
  return (
    <section className="toasts" aria-label={t('toast.region')}>
      {toasts.map((toast) => (
        <div key={toast.id} className="toast" role="alert" data-leaving={toast.leaving || undefined}>
          <svg className="toast-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5v5.5M12 16.5h.01" />
          </svg>
          <div className="toast-body">
            <p className="toast-title">{toast.title}</p>
            <p className="toast-message">{toast.message}</p>
          </div>
          <button
            type="button"
            className="toast-close"
            aria-label={t('toast.close')}
            onClick={() => onDismiss(toast.id)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      ))}
    </section>
  );
}

export function useToast(): ToastContextValue {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error('useToast must be used inside <ToastProvider>');
  return toast;
}
