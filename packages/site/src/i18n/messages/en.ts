import type { Messages } from '@/i18n/messages/es';

export const en: Messages = {
  'meta.title': 'Stellar Snap · Stellar and Soroban in MetaMask',
  'meta.description':
    'Stellar Snap adds Stellar and Soroban accounts to MetaMask: send, receive, swap and sign without installing another wallet. For mainnet, testnet and futurenet.',

  'nav.skip': 'Skip to content',
  'nav.main': 'Main',
  'nav.language': 'Language',
  'link.newTab': '(opens in a new tab)',
  'theme.toDark': 'Switch to dark mode',
  'theme.toLight': 'Switch to light mode',

  'suggest.text': 'This page is also available in English.',
  'suggest.action': 'View in English',
  'suggest.dismiss': 'Dismiss',

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

  'features.eyebrow': 'Features',
  'features.title': 'All of Stellar, *without leaving MetaMask.*',
  'features.lead':
    'The *Stellar Snap* adds a full Stellar wallet to MetaMask, with its own screen inside the extension.',
  'features.accounts.title': 'Stellar accounts',
  'features.accounts.text':
    'Create several accounts from your MetaMask Secret Recovery Phrase, or import a secret key or a recovery phrase.',
  'features.payments.title': 'Send and receive',
  'features.payments.text': 'Send XLM and other assets after reviewing the fee and memo, and receive with a QR code.',
  'features.assets.title': 'Assets and trustlines',
  'features.assets.text':
    'Add assets from the Cosmos Pay registry, or any other by its code and issuer, and remove them when you no longer use them.',
  'features.swaps.title': 'Swaps',
  'features.swaps.text':
    'Swap assets on the Stellar DEX with Cosmos Pay quotes. The Snap checks every transaction before asking for your signature.',
  'features.soroban.title': 'Soroban and messages',
  'features.soroban.text':
    'Sign Soroban contract authorizations seeing the contract, function and arguments, and sign messages with SEP-53.',
  'features.evm.title': 'Linked EVM account',
  'features.evm.text': 'Link your MetaMask 0x address to your Stellar account with signatures anyone can verify.',

  'start.eyebrow': 'Get started',
  'start.title': 'Ready in *three steps.*',
  'start.metamask.title': 'Install MetaMask',
  'start.metamask.text': "Add the MetaMask extension to your desktop browser, if you don't have it yet.",
  'start.install.title': 'Add the Stellar Snap',
  'start.install.text': 'Click "Install in MetaMask" on this page and approve the permissions MetaMask shows you.',
  'start.use.title': 'Use your Stellar account',
  'start.use.text':
    'In MetaMask, open the ⋮ menu → Snaps → Stellar Snap. From there you send, receive, swap and manage your accounts.',

  'dev.eyebrow': 'For developers',
  'dev.title': 'Connect your dApp with *a standard API.*',
  'dev.lead':
    "The `@cosmosapp/stellar-metamask-adapter` adapter implements SEP-43: on mainnet it uses MetaMask's built-in Stellar support, and on testnet and futurenet, the Stellar Snap.",
  'dev.sep43': '*SEP-43*: the same methods and error codes as other Stellar wallets.',
  'dev.kit': '*Stellar Wallets Kit*: a module that adds MetaMask to the wallet picker.',
  'dev.freighter':
    '*Freighter API*: dApps built for Freighter work through a bundler alias, without changing their code.',
  'dev.example': 'Connect and sign with SEP-43',
  'dev.repo': 'View the code on GitHub',

  'faq.eyebrow': 'FAQ',
  'faq.title': 'What you *need to know.*',
  'faq.what.q': 'What is Stellar Snap?',
  'faq.what.a':
    "It's an open-source MetaMask Snap that adds Stellar and Soroban accounts to MetaMask, with its own screen inside the extension. It's a product of Cosmos Pay and Cosmos.",
  'faq.official.q': 'Is it an official MetaMask product?',
  'faq.official.a':
    "No. Stellar Snap is an independent project: it isn't affiliated with, sponsored or endorsed by MetaMask, Consensys or the Stellar Development Foundation.",
  'faq.networks.q': 'Which Stellar networks does it support?',
  'faq.networks.a':
    "All three. On testnet and futurenet, the Stellar Snap signs. On mainnet, the adapter uses MetaMask's built-in Stellar support and, if your version doesn't have it, the Snap.",
  'faq.keys.q': 'Where are my keys?',
  'faq.keys.a':
    'In MetaMask. Accounts are derived from your Secret Recovery Phrase with SEP-0005, as in other Stellar wallets, and keys never leave MetaMask. For an imported account, only its secret key is stored, encrypted by MetaMask.',
  'faq.cost.q': 'How much does it cost?',
  'faq.cost.a':
    'Installing and using it is free. You pay Stellar network fees, and swaps include a Cosmos Pay platform fee that you see in the quote before confirming.',
  'faq.extension.q': 'Do I need another wallet or extension?',
  'faq.extension.a':
    'No. You only need MetaMask: the Snap runs inside the extension, and Stellar dApps connect through it.',
  'faq.dapp.q': 'How do I integrate it into my dApp?',
  'faq.dapp.a':
    'With the SEP-43 adapter, the Stellar Wallets Kit module or the Freighter-compatible API. The code and the integration guide are on [GitHub]({repo}).',

  'donate.eyebrow': 'Donate',
  'donate.title': 'Help us *keep building.*',
  'donate.lead':
    "Stellar Snap is free and open source. If it's useful to you, you can donate on the Stellar network: every contribution funds audits, maintenance and new features.",
  'donate.address': 'Stellar address for donations',
  'donate.copy': 'Copy address',
  'donate.copied': 'Address copied',
  'donate.qr': 'QR code with the donation address',
  'donate.note':
    'Accepts XLM and other Stellar assets, such as USDC, on the public network (mainnet). Do not send testnet funds or funds from other blockchains.',
  'donate.other': 'Other ways to donate',

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

  'consent.label': 'Site measurement',
  'consent.text':
    'With your permission, we use Google Analytics to count visits and measure how fast the site is. No ads.',
  'consent.accept': 'Accept',
  'consent.reject': 'Decline',
  'consent.policy': 'Privacy policy',

  'footer.copyright': '© {year} Stellar Snap is a product of Cosmos Pay and Cosmos.',
  'footer.pages': 'About and contact',
  'footer.privacy': 'Privacy',
  'footer.terms': 'Terms',
  'footer.credits': 'Credits',
  'footer.contact': 'Contact',
  'footer.socialLink': 'Cosmos on {network}',
  'footer.analytics': 'Measurement preferences',
  'doc.updated': 'Last updated: {date}',
  'doc.translationNote': 'This document is available in Spanish and English; this is the English version.',
  'breadcrumb.label': 'Breadcrumb',
  'breadcrumb.home': 'Home',

  'notFound.title': 'Page not found',
  'notFound.text':
    "The address you opened doesn't exist or has moved. Check that it's spelled right, or go back to the home page.",
  'notFound.home': 'Go to the home page',
};
