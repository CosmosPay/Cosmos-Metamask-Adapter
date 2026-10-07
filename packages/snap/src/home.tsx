import type { OnUserInputHandler } from '@metamask/snaps-sdk';
import { UserInputEventType } from '@metamask/snaps-sdk';
import type { JSXElement, SnapComponent } from '@metamask/snaps-sdk/jsx';
import {
  Banner,
  Address,
  Avatar,
  Box,
  Button,
  Card,
  Copyable,
  Divider,
  Field,
  Form,
  Heading,
  Icon,
  Image,
  Input,
  Link,
  Row,
  Section,
  Selector,
  SelectorOption,
  Spinner,
  Text,
} from '@metamask/snaps-sdk/jsx';
import qrcode from 'qrcode-generator';

import type { RegistryAsset } from './assets';
import { assetAvatar, findAsset, getRegistry, pricingAssetId } from './assets';
import type { HorizonAccount, HorizonBalance, HorizonPayment } from './horizon';
import { fetchAccount, fetchPayments, requestFriendbot } from './horizon';
import {
  formatDate,
  hideBalances,
  loadPreferences,
  localizeNumber,
  pricingPreferences,
  t,
} from './i18n';
import type { ActionIcon } from './icons';
import {
  activityIcon,
  actionTile,
  assetIcon,
  fundIllustration,
  kebab,
  listRow,
  networkPill,
  rowAction,
  textLabel,
  pillButton,
  tokenInfo,
} from './icons';
import { getKeypair } from './keys';
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
} from './payments';
import { fetchPrices, XLM_ASSET_ID } from './prices';
import { addAccount, getState, removeAccount, renameAccount, updateState } from './state';

type FieldErrors = Record<string, string>;

type SendForm = {
  destination: string;
  amount: string;
  asset: string;
  memo: string;
};

type Tab = 'tokens' | 'activity';

type HomeContext = {
  form?: SendForm;
  tab?: Tab;
  trust?: TrustlineRequest;
};

type Notice = { severity: 'success' | 'danger' | 'info'; title: string; text: string };

const shorten = (address: string) => `${address.slice(0, 6)}…${address.slice(-6)}`;

const networkLabel = (id: StellarNetwork) => t(`network.${id}`);

/** Custom names (renamed by the user), refreshed at the start of every event. */
let accountNames: Record<string, string> = {};

const accountName = (index: number) =>
  accountNames[String(index)] ?? t('accounts.name', { n: index + 1 });

/** Localized amount, or a mask when the user hides balances in MetaMask. */
const balanceText = (amount: string) =>
  hideBalances() ? t('common.hidden') : localizeNumber(formatAmount(amount));

/** Accepts `1,5` and `1.234,5` as typed in comma-decimal languages. */
const normalizeAmount = (amount: string) => {
  const value = amount.trim();
  return value.includes(',') ? value.replace(/\./gu, '').replace(',', '.') : value;
};

const formatFiat = (amount: number, currency: string) => {
  const fixed = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/gu, ',');
  return `${currency.toUpperCase()} ${localizeNumber(fixed)}`;
};

const EMPTY_FORM: SendForm = { destination: '', amount: '', asset: 'native', memo: '' };

// --- Shared pieces -------------------------------------------------------------

const BackButton: SnapComponent<{ label?: string; name?: string }> = ({ label, name }) => (
  <Button name={name ?? 'back'}>
    <Icon name="arrow-left" color="primary" />
    {label ?? t('common.back')}
  </Button>
);

const Loading: SnapComponent<{ text: string }> = ({ text }) => (
  <Box center>
    <Spinner />
    <Text alignment="center">{text}</Text>
  </Box>
);

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
      const created = payment.type === 'create_account';
      const outgoing = created ? payment.funder === address : payment.from === address;
      const counterparty =
        (created
          ? outgoing
            ? payment.account
            : payment.funder
          : outgoing
            ? payment.to
            : payment.from) ?? '';
      const asset =
        created || payment.asset_type === 'native' ? 'XLM' : payment.asset_code ?? '?';
      const amount = balanceText((created ? payment.starting_balance : payment.amount) ?? '0');
      const title =
        created && !outgoing
          ? t('activity.created')
          : outgoing
            ? t('activity.sent')
            : t('activity.received');
      return (
        <Card
          image={activityIcon(outgoing ? 'out' : 'in')}
          title={title}
          description={`${formatDate(payment.created_at)} · ${shorten(counterparty)}`}
          value={`${outgoing ? '-' : '+'}${amount} ${asset}`}
        />
      );
    })}
    {payments.length > 0 ? (
      <Link href={`${network.explorerUrl}/account/${address}`}>{t('activity.explorer')}</Link>
    ) : null}
  </Box>
);

