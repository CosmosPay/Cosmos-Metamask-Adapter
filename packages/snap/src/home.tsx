import type { OnUserInputHandler } from '@metamask/snaps-sdk';
import { UserInputEventType } from '@metamask/snaps-sdk';
import type { JSXElement, SnapComponent } from '@metamask/snaps-sdk/jsx';
import {
  Banner,
  Box,
  Button,
  Copyable,
  Field,
  Form,
  Heading,
  Icon,
  Image,
  Input,
  Link,
  Row,
  Section,
  Skeleton,
  Spinner,
  Text,
} from '@metamask/snaps-sdk/jsx';

import { TransactionBuilder } from '@stellar/stellar-sdk/base';

import type { RegistryAsset } from './assets';
import { assetAvatar, findAsset, getRegistry, pricingAssetId } from './assets';
import type { HorizonAccount, HorizonBalance, HorizonPayment } from './horizon';
import { fetchAccount, fetchOperation, fetchPayments, requestFriendbot, submitTransaction } from './horizon';
import { formatDate, hideBalances, loadPreferences, localizeNumber, pricingPreferences, t } from './i18n';
import type { ActionIcon } from './icons';
import {
  activityIcon,
  identicon,
  actionTile,
  assetIcon,
  fundIllustration,
  networkPill,
  rowAction,
  textLabel,
  pillButton,
  spacer,
  tokenInfo,
  wideRow,
} from './icons';
import { getKeypair, ImportError, keypairFromImport } from './keys';
import { describeOperation, innerTransaction } from './transactions';
import type { OperationSummary } from './ui';
import type { NetworkConfig, StellarNetwork } from './networks';
import { NETWORK_IDS, NETWORKS } from './networks';
import type { PaymentRequest, TrustlineRequest } from './payments';
import {
  assetKey,
  assetLabelOf,
  formatAmount,
  formatStroops,
  PaymentValidationError,
  preparePayment,
  prepareTrustline,
  sendPayment,
  signAndSubmit,
  spendableStroops,
  toStroops,
} from './payments';
import { fetchPrices, XLM_ASSET_ID } from './prices';
import { qrSvg } from './qr';
import {
  addAccount,
  getState,
  importAccount,
  IMPORTED_BASE,
  isImported,
  removeAccount,
  renameAccount,
  updateState,
} from './state';
import type { SwapAsset, SwapQuote } from './swap';
import { cosmosSwapsEnabled, estimateSwap, executeSwap, quoteSwap } from './swap';

type FieldErrors = Record<string, string>;

type SendForm = {
  destination: string;
  amount: string;
  asset: string;
  memo: string;
};

type Tab = 'tokens' | 'activity';

type SwapForm = { from: string; to: string | null; amount: string };

type PickerPurpose = 'send' | 'swap-from' | 'swap-to';

type HomeContext = {
  swap?: SwapForm;
  quote?: SwapQuote;
  form?: SendForm;
  tab?: Tab;
  trust?: TrustlineRequest;
  /** XDR being reviewed on the Sign screen. */
  sign?: string;
};

type Notice = {
  severity: 'success' | 'danger' | 'info';
  title: string;
  text: string;
};

const shorten = (address: string) => `${address.slice(0, 6)}…${address.slice(-6)}`;

const networkLabel = (id: StellarNetwork) => t(`network.${id}`);

/** Custom names (renamed by the user), refreshed at the start of every event. */
let accountNames: Record<string, string> = {};

const accountName = (index: number) =>
  accountNames[String(index)] ??
  (isImported(index)
    ? t('accounts.importedName', { n: index - IMPORTED_BASE + 1 })
    : t('accounts.name', { n: index + 1 }));

/** Localized amount, or a mask when the user hides balances in MetaMask. */
const balanceText = (amount: string) => (hideBalances() ? t('common.hidden') : localizeNumber(formatAmount(amount)));

/** Accepts `1,5` and `1.234,5` as typed in comma-decimal languages. */
const normalizeAmount = (amount: string) => {
  const value = amount.trim();
  return value.includes(',') ? value.replace(/\./gu, '').replace(',', '.') : value;
};

const formatFiat = (amount: number, currency: string) => {
  const fixed = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/gu, ',');
  return `${currency.toUpperCase()} ${localizeNumber(fixed)}`;
};

const EMPTY_FORM: SendForm = {
  destination: '',
  amount: '',
  asset: 'native',
  memo: '',
};

// --- Shared pieces -------------------------------------------------------------

const Loading: SnapComponent<{ text: string }> = ({ text }) => (
  <Box center>
    <Spinner />
    <Text alignment="center">{text}</Text>
  </Box>
);

/** Four tiles share the row. */
const TILE = 78;

/** Rounded tile (icon + label) like MetaMask's Buy / Swap / Send / Receive. */
const ActionTile: SnapComponent<{
  name: string;
  icon: ActionIcon;
  label: string;
  disabled?: boolean;
  width?: number;
}> = ({ name, icon, label, disabled, width }) => (
  <Button name={name} disabled={Boolean(disabled)}>
    <Image src={actionTile(icon, label, disabled, width)} alt={label} />
  </Button>
);

/** Full-width button drawn to fit (see `pillButton`): no snap logo, MetaMask hover. */
const PillButton: SnapComponent<{
  name: string;
  label: string;
  kind?: 'primary' | 'secondary' | 'danger';
  submit?: boolean;
  disabled?: boolean;
}> = ({ name, label, kind, submit, disabled }) => (
  <Button name={name} type={submit ? 'submit' : 'button'} disabled={Boolean(disabled)}>
    <Image src={pillButton(label, kind ?? 'primary')} alt={label} />
  </Button>
);

/** Breathing room between details and the action buttons. */
const Gap: SnapComponent<{ size?: number }> = ({ size }) => <Image src={spacer(size ?? 28)} alt="" />;

const TabBar: SnapComponent<{ tab: Tab }> = ({ tab }) => (
  <Box direction="horizontal">
    {tab === 'tokens' ? (
      <Text fontWeight="bold">{t('home.tokens')}</Text>
    ) : (
      <Button name="tab-tokens">{t('home.tokens')}</Button>
    )}
    {tab === 'activity' ? (
      <Text fontWeight="bold">{t('home.activity')}</Text>
    ) : (
      <Button name="tab-activity">{t('home.activity')}</Button>
    )}
  </Box>
);

// --- Main screen ---------------------------------------------------------------

type AccountOption = { index: number; address: string };

/** One row of the token list, pre-rendered (avatars need async image loads). */
type TokenRow = {
  avatar: string;
  /** Name + "change | issuer" block (SVG). */
  info: string;
  title: string;
  value: string;
  extra: string;
  /** Fiat value / raw amount, for ordering. */
  sortValue: number;
  sortAmount: number;
};

const TokenList: SnapComponent<{ rows: TokenRow[] }> = ({ rows }) => (
  <Box>
    {rows.map((row) => (
      <Box direction="horizontal" alignment="space-between">
        <Box direction="horizontal" crossAlignment="center">
          <Image src={row.avatar} alt={row.title} />
          <Image src={row.info} alt={row.title} />
        </Box>
        <Box crossAlignment="end">
          <Text fontWeight="bold" alignment="end">
            {row.value}
          </Text>
          <Text size="sm" color="muted" alignment="end">
            {row.extra}
          </Text>
        </Box>
      </Box>
    ))}
    <Box center>
      <Button name="go-assets">{t('trust.title')}</Button>
    </Box>
  </Box>
);

/** How one Horizon payment reads in the wallet. */
function describeActivity(payment: HorizonPayment, address: string) {
  const created = payment.type === 'create_account';
  // A swap is a path payment back to ourselves.
  const swap = !created && payment.from === address && payment.to === address;
  const outgoing = !swap && (created ? payment.funder === address : payment.from === address);
  const counterparty =
    (created ? (outgoing ? payment.account : payment.funder) : outgoing ? payment.to : payment.from) ?? '';
  const asset = created || payment.asset_type === 'native' ? 'XLM' : (payment.asset_code ?? '?');
  const amount = balanceText((created ? payment.starting_balance : payment.amount) ?? '0');
  const memo = payment.transaction?.memo_type === 'text' ? payment.transaction.memo : undefined;
  const sold =
    swap && payment.source_amount
      ? `${balanceText(payment.source_amount)} ${payment.source_asset_type === 'native' ? 'XLM' : (payment.source_asset_code ?? '?')}`
      : undefined;
  // A leg of a bigger transaction (e.g. the Cosmos swap commission) is named
  // by the transaction's own message; a plain payment keeps Sent / Received
  // with its memo as detail.
  const leg = (payment.transaction?.operation_count ?? 1) > 1;
  const title = swap
    ? t('activity.swap')
    : created && !outgoing
      ? t('activity.created')
      : leg && memo
        ? memo
        : outgoing
          ? t('activity.sent')
          : t('activity.received');
  const detail = swap ? (sold ? `${sold} →` : '') : !leg && memo ? memo : shorten(counterparty);
  return {
    swap,
    outgoing,
    counterparty,
    memo,
    sold,
    title,
    detail,
    value: `${outgoing ? '-' : '+'}${amount} ${asset}`,
    icon: activityIcon(swap ? 'swap' : outgoing ? 'out' : 'in'),
  };
}

