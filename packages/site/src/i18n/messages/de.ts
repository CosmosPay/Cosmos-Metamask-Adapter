import type { Messages } from '@/i18n/messages/es';

export const de: Messages = {
  'meta.title': 'Stellar Snap · Stellar und Soroban in MetaMask',
  'meta.description':
    'Stellar Snap bringt Stellar- und Soroban-Konten in MetaMask: senden, empfangen, tauschen und signieren, ohne weitere Wallet. Für Mainnet, Testnet und Futurenet.',

  'nav.skip': 'Zum Inhalt springen',
  'nav.main': 'Hauptmenü',
  'nav.language': 'Sprache',
  'link.newTab': '(öffnet in einem neuen Tab)',
  'theme.toDark': 'Zum dunklen Modus wechseln',
  'theme.toLight': 'Zum hellen Modus wechseln',

  'suggest.text': 'Diese Seite gibt es auch auf Deutsch.',
  'suggest.action': 'Auf Deutsch ansehen',
  'suggest.dismiss': 'Ausblenden',

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

  'features.eyebrow': 'Funktionen',
  'features.title': 'Ganz Stellar, *ohne MetaMask zu verlassen.*',
  'features.lead':
    'Der *Stellar Snap* ergänzt MetaMask um eine vollständige Stellar-Wallet mit eigener Ansicht in der Erweiterung.',
  'features.accounts.title': 'Stellar-Konten',
  'features.accounts.text':
    'Erstellen Sie mehrere Konten aus der geheimen Wiederherstellungsphrase von MetaMask oder importieren Sie einen geheimen Schlüssel oder eine Wiederherstellungsphrase.',
  'features.payments.title': 'Senden und empfangen',
  'features.payments.text':
    'Senden Sie XLM und andere Assets, nachdem Sie Gebühr und Memo geprüft haben, und empfangen Sie per QR-Code.',
  'features.assets.title': 'Assets und Trustlines',
  'features.assets.text':
    'Fügen Sie Assets aus dem Cosmos-Pay-Verzeichnis hinzu, oder jedes andere über Code und Aussteller, und entfernen Sie sie, wenn Sie sie nicht mehr nutzen.',
  'features.swaps.title': 'Tauschen',
  'features.swaps.text':
    'Tauschen Sie Assets an der Stellar-DEX mit Kursen von Cosmos Pay. Der Snap prüft jede Transaktion, bevor er Sie um Ihre Signatur bittet.',
  'features.soroban.title': 'Soroban und Nachrichten',
  'features.soroban.text':
    'Signieren Sie Soroban-Vertragsautorisierungen mit Blick auf Vertrag, Funktion und Argumente, und signieren Sie Nachrichten mit SEP-53.',
  'features.evm.title': 'Verknüpftes EVM-Konto',
  'features.evm.text':
    'Verknüpfen Sie Ihre 0x-Adresse aus MetaMask mit Ihrem Stellar-Konto – mit Signaturen, die jeder prüfen kann.',

  'start.eyebrow': 'Erste Schritte',
  'start.title': 'Startklar in *drei Schritten.*',
  'start.metamask.title': 'MetaMask installieren',
  'start.metamask.text':
    'Fügen Sie die MetaMask-Erweiterung zu Ihrem Desktop-Browser hinzu, falls Sie sie noch nicht haben.',
  'start.install.title': 'Stellar Snap hinzufügen',
  'start.install.text':
    'Klicken Sie auf dieser Seite auf „In MetaMask installieren“ und bestätigen Sie die Berechtigungen, die MetaMask anzeigt.',
  'start.use.title': 'Stellar-Konto nutzen',
  'start.use.text':
    'Öffnen Sie in MetaMask das Menü ⋮ → Snaps → Stellar Snap. Dort senden, empfangen und tauschen Sie und verwalten Ihre Konten.',

  'dev.eyebrow': 'Für Entwickler',
  'dev.title': 'Verbinden Sie Ihre dApp über *eine Standard-API.*',
  'dev.lead':
    'Der Adapter `@cosmospay/stellar-metamask-adapter` implementiert SEP-43: Im Mainnet nutzt er die in MetaMask integrierte Stellar-Unterstützung, im Testnet und Futurenet den Stellar Snap.',
  'dev.sep43': '*SEP-43*: dieselben Methoden und Fehlercodes wie bei anderen Stellar-Wallets.',
  'dev.kit': '*Stellar Wallets Kit*: ein Modul, das MetaMask zur Wallet-Auswahl hinzufügt.',
  'dev.freighter': '*Freighter-API*: dApps für Freighter funktionieren über einen Bundler-Alias, ohne Codeänderung.',
  'dev.example': 'Verbinden und signieren mit SEP-43',
  'dev.repo': 'Code auf GitHub ansehen',

  'faq.eyebrow': 'Häufige Fragen',
  'faq.title': 'Was Sie *wissen sollten.*',
  'faq.what.q': 'Was ist Stellar Snap?',
  'faq.what.a':
    'Ein quelloffener MetaMask-Snap, der MetaMask um Stellar- und Soroban-Konten ergänzt, mit eigener Ansicht in der Erweiterung. Ein Produkt von Cosmos Pay und Cosmos.',
  'faq.official.q': 'Ist es ein offizielles MetaMask-Produkt?',
  'faq.official.a':
    'Nein. Stellar Snap ist ein unabhängiges Projekt: Es ist weder mit MetaMask, Consensys oder der Stellar Development Foundation verbunden noch von ihnen gesponsert oder genehmigt.',
  'faq.networks.q': 'Welche Stellar-Netzwerke werden unterstützt?',
  'faq.networks.a':
    'Alle drei. Im Testnet und Futurenet signiert der Stellar Snap. Im Mainnet nutzt der Adapter die in MetaMask integrierte Stellar-Unterstützung und, falls Ihre Version sie nicht hat, den Snap.',
  'faq.keys.q': 'Wo liegen meine Schlüssel?',
  'faq.keys.a':
    'In MetaMask. Die Konten werden mit SEP-0005 aus Ihrer geheimen Phrase abgeleitet, wie bei anderen Stellar-Wallets, und die Schlüssel verlassen MetaMask nie. Von einem importierten Konto wird nur der geheime Schlüssel gespeichert, von MetaMask verschlüsselt.',
  'faq.cost.q': 'Was kostet es?',
  'faq.cost.a':
    'Installation und Nutzung sind kostenlos. Sie zahlen die Gebühren des Stellar-Netzwerks, und Tauschvorgänge enthalten eine Plattformgebühr von Cosmos Pay, die Sie vor dem Bestätigen im Angebot sehen.',
  'faq.extension.q': 'Brauche ich eine weitere Wallet oder Erweiterung?',
  'faq.extension.a':
    'Nein. Sie brauchen nur MetaMask: Der Snap läuft in der Erweiterung, und Stellar-dApps verbinden sich darüber.',
  'faq.dapp.q': 'Wie binde ich es in meine dApp ein?',
  'faq.dapp.a':
    'Mit dem SEP-43-Adapter, dem Modul für Stellar Wallets Kit oder der Freighter-kompatiblen API. Code und Integrationsanleitung finden Sie auf [GitHub]({repo}).',

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
  'footer.pages': 'Info und Kontakt',
  'footer.privacy': 'Datenschutz',
  'footer.terms': 'Nutzungsbedingungen',
  'footer.credits': 'Credits',
  'footer.contact': 'Kontakt',
  'footer.socialLink': 'Cosmos auf {network}',
  'doc.updated': 'Zuletzt aktualisiert: {date}',
  'doc.translationNote': 'Dieses Dokument gibt es auf Spanisch und Englisch; dies ist die englische Fassung.',
  'breadcrumb.label': 'Brotkrumennavigation',
  'breadcrumb.home': 'Startseite',

  'notFound.title': 'Seite nicht gefunden',
  'notFound.text':
    'Die aufgerufene Adresse gibt es nicht oder sie wurde verschoben. Prüfen Sie die Schreibweise oder kehren Sie zur Startseite zurück.',
  'notFound.home': 'Zur Startseite',
};