type CaipAccount = `${string}:${string}:${string}`;

const caipAccount = (network: NetworkConfig, address: string) =>
  `${network.chainId}:${address}` as CaipAccount;

/** MetaMask-style header: "Account 1 ⌄" opens the account list. */
const AccountHeader: SnapComponent<{ selected: number; network: NetworkConfig; address: string }> = ({
  selected,
  network,
  address,
}) => (
  <Box direction="horizontal" alignment="space-between">
    <Box>
      <Button name="go-accounts">
        <Image src={textLabel(accountName(selected), { size: 18, chevron: true })} alt={accountName(selected)} />
      </Button>
      {/* Small and muted so it doesn't compete with the balance. */}
      <Box direction="horizontal" crossAlignment="center">
        <Avatar address={caipAccount(network, address)} size="sm" />
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
          <ActionTile name="go-send" icon="send" label={t('home.send')} width={156} />
          <ActionTile name="go-receive" icon="receive" label={t('home.receive')} width={156} />
        </Box>
      ) : (
        <Box direction="horizontal" alignment="center">
          <ActionTile name={fundAction} icon="fund" label={t('home.fund')} />
          <ActionTile name="go-send" icon="send" label={t('home.send')} disabled />
          <ActionTile name="go-receive" icon="receive" label={t('home.receive')} />
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
      {tab === 'activity' ? (
        <ActivityList address={address} network={network} payments={payments} />
      ) : null}
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
        <Image src={listRow(NETWORKS[id].name, id === selected)} alt={NETWORKS[id].name} />
      </Button>
    ))}
  </Box>
);

// --- Accounts ------------------------------------------------------------------

type AccountRowData = AccountOption & { balance: string };

const AccountRow: SnapComponent<{ row: AccountRowData; network: NetworkConfig }> = ({
  row,
  network,
}) => (
  <Box direction="horizontal" alignment="space-between">
    <Box direction="horizontal" crossAlignment="center">
      <Avatar address={caipAccount(network, row.address)} size="md" />
      <Box>
        <Button name={`select-account:${row.index}`}>
          <Image src={textLabel(accountName(row.index), { size: 15 })} alt={accountName(row.index)} />
        </Button>
        <Address address={caipAccount(network, row.address)} avatar={false} />
      </Box>
    </Box>
    <Box direction="horizontal" crossAlignment="center">
      <Text fontWeight="bold">{row.balance}</Text>
      <Button name={`account-menu:${row.index}`}>
        <Image src={kebab()} alt="⋮" />
      </Button>
    </Box>
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
  </Box>
);

const AccountList: SnapComponent<{
  rows: AccountRowData[];
  selected: number;
  network: NetworkConfig;
}> = ({ rows, selected, network }) => (
  <Box>
    <ScreenHeader title={t('accounts.title')} />
    {rows.map((row) =>
      row.index === selected ? (
        <Section>
          <AccountRow row={row} network={network} />
        </Section>
      ) : (
        <AccountRow row={row} network={network} />
      ),
    )}
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
        <Avatar address={caipAccount(network, address)} size="lg" />
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

const ConfirmRemoveAccount: SnapComponent<{ index: number; address: string }> = ({
  index,
  address,
}) => (
  <Box>
    <ConfirmRemoveBody index={index} address={address} />
    <PillButton
      name={`confirm-remove-account:${index}`}
      label={t('accounts.remove.confirm')}
      kind="danger"
    />
    <PillButton name={`account-menu:${index}`} label={t('common.cancel')} kind="secondary" />
  </Box>
);

const ConfirmRemoveBody: SnapComponent<{ index: number; address: string }> = ({
  index,
  address,
}) => (
  <Box>
    <Heading>{t('accounts.remove.title', { name: accountName(index) })}</Heading>
    <Text color="alternative">{shorten(address)}</Text>
    <Banner title={t('accounts.remove.confirm')} severity="warning">
      <Text>{t('accounts.remove.text')}</Text>
    </Banner>
  </Box>
);

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
    <Box center>
      <Image src={avatar} alt={code} />
      <Heading>
        {remove ? t('trust.review.remove', { asset: code }) : t('trust.review.add', { asset: code })}
      </Heading>
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
    <PillButton
      name="confirm-trust"
      label={remove ? t('trust.confirm.remove') : t('trust.confirm.add')}
      kind={remove ? 'danger' : 'primary'}
    />
    <PillButton name="go-assets" label={t('common.back')} kind="secondary" />
  </Box>
);

