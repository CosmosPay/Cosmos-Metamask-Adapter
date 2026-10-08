import type { Json } from '@metamask/snaps-sdk';

import { fetchAccount } from '@/services/horizon';
import { accountName, refreshAccountNames } from '@/wallet/accountNames';
import { getKeypair } from '@/wallet/keyring';
import { getState } from '@/wallet/state';
import type { RpcMethodRegistry } from '@/rpc/context';
import { resolveKeypair, resolveNetwork, validate } from '@/rpc/context';
import { BaseParams } from '@/rpc/schemas';

export const accountMethods: RpcMethodRegistry = {
  async stellar_getAddress({ params }) {
    const keypair = await resolveKeypair(validate(params, BaseParams));
    return { address: keypair.publicKey() };
  },

  async stellar_getAccounts() {
    const { accounts, selectedAccount } = await getState();
    await refreshAccountNames();
    return {
      selectedAccount,
      accounts: await Promise.all(
        accounts.map(async (index) => ({
          index,
          name: accountName(index),
          address: (await getKeypair(index)).publicKey(),
        })),
      ),
    };
  },

  async stellar_getBalance({ params }) {
    const request = validate(params, BaseParams);
    const network = await resolveNetwork(request);
    const keypair = await resolveKeypair(request);
    const account = await fetchAccount(network, keypair.publicKey());
    return {
      address: keypair.publicKey(),
      network: network.chainId,
      funded: account !== null,
      balances: (account?.balances ?? []) as Json,
    };
  },
};
