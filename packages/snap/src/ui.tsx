import {
  Banner,
  Box,
  Divider,
  Heading,
  Row,
  Text,
} from '@metamask/snaps-sdk/jsx';
import type { SnapComponent } from '@metamask/snaps-sdk/jsx';

import { t } from './i18n';
import type { NetworkConfig } from './networks';

export type OperationSummary = {
  type: string;
  details: [string, string][];
};

const shorten = (address: string) =>
  address.length > 16 ? `${address.slice(0, 6)}...${address.slice(-6)}` : address;

const OriginHeader: SnapComponent<{ origin: string; network: NetworkConfig }> = ({
  origin,
  network,
}) => (
  <Box>
    <Row label={t('dialog.origin')}>
      <Text>{origin}</Text>
    </Row>
    <Row label={t('dialog.network')}>
      <Text>{network.name}</Text>
    </Row>
  </Box>
);

export const ConfirmTransaction: SnapComponent<{
  origin: string;
  network: NetworkConfig;
  signer: string;
  source: string;
  fee: string;
  memo?: string | undefined;
  operations: OperationSummary[];
  submit: boolean;
}> = ({ origin, network, signer, source, fee, memo, operations, submit }) => (
  <Box>
    <Heading>{submit ? t('dialog.signSubmitTx.title') : t('dialog.signTx.title')}</Heading>
    <OriginHeader origin={origin} network={network} />
    {source === signer ? null : (
      <Banner title={t('dialog.sourceMismatch.title')} severity="warning">
        <Text>{t('dialog.sourceMismatch.text')}</Text>
      </Banner>
    )}
    <Row label={t('dialog.signer')}>
      <Text>{shorten(signer)}</Text>
    </Row>
    <Row label={t('dialog.source')}>
      <Text>{shorten(source)}</Text>
    </Row>
    <Row label={t('dialog.maxFee')}>
      <Text>{t('dialog.stroops', { fee })}</Text>
    </Row>
    {memo ? (
      <Row label={t('dialog.memo')}>
        <Text>{memo}</Text>
      </Row>
    ) : null}
    <Divider />
    {operations.map((operation, index) => (
      <Box>
        <Text fontWeight="bold">{`${index + 1}. ${operation.type}`}</Text>
        {operation.details.map(([label, value]) => (
          <Row label={label}>
            <Text>{value}</Text>
          </Row>
        ))}
      </Box>
    ))}
  </Box>
);

export const ConfirmMessage: SnapComponent<{
  origin: string;
  signer: string;
  message: string;
}> = ({ origin, signer, message }) => (
  <Box>
    <Heading>{t('dialog.signMessage.title')}</Heading>
    <Row label={t('dialog.origin')}>
      <Text>{origin}</Text>
    </Row>
    <Row label={t('dialog.signer')}>
      <Text>{shorten(signer)}</Text>
    </Row>
    <Divider />
    <Text>{message}</Text>
  </Box>
);

export const ConfirmPayment: SnapComponent<{
  origin: string;
  network: NetworkConfig;
  from: string;
  to: string;
  amount: string;
  asset: string;
  memo?: string | undefined;
  createsAccount: boolean;
}> = ({ origin, network, from, to, amount, asset, memo, createsAccount }) => (
  <Box>
    <Heading>{t('dialog.payment.title')}</Heading>
    <OriginHeader origin={origin} network={network} />
    {createsAccount ? (
      <Banner title={t('dialog.payment.newAccount.title')} severity="info">
        <Text>{t('dialog.payment.newAccount.text')}</Text>
      </Banner>
    ) : null}
    <Row label={t('dialog.from')}>
      <Text>{shorten(from)}</Text>
    </Row>
    <Row label={t('dialog.to')}>
      <Text>{shorten(to)}</Text>
    </Row>
    <Row label={t('dialog.amount')}>
      <Text fontWeight="bold">{`${amount} ${asset}`}</Text>
    </Row>
    {memo ? (
      <Row label={t('dialog.memo')}>
        <Text>{memo}</Text>
      </Row>
    ) : null}
  </Box>
);

export const ConfirmAuthEntry: SnapComponent<{
  origin: string;
  network: NetworkConfig;
  signer: string;
  account?: string | undefined;
  nonce: string;
  expirationLedger: number;
  invocation: [string, string][];
}> = ({ origin, network, signer, account, nonce, expirationLedger, invocation }) => (
  <Box>
    <Heading>{t('dialog.auth.title')}</Heading>
    <OriginHeader origin={origin} network={network} />
    <Banner title={t('dialog.auth.warning.title')} severity="warning">
      <Text>{t('dialog.auth.warning.text')}</Text>
    </Banner>
    <Row label={t('dialog.signer')}>
      <Text>{shorten(signer)}</Text>
    </Row>
    {account ? (
      <Row label={t('dialog.auth.account')}>
        <Text>{shorten(account)}</Text>
      </Row>
    ) : null}
    <Row label={t('dialog.auth.expiration')}>
      <Text>{String(expirationLedger)}</Text>
    </Row>
    <Row label={t('dialog.auth.nonce')}>
      <Text>{nonce}</Text>
    </Row>
    <Divider />
    {invocation.map(([label, value]) => (
      <Row label={label}>
        <Text>{value}</Text>
      </Row>
    ))}
  </Box>
);

export const ConfirmSwitchNetwork: SnapComponent<{
  origin: string;
  from: NetworkConfig;
  to: NetworkConfig;
}> = ({ origin, from, to }) => (
  <Box>
    <Heading>{t('dialog.switch.title')}</Heading>
    <Row label={t('dialog.origin')}>
      <Text>{origin}</Text>
    </Row>
    <Row label={t('dialog.switch.current')}>
      <Text>{from.name}</Text>
    </Row>
    <Row label={t('dialog.switch.new')}>
      <Text fontWeight="bold">{to.name}</Text>
    </Row>
    {to.id === 'mainnet' ? (
      <Banner title={t('dialog.switch.mainnet.title')} severity="warning">
        <Text>{t('dialog.switch.mainnet.text')}</Text>
      </Banner>
    ) : null}
  </Box>
);

export const ConfirmLink: SnapComponent<{
  origin: string;
  evmAddress: string;
  stellarAddress: string;
}> = ({ origin, evmAddress, stellarAddress }) => (
  <Box>
    <Heading>{t('dialog.link.title')}</Heading>
    <Row label={t('dialog.origin')}>
      <Text>{origin}</Text>
    </Row>
    <Text>{t('dialog.link.text')}</Text>
    <Row label={t('dialog.link.evm')}>
      <Text>{evmAddress}</Text>
    </Row>
    <Row label={t('dialog.link.stellar')}>
      <Text>{shorten(stellarAddress)}</Text>
    </Row>
  </Box>
);
