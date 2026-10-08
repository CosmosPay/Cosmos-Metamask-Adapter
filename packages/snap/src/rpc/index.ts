import type { Json, OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { MethodNotFoundError } from '@metamask/snaps-sdk';

import { loadPreferences } from '@/i18n';
import type { RpcMethodRegistry } from '@/rpc/context';
import { accountMethods } from '@/rpc/methods/accounts';
import { evmLinkMethods } from '@/rpc/methods/evmLink';
import { networkMethods } from '@/rpc/methods/network';
import { paymentMethods } from '@/rpc/methods/payments';
import { signingMethods } from '@/rpc/methods/signing';

/** Every `stellar_*` method dApps can call. */
const methods: RpcMethodRegistry = {
  ...accountMethods,
  ...networkMethods,
  ...signingMethods,
  ...paymentMethods,
  ...evmLinkMethods,
};

export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }): Promise<Json> => {
  await loadPreferences();
  // Own keys only: `toString` & co. are not methods.
  const handler = Object.prototype.hasOwnProperty.call(methods, request.method) ? methods[request.method] : undefined;
  if (!handler) {
    throw new MethodNotFoundError({ method: request.method });
  }
  return handler({ origin, params: request.params });
};
