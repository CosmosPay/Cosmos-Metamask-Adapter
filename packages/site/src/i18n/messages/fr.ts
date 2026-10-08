import type { Messages } from '@/i18n/messages/es';

/** French typography: a no-break space (`\u00a0`) before `;` `:` and inside « », so they never start a line. */
export const fr: Messages = {
  'meta.title': 'Stellar Snap · Stellar dans MetaMask',

  'nav.language': 'Langue',
  'theme.toDark': 'Passer en mode sombre',
  'theme.toLight': 'Passer en mode clair',

  'hero.eyebrow': 'Compatible Freighter',
  'hero.title': 'Votre compte *Stellar*, *dans* ==MetaMask.==',
  'hero.lead': 'Le mainnet avec le support officiel de MetaMask\u00a0; testnet et futurenet avec le *Stellar Snap*.',
  'hero.install': 'Installer dans MetaMask',
  'hero.installed': 'Installé dans MetaMask',
  'hero.cta': 'Obtenir Cosmos Wallet',
  'hero.sponsoredBy': 'Propulsé par',
  'stats.networks': 'Réseaux Stellar',
  'stats.api': 'API standard',
  'stats.extensions': 'Extensions en plus',

  'connect.button': 'Connecter MetaMask',
  'connect.done': 'Connecté',

  'account.title': 'Votre compte',
  'account.network': 'Réseau',
  'account.address': 'Adresse',
  'account.signer': 'Signataire',
  'account.balance': 'Solde',
  'account.evm': 'EVM liée',
  'account.unfunded': 'Compte non approvisionné',
  'account.refresh': 'Actualiser le solde',
  'account.refreshed': 'Solde mis à jour',
  'account.fund': 'Approvisionner avec Friendbot',
  'account.funded': 'Compte approvisionné en XLM de test.',
  'account.friendbot': 'Friendbot',
  'account.link': 'Lier mon compte EVM',
  'account.linked': 'Comptes liés',
  'account.switched': 'Réseau changé',
  'backend.official': 'MetaMask (support officiel de Stellar)',
  'backend.snap': 'Stellar Snap',

  'soroban.title': 'Autorisation Soroban (signAuthEntry)',
  'soroban.text':
    "Construit l'autorisation d'un `transfer` d'exemple, la signe dans MetaMask et la vérifie avec le SDK Stellar, comme le ferait une dApp Soroban.",
  'soroban.button': "Signer l'autorisation d'exemple",
  'soroban.done': 'Autorisation Soroban signée et vérifiée',

  'payment.title': 'Envoyer un paiement',
  'payment.destination': 'Destinataire',
  'payment.amount': 'Montant (XLM)',
  'payment.memo': 'Mémo',
  'payment.memoPlaceholder': 'facultatif',
  'payment.submit': 'Envoyer',
  'payment.done': 'Paiement envoyé',

  'sign.title': 'Signer un message (SEP-53)',
  'sign.message': 'Message',
  'sign.default': 'Bonjour de la part de Stellar Snap',
  'sign.submit': 'Signer',
  'sign.done': 'Signature SEP-53',

  'error.rejected.title': 'Demande refusée',
  'error.rejected.text': 'Vous avez annulé la demande dans MetaMask.',
  'error.invalid.title': 'Demande non valide',
  'error.external.title': 'Service indisponible',
  'error.internal.title': "Une erreur s'est produite",
  'error.connectFirst': "Connectez d'abord MetaMask.",
  'error.unknownNetwork': 'Réseau inconnu\u00a0: {network}',
  'error.friendbot': 'Friendbot a répondu avec le code {status}.',
  'error.mainnetPayment': 'Sur le mainnet, utilisez le bouton «\u00a0Envoyer\u00a0» de MetaMask (support officiel).',
  'error.noSignature': "Le wallet n'a renvoyé aucune signature.",

  'toast.region': 'Notifications',
  'toast.close': 'Fermer',
};
