import { InvalidParamsError } from '@metamask/snaps-sdk';

import { ValidationError } from '@/domain/errors';
import { preparePayment, sendPayment } from '@/domain/payments';
import type { RpcMethodRegistry } from '@/rpc/context';
import { confirm, resolveKeypair, resolveNetwork, validate } from '@/rpc/context';
import { ConfirmPayment } from '@/rpc/dialogs';
import { SendPaymentParams } from '@/rpc/schemas';

export const paymentMethods: RpcMethodRegistry = {
  async stellar_sendPayment({ origin, params }) {
    const request = validate(params, SendPaymentParams);
    const network = await resolveNetwork(request);
    const keypair = await resolveKeypair(request);

    let prepared;
    try {
      prepared = await preparePayment(network, keypair, request);
    } catch (error) {
      throw error instanceof ValidationError ? new InvalidParamsError(error.message) : error;
    }

    await confirm(
      <ConfirmPayment
        origin={origin}
        network={network}
        from={keypair.publicKey()}
        to={request.destination}
        amount={request.amount}
        asset={prepared.assetLabel}
        memo={request.memo}
        createsAccount={prepared.createsAccount}
      />,
    );

    return sendPayment(network, keypair, prepared);
  },
};
