import type {
  Snap,
  SnapConfirmationInterface,
  SnapRequest,
  SnapResponse,
  SnapResponseWithInterface,
} from '@metamask/snaps-jest';
import { installSnap } from '@metamask/snaps-jest';
import { Wallet } from 'ethers';

/** Official SEP-0005 test vector 1 (https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0005.md). */
export const SEP5_PHRASE = 'illness spike retreat truth genius clock brain pass fit cave bargain toe';
export const SEP5_ACCOUNT_0 = 'GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6';
export const SEP5_ACCOUNT_1 = 'GBAW5XGWORWVFE2XTJYDTLDHXTY2Q2MO73HYCGB3XMFMQ562Q2W2GJQX';

/** Simulated MetaMask settings (phrase, locale, currency, hideBalances…). */
export type SimulationOptions = NonNullable<NonNullable<Parameters<typeof installSnap>[1]>['options']>;

/**
 * Installs the snap with the SEP-0005 test phrase (deterministic addresses).
 *
 * @param options - Extra snap options.
 * @returns The installed snap.
 */
export const installWithTestPhrase = async (options: SimulationOptions = {}): Promise<Snap> =>
  installSnap({ options: { secretRecoveryPhrase: SEP5_PHRASE, ...options } });

/**
 * Installs the snap with a random phrase, so accounts are never pre-funded on
 * the public networks.
 *
 * @param options - Extra snap options (locale defaults to `es`).
 * @returns The installed snap.
 */
export const installFresh = async (options: SimulationOptions = {}): Promise<Snap> =>
  installSnap({
    options: { secretRecoveryPhrase: Wallet.createRandom().mnemonic?.phrase ?? '', locale: 'es', ...options },
  });

/** The current screen of an interface, serialized for substring assertions. */
export const rendered = (ui: SnapResponseWithInterface | { content: unknown }) =>
  JSON.stringify('getInterface' in ui ? ui.getInterface().content : ui.content);

/**
 * The JSON-RPC result of a response, failing the test on an error response.
 *
 * @param response - A snap response (or a pending one).
 * @returns The result.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- RPC results are untyped JSON
export async function resultOf<Result = any>(response: SnapResponse | Promise<SnapResponse>): Promise<Result> {
  const { response: body } = await response;
  if ('error' in body) {
    throw new Error(`Expected a result, got error ${JSON.stringify(body.error)}`);
  }
  return body.result as Result;
}

/**
 * Approves (or cancels) the confirmation dialog of a pending request.
 *
 * @param pending - The pending request.
 * @param approve - Whether to approve.
 * @returns The dialog and the final response.
 */
export async function answer(
  pending: SnapRequest,
  approve = true,
): Promise<{ ui: SnapConfirmationInterface; response: SnapResponse }> {
  const ui = (await pending.getInterface()) as SnapConfirmationInterface;
  await (approve ? ui.ok() : ui.cancel());
  return { ui, response: await pending };
}

/** Matches a JSON-RPC error with this code. */
export const rpcError = (code: number) => expect.objectContaining({ code });

/** Runs a suite only with `STELLAR_LIVE=1` (real testnet). */
export const live = process.env.STELLAR_LIVE ? describe : describe.skip;

/**
 * Pulls one capture group out of the rendered screen, failing when absent.
 *
 * @param text - Rendered screen.
 * @param pattern - Pattern with one group.
 * @returns The group.
 */
export function capture(text: string, pattern: RegExp): string {
  const match = text.match(pattern);
  if (!match?.[1]) {
    throw new Error(`Pattern ${pattern} not found on screen`);
  }
  return match[1];
}
