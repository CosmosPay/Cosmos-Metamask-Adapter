import type { Messages } from '@/i18n/messages/es';

export const de: Messages = {
  'meta.title': 'Stellar Snap · Stellar in MetaMask',

  'nav.language': 'Sprache',
  'theme.toDark': 'Zum dunklen Modus wechseln',
  'theme.toLight': 'Zum hellen Modus wechseln',

  'hero.eyebrow': 'Kompatibel mit Cosmos Wallet',
  'hero.title': 'Ihr *Stellar*-Konto, *direkt in* ==MetaMask.==',
  'hero.lead':
    'Stellar- und Soroban-Konten, Zahlungen und Signaturen, ohne MetaMask zu verlassen – mit dem *Stellar Snap*.',
  'hero.install': 'In MetaMask installieren',
  'hero.installed': 'In MetaMask installiert',
  'hero.cta': 'Cosmos Wallet holen',
  'hero.sponsoredBy': 'Unterstützt von',
  'stats.networks': 'Stellar-Netzwerke',
  'stats.api': 'Standard-API',
  'stats.extensions': 'Zusätzliche Erweiterungen',

  'connect.button': 'MetaMask verbinden',
  'connect.done': 'Verbunden',

  'account.title': 'Ihr Konto',
  'account.network': 'Netzwerk',
  'account.address': 'Adresse',
  'account.signer': 'Unterzeichner',
  'account.balance': 'Guthaben',
  'account.evm': 'Verknüpfte EVM',
  'account.unfunded': 'Konto ohne Guthaben',
  'account.refresh': 'Guthaben aktualisieren',
  'account.refreshed': 'Guthaben aktualisiert',
  'account.fund': 'Mit Friendbot aufladen',
  'account.funded': 'Konto mit Test-XLM aufgeladen.',
  'account.friendbot': 'Friendbot',
  'account.link': 'Mein EVM-Konto verknüpfen',
  'account.linked': 'Verknüpfte Konten',
  'account.switched': 'Netzwerk gewechselt',
  'backend.official': 'MetaMask (integriertes Stellar)',
  'backend.snap': 'Stellar Snap',

  'soroban.title': 'Soroban-Autorisierung (signAuthEntry)',
  'soroban.text':
    'Erstellt die Autorisierung für einen Beispiel-`transfer`, signiert sie in MetaMask und prüft sie mit dem Stellar SDK – genau wie eine Soroban-dApp.',
  'soroban.button': 'Beispiel-Autorisierung signieren',
  'soroban.done': 'Soroban-Autorisierung signiert und geprüft',

  'payment.title': 'Zahlung senden',
  'payment.destination': 'Empfänger',
  'payment.amount': 'Betrag (XLM)',
  'payment.memo': 'Memo',
  'payment.memoPlaceholder': 'optional',
  'payment.submit': 'Senden',
  'payment.done': 'Zahlung gesendet',

  'sign.title': 'Nachricht signieren (SEP-53)',
  'sign.message': 'Nachricht',
  'sign.default': 'Hallo von Stellar Snap',
  'sign.submit': 'Signieren',
  'sign.done': 'SEP-53-Signatur',

  'error.rejected.title': 'Anfrage abgelehnt',
  'error.rejected.text': 'Sie haben die Anfrage in MetaMask abgebrochen.',
  'error.invalid.title': 'Ungültige Anfrage',
  'error.external.title': 'Dienst nicht verfügbar',
  'error.internal.title': 'Etwas ist schiefgelaufen',
  'error.connectFirst': 'Verbinden Sie zuerst MetaMask.',
  'error.unknownNetwork': 'Unbekanntes Netzwerk: {network}',
  'error.friendbot': 'Friendbot hat mit dem Statuscode {status} geantwortet.',
  'error.mainnetPayment': 'Verwenden Sie im Mainnet die Schaltfläche „Senden“ von MetaMask.',
  'error.noSignature': 'Die Wallet hat keine Signatur zurückgegeben.',

  'toast.region': 'Benachrichtigungen',
  'toast.close': 'Schließen',

  'footer.copyright': '© {year} Stellar Snap ist ein Produkt von Cosmos Pay und Cosmos.',
};
