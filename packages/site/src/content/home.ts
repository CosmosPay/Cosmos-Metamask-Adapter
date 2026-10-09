import { REPO_URL } from '@/config';
import type { MessageKey } from '@/i18n';

/**
 * The home page's sections below the hero, as message keys. The page, its
 * structured data and llms.txt all read them from here, so they never drift.
 */

export type FeatureIcon = 'accounts' | 'payments' | 'assets' | 'swaps' | 'soroban' | 'evm';

export const FEATURES: { icon: FeatureIcon; title: MessageKey; text: MessageKey }[] = [
  { icon: 'accounts', title: 'features.accounts.title', text: 'features.accounts.text' },
  { icon: 'payments', title: 'features.payments.title', text: 'features.payments.text' },
  { icon: 'assets', title: 'features.assets.title', text: 'features.assets.text' },
  { icon: 'swaps', title: 'features.swaps.title', text: 'features.swaps.text' },
  { icon: 'soroban', title: 'features.soroban.title', text: 'features.soroban.text' },
  { icon: 'evm', title: 'features.evm.title', text: 'features.evm.text' },
];

export const STEPS: { title: MessageKey; text: MessageKey }[] = [
  { title: 'start.metamask.title', text: 'start.metamask.text' },
  { title: 'start.install.title', text: 'start.install.text' },
  { title: 'start.use.title', text: 'start.use.text' },
];

export const DEVELOPER_POINTS: MessageKey[] = ['dev.sep43', 'dev.kit', 'dev.freighter'];

/**
 * The dApp example on the page; code reads the same in every language. Lines
 * stay within 76 characters, which the card fits on desktop without scrolling.
 */
export const DEVELOPER_EXAMPLE = `import { HybridStellarAdapter } from '@cosmosapp/stellar-metamask-adapter';

const wallet = new HybridStellarAdapter();

// MetaMask's Stellar support signs on mainnet; the Stellar Snap, on testnet
const { address } = await wallet.requestAccess();

// Transactions and Soroban authorizations, as in every SEP-43 wallet
const { signedTxXdr } = await wallet.signTransaction(xdr);
const { signedAuthEntry } = await wallet.signAuthEntry(authEntryXdr);

// Switch networks and follow the account the user picks
await wallet.switchNetwork('testnet');
wallet.onChange(({ address, network }) => render(address, network));`;

export const FAQ: { question: MessageKey; answer: MessageKey }[] = [
  { question: 'faq.what.q', answer: 'faq.what.a' },
  { question: 'faq.official.q', answer: 'faq.official.a' },
  { question: 'faq.networks.q', answer: 'faq.networks.a' },
  { question: 'faq.keys.q', answer: 'faq.keys.a' },
  { question: 'faq.cost.q', answer: 'faq.cost.a' },
  { question: 'faq.extension.q', answer: 'faq.extension.a' },
  { question: 'faq.dapp.q', answer: 'faq.dapp.a' },
];

/** Placeholders the answers use. */
export const FAQ_VALUES = { repo: REPO_URL };
