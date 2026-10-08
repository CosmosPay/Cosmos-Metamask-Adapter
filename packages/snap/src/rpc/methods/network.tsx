import { NETWORKS } from '@/config/networks';
import { getState, updateState } from '@/wallet/state';
import type { RpcMethodRegistry } from '@/rpc/context';
import { confirm, networkInfo, resolveNetwork, validate } from '@/rpc/context';
import { ConfirmSwitchNetwork } from '@/rpc/dialogs';
import { BaseParams, SwitchNetworkParams } from '@/rpc/schemas';

export const networkMethods: RpcMethodRegistry = {
  async stellar_getNetwork({ params }) {
    return networkInfo(await resolveNetwork(validate(params, BaseParams)));
  },

  async stellar_switchNetwork({ origin, params }) {
    const { network: target } = validate(params, SwitchNetworkParams);
    const state = await getState();
    if (state.network !== target) {
      await confirm(<ConfirmSwitchNetwork origin={origin} from={NETWORKS[state.network]} to={NETWORKS[target]} />);
      await updateState({ network: target });
    }
    return networkInfo(NETWORKS[target]);
  },
};