// --- Payments ------------------------------------------------------------------

type AssetOption = { key: string; avatar: string; title: string; who: string; balance: string };

const Send: SnapComponent<{
  network: NetworkConfig;
  account: HorizonAccount;
  options: AssetOption[];
  form: SendForm;
  errors?: FieldErrors | undefined;
}> = ({ network, account, options, form, errors }) => {
  const selected =
    account.balances.find((balance) => assetKey(balance) === form.asset) ?? account.balances[0];
  const available = selected
    ? localizeNumber(formatStroops(spendableStroops(account, selected)))
    : '0';

  return (
    <Box>
    <Box>
      <Heading>{t('send.title', { network: networkLabel(network.id) })}</Heading>
      <Form name="send-form">
        <Field label={t('send.destination')} error={errors?.destination}>
          <Input name="destination" placeholder="G…" value={form.destination} />
        </Field>
        <Field label={t('send.asset')} error={errors?.assetCode}>
          {/* MetaMask's own selector (cards with logo), not the browser's <select>. */}
          <Selector name="asset" title={t('send.asset')} value={form.asset}>
            {options.map((option) => (
              <SelectorOption value={option.key}>
                <Card image={option.avatar} title={option.title} description={option.who} value={option.balance} />
              </SelectorOption>
            ))}
          </Selector>
        </Field>
        <Field label={t('send.amount', { available })} error={errors?.amount}>
          <Input name="amount" placeholder="0" value={form.amount} />
        </Field>
        <Field label={t('send.memo')} error={errors?.memo}>
          <Input name="memo" placeholder={t('send.memo.placeholder')} value={form.memo} />
        </Field>
        <PillButton name="review" label={t('send.review')} submit />
      </Form>
    </Box>
      <PillButton name="back" label={t('common.cancel')} kind="secondary" />
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
    <Heading>{t('review.title')}</Heading>
    <Box center>
      <Heading size="lg">
        {`${localizeNumber(formatAmount(normalizeAmount(form.amount)))} ${assetLabel}`}
      </Heading>
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
    <PillButton name="confirm-send" label={t('review.confirm')} />
    <PillButton name="edit-send" label={t('review.edit')} kind="secondary" />
  </Box>
);

const Sent: SnapComponent<{ amount: string; explorerUrl: string; hash: string }> = (props) => (
  <Box>
    <SentBody {...props} />
    <PillButton name="back" label={t('common.done')} />
  </Box>
);

const SentBody: SnapComponent<{ amount: string; explorerUrl: string; hash: string }> = ({
  amount,
  explorerUrl,
  hash,
}) => (
  <Box>
    <Box center>
      <Icon name="check" color="primary" />
      <Heading>{t('sent.title')}</Heading>
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
    <Heading>{t('receive.title', { network: networkLabel(network.id) })}</Heading>
    <Box center>
      <Image src={qr} alt={t('receive.qrAlt')} />
    </Box>
    <Copyable value={address} />
    <Text color="alternative">{t('receive.note')}</Text>
    {active ? null : (
      <Banner title={t('home.inactive.title')} severity="info">
        <Text>{t('receive.inactive')}</Text>
      </Banner>
    )}
    <BackButton />
  </Box>
);

const Fund: SnapComponent<{ address: string }> = ({ address }) => (
  <Box>
    <Heading>{t('fund.title')}</Heading>
    <Text>{t('fund.step1')}</Text>
    <Text>{t('fund.step2')}</Text>
    <Copyable value={address} />
    <Text>{t('fund.step3')}</Text>
    <Divider />
    <BackButton />
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
    indexes.map(async (index) => ({ index, address: (await getKeypair(index)).publicKey() })),
  );
}

async function show(id: string, ui: JSXElement, context: HomeContext = {}) {
  await snap.request({ method: 'snap_updateInterface', params: { id, ui, context } });
}