const ActivityList: SnapComponent<{
  address: string;
  network: NetworkConfig;
  payments: HorizonPayment[];
}> = ({ address, network, payments }) => (
  <Box>
    {payments.length === 0 ? (
      <Text color="alternative" alignment="center">
        {t('activity.empty')}
      </Text>
    ) : null}
    {payments.map((payment) => {
      const item = describeActivity(payment, address);
      // A button (not a link) so the whole row gets hover and the pointer;
      // the detail screen links out to Stellar Expert.
      return (
        <Button name={`activity:${payment.id}`}>
          <Image
            src={wideRow({
              avatar: item.icon,
              title: item.title,
              subtitle: item.detail
                ? `${formatDate(payment.created_at)} · ${item.detail}`
                : formatDate(payment.created_at),
              right: item.value,
            })}
            alt={item.title}
          />
        </Button>
      );
    })}
    {payments.length > 0 ? (
      <Link href={`${network.explorerUrl}/account/${address}`}>{t('activity.explorer')}</Link>
    ) : null}
  </Box>
);

const ActivityDetail: SnapComponent<{
  payment: HorizonPayment;
  address: string;
  network: NetworkConfig;
}> = ({ payment, address, network }) => {
  const item = describeActivity(payment, address);
  const fee = payment.transaction?.fee_charged;
  return (
    <Box>
      <ScreenHeader title={item.title} back="tab-activity" />
      <Box center>
        <Image src={item.icon} alt="" />
        <Heading size="lg">{item.value}</Heading>
        {item.sold ? <Text color="alternative">{`${item.sold} →`}</Text> : null}
      </Box>
      <Section>
        <Row label={t('activity.status')}>
          <Text color="success">{t('activity.completed')}</Text>
        </Row>
        <Row label={t('activity.date')}>
          <Text>{formatDate(payment.created_at)}</Text>
        </Row>
        {item.swap ? null : (
          <Row label={item.outgoing ? t('activity.to') : t('activity.from')}>
            <Text>{shorten(item.counterparty)}</Text>
          </Row>
        )}
        {item.memo ? (
          <Row label={t('activity.memo')}>
            <Text>{item.memo}</Text>
          </Row>
        ) : null}
        {fee ? (
          <Row label={t('activity.networkFee')}>
            <Text>{`${localizeNumber(formatAmount(formatStroops(BigInt(fee))))} XLM`}</Text>
          </Row>
        ) : null}
        <Row label={t('sent.transaction')}>
          <Text>{shorten(payment.transaction_hash)}</Text>
        </Row>
      </Section>
      <Link href={`${network.explorerUrl}/tx/${payment.transaction_hash}`}>{t('sent.explorer')}</Link>
    </Box>
  );
};

/** MetaMask-style header: "Account 1 ⌄" opens the account list. */
const AccountHeader: SnapComponent<{
  selected: number;
  network: NetworkConfig;
  address: string;
}> = ({ selected, network, address }) => (
  <Box direction="horizontal" alignment="space-between">
    <Box>
      <Button name="go-accounts">
        <Image src={textLabel(accountName(selected), { size: 18, chevron: true })} alt={accountName(selected)} />
      </Button>
      {/* Small and muted so it doesn't compete with the balance. */}
      <Box direction="horizontal" crossAlignment="center">
        <Image src={identicon(address, 16)} alt="" />
        <Text size="sm" color="muted">
          {shorten(address)}
        </Text>
      </Box>
    </Box>
    <Button name="refresh">
      <Icon name="refresh" />
    </Button>
  </Box>
);

type Summary = {
  headline: string;
  change: { text: string; color: 'success' | 'error' } | null;
};

const Main: SnapComponent<{
  selected: number;
  address: string;
  network: NetworkConfig;
  funded: boolean;
  summary: Summary;
  tokens: TokenRow[];
  tab: Tab;
  payments: HorizonPayment[];
  notice?: Notice | undefined;
}> = ({ selected, address, network, funded, summary, tokens, tab, payments, notice }) => {
  const fundAction = network.friendbotUrl ? 'friendbot' : 'go-fund';

  const content = (
    <Box>
      <AccountHeader selected={selected} network={network} address={address} />

      <Box>
        <Heading size="lg">{summary.headline}</Heading>
        {summary.change ? (
          <Text color={summary.change.color} size="sm">
            {summary.change.text}
          </Text>
        ) : null}
      </Box>

      {notice ? <NoticeBanner notice={notice} /> : null}

      {funded ? null : (
        <Section>
          <Box center>
            <Image src={fundIllustration()} alt="" />
            <Heading size="md">{t('home.hero.title')}</Heading>
            <Text color="alternative" alignment="center">
              {network.friendbotUrl ? t('home.hero.text.test') : t('home.hero.text.mainnet')}
            </Text>
          </Box>
          <PillButton name={fundAction} label={t('home.hero.cta')} />
        </Section>
      )}

      {/* Fund only exists until the account is activated. */}
      {funded ? (
        <Box direction="horizontal" alignment="center">
          <ActionTile name="go-send" icon="send" label={t('home.send')} width={TILE} />
          <ActionTile
            name="go-swap"
            icon="swap"
            label={t('swap.tile')}
            disabled={!cosmosSwapsEnabled(network)}
            width={TILE}
          />
          <ActionTile name="go-receive" icon="receive" label={t('home.receive')} width={TILE} />
          <ActionTile name="go-sign" icon="sign" label={t('home.sign')} width={TILE} />
        </Box>
      ) : (
        <Box direction="horizontal" alignment="center">
          <ActionTile name={fundAction} icon="fund" label={t('home.fund')} width={TILE} />
          <ActionTile name="go-send" icon="send" label={t('home.send')} disabled width={TILE} />
          <ActionTile name="go-receive" icon="receive" label={t('home.receive')} width={TILE} />
          <ActionTile name="go-sign" icon="sign" label={t('home.sign')} width={TILE} />
        </Box>
      )}

      <TabBar tab={tab} />
      <Button name="go-networks">
        <Image
          src={networkPill(t('network.pill', { network: network.name }))}
          alt={t('network.pill', { network: network.name })}
        />
      </Button>
      {tab === 'tokens' && funded ? <TokenList rows={tokens} /> : null}
      {tab === 'activity' ? <ActivityList address={address} network={network} payments={payments} /> : null}
    </Box>
  );

  return content;
};

/** Notification with the close "X" in its top-right corner. */
const NoticeBanner: SnapComponent<{ notice: Notice }> = ({ notice }) => {
  const icon = notice.severity === 'success' ? 'confirmation' : notice.severity === 'danger' ? 'danger' : 'info';
  const color = notice.severity === 'success' ? 'success' : notice.severity === 'danger' ? 'error' : 'primary';
  return (
    <Section>
      <Box direction="horizontal" alignment="space-between">
        <Box direction="horizontal">
          <Icon name={icon} color={color} />
          <Box>
            <Text fontWeight="bold">{notice.title}</Text>
            <Text color="alternative">{notice.text}</Text>
          </Box>
        </Box>
        <Button name="dismiss">
          <Icon name="close" />
        </Button>
      </Box>
    </Section>
  );
};

// --- Networks ------------------------------------------------------------------

const ScreenHeader: SnapComponent<{ title: string; back?: string }> = ({ title, back }) => (
  <Box direction="horizontal" alignment="space-between">
    <Button name={back ?? 'back'}>
      <Icon name="arrow-left" />
    </Button>
    <Heading>{title}</Heading>
    <Box>{null}</Box>
  </Box>
);

const Networks: SnapComponent<{ selected: StellarNetwork }> = ({ selected }) => (
  <Box>
    <ScreenHeader title={t('networks.title')} />
    {NETWORK_IDS.map((id) => (
      <Button name={`select-network:${id}`}>
        <Image
          src={wideRow({
            avatar: assetIcon('XLM'),
            title: NETWORKS[id].name,
            subtitle: t(`networks.sub.${id}`),
            trailing: id === selected ? 'check' : undefined,
            surface: id === selected,
          })}
          alt={NETWORKS[id].name}
        />
      </Button>
    ))}
  </Box>
);

// --- Accounts ------------------------------------------------------------------

type AccountRowData = AccountOption & { balance: string };

/**
 * One clickable row (avatar, name, address, balance) plus its ⋮ menu. The ⋮ is
 * a native icon: its fixed CSS size keeps it from shrinking, so the row art can
 * be drawn large and scale down to whatever width is left.
 */
const AccountRow: SnapComponent<{
  row: AccountRowData;
  selected: boolean;
}> = ({ row, selected }) => (
  <Box direction="horizontal" alignment="space-between" crossAlignment="center">
    <Button name={`select-account:${row.index}`}>
      <Image
        src={wideRow({
          avatar: identicon(row.address),
          title: accountName(row.index),
          subtitle: shorten(row.address),
          right: row.balance,
          surface: selected,
        })}
        alt={accountName(row.index)}
      />
    </Button>
    <Button name={`account-menu:${row.index}`}>
      <Icon name="more-vertical" color="muted" />
    </Button>
  </Box>
);

const Accounts: SnapComponent<{
  rows: AccountRowData[];
  selected: number;
  network: NetworkConfig;
}> = ({ rows, selected, network }) => (
  <Box>
    <AccountList rows={rows} selected={selected} network={network} />
    <PillButton name="add-account" label={t('accounts.addButton')} kind="secondary" />
    <PillButton name="go-import" label={t('accounts.importButton')} kind="secondary" />
  </Box>
);

