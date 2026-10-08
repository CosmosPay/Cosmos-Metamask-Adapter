import type { TrustlineRequest } from '@/domain/trustlines';
import type { SwapQuote } from '@/domain/swap';

export type { FieldErrors } from '@/domain/errors';

export type Tab = 'tokens' | 'activity';

export type SendForm = {
  destination: string;
  amount: string;
  /** `native` or `CODE:ISSUER` (see `assetKey`). */
  asset: string;
  memo: string;
};

export type SwapForm = { from: string; to: string | null; amount: string };

export type PickerPurpose = 'send' | 'swap-from' | 'swap-to';

/** Interface context: what each screen needs to remember between events. */
export type HomeContext = {
  swap?: SwapForm;
  quote?: SwapQuote;
  form?: SendForm;
  tab?: Tab;
  trust?: TrustlineRequest;
  /** XDR being reviewed on the Sign screen. */
  sign?: string;
};

export type Notice = {
  severity: 'success' | 'danger' | 'info';
  title: string;
  text: string;
};

export const EMPTY_SEND_FORM: SendForm = {
  destination: '',
  amount: '',
  asset: 'native',
  memo: '',
};

export const EMPTY_SWAP_FORM: SwapForm = { from: 'native', to: null, amount: '' };

// --- View models (pre-rendered rows; avatars need async image loads) --------

export type Summary = {
  headline: string;
  change: { text: string; color: 'success' | 'error' } | null;
};

export type TokenRow = {
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

export type AccountRowData = { index: number; address: string; balance: string };

export type AssetOption = {
  key: string;
  avatar: string;
  title: string;
  who: string;
  balance: string;
};

export type AssetPickerRow = {
  code: string;
  issuer: string;
  avatar: string;
  subtitle: string;
  held: boolean;
};

/** What the swap form shows under "You receive" while typing. */
export type SwapEstimate = { receive: string; fee?: string | undefined; error?: boolean };