const signedPercent = (value: number) =>
  `${value < 0 ? '-' : '+'}${localizeNumber(Math.abs(value).toFixed(2))}%`;

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
      balance.asset_type === 'native' ? null : balance.asset_issuer ?? null,
      network.id,
      registry,
    );
  const ids = [
    ...new Set(
      (balances.length > 0 ? balances.map(idOf) : [XLM_ASSET_ID]).filter(
        (id): id is string => id !== null,
      ),
    ),
  ];
  const prices = await fetchPrices(ids);
  const hidden = hideBalances();

  let total = 0;
  let totalDelta = 0;
  let currency: string | null = null;

  const rows = await Promise.all(
    balances.map(async (balance): Promise<TokenRow> => {
      const code = assetLabelOf(balance);
      const issuer = balance.asset_type === 'native' ? null : balance.asset_issuer ?? null;
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
      const title = issuer === null ? t('asset.xlm') : entry?.name ?? code;
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
  let summary: Summary = { headline: `${balanceText(native?.balance ?? '0')} XLM`, change: null };

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
    tab === 'activity' && account
      ? fetchPayments(network, address).catch(() => [])
      : Promise.resolve([]),
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

async function openSend(id: string, form: SendForm, errors?: FieldErrors) {
  const { network, account } = await loadContext();
  if (!account) {
    await show(id, await mainScreen());
    return;
  }
  const registry = await getRegistry(network);
  const options = await Promise.all(
    account.balances
      .filter((balance) => balance.asset_type !== 'liquidity_pool_shares')
      .map(async (balance): Promise<AssetOption> => {
        const code = assetLabelOf(balance);
        const issuer = balance.asset_type === 'native' ? null : balance.asset_issuer ?? null;
        const entry = findAsset(registry, code, issuer);
        return {
          key: assetKey(balance),
          avatar: await assetAvatar(code, issuer, registry),
          title: issuer === null ? t('asset.xlm') : entry?.name ?? code,
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
  await show(
    id,
    <Send network={network} account={account} options={options} form={form} errors={errors} />,
    { form },
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
    (balance) =>
      balance.asset_type === 'credit_alphanum4' || balance.asset_type === 'credit_alphanum12',
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
      subtitle: asset.verified
        ? asset.issuerName
        : `${t('trust.unverified')} · ${shorten(asset.issuer)}`,
      held: held(asset.code, asset.issuer),
    })),
  );
  await show(id, <Assets rows={rows} />);
}

async function openCustomAsset(
  id: string,
  errors?: FieldErrors,
  values?: { code: string; issuer: string },
) {
  await show(id, <CustomAsset errors={errors} values={values} />);
}

async function reviewTrust(id: string, trust: TrustlineRequest, fromForm = false) {
  await show(id, <Loading text={t('loading.trust')} />, { trust });
  const { keypair, network } = await loadContext();
  try {
    const [prepared, registry] = await Promise.all([
      prepareTrustline(network, keypair, trust),
      getRegistry(network),
    ]);
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
      await openCustomAsset(id, error.fields, { code: trust.code, issuer: trust.issuer });
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
  const [options, prices] = await Promise.all([
    accountOptions(state.accounts),
    fetchPrices([XLM_ASSET_ID]),
  ]);
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
      await review(id, readForm(event.value));
    }
    if (event.name === 'trust-form') {
      await reviewTrust(
        id,
        { code: readString(event.value, 'code'), issuer: readString(event.value, 'issuer') },
        true,
      );
    }
    return;
  }

  if (event.type !== UserInputEventType.ButtonClickEvent) {
    return;
  }
  const name = event.name ?? '';

  if (name.startsWith('add-trust:') || name.startsWith('remove-trust:')) {
    const trust = parseTrustButton(name);
    if (trust) {
      await reviewTrust(id, { ...trust, remove: name.startsWith('remove-trust:') });
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
  if (name.startsWith('account-menu:')) {
    await openAccountMenu(id, Number(name.split(':')[1]));
    return;
  }
  if (name.startsWith('remove-account:')) {
    const index = Number(name.split(':')[1]);
    await show(
      id,
      <ConfirmRemoveAccount index={index} address={(await getKeypair(index)).publicKey()} />,
    );
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
    case 'add-account':
      await showAccountAdded(id, await addAccount());
      break;
    case 'go-receive': {
      const { keypair, network, account } = await loadContext();
      const qr = qrcode(0, 'M');
      qr.addData(keypair.publicKey());
      qr.make();
      await show(
        id,
        <Receive
          address={keypair.publicKey()}
          network={network}
          qr={qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true })}
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