const AccountList: SnapComponent<{
  rows: AccountRowData[];
  selected: number;
  network: NetworkConfig;
}> = ({ rows, selected, network }) => (
  <Box>
    <ScreenHeader title={t('accounts.title')} />
    {rows.map((row) => (
      <AccountRow row={row} selected={row.index === selected} />
    ))}
  </Box>
);

const AccountMenu: SnapComponent<{
  index: number;
  address: string;
  network: NetworkConfig;
  selected: boolean;
  removable: boolean;
}> = ({ index, address, network, selected, removable }) => {
  const content = (
    <Box>
      <ScreenHeader title={accountName(index)} back="go-accounts" />
      <Box center>
        <Image src={identicon(address, 64)} alt="" />
      </Box>
      <Form name={`rename-form:${index}`}>
        <Field label={t('accounts.rename')}>
          <Input name="name" value={accountName(index)} placeholder={t('accounts.name', { n: index + 1 })} />
          <Button type="submit" name={`rename:${index}`}>
            {t('accounts.save')}
          </Button>
        </Field>
      </Form>
      <Text color="alternative">{t('accounts.copyHint')}</Text>
      <Copyable value={address} />
      <Button name={`remove-account:${index}`} variant="destructive" disabled={!removable}>
        {t('accounts.remove')}
      </Button>
      {removable ? null : <Text color="alternative">{t('accounts.remove.last')}</Text>}
    </Box>
  );
  return selected ? (
    content
  ) : (
    <Box>
      {content}
      <PillButton name={`select-account:${index}`} label={t('accounts.menu.use')} />
    </Box>
  );
};

const ConfirmRemoveAccount: SnapComponent<{
  index: number;
  address: string;
}> = ({ index, address }) => (
  <Box>
    <ConfirmRemoveBody index={index} address={address} />
    <Gap />
    <PillButton name={`confirm-remove-account:${index}`} label={t('accounts.remove.confirm')} kind="danger" />
    <PillButton name={`account-menu:${index}`} label={t('common.cancel')} kind="secondary" />
  </Box>
);

const ConfirmRemoveBody: SnapComponent<{ index: number; address: string }> = ({ index, address }) => (
  <Box>
    <Heading>{t('accounts.remove.title', { name: accountName(index) })}</Heading>
    <Text color="alternative">{shorten(address)}</Text>
    <Banner title={t('accounts.remove.confirm')} severity="warning">
      <Text>{isImported(index) ? t('accounts.remove.importedText') : t('accounts.remove.text')}</Text>
    </Banner>
  </Box>
);

const ImportAccount: SnapComponent<{ error?: string | undefined }> = ({ error }) => (
  <Box>
    <ScreenHeader title={t('import.title')} back="go-accounts" />
    <Form name="import-form">
      <Field label={t('import.secret')} error={error}>
        <Input name="secret" type="password" placeholder={t('import.secret.placeholder')} />
      </Field>
      <Field label={t('import.account')}>
        <Input name="accountNumber" type="number" placeholder="1" />
      </Field>
      <Text color="alternative" size="sm">
        {t('import.note')}
      </Text>
      <Gap />
      <PillButton name="import-account" label={t('import.submit')} submit />
    </Form>
  </Box>
);

/**
 * Imports a secret key or recovery phrase typed in the import form.
 *
 * @param id - Interface id.
 * @param value - Form values.
 */
async function submitImport(id: string, value: Record<string, unknown>) {
  const secret = readString(value, 'secret');
  const accountNumber = Number(readString(value, 'accountNumber') || '1');
  let keypair;
  try {
    keypair = await keypairFromImport(secret, accountNumber);
  } catch (error) {
    const reason = error instanceof ImportError ? error.message : 'phrase';
    await show(id, <ImportAccount error={t(`import.error.${reason as 'secret' | 'phrase' | 'account'}`)} />);
    return;
  }

  const { accounts } = await getState();
  const existing = await Promise.all(accounts.map(async (index) => (await getKeypair(index)).publicKey()));
  if (existing.includes(keypair.publicKey())) {
    await show(id, <ImportAccount error={t('import.error.duplicate')} />);
    return;
  }

  const index = await importAccount(keypair.secret());
  accountNames = (await getState()).accountNames;
  await show(
    id,
    await mainScreen({
      severity: 'success',
      title: t('import.done.title'),
      text: t('import.done.text', { name: accountName(index) }),
    }),
  );
}

// --- Trustlines ----------------------------------------------------------------

type AssetPickerRow = {
  code: string;
  issuer: string;
  avatar: string;
  subtitle: string;
  held: boolean;
};

/** Picker like the account/network lists: logo, code, issuer, + / ✓. */
const Assets: SnapComponent<{ rows: AssetPickerRow[] }> = ({ rows }) => (
  <Box>
    <AssetPickerList rows={rows} />
    <PillButton name="go-custom-asset" label={t('trust.otherAsset')} kind="secondary" />
  </Box>
);

const AssetPickerList: SnapComponent<{ rows: AssetPickerRow[] }> = ({ rows }) => (
  <Box>
    <ScreenHeader title={t('trust.title')} />
    {rows.map((row) => (
      <Box direction="horizontal" alignment="space-between">
        <Box direction="horizontal" crossAlignment="center">
          <Image src={row.avatar} alt={row.code} />
          <Box>
            <Text fontWeight="bold">{row.code}</Text>
            <Text size="sm" color="muted">
              {row.subtitle}
            </Text>
          </Box>
        </Box>
        <Button name={`${row.held ? 'remove' : 'add'}-trust:${row.code}:${row.issuer}`}>
          <Image src={rowAction(row.held ? 'added' : 'add')} alt={row.held ? '✓' : '+'} />
        </Button>
      </Box>
    ))}
  </Box>
);

const CustomAsset: SnapComponent<{
  errors?: FieldErrors | undefined;
  values?: { code: string; issuer: string } | undefined;
}> = ({ errors, values }) => (
  <Box>
    <Box>
      <ScreenHeader title={t('trust.otherAsset')} back="go-assets" />
      <Form name="trust-form">
        <Field label={t('trust.code')} error={errors?.code}>
          <Input name="code" placeholder="USDC" value={values?.code ?? ''} />
        </Field>
        <Field label={t('trust.issuer')} error={errors?.issuer}>
          <Input name="issuer" placeholder="G…" value={values?.issuer ?? ''} />
        </Field>
        <PillButton name="review-trust" label={t('send.review')} submit />
      </Form>
    </Box>
  </Box>
);

const TrustReview: SnapComponent<{
  network: NetworkConfig;
  code: string;
  issuer: string;
  issuerName: string | null;
  avatar: string;
  domain: string | null;
  remove: boolean;
  feeXlm: string;
}> = ({ network, code, issuer, issuerName, avatar, domain, remove, feeXlm }) => (
  <Box>
    <Box>
      <ScreenHeader title={t('trust.title')} back="go-assets" />
      <Box center>
        <Image src={avatar} alt={code} />
        <Heading>{remove ? t('trust.review.remove', { asset: code }) : t('trust.review.add', { asset: code })}</Heading>
      </Box>
      <Section>
        <Row label={t('review.network')}>
          <Text>{network.name}</Text>
        </Row>
        <Row label={t('trust.review.issuer')}>
          <Text>{issuerName ?? shorten(issuer)}</Text>
        </Row>
        {domain ? (
          <Row label={t('trust.review.domain')}>
            <Text>{domain}</Text>
          </Row>
        ) : null}
        <Row label={t('trust.review.reserve')}>
          <Text>{remove ? t('trust.review.reserve.free') : t('trust.review.reserve.lock')}</Text>
        </Row>
        <Row label={t('review.fee')}>
          <Text>{`${localizeNumber(feeXlm)} XLM`}</Text>
        </Row>
      </Section>
      {!remove && !issuerName ? (
        <Banner title={t('trust.review.unverified.title')} severity="warning">
          <Text>{t('trust.review.unverified.text')}</Text>
        </Banner>
      ) : null}
    </Box>
    <Gap />
    <PillButton
      name="confirm-trust"
      label={remove ? t('trust.confirm.remove') : t('trust.confirm.add')}
      kind={remove ? 'danger' : 'primary'}
    />
    <PillButton name="go-assets" label={t('common.back')} kind="secondary" />
  </Box>
);

// --- Payments ------------------------------------------------------------------

type AssetOption = {
  key: string;
  avatar: string;
  title: string;
  who: string;
  balance: string;
};

/** Tappable field showing the chosen asset; opens the picker screen. */
const AssetField: SnapComponent<{ name: string; option: AssetOption }> = ({ name, option }) => (
  <Button name={name}>
    <Image
      src={wideRow({
        avatar: option.avatar,
        title: option.title,
        subtitle: option.who,
        right: option.balance,
        trailing: 'chevron',
        surface: true,
      })}
      alt={option.title}
    />
  </Button>
);

/** Full-page asset list: grows downward and scrolls with the page. */
const AssetPicker: SnapComponent<{
  purpose: PickerPurpose;
  options: AssetOption[];
  selected: string | null;
}> = ({ purpose, options, selected }) => (
  <Box>
    <ScreenHeader title={t('picker.title')} back={`picker-back:${purpose}`} />
    {options.map((option) => (
      <Button name={`choose-asset:${purpose}:${option.key}`}>
        <Image
          src={wideRow({
            avatar: option.avatar,
            title: option.title,
            subtitle: option.who,
            right: option.balance,
            trailing: option.key === selected ? 'check' : undefined,
            surface: option.key === selected,
          })}
          alt={option.title}
        />
      </Button>
    ))}
  </Box>
);

