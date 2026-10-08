import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Button, Heading, Icon, Image, Link, Section, Text } from '@metamask/snaps-sdk/jsx';

import type { NetworkConfig } from '@/config/networks';
import { swapsAvailable } from '@/services/swap';
import { t } from '@/i18n';
import type { HorizonPayment } from '@/services/horizon';
import { shorten } from '@/ui/format';
import { fundIllustration, identicon, networkPill, textLabel, wideRow } from '@/ui/graphics/icons';
import { accountName } from '@/wallet/accountNames';
import { ActionTile, NoticeBanner, PillButton, TabBar, TILE_WIDTH } from '@/home/components';
import type { Notice, Summary, Tab, TokenRow } from '@/home/types';
import { activitySubtitle, describeActivity } from '@/home/viewModels/activity';

/** MetaMask-style header: "Account 1 ⌄" opens the account list. */
export const AccountHeader: SnapComponent<{
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

export const TokenList: SnapComponent<{ rows: TokenRow[] }> = ({ rows }) => (
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

export const ActivityList: SnapComponent<{
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
              subtitle: activitySubtitle(payment, item),
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

export const Main: SnapComponent<{
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

  return (
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
          <ActionTile name="go-send" icon="send" label={t('home.send')} width={TILE_WIDTH} />
          <ActionTile
            name="go-swap"
            icon="swap"
            label={t('swap.tile')}
            disabled={!swapsAvailable(network)}
            width={TILE_WIDTH}
          />
          <ActionTile name="go-receive" icon="receive" label={t('home.receive')} width={TILE_WIDTH} />
          <ActionTile name="go-sign" icon="sign" label={t('home.sign')} width={TILE_WIDTH} />
        </Box>
      ) : (
        <Box direction="horizontal" alignment="center">
          <ActionTile name={fundAction} icon="fund" label={t('home.fund')} width={TILE_WIDTH} />
          <ActionTile name="go-send" icon="send" label={t('home.send')} disabled width={TILE_WIDTH} />
          <ActionTile name="go-receive" icon="receive" label={t('home.receive')} width={TILE_WIDTH} />
          <ActionTile name="go-sign" icon="sign" label={t('home.sign')} width={TILE_WIDTH} />
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
};
