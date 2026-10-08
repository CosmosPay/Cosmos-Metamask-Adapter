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

/** The dApp example on the page; code reads the same in every language. */
export const DEVELOPER_EXAMPLE = `import { HybridStellarAdapter } from '@cosmospay/stellar-metamask-adapter';

const wallet = new HybridStellarAdapter();
const { address } = await wallet.requestAccess();
const { signedTxXdr } = await wallet.signTransaction(xdr, { networkPassphrase });`;

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