const Send: SnapComponent<{
  network: NetworkConfig;
  account: HorizonAccount;
  option: AssetOption;
  form: SendForm;
  errors?: FieldErrors | undefined;
}> = ({ network, account, option, form, errors }) => {
  const selected = account.balances.find((balance) => assetKey(balance) === form.asset) ?? account.balances[0];
  const available = selected ? localizeNumber(formatStroops(spendableStroops(account, selected))) : '0';

  return (
    <Box>
      <Box>
        <ScreenHeader title={t('send.title', { network: networkLabel(network.id) })} />
        <Form name="send-form">
          <Field label={t('send.destination')} error={errors?.destination}>
            <Input name="destination" placeholder="G…" value={form.destination} />
          </Field>
          <Text fontWeight="bold">{t('send.asset')}</Text>
          <AssetField name="pick-asset:send" option={option} />
          {errors?.assetCode ? <Text color="error">{errors.assetCode}</Text> : null}
          <Field label={t('send.amount', { available })} error={errors?.amount}>
            <Input name="amount" placeholder="0" value={form.amount} />
          </Field>
          <Field label={t('send.memo')} error={errors?.memo}>
            <Input name="memo" placeholder={t('send.memo.placeholder')} value={form.memo} />
          </Field>
          <Gap />
          <PillButton name="review" label={t('send.review')} submit />
        </Form>
      </Box>
    </Box>
  );
};

/** What the swap form shows under "You receive" while typing. */
type SwapEstimate = { receive: string; fee?: string | undefined; error?: boolean };

const Swap: SnapComponent<{
  from: AssetOption;
  to: AssetOption | null;
  /** Undefined keeps whatever is typed (live re-render while typing). */
  amount?: string | undefined;
  available: string;
  estimate?: SwapEstimate | undefined;
  errors?: FieldErrors | undefined;
}> = ({ from, to, amount, available, estimate, errors }) => (
  <Box>
    <ScreenHeader title={t('swap.title')} />
    <Form name="swap-form">
      <Text fontWeight="bold">{t('swap.from')}</Text>
      <AssetField name="pick-asset:swap-from" option={from} />
      <Field label={t('swap.amount', { available })} error={errors?.amount}>
        <Input name="amount" placeholder="0" value={amount} />
      </Field>
      <Text fontWeight="bold">{t('swap.to')}</Text>
      {to ? (
        <AssetField name="pick-asset:swap-to" option={to} />
      ) : (
        <Text color="alternative">{t('swap.noAssets')}</Text>
      )}
      {errors?.to ? <Text color="error">{errors.to}</Text> : null}
      {to && estimate ? (
        estimate.error ? (
          <Text color="error">{estimate.receive}</Text>
        ) : (
          <Section>
            <Row label={t('swap.youGet')}>
              <Text fontWeight="bold">{estimate.receive}</Text>
            </Row>
            {estimate.fee ? (
              <Row label={t('swap.fee')}>
                <Text color="alternative">{estimate.fee}</Text>
              </Row>
            ) : null}
          </Section>
        )
      ) : null}
      <Gap />
      {to ? (
        <PillButton name="review-swap" label={t('swap.review')} submit />
      ) : (
        <PillButton name="go-assets" label={t('trust.title')} />
      )}
    </Form>
  </Box>
);

const SwapReview: SnapComponent<{ quote: SwapQuote }> = ({ quote }) => {
  const rate = toStroops(quote.swapAmount) > 0n ? Number(quote.estimated) / Number(quote.swapAmount) : 0;
  const route = [quote.from, ...quote.path, quote.to].map((asset) => asset.code).join(' → ');
  return (
    <Box>
      <ScreenHeader title={t('swap.review.title')} back="edit-swap" />
      <Box center>
        <Heading size="lg">{`${localizeNumber(formatAmount(quote.sendAmount))} ${quote.from.code}`}</Heading>
        <Icon name="arrow-down" color="muted" />
        <Heading size="lg">{`≈ ${localizeNumber(formatAmount(quote.estimated))} ${quote.to.code}`}</Heading>
      </Box>
      <Section>
        <Row label={t('swap.rate')}>
          <Text>{`1 ${quote.from.code} ≈ ${localizeNumber(rate.toFixed(7).replace(/\.?0+$/u, ''))} ${quote.to.code}`}</Text>
        </Row>
        <Row label={t('swap.minimum')}>
          <Text>{`${localizeNumber(formatAmount(quote.minimum))} ${quote.to.code}`}</Text>
        </Row>
        <Row label={t('swap.slippage')}>
          <Text>{`${localizeNumber((quote.slippageBps / 100).toFixed(2))}%`}</Text>
        </Row>
        {toStroops(quote.fee.amount) > 0n ? (
          <Row label={t('swap.fee')}>
            <Text>{`${localizeNumber(formatAmount(quote.fee.amount))} ${quote.from.code} (${localizeNumber((quote.fee.bps / 100).toFixed(2))}%)`}</Text>
          </Row>
        ) : null}
        <Row label={t('swap.route')}>
          <Text>{quote.path.length === 0 ? `${route} · ${t('swap.direct')}` : route}</Text>
        </Row>
        <Row label={t('swap.provider')}>
          <Text>Cosmos Pay</Text>
        </Row>
      </Section>
      <Gap />
      <PillButton name="confirm-swap" label={t('swap.confirm')} />
      <PillButton name="edit-swap" label={t('review.edit')} kind="secondary" />
    </Box>
  );
};

const Review: SnapComponent<{
  network: NetworkConfig;
  from: string;
  form: SendForm;
  assetLabel: string;
  feeXlm: string;
  createsAccount: boolean;
}> = ({ network, from, form, assetLabel, feeXlm, createsAccount }) => (
  <Box>
    <Box>
      <ScreenHeader title={t('review.title')} back="edit-send" />
      <Box center>
        <Heading size="lg">{`${localizeNumber(formatAmount(normalizeAmount(form.amount)))} ${assetLabel}`}</Heading>
      </Box>
      <Section>
        <Row label={t('review.network')}>
          <Text>{network.name}</Text>
        </Row>
        <Row label={t('review.from')}>
          <Text>{shorten(from)}</Text>
        </Row>
        <Row label={t('review.to')}>
          <Text>{shorten(form.destination.trim())}</Text>
        </Row>
        {form.memo.trim() ? (
          <Row label={t('review.memo')}>
            <Text>{form.memo.trim()}</Text>
          </Row>
        ) : null}
        <Row label={t('review.fee')}>
          <Text>{`${localizeNumber(feeXlm)} XLM`}</Text>
        </Row>
      </Section>
      {createsAccount ? (
        <Banner title={t('review.newAccount.title')} severity="info">
          <Text>{t('review.newAccount.text')}</Text>
        </Banner>
      ) : null}
      {network.id === 'mainnet' ? (
        <Banner title={t('review.mainnet.title')} severity="warning">
          <Text>{t('review.mainnet.text')}</Text>
        </Banner>
      ) : null}
    </Box>
    <Gap />
    <PillButton name="confirm-send" label={t('review.confirm')} />
    <PillButton name="edit-send" label={t('review.edit')} kind="secondary" />
  </Box>
);

const Sent: SnapComponent<{
  amount: string;
  explorerUrl: string;
  hash: string;
  title?: string;
}> = (props) => (
  <Box>
    <SentBody {...props} />
    <Gap />
    <PillButton name="back" label={t('common.done')} />
  </Box>
);

const SentBody: SnapComponent<{
  amount: string;
  explorerUrl: string;
  hash: string;
  title?: string;
}> = ({ amount, explorerUrl, hash, title }) => (
  <Box>
    <Box center>
      <Icon name="check" color="primary" />
      <Heading>{title ?? t('sent.title')}</Heading>
      <Text alignment="center">{amount}</Text>
    </Box>
    <Row label={t('sent.transaction')}>
      <Text>{shorten(hash)}</Text>
    </Row>
    <Link href={explorerUrl}>{t('sent.explorer')}</Link>
  </Box>
);

const Failed: SnapComponent<{ message: string; retry: string }> = ({ message, retry }) => (
  <Box>
    <Box>
      <Banner title={t('failed.title')} severity="danger">
        <Text>{message}</Text>
      </Banner>
    </Box>
    <Gap />
    <PillButton name={retry} label={t('failed.retry')} />
    <PillButton name="back" label={t('common.back')} kind="secondary" />
  </Box>
);

const Receive: SnapComponent<{
  address: string;
  network: NetworkConfig;
  qr: string;
  active: boolean;
}> = ({ address, network, qr, active }) => (
  <Box>
    <ScreenHeader title={t('receive.title', { network: networkLabel(network.id) })} />
    <Box center>
      <Image src={qr} alt={t('receive.qrAlt')} />
    </Box>
    <Gap size={8} />
    <Copyable value={address} />
    <Text color="alternative">{t('receive.note')}</Text>
    {active ? null : (
      <Banner title={t('home.inactive.title')} severity="info">
        <Text>{t('receive.inactive')}</Text>
      </Banner>
    )}
  </Box>
);

