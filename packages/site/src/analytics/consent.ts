import { useSyncExternalStore } from 'react';

/** The visitor's answer about analytics; null until they give one. */
export type Consent = 'granted' | 'denied';

const STORAGE_KEY = 'analytics-consent';
/** Fired on every change here, so each hook re-reads. */
const CHANGE = 'site:consent';

type State = { consent: Consent | null; asking: boolean };

let state: State = { consent: null, asking: false };
let loaded = false;

function read(): State {
  if (!loaded && typeof window !== 'undefined') {
    loaded = true;
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      state = { consent: value === 'granted' || value === 'denied' ? value : null, asking: false };
    } catch {
      // Storage blocked: ask again on each visit.
    }
  }
  return state;
}

function update(next: State): void {
  state = next;
  window.dispatchEvent(new Event(CHANGE));
}

/** Records the visitor's answer and closes the notice. */
export function answerConsent(consent: Consent): void {
  try {
    localStorage.setItem(STORAGE_KEY, consent);
  } catch {
    // Not persisted; it still applies to this visit.
  }
  update({ consent, asking: false });
}

/** Shows the notice again so the visitor can change their answer (the footer's "Measurement preferences"). */
export function askConsentAgain(): void {
  update({ ...read(), asking: true });
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE, onChange);
  return () => window.removeEventListener(CHANGE, onChange);
}

const SERVER_STATE: State = { consent: null, asking: false };

/** The answer and whether the notice is open again; nothing is known while prerendering. */
export function useConsent(): State {
  return useSyncExternalStore(subscribe, read, () => SERVER_STATE);
}
