import type { NetworkConfig } from '@/config/networks';
import { assetBalances, assetKey, assetLabelOf, issuerOf } from '@/domain/balances';
import { t } from '@/i18n';
import type { HorizonAccount } from '@/services/horizon';
import type { RegistryAsset } from '@/services/assets';
import { findAsset, getRegistry } from '@/services/assets';
import { assetAvatar } from '@/ui/assetAvatar';
import { balanceText, shorten } from '@/ui/format';
import type { AssetOption, AssetPickerRow } from '@/home/types';

/** Display name of an asset: "Stellar Lumens", the registry name, or its code. */
export const assetTitle = (code: string, issuer: string | null, entry: RegistryAsset | undefined) =>
  issuer === null ? t('asset.xlm') : (entry?.name ?? code);

/**
 * Who stands behind an asset: Stellar, the verified issuer, or "Unverified G…".
 *
 * @param issuer - Issuer address, null for XLM.
 * @param entry - Registry entry, if listed.
 * @param separator - Between "Unverified" and the address.
 * @returns The label.
 */
export const issuerLabel = (issuer: string | null, entry: RegistryAsset | undefined, separator = ' ') =>
  issuer === null
    ? 'Stellar'
    : entry?.verified
      ? entry.issuerName
      : `${t('trust.unverified')}${separator}${shorten(issuer)}`;

/**
 * The account's assets as picker options (logo, name, issuer, balance), XLM first.
 *
 * @param network - Network config.
 * @param account - Horizon account.
 * @returns The options.
 */
export async function assetOptions(network: NetworkConfig, account: HorizonAccount): Promise<AssetOption[]> {
  const registry = await getRegistry(network);
  return Promise.all(
    assetBalances(account).map(async (balance): Promise<AssetOption> => {
      const code = assetLabelOf(balance);
      const issuer = issuerOf(balance);
      const entry = findAsset(registry, code, issuer);
      return {
        key: assetKey(balance),
        avatar: await assetAvatar(code, issuer, registry),
        title: assetTitle(code, issuer, entry),
        who: issuerLabel(issuer, entry),
        balance: `${balanceText(balance.balance)} ${code}`,
      };
    }),
  );
}

/**
 * Rows of the trustline manager: every Cosmos Pay listed asset plus any the
 * user holds that the registry doesn't list, marked as held or not.
 *
 * @param network - Network config.
 * @param account - Horizon account.
 * @returns The rows.
 */
export async function assetPickerRows(network: NetworkConfig, account: HorizonAccount): Promise<AssetPickerRow[]> {
  const registry = await getRegistry(network);
  const trustlines = account.balances.filter(
    (balance) => balance.asset_type === 'credit_alphanum4' || balance.asset_type === 'credit_alphanum12',
  );
  const held = (code: string, issuer: string) =>
    trustlines.some((line) => line.asset_code === code && line.asset_issuer === issuer);

  const candidates = [
    ...registry.filter((asset): asset is RegistryAsset & { issuer: string } => asset.issuer !== null),
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

  return Promise.all(
    candidates.map(async (asset): Promise<AssetPickerRow> => ({
      code: asset.code,
      issuer: asset.issuer,
      avatar: await assetAvatar(asset.code, asset.issuer, registry, 36),
      subtitle: asset.verified ? asset.issuerName : `${t('trust.unverified')} · ${shorten(asset.issuer)}`,
      held: held(asset.code, asset.issuer),
    })),
  );
}