const Fund: SnapComponent<{ address: string }> = ({ address }) => (
  <Box>
    <ScreenHeader title={t('fund.title')} />
    <Text>{t('fund.step1')}</Text>
    <Text>{t('fund.step2')}</Text>
    <Copyable value={address} />
    <Text>{t('fund.step3')}</Text>
  </Box>
);

// --- Loading skeletons --------------------------------------------------------------

/** Placeholder rows shaped like the list that is loading. */
const SkeletonRows: SnapComponent<{ count: number }> = ({ count }) => (
  <Box>
    {Array.from({ length: count }, () => (
      <Box direction="horizontal" crossAlignment="center">
        <Skeleton width={40} height={40} borderRadius="full" />
        <Box>
          <Skeleton width={140} height={14} />
          <Skeleton width={90} height={12} />
        </Box>
      </Box>
    ))}
  </Box>
);

/** Shown the instant a screen is opened, while its data loads. */
const PageSkeleton: SnapComponent<{ title: string }> = ({ title }) => (
  <Box>
    <ScreenHeader title={title} />
    <SkeletonRows count={4} />
  </Box>
);

const HomeSkeleton: SnapComponent = () => (
  <Box>
    <Box direction="horizontal" alignment="space-between">
      <Box>
        <Skeleton width={110} height={20} />
        <Skeleton width={90} height={12} />
      </Box>
    </Box>
    <Box center>
      <Skeleton width={170} height={36} />
      <Skeleton width={90} height={14} />
    </Box>
    <Box direction="horizontal" alignment="center">
      <Skeleton width={70} height={64} />
      <Skeleton width={70} height={64} />
      <Skeleton width={70} height={64} />
      <Skeleton width={70} height={64} />
    </Box>
    <SkeletonRows count={3} />
  </Box>
);

// --- Sign ---------------------------------------------------------------------------

const SignForm: SnapComponent<{ error?: string | undefined }> = ({ error }) => (
  <Box>
    <ScreenHeader title={t('sign.title')} />
    <Text color="alternative">{t('sign.hint')}</Text>
    <Form name="sign-form">
      <Field label={t('sign.xdr')} error={error}>
        <Input name="xdr" placeholder="AAAA…" />
      </Field>
      <Gap />
      <PillButton name="review-sign" label={t('send.review')} submit />
    </Form>
  </Box>
);

const SignReview: SnapComponent<{
  network: NetworkConfig;
  signer: string;
  source: string;
  fee: string;
  memo?: string | undefined;
  operations: OperationSummary[];
}> = ({ network, signer, source, fee, memo, operations }) => (
  <Box>
    <ScreenHeader title={t('sign.review.title')} back="edit-sign" />
    {source === signer ? null : (
      <Banner title={t('dialog.sourceMismatch.title')} severity="warning">
        <Text>{t('dialog.sourceMismatch.text')}</Text>
      </Banner>
    )}
    <Section>
      <Row label={t('review.network')}>
        <Text>{network.name}</Text>
      </Row>
      <Row label={t('dialog.signer')}>
        <Text>{shorten(signer)}</Text>
      </Row>
      <Row label={t('dialog.source')}>
        <Text>{shorten(source)}</Text>
      </Row>
      <Row label={t('dialog.maxFee')}>
        <Text>{`${localizeNumber(formatAmount(formatStroops(BigInt(fee))))} XLM`}</Text>
      </Row>
      {memo ? (
        <Row label={t('dialog.memo')}>
          <Text>{memo}</Text>
        </Row>
      ) : null}
    </Section>
    {operations.map((operation, index) => (
      <Section>
        <Text fontWeight="bold">{`${index + 1}. ${operation.type}`}</Text>
        {operation.details.map(([label, value]) => (
          <Row label={label}>
            <Text>{value}</Text>
          </Row>
        ))}
      </Section>
    ))}
    <Gap />
    <PillButton name="sign-submit" label={t('sign.submit')} />
    <PillButton name="sign-only" label={t('sign.only')} kind="secondary" />
  </Box>
);

const Signed: SnapComponent<{ xdr: string }> = ({ xdr }) => (
  <Box>
    <ScreenHeader title={t('sign.done.title')} />
    <Box center>
      <Icon name="check" color="primary" />
      <Text alignment="center">{t('sign.done.text')}</Text>
    </Box>
    <Copyable value={xdr} />
    <Gap />
    <PillButton name="back" label={t('common.done')} />
  </Box>
);

// --- Controller ------------------------------------------------------------------

async function loadContext() {
  const state = await getState();
  const keypair = await getKeypair(state.selectedAccount);
  const network = NETWORKS[state.network];
  const account = await fetchAccount(network, keypair.publicKey()).catch(() => null);
  return { state, keypair, network, account };
}

async function accountOptions(indexes: number[]): Promise<AccountOption[]> {
  return Promise.all(
    indexes.map(async (index) => ({
      index,
      address: (await getKeypair(index)).publicKey(),
    })),
  );
}

async function show(id: string, ui: JSXElement, context: HomeContext = {}) {
  await snap.request({
    method: 'snap_updateInterface',
    params: { id, ui, context },
  });
}

const signedPercent = (value: number) => `${value < 0 ? '-' : '+'}${localizeNumber(Math.abs(value).toFixed(2))}%`;

/**
 * Token rows and the headline balance with its 24h performance.
 *
 * @param network - Network config.
 * @param account - Horizon account (null when not activated).
 * @returns Rows and summary.
 */
async function portfolio(
  network: NetworkConfig,
  account: HorizonAccount | null,
): Promise<{ rows: TokenRow[]; summary: Summary }> {
  const balances = account?.balances.filter((balance) => balance.asset_type !== 'liquidity_pool_shares') ?? [];
  const registry = await getRegistry(network);
  // USD estimate everywhere: test-network assets use their mainnet price.
  const idOf = (balance: HorizonBalance) =>
    pricingAssetId(
      assetLabelOf(balance),
      balance.asset_type === 'native' ? null : (balance.asset_issuer ?? null),
      network.id,
      registry,
    );
  const ids = [
    ...new Set((balances.length > 0 ? balances.map(idOf) : [XLM_ASSET_ID]).filter((id): id is string => id !== null)),
  ];
  const prices = await fetchPrices(ids);
  const hidden = hideBalances();

  let total = 0;
  let totalDelta = 0;
  let currency: string | null = null;

  const rows = await Promise.all(
    balances.map(async (balance): Promise<TokenRow> => {
      const code = assetLabelOf(balance);
      const issuer = balance.asset_type === 'native' ? null : (balance.asset_issuer ?? null);
      const entry = findAsset(registry, code, issuer);
      const priceId = idOf(balance);
      const price = priceId ? prices[priceId] : undefined;
      const amount = `${balanceText(balance.balance)} ${code}`;

      let fiat: string | null = null;
      let fiatValue = 0;
      if (price) {
        const value = Number(balance.balance) * price.price;
        fiatValue = value;
        total += value;
        if (price.change24h !== null) {
          totalDelta += value - value / (1 + price.change24h / 100);
        }
        currency = price.currency;
        fiat = hidden ? `${price.currency.toUpperCase()} ${t('common.hidden')}` : formatFiat(value, price.currency);
      }

      const who =
        issuer === null
          ? 'Stellar'
          : entry?.verified
            ? entry.issuerName
            : `${t('trust.unverified')} · ${shorten(issuer)}`;
      // No 24h data (or no market at all) reads as a flat 0,00 %.
      const change24h = price?.change24h ?? 0;
      // Anything that rounds to 0,00 % is shown flat: no sign, no color.
      const flat = Math.abs(change24h) < 0.005;
      const change = {
        text: flat ? `${localizeNumber('0.00')}%` : signedPercent(change24h),
        tone: flat ? ('flat' as const) : change24h > 0 ? ('up' as const) : ('down' as const),
      };
      const title = issuer === null ? t('asset.xlm') : (entry?.name ?? code);
      // Same two-line layout for every row: assets without a market price show 0.
      const { currency: userCurrency, enabled: pricing } = pricingPreferences();
      const value = fiat ?? (pricing ? formatFiat(0, userCurrency) : amount);

      return {
        avatar: await assetAvatar(code, issuer, registry),
        info: tokenInfo(title, who.replace(' · ', ' '), change),
        title,
        value,
        extra: value === amount ? '' : amount,
        sortValue: fiatValue,
        sortAmount: Number(balance.balance),
      };
    }),
  );

  // Largest holdings first, like MetaMask: by value, then by amount.
  rows.sort((a, b) => b.sortValue - a.sortValue || b.sortAmount - a.sortAmount);

  const native = balances.find((balance) => balance.asset_type === 'native');
  let summary: Summary = {
    headline: `${balanceText(native?.balance ?? '0')} XLM`,
    change: null,
  };

  // Not activated yet: still show the estimate (0) in the user's currency.
  const fallbackCurrency = currency ?? prices[XLM_ASSET_ID]?.currency ?? null;
  if (fallbackCurrency !== null) {
    summary = {
      headline: hidden
        ? `${fallbackCurrency.toUpperCase()} ${t('common.hidden')}`
        : formatFiat(total, fallbackCurrency),
      change:
        hidden || total === 0
          ? null
          : {
              text: `${totalDelta < 0 ? '-' : '+'}${formatFiat(Math.abs(totalDelta), fallbackCurrency)} (${signedPercent((totalDelta / (total - totalDelta)) * 100)})`,
              color: totalDelta < 0 ? 'error' : 'success',
            },
    };
  }

  return { rows, summary };
}

