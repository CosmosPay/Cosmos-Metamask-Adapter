import type { IOnChangeEvent, ModuleInterface, ModuleType } from '@creit.tech/stellar-wallets-kit/types';

import { StellarWalletError } from '@/errors';
import type { HybridAdapterOptions } from '@/hybrid';
import { HybridStellarAdapter } from '@/hybrid';
import type { Sep43Error } from '@/types';

export const METAMASK_STELLAR_ID = 'metamask-stellar-snap';

const ICON =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTQiIGZpbGw9IiMwRjBGMEYiLz48cGF0aCBmaWxsPSIjRkZGRkZGIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzLjYzIDcuNjkpIHNjYWxlKDAuMTMpIiBkPSJNMjE4LjE5IDBDMjQzLjA4IDAgMjY3LjIzIDQuODggMjg5Ljk3IDE0LjUxQzMwMi4xMiAxOS42NSAzMTMuNzIgMjYuMTIgMzI0LjQ5IDMzLjc0TDMyMi4xOSAzNC45MkwyOTIuNjIgNTBDMjcwLjA0IDM3LjQ1IDI0NC4zMyAzMC44MiAyMTguMTkgMzAuODJDMjE3LjggMzAuODIgMjE3LjQgMzAuODIgMjE3IDMwLjgyQzE5Ni45MSAzMC45NyAxNzcuMzUgMzQuOTggMTU4Ljg1IDQyLjczQzE0MC4zNyA1MC40OCAxMjMuNzkgNjEuNjMgMTA5LjU3IDc1Ljg2QzgwLjU2IDEwNC45MSA2NC41OCAxNDMuNTMgNjQuNTggMTg0LjYxQzY0LjU4IDE5MS4zIDY1LjAyIDE5OC4wNSA2NS44OCAyMDQuN0w2Ni4xNiAyMDYuODJMNjguMDcgMjA1Ljg1TDMyMy41NiA3NS41MUwzNzYuNDYgNDguNTNMNDM2LjM4IDE3Ljk2TDQzNi4zOCA1Mi41NUwzNzQuNjYgODQuMDNMMzQ0LjM5IDk5LjQ4TDc1LjA3IDIzNi44Nkw3My44NiAyMzcuNTVMNjAuMDkgMjQ0LjU3TDQ2LjExIDI1MS43TDQ2LjA4IDI1MS42NUw0NC44MiAyNTIuMjlMMCAyNzUuMTVMMCAyNDAuNTdMMTUuMTUgMjMyLjg0QzI3Ljg4IDIyNi4zNSAzNS40IDIxMi45NCAzNC4zMyAxOTguNjdDMzMuOTggMTk0LjAxIDMzLjggMTg5LjI4IDMzLjggMTg0LjYxQzMzLjggMTU5LjY5IDM4LjY4IDEzNS41MSA0OC4zIDExMi43NEM1Ny41OSA5MC43NiA3MC44OCA3MS4wMiA4Ny44MSA1NC4wN0MxMDQuNzMgMzcuMTIgMTI0LjQ1IDIzLjgxIDE0Ni40MSAxNC41MUMxNjkuMTYgNC44OCAxOTMuMzEgMCAyMTguMTkgMFogTTQzNi4zOSA5OC43NUw0MzYuMzkgMTMzLjM0TDQyMS4yMiAxNDEuMDdDNDA4LjQ5IDE0Ny41NyA0MDAuOTcgMTYwLjk5IDQwMi4wNSAxNzUuMjZDNDAyLjQgMTc5Ljk4IDQwMi41OSAxODQuNzUgNDAyLjU5IDE4OS40NEM0MDIuNTkgMjE0LjM2IDM5Ny43MSAyMzguNTQgMzg4LjA5IDI2MS4zQzM3OC44IDI4My4yOCAzNjUuNTEgMzAzLjAyIDM0OC41OCAzMTkuOThDMzMxLjY0IDMzNi45MyAzMTEuOTMgMzUwLjI0IDI4OS45NyAzNTkuNTRDMjY3LjIyIDM2OS4xNyAyNDMuMDggMzc0LjA1IDIxOC4xOSAzNzQuMDVDMTkzLjMxIDM3NC4wNSAxNjkuMTYgMzY5LjE3IDE0Ni40MiAzNTkuNTRDMTM0LjIyIDM1NC4zNyAxMjIuNTggMzQ3Ljg4IDExMS43NyAzNDAuMjFMMTQyLjQgMzI0LjU5TDE0My42MiAzMjMuOTdDMTY2LjIzIDMzNi41NyAxOTIgMzQzLjIzIDIxOC4yIDM0My4yM0MyMTguNTYgMzQzLjIzIDIxOC45MyAzNDMuMjMgMjE5LjI5IDM0My4yM0MyMzkuMzkgMzQzLjA5IDI1OC45OCAzMzkuMDkgMjc3LjQ5IDMzMS4zM0MyOTUuOTkgMzIzLjU4IDMxMi41OSAzMTIuNDMgMzI2LjgxIDI5OC4xOUMzNTUuODMgMjY5LjE0IDM3MS44MSAyMzAuNTIgMzcxLjgxIDE4OS40NEMzNzEuODEgMTgyLjc0IDM3MS4zNiAxNzUuOTMgMzcwLjQ5IDE2OS4yMkwzNzAuMjIgMTY3LjA5TDM2OC4zMSAxNjguMDdMMTEyLjU1IDI5OC41M0w1OS42NSAzMjUuNTJMMCAzNTUuOTVMMCAzMjEuMzdMNjEuNDYgMjkwLjAxTDkxLjcyIDI3NC41N0w0MzYuMzkgOTguNzVaIi8+PC9zdmc+Cg==';

