import type { Json } from '@metamask/snaps-sdk';

/**
 * Where the wallet state lives (Repository port). The snap uses MetaMask's
 * encrypted `snap_manageState`; tests swap in {@link MemoryStateStore}.
 */
export type StateStore = {
  read(): Promise<Record<string, Json> | null>;
  write(state: Record<string, Json>): Promise<void>;
};

/** MetaMask-managed, encrypted snap storage. */
export const snapStateStore: StateStore = {
  async read() {
    return (await snap.request({
      method: 'snap_manageState',
      params: { operation: 'get' },
    })) as Record<string, Json> | null;
  },
  async write(state) {
    await snap.request({
      method: 'snap_manageState',
      params: { operation: 'update', newState: state },
    });
  },
};

/** In-memory store, for tests and tooling. */
export class MemoryStateStore implements StateStore {
  #state: Record<string, Json> | null;

  constructor(initial: Record<string, Json> | null = null) {
    this.#state = initial;
  }

  async read() {
    return this.#state === null ? null : structuredClone(this.#state);
  }

  async write(state: Record<string, Json>) {
    this.#state = structuredClone(state);
  }
}

let store: StateStore = snapStateStore;

/** The store in use. */
export const stateStore = (): StateStore => store;

/**
 * Replaces the store (dependency injection point for tests).
 *
 * @param next - The store to use from now on.
 * @returns The previous store, to restore it.
 */
export function useStateStore(next: StateStore): StateStore {
  const previous = store;
  store = next;
  return previous;
}
