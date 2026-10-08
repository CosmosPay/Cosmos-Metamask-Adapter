import { InvalidParamsError } from '@metamask/snaps-sdk';

import { buildLinkMessage, recoverPersonalSignAddress } from '@/domain/evmLink';
import { getState, updateState } from '@/wallet/state';
import type { RpcMethodRegistry } from '@/rpc/context';
import { confirm, resolveKeypair, validate } from '@/rpc/context';
import { ConfirmLink } from '@/rpc/dialogs';
import { BaseParams, LinkMessageParams, LinkParams } from '@/rpc/schemas';

export const evmLinkMethods: RpcMethodRegistry = {
  async stellar_getLinkMessage({ params }) {
    const request = validate(params, LinkMessageParams);
    const keypair = await resolveKeypair(request);
    return { message: buildLinkMessage(request.evmAddress, keypair.publicKey()) };
  },

  async stellar_linkEvmAddress({ origin, params }) {
    const request = validate(params, LinkParams);
    const keypair = await resolveKeypair(request);
    const stellarAddress = keypair.publicKey();
    const evmAddress = request.evmAddress.toLowerCase();
    const message = buildLinkMessage(evmAddress, stellarAddress);

    let recovered: string;
    try {
      recovered = recoverPersonalSignAddress(message, request.evmSignature);
    } catch {
      throw new InvalidParamsError('Invalid EVM signature.');
    }
    if (recovered !== evmAddress) {
      throw new InvalidParamsError('EVM signature was not produced by evmAddress.');
    }

    await confirm(<ConfirmLink origin={origin} evmAddress={evmAddress} stellarAddress={stellarAddress} />);

    const link = {
      evmAddress,
      stellarAddress,
      message,
      evmSignature: request.evmSignature,
      stellarSignature: Buffer.from(keypair.signMessage(message)).toString('base64'),
      linkedAt: Date.now(),
    };
    const { links } = await getState();
    await updateState({
      links: [
        ...links.filter((item) => !(item.evmAddress === evmAddress && item.stellarAddress === stellarAddress)),
        link,
      ],
    });
    return link;
  },

  async stellar_getLinkedAddresses({ params }) {
    const request = validate(params, BaseParams);
    const { links } = await getState();
    if (request.accountIndex === undefined && request.address === undefined) {
      return links;
    }
    const keypair = await resolveKeypair(request);
    return links.filter((link) => link.stellarAddress === keypair.publicKey());
  },
};