function unwrap<Result extends { error?: Sep43Error }>(result: Result): Omit<Result, 'error'> {
  if (result.error) {
    throw new StellarWalletError(result.error);
  }
  const { error: _ignored, ...rest } = result;
  return rest;
}

/**
 * Stellar Wallets Kit module: shows "MetaMask" in the kit's wallet picker and
 * routes mainnet to MetaMask's official Stellar support and testnet/futurenet
 * to the Stellar Snap.
 *
 * ```ts
 * StellarWalletsKit.init({ modules: [new MetaMaskStellarModule(), ...defaultModules()] });
 * ```
 */
export class MetaMaskStellarModule implements ModuleInterface {
  readonly moduleType = 'HOT_WALLET' as ModuleType;
  readonly productId = METAMASK_STELLAR_ID;
  readonly productName = 'MetaMask · Stellar Snap';
  readonly productUrl = 'https://metamask.io';
  readonly productIcon = ICON;

  readonly adapter: HybridStellarAdapter;

  constructor(options: HybridAdapterOptions = {}) {
    this.adapter = new HybridStellarAdapter(options);
  }

  isAvailable(): Promise<boolean> {
    return this.adapter.isAvailable(800);
  }

  async getAddress(params?: { path?: string; skipRequestAccess?: boolean }) {
    const current = await this.adapter.getAddress();
    if (!current.error) {
      return { address: current.address };
    }
    const result = params?.skipRequestAccess ? await this.adapter.restore() : await this.adapter.requestAccess();
    return unwrap(result);
  }

  async signTransaction(xdr: string, opts?: { networkPassphrase?: string; address?: string }) {
    return unwrap(await this.adapter.signTransaction(xdr, opts));
  }

  async signAuthEntry(authEntry: string, opts?: { networkPassphrase?: string; address?: string }) {
    const { signedAuthEntry, signerAddress } = unwrap(await this.adapter.signAuthEntry(authEntry, opts));
    return { signedAuthEntry: signedAuthEntry ?? '', signerAddress };
  }

  async signMessage(message: string, opts?: { networkPassphrase?: string; address?: string }) {
    const { signedMessage, signerAddress } = unwrap(await this.adapter.signMessage(message, opts));
    return { signedMessage: signedMessage ?? '', signerAddress };
  }

  async getNetwork() {
    return unwrap(await this.adapter.getNetwork());
  }

  onChange(callback: (event: IOnChangeEvent) => void): void {
    this.adapter.onChange(({ address, network, networkPassphrase }) =>
      callback({ address, network, networkPassphrase }),
    );
  }

  disconnect(): Promise<void> {
    return this.adapter.disconnect();
  }
}
