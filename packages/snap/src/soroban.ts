import { Address, scValToNative, xdr } from '@stellar/stellar-sdk/base';

import { t } from './i18n';

const MAX_VALUE_LENGTH = 160;
const MAX_DEPTH = 4;

const shorten = (value: string) => (value.length > MAX_VALUE_LENGTH ? `${value.slice(0, MAX_VALUE_LENGTH)}…` : value);

/**
 * Renders a Soroban value as compact, human readable text.
 *
 * @param value - The ScVal.
 * @returns Text for the confirmation dialog.
 */
export function formatScVal(value: xdr.ScVal): string {
  try {
    const native = scValToNative(value);
    return shorten(
      typeof native === 'string'
        ? native
        : JSON.stringify(native, (_key, item: unknown) => {
            if (typeof item === 'bigint') {
              return item.toString();
            }
            if (item instanceof Uint8Array) {
              return `0x${Buffer.from(item).toString('hex')}`;
            }
            return item;
          }),
    );
  } catch {
    return shorten(value.toXDR('base64'));
  }
}

const formatAddress = (address: xdr.ScAddress) => Address.fromScAddress(address).toString();

/**
 * Describes a contract call (contract + function + args).
 *
 * @param call - The invocation args.
 * @returns Rows for the dialog.
 */
export function describeContractCall(call: xdr.InvokeContractArgs): [string, string][] {
  return [
    [t('soroban.contract'), formatAddress(call.contractAddress)],
    [t('soroban.fn'), call.functionName.toString()],
    ...call.args.map((arg, index): [string, string] => [t('soroban.arg', { index: index + 1 }), formatScVal(arg)]),
  ];
}

/**
 * Describes a host function invoked by a transaction.
 *
 * @param func - The host function.
 * @returns A title and rows for the dialog.
 */
export function describeHostFunction(func: xdr.HostFunction): {
  type: string;
  details: [string, string][];
} {
  switch (func.type) {
    case 'hostFunctionTypeInvokeContract':
      return {
        type: t('soroban.call'),
        details: describeContractCall(func.invokeContract),
      };
    case 'hostFunctionTypeUploadContractWasm':
      return {
        type: t('soroban.upload'),
        details: [[t('soroban.size'), t('soroban.bytes', { size: func.wasm.length })]],
      };
    case 'hostFunctionTypeCreateContract':
    case 'hostFunctionTypeCreateContractV2':
      return { type: t('soroban.deploy'), details: [] };
    default:
      return { type: t('soroban.function'), details: [] };
  }
}

/**
 * Flattens an authorization tree into readable rows, so the user sees every
 * contract call they are authorizing (including nested sub-invocations).
 *
 * @param invocation - Root invocation.
 * @param depth - Current depth.
 * @returns Rows for the dialog.
 */
export function describeInvocation(invocation: xdr.SorobanAuthorizedInvocation, depth = 0): [string, string][] {
  const prefix = depth === 0 ? '' : `${'↳'.repeat(depth)} `;
  const fn = invocation.function;
  let rows: [string, string][];

  switch (fn.type) {
    case 'sorobanAuthorizedFunctionTypeContractFn':
      rows = describeContractCall(fn.contractFn).map(([label, value]) => [`${prefix}${label}`, value]);
      break;
    default:
      rows = [[`${prefix}${t('soroban.action')}`, t('soroban.deploy')]];
  }

  if (depth >= MAX_DEPTH) {
    return invocation.subInvocations.length > 0
      ? [...rows, [`${prefix}…`, t('soroban.more', { count: invocation.subInvocations.length })]]
      : rows;
  }

  return [...rows, ...invocation.subInvocations.flatMap((sub) => describeInvocation(sub, depth + 1))];
}
