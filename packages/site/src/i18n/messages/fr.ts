import type { Messages } from '@/i18n/messages/es';

/** French typography: a no-break space (`\u00a0`) before `;` `:` and inside « », so they never start a line. */
export const fr: Messages = {
  'meta.title': 'Stellar Snap · Stellar et Soroban dans MetaMask',
  'meta.description':
    'Stellar Snap ajoute des comptes Stellar et Soroban à MetaMask\u00a0: envoyez, recevez, échangez et signez sans installer un autre wallet. Mainnet, testnet et futurenet.',

  'nav.skip': 'Aller au contenu',
  'nav.main': 'Principale',
  'nav.language': 'Langue',
  'link.newTab': "(s'ouvre dans un nouvel onglet)",
  'theme.toDark': 'Passer en mode sombre',
  'theme.toLight': 'Passer en mode clair',

  'suggest.text': 'Cette page est aussi disponible en français.',
  'suggest.action': 'Voir en français',
  'suggest.dismiss': 'Ignorer',

  'hero.eyebrow': 'Compatible avec Cosmos Wallet',
  'hero.title': 'Votre compte *Stellar*, *dans* ==MetaMask.==',
  'hero.lead': 'Comptes, paiements et signatures Stellar et Soroban sans quitter MetaMask, avec le *Stellar Snap*.',
  'hero.install': 'Installer dans MetaMask',
  'hero.installed': 'Installé dans MetaMask',
  'hero.cta': 'Obtenir Cosmos Wallet',
  'hero.sponsoredBy': 'Propulsé par',
  'stats.networks': 'Réseaux Stellar',
  'stats.api': 'API standard',
  'stats.extensions': 'Extensions en plus',

  'features.eyebrow': 'Fonctionnalités',
  'features.title': 'Tout Stellar, *sans quitter MetaMask.*',
  'features.lead':
    "Le *Stellar Snap* ajoute à MetaMask un wallet Stellar complet, avec son propre écran dans l'extension.",
  'features.accounts.title': 'Comptes Stellar',
  'features.accounts.text':
    'Créez plusieurs comptes à partir de la phrase secrète de récupération de MetaMask, ou importez une clé secrète ou une phrase de récupération.',
  'features.payments.title': 'Envoyer et recevoir',
  'features.payments.text':
    "Envoyez des XLM et d'autres actifs après avoir vérifié les frais et le mémo, et recevez avec un code QR.",
  'features.assets.title': 'Actifs et trustlines',
  'features.assets.text':
    "Ajoutez des actifs du registre de Cosmos Pay, ou n'importe quel autre par son code et son émetteur, et retirez-les quand vous ne les utilisez plus.",
  'features.swaps.title': 'Échanges',
  'features.swaps.text':
    'Échangez des actifs sur le DEX de Stellar avec les cotations de Cosmos Pay. Le Snap vérifie chaque transaction avant de vous demander votre signature.',
  'features.soroban.title': 'Soroban et messages',
  'features.soroban.text':
    'Signez des autorisations de contrats Soroban en voyant le contrat, la fonction et les arguments, et signez des messages avec SEP-53.',
  'features.evm.title': 'Compte EVM lié',
  'features.evm.text':
    'Liez votre adresse 0x de MetaMask à votre compte Stellar avec des signatures que tout le monde peut vérifier.',

  'start.eyebrow': 'Pour commencer',
  'start.title': 'Prêt en *trois étapes.*',
  'start.metamask.title': 'Installez MetaMask',
  'start.metamask.text': "Ajoutez l'extension MetaMask à votre navigateur de bureau, si vous ne l'avez pas encore.",
  'start.install.title': 'Ajoutez le Stellar Snap',
  'start.install.text':
    'Cliquez sur «\u00a0Installer dans MetaMask\u00a0» sur cette page et approuvez les autorisations que MetaMask vous montre.',
  'start.use.title': 'Utilisez votre compte Stellar',
  'start.use.text':
    'Dans MetaMask, ouvrez le menu ⋮ → Snaps → Stellar Snap. De là, vous envoyez, recevez, échangez et gérez vos comptes.',

  'dev.eyebrow': 'Pour les développeurs',
  'dev.title': 'Connectez votre dApp avec *une API standard.*',
  'dev.lead':
    "L'adaptateur `@cosmosapp/stellar-metamask-adapter` implémente SEP-43\u00a0: sur le mainnet, il utilise la prise en charge de Stellar intégrée à MetaMask et, sur le testnet et le futurenet, le Stellar Snap.",
  'dev.sep43': "*SEP-43*\u00a0: les mêmes méthodes et codes d'erreur que les autres wallets Stellar.",
  'dev.kit': '*Stellar Wallets Kit*\u00a0: un module qui ajoute MetaMask au sélecteur de wallets.',
  'dev.freighter':
    '*API Freighter*\u00a0: les dApps conçues pour Freighter fonctionnent via un alias du bundler, sans changer leur code.',
  'dev.example': 'Se connecter et signer avec SEP-43',
  'dev.repo': 'Voir le code sur GitHub',

  'faq.eyebrow': 'Questions fréquentes',
  'faq.title': "Ce qu'il *faut savoir.*",
  'faq.what.q': "Qu'est-ce que Stellar Snap\u00a0?",
  'faq.what.a':
    "C'est un Snap MetaMask open source qui ajoute des comptes Stellar et Soroban à MetaMask, avec son propre écran dans l'extension. C'est un produit de Cosmos Pay et de Cosmos.",
  'faq.official.q': 'Est-ce un produit officiel de MetaMask\u00a0?',
  'faq.official.a':
    "Non. Stellar Snap est un projet indépendant\u00a0: il n'est ni affilié, ni parrainé, ni approuvé par MetaMask, Consensys ou la Stellar Development Foundation.",
  'faq.networks.q': 'Quels réseaux Stellar sont pris en charge\u00a0?',
  'faq.networks.a':
    "Les trois. Sur le testnet et le futurenet, c'est le Stellar Snap qui signe. Sur le mainnet, l'adaptateur utilise la prise en charge de Stellar intégrée à MetaMask et, si votre version ne l'a pas, le Snap.",
  'faq.keys.q': 'Où sont mes clés\u00a0?',
  'faq.keys.a':
    'Dans MetaMask. Les comptes sont dérivés de votre phrase secrète avec SEP-0005, comme dans les autres wallets Stellar, et les clés ne quittent jamais MetaMask. Pour un compte importé, seule sa clé secrète est conservée, chiffrée par MetaMask.',
  'faq.cost.q': 'Combien ça coûte\u00a0?',
  'faq.cost.a':
    "L'installation et l'utilisation sont gratuites. Vous payez les frais du réseau Stellar, et les échanges incluent des frais de plateforme Cosmos Pay affichés dans la cotation avant de confirmer.",
  'faq.extension.q': 'Faut-il un autre wallet ou une autre extension\u00a0?',
  'faq.extension.a':
    "Non. Il suffit de MetaMask\u00a0: le Snap fonctionne dans l'extension, et les dApps Stellar s'y connectent.",
  'faq.dapp.q': "Comment l'intégrer à ma dApp\u00a0?",
  'faq.dapp.a':
    "Avec l'adaptateur SEP-43, le module Stellar Wallets Kit ou l'API compatible avec Freighter. Le code et le guide d'intégration sont sur [GitHub]({repo}).",

  'donate.eyebrow': 'Dons',
  'donate.title': 'Aidez-nous à *poursuivre le projet.*',
  'donate.lead':
    "Stellar Snap est gratuit et open source. S'il vous est utile, vous pouvez faire un don sur le réseau Stellar\u00a0: chaque contribution finance les audits, la maintenance et de nouvelles fonctionnalités.",
  'donate.address': 'Adresse Stellar pour les dons',
  'donate.copy': "Copier l'adresse",
  'donate.copied': 'Adresse copiée',
  'donate.qr': "Code QR de l'adresse de don",
  'donate.note':
    "Accepte les XLM et d'autres actifs Stellar, comme l'USDC, sur le réseau public (mainnet). N'envoyez pas de fonds du testnet ni d'autres blockchains.",
  'donate.other': 'Autres façons de donner',

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
  'backend.official': 'MetaMask (Stellar intégré)',
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
  'error.mainnetPayment': 'Sur le mainnet, utilisez le bouton «\u00a0Envoyer\u00a0» de MetaMask.',
  'error.noSignature': "Le wallet n'a renvoyé aucune signature.",

  'toast.region': 'Notifications',
  'toast.close': 'Fermer',

  'consent.label': 'Mesure du site',
  'consent.text':
    'Avec votre accord, nous utilisons Google Analytics pour compter les visites et mesurer les performances du site. Aucune publicité.',
  'consent.accept': 'Accepter',
  'consent.reject': 'Refuser',
  'consent.policy': 'Politique de confidentialité',

  'footer.copyright': '© {year} Stellar Snap est un produit de Cosmos Pay et de Cosmos.',
  'footer.pages': 'À propos et contact',
  'footer.privacy': 'Confidentialité',
  'footer.terms': 'Conditions',
  'footer.credits': 'Crédits',
  'footer.contact': 'Contact',
  'footer.socialLink': 'Cosmos sur {network}',
  'footer.analytics': 'Préférences de mesure',
  'doc.updated': 'Dernière mise à jour\u00a0: {date}',
  'doc.translationNote': 'Ce document est disponible en espagnol et en anglais\u00a0; voici la version anglaise.',
  'breadcrumb.label': "Fil d'Ariane",
  'breadcrumb.home': 'Accueil',

  'notFound.title': 'Page introuvable',
  'notFound.text':
    "L'adresse que vous avez ouverte n'existe pas ou a été déplacée. Vérifiez qu'elle est bien écrite ou revenez à l'accueil.",
  'notFound.home': "Aller à l'accueil",
};