async function mainScreen(notice?: Notice, tab: Tab = 'tokens'): Promise<JSXElement> {
  const { state, keypair, network, account } = await loadContext();
  const address = keypair.publicKey();
  const [{ rows, summary }, payments] = await Promise.all([
    portfolio(network, account),
    tab === 'activity' && account ? fetchPayments(network, address).catch(() => []) : Promise.resolve([]),
  ]);
  return (
    <Main
      selected={state.selectedAccount}
      address={address}
      network={network}
      funded={account !== null}
      summary={summary}
      tokens={rows}
      tab={tab}
      payments={payments}
      notice={notice}
    />
  );
}

function toRequest(form: SendForm): PaymentRequest {
  const [code, issuer] = form.asset === 'native' ? [] : form.asset.split(':');
  return {
    destination: form.destination,
    amount: normalizeAmount(form.amount),
    memo: form.memo,
    ...(code && issuer ? { assetCode: code, assetIssuer: issuer } : {}),
  };
}

const readString = (value: Record<string, unknown>, key: string, fallback = '') =>
  typeof value[key] === 'string' ? (value[key] as string) : fallback;

const readForm = (value: Record<string, unknown>): SendForm => ({
  destination: readString(value, 'destination'),
  amount: readString(value, 'amount'),
  asset: readString(value, 'asset', 'native'),
  memo: readString(value, 'memo'),
});

/**
 * Creates the home page interface.
 *
 * @returns The interface id.
 */
export async function createHome(): Promise<string> {
  await loadPreferences();
  accountNames = (await getState()).accountNames;
  return snap.request({
    method: 'snap_createInterface',
    params: { ui: await mainScreen(), context: {} },
  });
}

/**
 * The account's assets as picker options (logo, name, issuer, balance).
 *
 * @param network - Network config.
 * @param account - Horizon account.
 * @returns Options, largest balance first is not needed here: XLM first.
 */
async function assetOptions(network: NetworkConfig, account: HorizonAccount): Promise<AssetOption[]> {
  const registry = await getRegistry(network);
  return Promise.all(
    account.balances
      .filter((balance) => balance.asset_type !== 'liquidity_pool_shares')
      .map(async (balance): Promise<AssetOption> => {
        const code = assetLabelOf(balance);
        const issuer = balance.asset_type === 'native' ? null : (balance.asset_issuer ?? null);
        const entry = findAsset(registry, code, issuer);
        return {
          key: assetKey(balance),
          avatar: await assetAvatar(code, issuer, registry),
          title: issuer === null ? t('asset.xlm') : (entry?.name ?? code),
          who:
            issuer === null
              ? 'Stellar'
              : entry?.verified
                ? entry.issuerName
                : `${t('trust.unverified')} ${shorten(issuer)}`,
          balance: `${balanceText(balance.balance)} ${code}`,
        };
      }),
  );
}

const swapAssetOf = (key: string): SwapAsset => {
  if (key === 'native') {
    return { code: 'XLM', issuer: null };
  }
  const [code = '', issuer = ''] = key.split(':');
  return { code, issuer };
};

