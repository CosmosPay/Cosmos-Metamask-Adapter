import type { Messages } from '@/i18n/messages/es';

export const en: Messages = {
  'meta.title': 'Stellar Snap · Stellar in MetaMask',

  'nav.language': 'Language',
  'theme.toDark': 'Switch to dark mode',
  'theme.toLight': 'Switch to light mode',

  'hero.eyebrow': 'Cosmos Wallet compatible',
  'hero.title': 'Your *Stellar* account, *inside* ==MetaMask.==',
  'hero.lead':
    'Stellar and Soroban accounts, payments and signatures without leaving MetaMask, with the *Stellar Snap*.',
  'hero.install': 'Install in MetaMask',
  'hero.installed': 'Installed in MetaMask',
  'hero.cta': 'Get Cosmos Wallet',
  'hero.sponsoredBy': 'Powered by',
  'stats.networks': 'Stellar networks',
  'stats.api': 'Standard API',
  'stats.extensions': 'Extra extensions',

  'connect.button': 'Connect MetaMask',
  'connect.done': 'Connected',

  'account.title': 'Your account',
  'account.network': 'Network',
  'account.address': 'Address',
  'account.signer': 'Signer',
  'account.balance': 'Balance',
  'account.evm': 'Linked EVM',
  'account.unfunded': 'Unfunded account',
  'account.refresh': 'Refresh balance',
  'account.refreshed': 'Balance updated',
  'account.fund': 'Fund with Friendbot',
  'account.funded': 'Account funded with test XLM.',
  'account.friendbot': 'Friendbot',
  'account.link': 'Link my EVM account',
  'account.linked': 'Linked accounts',
  'account.switched': 'Network switched',
  'backend.official': 'MetaMask (built-in Stellar)',
  'backend.snap': 'Stellar Snap',

  'soroban.title': 'Soroban authorization (signAuthEntry)',
  'soroban.text':
    'Builds the authorization for a sample `transfer`, signs it in MetaMask and verifies it with the Stellar SDK, just like a Soroban dApp would.',
  'soroban.button': 'Sign sample authorization',
  'soroban.done': 'Soroban authorization signed and verified',

  'payment.title': 'Send payment',
  'payment.destination': 'Destination',
  'payment.amount': 'Amount (XLM)',
  'payment.memo': 'Memo',
  'payment.memoPlaceholder': 'optional',
  'payment.submit': 'Send',
  'payment.done': 'Payment sent',

  'sign.title': 'Sign message (SEP-53)',
  'sign.message': 'Message',
  'sign.default': 'Hello from Stellar Snap',
  'sign.submit': 'Sign',
  'sign.done': 'SEP-53 signature',

  'error.rejected.title': 'Request rejected',
  'error.rejected.text': 'You cancelled the request in MetaMask.',
  'error.invalid.title': 'Invalid request',
  'error.external.title': 'Service unavailable',
  'error.internal.title': 'Something went wrong',
  'error.connectFirst': 'Connect MetaMask first.',
  'error.unknownNetwork': 'Unknown network: {network}',
  'error.friendbot': 'Friendbot answered with status {status}.',
  'error.mainnetPayment': 'On mainnet, use MetaMask\'s "Send" button.',
  'error.noSignature': 'The wallet returned no signature.',

  'toast.region': 'Notifications',
  'toast.close': 'Close',

  'footer.copyright': '© {year} Stellar Snap is a product of Cosmos Pay and Cosmos.',
};
