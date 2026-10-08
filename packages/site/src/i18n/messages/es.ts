/**
 * Spanish strings: the source of truth for the message keys. `en` and `pt`
 * must define exactly the same keys (their type enforces it).
 *
 * Inline markup for `RichText`: *bold*, ==highlight==, `code`.
 * Placeholders: {name}.
 */
export const es = {
  'meta.title': 'Stellar en MetaMask · Cosmos Pay',

  'nav.language': 'Idioma',
  'theme.toDark': 'Cambiar a modo oscuro',
  'theme.toLight': 'Cambiar a modo claro',

  'hero.eyebrow': 'Compatible con Freighter',
  'hero.title': 'Tu cuenta *Stellar*, *dentro* de ==MetaMask.==',
  'hero.lead': 'Mainnet con el soporte oficial de MetaMask; testnet y futurenet con el *Stellar Snap*.',
  'hero.cta': 'Obtener Cosmos Wallet',
  'hero.supported': 'Funciona con',
  'stats.networks': 'Redes Stellar',
  'stats.api': 'API estándar',
  'stats.extensions': 'Extensiones extra',

  'connect.button': 'Conectar MetaMask',
  'connect.done': 'Conectado',

  'account.title': 'Tu cuenta',
  'account.network': 'Red',
  'account.address': 'Dirección',
  'account.signer': 'Firmante',
  'account.balance': 'Saldo',
  'account.evm': 'EVM vinculada',
  'account.unfunded': 'Cuenta sin fondos',
  'account.refresh': 'Actualizar saldo',
  'account.refreshed': 'Saldo actualizado',
  'account.fund': 'Fondear con Friendbot',
  'account.funded': 'Cuenta fondeada con XLM de prueba.',
  'account.friendbot': 'Friendbot',
  'account.link': 'Vincular mi cuenta EVM',
  'account.linked': 'Cuentas vinculadas',
  'account.switched': 'Red cambiada',
  'backend.official': 'MetaMask (soporte oficial de Stellar)',
  'backend.snap': 'Stellar Snap',

  'soroban.title': 'Autorización Soroban (signAuthEntry)',
  'soroban.text':
    'Construye la autorización de un `transfer` de ejemplo, la firma en MetaMask y la verifica con el SDK de Stellar, igual que haría una dApp de Soroban.',
  'soroban.button': 'Firmar autorización de ejemplo',
  'soroban.done': 'Autorización Soroban firmada y verificada',

  'payment.title': 'Enviar pago',
  'payment.destination': 'Destino',
  'payment.amount': 'Monto (XLM)',
  'payment.memo': 'Memo',
  'payment.memoPlaceholder': 'opcional',
  'payment.submit': 'Enviar',
  'payment.done': 'Pago enviado',

  'sign.title': 'Firmar mensaje (SEP-53)',
  'sign.message': 'Mensaje',
  'sign.default': 'Hola desde Cosmos Pay',
  'sign.submit': 'Firmar',
  'sign.done': 'Firma SEP-53',

  'error.rejected.title': 'Solicitud rechazada',
  'error.rejected.text': 'Cancelaste la solicitud en MetaMask.',
  'error.invalid.title': 'Solicitud no válida',
  'error.external.title': 'Servicio no disponible',
  'error.internal.title': 'Algo salió mal',
  'error.connectFirst': 'Conecta MetaMask primero.',
  'error.unknownNetwork': 'Red desconocida: {network}',
  'error.friendbot': 'Friendbot respondió con el código {status}.',
  'error.mainnetPayment': 'En mainnet usa el botón «Enviar» de MetaMask (soporte oficial).',
  'error.noSignature': 'La wallet no devolvió ninguna firma.',

  'toast.region': 'Notificaciones',
  'toast.close': 'Cerrar',
} as const;

export type MessageKey = keyof typeof es;
export type Messages = Record<MessageKey, string>;