/** Values typed in a form, read back before leaving the screen (e.g. to pick an asset). */
async function formValues(id: string, form: string): Promise<Record<string, unknown>> {
  try {
    const state = (await snap.request({
      method: 'snap_getInterfaceState',
      params: { id },
    })) as Record<string, unknown>;
    const values = state[form];
    return values && typeof values === 'object' ? (values as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

async function openPicker(id: string, purpose: PickerPurpose, context: HomeContext) {
  const { network, account } = await loadContext();
  if (!account) {
    await show(id, await mainScreen());
    return;
  }
  let options = await assetOptions(network, account);
  const swap = context.swap;
  if (purpose === 'swap-to' && swap) {
    options = options.filter((option) => option.key !== swap.from);
  }
  const selected =
    purpose === 'send'
      ? (context.form ?? EMPTY_FORM).asset
      : purpose === 'swap-from'
        ? (swap?.from ?? null)
        : (swap?.to ?? null);
  await show(id, <AssetPicker purpose={purpose} options={options} selected={selected} />, context);
}

async function openSwap(
  id: string,
  swap: SwapForm,
  errors?: FieldErrors,
  live?: { estimate: SwapEstimate | undefined },
) {
  const { network, account } = await loadContext();
  if (!account) {
    await show(id, await mainScreen());
    return;
  }
  const options = await assetOptions(network, account);
  const from = options.find((option) => option.key === swap.from) ?? options[0];
  if (!from) {
    await show(id, await mainScreen());
    return;
  }
  const candidates = options.filter((option) => option.key !== from.key);
  const to = candidates.find((option) => option.key === swap.to) ?? candidates[0] ?? null;
  const fromBalance = account.balances.find((balance) => assetKey(balance) === from.key);
  const available = fromBalance ? localizeNumber(formatStroops(spendableStroops(account, fromBalance))) : '0';
  const next: SwapForm = {
    from: from.key,
    to: to?.key ?? null,
    amount: swap.amount,
  };
  const estimate = live ? live.estimate : errors ? undefined : await swapEstimate(network, next);
  await show(
    id,
    <Swap
      from={from}
      to={to}
      amount={live ? undefined : swap.amount}
      available={available}
      estimate={estimate}
      errors={errors}
    />,
    { swap: next },
  );
}

/**
 * The "you receive" line for the amount typed so far, from the Cosmos Pay quote.
 *
 * @param network - Network config.
 * @param swap - Current form.
 * @returns The estimate, or undefined while there is nothing to price.
 */
async function swapEstimate(network: NetworkConfig, swap: SwapForm): Promise<SwapEstimate | undefined> {
  const amount = normalizeAmount(swap.amount);
  if (!swap.to || !/^\d+(\.\d{1,7})?$/u.test(amount) || toStroops(amount) <= 0n) {
    return undefined;
  }
  try {
    const quote = await estimateSwap(network, {
      from: swapAssetOf(swap.from),
      to: swapAssetOf(swap.to),
      amount,
    });
    return {
      receive: `≈ ${localizeNumber(formatAmount(quote.estimated))} ${quote.to.code}`,
      fee:
        toStroops(quote.fee.amount) > 0n
          ? `${localizeNumber(formatAmount(quote.fee.amount))} ${quote.from.code} (${localizeNumber((quote.fee.bps / 100).toFixed(2))}%)`
          : undefined,
    };
  } catch (error) {
    const message = error instanceof PaymentValidationError ? Object.values(error.fields)[0] : (error as Error).message;
    return { receive: message ?? t('swap.error.noPath'), error: true };
  }
}

const sleep = async (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Re-prices the swap as the amount is typed. Waits for a pause in typing and
 * drops any result the user has already typed past, so only the latest amount
 * ever renders; the input itself is never overwritten.
 *
 * @param id - Interface id.
 * @param swap - Form as kept in context.
 * @param typed - Amount just typed.
 */
async function liveSwapEstimate(id: string, swap: SwapForm, typed: string) {
  const current = async () => readString(await formValues(id, 'swap-form'), 'amount', typed);
  await sleep(350);
  if ((await current()) !== typed) {
    return;
  }
  const { network } = await loadContext();
  const estimate = await swapEstimate(network, { ...swap, amount: typed });
  if ((await current()) !== typed) {
    return;
  }
  await openSwap(id, { ...swap, amount: typed }, undefined, { estimate });
}

async function reviewSwap(id: string, swap: SwapForm) {
  if (!swap.to) {
    await openSwap(id, swap);
    return;
  }
  await show(id, <Loading text={t('loading.quote')} />, { swap });
  const { keypair, network } = await loadContext();
  try {
    const quote = await quoteSwap(network, keypair, {
      from: swapAssetOf(swap.from),
      to: swapAssetOf(swap.to),
      amount: normalizeAmount(swap.amount),
    });
    await show(id, <SwapReview quote={quote} />, { swap, quote });
  } catch (error) {
    if (error instanceof PaymentValidationError) {
      await openSwap(id, swap, error.fields);
      return;
    }
    await show(id, <Failed message={(error as Error).message} retry="edit-swap" />, { swap });
  }
}

async function confirmSwap(id: string, swap: SwapForm | undefined, quote: SwapQuote) {
  await show(id, <Loading text={t('loading.swap')} />, { swap, quote });
  const { keypair, network } = await loadContext();
  try {
    const result = await executeSwap(network, keypair, quote);
    await show(
      id,
      <Sent
        title={t('swap.done.title')}
        amount={`${localizeNumber(formatAmount(quote.sendAmount))} ${quote.from.code} → ≈ ${localizeNumber(formatAmount(quote.estimated))} ${quote.to.code}`}
        explorerUrl={result.explorerUrl}
        hash={result.hash}
      />,
    );
  } catch (error) {
    await show(id, <Failed message={(error as Error).message} retry="edit-swap" />, { swap });
  }
}

async function openSend(id: string, form: SendForm, errors?: FieldErrors) {
  const { network, account } = await loadContext();
  if (!account) {
    await show(id, await mainScreen());
    return;
  }
  const options = await assetOptions(network, account);
  const option = options.find((candidate) => candidate.key === form.asset) ?? options[0];
  if (!option) {
    await show(id, await mainScreen());
    return;
  }
  await show(
    id,
    <Send network={network} account={account} option={option} form={{ ...form, asset: option.key }} errors={errors} />,
    { form: { ...form, asset: option.key } },
  );
}

async function review(id: string, form: SendForm) {
  await show(id, <Loading text={t('loading.review')} />, { form });
  const { keypair, network } = await loadContext();
  try {
    const prepared = await preparePayment(network, keypair, toRequest(form));
    await show(
      id,
      <Review
        network={network}
        from={keypair.publicKey()}
        form={form}
        assetLabel={prepared.assetLabel}
        feeXlm={prepared.feeXlm}
        createsAccount={prepared.createsAccount}
      />,
      { form },
    );
  } catch (error) {
    if (error instanceof PaymentValidationError) {
      await openSend(id, form, error.fields);
      return;
    }
    await show(id, <Failed message={(error as Error).message} retry="edit-send" />, { form });
  }
}

async function confirmSend(id: string, form: SendForm) {
  await show(id, <Loading text={t('loading.sending')} />, { form });
  const { keypair, network } = await loadContext();
  try {
    // Rebuild with a fresh sequence number right before signing.
    const prepared = await preparePayment(network, keypair, toRequest(form));
    const result = await sendPayment(network, keypair, prepared);
    await show(
      id,
      <Sent
        amount={`${localizeNumber(formatAmount(normalizeAmount(form.amount)))} ${prepared.assetLabel}`}
        explorerUrl={result.explorerUrl}
        hash={result.hash}
      />,
    );
  } catch (error) {
    await show(id, <Failed message={(error as Error).message} retry="edit-send" />, { form });
  }
}

async function openAssets(id: string) {
  const { network, account } = await loadContext();
  if (!account) {
    await show(id, await mainScreen());
    return;
  }
  const registry = await getRegistry(network);
  const trustlines = account.balances.filter(
    (balance) => balance.asset_type === 'credit_alphanum4' || balance.asset_type === 'credit_alphanum12',
  );
  const held = (code: string, issuer: string) =>
    trustlines.some((line) => line.asset_code === code && line.asset_issuer === issuer);

  const candidates = [
    ...registry.filter((asset): asset is RegistryAsset & { issuer: string } => asset.issuer !== null),
    // Assets the user holds that Cosmos Pay doesn't list.
    ...trustlines
      .filter((line) => !findAsset(registry, line.asset_code ?? '', line.asset_issuer ?? null))
      .map((line) => ({
        code: line.asset_code ?? '',
        issuer: line.asset_issuer ?? '',
        name: line.asset_code ?? '',
        issuerName: '',
        issuerDomain: '',
        verified: false,
      })),
  ];

  const rows = await Promise.all(
    candidates.map(async (asset): Promise<AssetPickerRow> => ({
      code: asset.code,
      issuer: asset.issuer,
      avatar: await assetAvatar(asset.code, asset.issuer, registry, 36),
      subtitle: asset.verified ? asset.issuerName : `${t('trust.unverified')} · ${shorten(asset.issuer)}`,
      held: held(asset.code, asset.issuer),
    })),
  );
  await show(id, <Assets rows={rows} />);
}

async function openCustomAsset(id: string, errors?: FieldErrors, values?: { code: string; issuer: string }) {
  await show(id, <CustomAsset errors={errors} values={values} />);
}

async function reviewTrust(id: string, trust: TrustlineRequest, fromForm = false) {
  await show(id, <Loading text={t('loading.trust')} />, { trust });
  const { keypair, network } = await loadContext();
  try {
    const [prepared, registry] = await Promise.all([prepareTrustline(network, keypair, trust), getRegistry(network)]);
    const entry = findAsset(registry, prepared.code, prepared.issuer);
    await show(
      id,
      <TrustReview
        network={network}
        code={prepared.code}
        issuer={prepared.issuer}
        issuerName={entry?.verified ? entry.issuerName : null}
        avatar={await assetAvatar(prepared.code, prepared.issuer, registry, 56)}
        domain={prepared.domain}
        remove={prepared.remove}
        feeXlm={prepared.feeXlm}
      />,
      { trust },
    );
  } catch (error) {
    if (error instanceof PaymentValidationError && fromForm) {
      await openCustomAsset(id, error.fields, {
        code: trust.code,
        issuer: trust.issuer,
      });
      return;
    }
    await show(id, <Failed message={(error as Error).message} retry="go-assets" />);
  }
}

async function confirmTrust(id: string, trust: TrustlineRequest) {
  await show(id, <Loading text={t('loading.sending')} />, { trust });
  const { keypair, network } = await loadContext();
  try {
    const prepared = await prepareTrustline(network, keypair, trust);
    await signAndSubmit(network, keypair, prepared.tx);
    await show(
      id,
      await mainScreen(
        prepared.remove
          ? {
              severity: 'success',
              title: t('trust.removed.title'),
              text: t('trust.removed.text', { asset: prepared.code }),
            }
          : {
              severity: 'success',
              title: t('trust.added.title'),
              text: t('trust.added.text', { asset: prepared.code }),
            },
      ),
    );
  } catch (error) {
    await show(id, <Failed message={(error as Error).message} retry="go-assets" />);
  }
}

async function openAccounts(id: string) {
  const state = await getState();
  const network = NETWORKS[state.network];
  const [options, prices] = await Promise.all([accountOptions(state.accounts), fetchPrices([XLM_ASSET_ID])]);
  const price = prices[XLM_ASSET_ID];
  const rows = await Promise.all(
    options.map(async (option) => {
      const account = await fetchAccount(network, option.address).catch(() => null);
      const native = account?.balances.find((balance) => balance.asset_type === 'native');
      const amount = native?.balance ?? '0';
      const balance =
        price && !hideBalances()
          ? formatFiat(Number(amount) * price.price, price.currency)
          : `${balanceText(amount)} XLM`;
      return { ...option, balance };
    }),
  );
  await show(id, <Accounts rows={rows} selected={state.selectedAccount} network={network} />);
}

/**
 * Swaps the screen for a skeleton the moment a slow screen is requested, so
 * the click answers instantly while its data loads.
 *
 * @param id - Interface id.
 * @param name - Clicked button.
 * @param context - Current context (kept, so nothing is lost).
 */
async function showSkeleton(id: string, name: string, context: HomeContext) {
  const pages: Record<string, string> = {
    'go-accounts': t('accounts.title'),
    'go-assets': t('trust.title'),
    'go-swap': t('swap.title'),
    'edit-swap': t('swap.title'),
    'go-send': t('home.send'),
    'edit-send': t('home.send'),
    'go-receive': t('home.receive'),
  };
  let skeleton: JSXElement | null = null;
  if (pages[name]) {
    skeleton = <PageSkeleton title={pages[name]} />;
  } else if (name.startsWith('account-menu:')) {
    skeleton = <PageSkeleton title={accountName(Number(name.split(':')[1]))} />;
  } else if (name.startsWith('activity:')) {
    skeleton = <PageSkeleton title={t('activity.detail.title')} />;
  } else if (
    name === 'back' ||
    name === 'dismiss' ||
    name === 'tab-tokens' ||
    name === 'tab-activity' ||
    name.startsWith('select-account:')
  ) {
    skeleton = <HomeSkeleton />;
  }
  if (skeleton) {
    await show(id, skeleton, context);
  }
}

async function openActivity(id: string, operationId: string) {
  const { keypair, network } = await loadContext();
  const payment = await fetchOperation(network, operationId).catch(() => null);
  if (!payment) {
    await show(id, await mainScreen(undefined, 'activity'), { tab: 'activity' });
    return;
  }
  await show(id, <ActivityDetail payment={payment} address={keypair.publicKey()} network={network} />, {
    tab: 'activity',
  });
}

/**
 * Decodes a pasted transaction and shows what signing it would do.
 *
 * @param id - Interface id.
 * @param xdr - Base64 transaction envelope.
 */
async function reviewSign(id: string, xdr: string) {
  const { keypair, network } = await loadContext();
  let tx;
  try {
    tx = TransactionBuilder.fromXDR(xdr, network.passphrase);
  } catch {
    await show(id, <SignForm error={t('sign.error.xdr', { network: network.name })} />);
    return;
  }
  const inner = innerTransaction(tx);
  const memo = inner.memo.value;
  await show(
    id,
    <SignReview
      network={network}
      signer={keypair.publicKey()}
      source={'feeSource' in tx ? tx.feeSource : inner.source}
      fee={tx.fee}
      memo={memo === null || memo === undefined ? undefined : memo.toString()}
      operations={inner.operations.map(describeOperation)}
    />,
    { sign: xdr },
  );
}

/**
 * Signs the reviewed transaction, and optionally submits it.
 *
 * @param id - Interface id.
 * @param xdr - The reviewed envelope.
 * @param submit - Also send it to the network.
 */
async function signXdr(id: string, xdr: string, submit: boolean) {
  const { keypair, network } = await loadContext();
  if (submit) {
    await show(id, <Loading text={t('loading.sending')} />, { sign: xdr });
  }
  try {
    const tx = TransactionBuilder.fromXDR(xdr, network.passphrase);
    tx.sign(keypair);
    const signed = tx.toXDR();
    if (!submit) {
      await show(id, <Signed xdr={signed} />);
      return;
    }
    const result = await submitTransaction(network, signed);
    await show(
      id,
      <Sent
        title={t('sign.sent.title')}
        amount={t('sign.ops', { n: innerTransaction(tx).operations.length })}
        explorerUrl={`${network.explorerUrl}/tx/${result.hash}`}
        hash={result.hash}
      />,
    );
  } catch (error) {
    await show(id, <Failed message={(error as Error).message} retry="edit-sign" />, { sign: xdr });
  }
}

async function openAccountMenu(id: string, index: number) {
  const state = await getState();
  if (!state.accounts.includes(index)) {
    await openAccounts(id);
    return;
  }
  await show(
    id,
    <AccountMenu
      index={index}
      address={(await getKeypair(index)).publicKey()}
      network={NETWORKS[state.network]}
      selected={state.selectedAccount === index}
      removable={state.accounts.length > 1}
    />,
  );
}

async function showAccountAdded(id: string, index: number) {
  await show(
    id,
    await mainScreen({
      severity: 'success',
      title: t('accounts.added.title'),
      text: t('accounts.added.text', { name: accountName(index) }),
    }),
  );
}

const parseTrustButton = (name: string): TrustlineRequest | null => {
  const [, code, issuer] = name.split(':');
  return code && issuer ? { code, issuer } : null;
};

export const onUserInput: OnUserInputHandler = async ({ id, event, context }) => {
  await loadPreferences();
  accountNames = (await getState()).accountNames;
  const homeContext = (context as HomeContext | null) ?? {};
  const form = homeContext.form ?? EMPTY_FORM;

  if (event.type === UserInputEventType.InputChangeEvent) {
    if (event.name === 'amount' && homeContext.swap && !homeContext.quote) {
      await liveSwapEstimate(id, homeContext.swap, typeof event.value === 'string' ? event.value : '');
    }
    return;
  }

  if (event.type === UserInputEventType.FormSubmitEvent && event.name?.startsWith('rename-form:')) {
    const index = Number(event.name.split(':')[1]);
    await renameAccount(index, readString(event.value, 'name'));
    accountNames = (await getState()).accountNames;
    await show(
      id,
      await mainScreen({
        severity: 'success',
        title: t('accounts.renamed.title'),
        text: t('accounts.renamed.text', { name: accountName(index) }),
      }),
    );
    return;
  }

  if (event.type === UserInputEventType.FormSubmitEvent) {
    if (event.name === 'send-form') {
      // The asset comes from the picker (kept in context), not from a form field.
      await review(id, { ...readForm(event.value), asset: form.asset });
    }
    if (event.name === 'swap-form') {
      const swap = homeContext.swap ?? { from: 'native', to: null, amount: '' };
      await reviewSwap(id, {
        ...swap,
        amount: readString(event.value, 'amount'),
      });
    }
    if (event.name === 'sign-form') {
      await reviewSign(id, readString(event.value, 'xdr').trim());
    }
    if (event.name === 'import-form') {
      await submitImport(id, event.value);
    }
    if (event.name === 'trust-form') {
      await reviewTrust(
        id,
        {
          code: readString(event.value, 'code'),
          issuer: readString(event.value, 'issuer'),
        },
        true,
      );
    }
    return;
  }

  if (event.type !== UserInputEventType.ButtonClickEvent) {
    return;
  }
  const name = event.name ?? '';
  await showSkeleton(id, name, homeContext);

  if (name.startsWith('add-trust:') || name.startsWith('remove-trust:')) {
    const trust = parseTrustButton(name);
    if (trust) {
      await reviewTrust(id, {
        ...trust,
        remove: name.startsWith('remove-trust:'),
      });
    }
    return;
  }
  if (name.startsWith('select-network:')) {
    const network = name.split(':')[1] as StellarNetwork;
    if (network in NETWORKS) {
      await updateState({ network });
    }
    await show(id, <Loading text={t('loading.network')} />);
    await show(id, await mainScreen());
    return;
  }
  if (name.startsWith('select-account:')) {
    const index = Number(name.split(':')[1]);
    const { accounts } = await getState();
    if (accounts.includes(index)) {
      await updateState({ selectedAccount: index });
    }
    await show(id, await mainScreen());
    return;
  }
  if (name.startsWith('activity:')) {
    await openActivity(id, name.slice('activity:'.length));
    return;
  }
  if (name.startsWith('account-menu:')) {
    await openAccountMenu(id, Number(name.split(':')[1]));
    return;
  }
  if (name.startsWith('pick-asset:')) {
    const purpose = name.slice('pick-asset:'.length) as PickerPurpose;
    if (purpose === 'send') {
      const typed = await formValues(id, 'send-form');
      const next = { ...readForm(typed), asset: form.asset };
      await openPicker(id, purpose, { form: next });
    } else {
      const swap = homeContext.swap ?? { from: 'native', to: null, amount: '' };
      const typed = await formValues(id, 'swap-form');
      await openPicker(id, purpose, {
        swap: { ...swap, amount: readString(typed, 'amount', swap.amount) },
      });
    }
    return;
  }
  if (name.startsWith('choose-asset:')) {
    const [, purpose, ...rest] = name.split(':');
    const key = rest.join(':');
    if (purpose === 'send') {
      await openSend(id, { ...form, asset: key });
    } else {
      const swap = homeContext.swap ?? { from: 'native', to: null, amount: '' };
      const next =
        purpose === 'swap-from'
          ? { ...swap, from: key, to: swap.to === key ? swap.from : swap.to }
          : { ...swap, to: key };
      await openSwap(id, next);
    }
    return;
  }
  if (name.startsWith('picker-back:')) {
    if (name === 'picker-back:send') {
      await openSend(id, form);
    } else {
      await openSwap(id, homeContext.swap ?? { from: 'native', to: null, amount: '' });
    }
    return;
  }
  if (name.startsWith('remove-account:')) {
    const index = Number(name.split(':')[1]);
    await show(id, <ConfirmRemoveAccount index={index} address={(await getKeypair(index)).publicKey()} />);
    return;
  }
  if (name.startsWith('confirm-remove-account:')) {
    const index = Number(name.split(':')[1]);
    await removeAccount(index);
    await show(
      id,
      await mainScreen({
        severity: 'info',
        title: t('accounts.removed.title'),
        text: t('accounts.removed.text', { name: accountName(index) }),
      }),
    );
    return;
  }

  switch (name) {
    case 'go-send':
      await openSend(id, EMPTY_FORM);
      break;
    case 'go-swap':
      await openSwap(id, { from: 'native', to: null, amount: '' });
      break;
    case 'edit-swap':
      await openSwap(id, homeContext.swap ?? { from: 'native', to: null, amount: '' });
      break;
    case 'confirm-swap':
      if (homeContext.quote) {
        await confirmSwap(id, homeContext.swap, homeContext.quote);
      }
      break;
    case 'edit-send':
      await openSend(id, form);
      break;
    case 'confirm-send':
      await confirmSend(id, form);
      break;
    case 'go-assets':
      await openAssets(id);
      break;
    case 'go-custom-asset':
      await openCustomAsset(id);
      break;
    case 'dismiss': {
      const tab = homeContext.tab ?? 'tokens';
      await show(id, await mainScreen(undefined, tab), { tab });
      break;
    }
    case 'confirm-trust':
      if (homeContext.trust) {
        await confirmTrust(id, homeContext.trust);
      }
      break;
    case 'go-accounts':
      await openAccounts(id);
      break;
    case 'go-networks': {
      const { network } = await getState();
      await show(id, <Networks selected={network} />);
      break;
    }
    case 'go-sign':
      await show(id, <SignForm />);
      break;
    case 'edit-sign':
      await show(id, <SignForm />);
      break;
    case 'sign-only':
    case 'sign-submit':
      if (homeContext.sign) {
        await signXdr(id, homeContext.sign, name === 'sign-submit');
      }
      break;
    case 'go-import':
      await show(id, <ImportAccount />);
      break;
    case 'add-account':
      await showAccountAdded(id, await addAccount());
      break;
    case 'go-receive': {
      const { keypair, network, account } = await loadContext();
      await show(
        id,
        <Receive
          address={keypair.publicKey()}
          network={network}
          qr={qrSvg(keypair.publicKey())}
          active={account !== null}
        />,
      );
      break;
    }
    case 'go-fund': {
      const { keypair } = await loadContext();
      await show(id, <Fund address={keypair.publicKey()} />);
      break;
    }
    case 'friendbot': {
      await show(id, <Loading text={t('loading.friendbot')} />);
      const { keypair, network } = await loadContext();
      try {
        await requestFriendbot(network, keypair.publicKey());
        await show(
          id,
          await mainScreen({
            severity: 'success',
            title: t('home.funded.title'),
            text: t('home.funded.text', { network: network.name }),
          }),
        );
      } catch (error) {
        await show(
          id,
          await mainScreen({
            severity: 'danger',
            title: t('home.friendbot.title'),
            text: (error as Error).message,
          }),
        );
      }
      break;
    }
    case 'tab-tokens':
    case 'tab-activity': {
      const tab = name === 'tab-activity' ? 'activity' : 'tokens';
      await show(id, await mainScreen(undefined, tab), { tab });
      break;
    }
    case 'refresh': {
      const tab = homeContext.tab ?? 'tokens';
      await show(id, <Loading text={t('loading.refresh')} />, { tab });
      await show(id, await mainScreen(undefined, tab), { tab });
      break;
    }
    case 'back':
    default:
      await show(id, await mainScreen());
  }
};
