/**
 * Spanish strings: the source of truth for the message keys. Every other
 * language must define exactly the same keys (their type enforces it).
 *
 * Inline markup for `RichText` (lib/markup.ts): *bold*, ==highlight==, `code`, [link](url).
 * Placeholders: {name}.
 */
export const es = {
  'meta.title': 'Stellar Snap · Stellar y Soroban en MetaMask',
  'meta.description':
    'Stellar Snap agrega cuentas de Stellar y Soroban a MetaMask: envía, recibe, canjea y firma sin instalar otra wallet. Para mainnet, testnet y futurenet.',

  'nav.skip': 'Saltar al contenido',
  'nav.main': 'Principal',
  'nav.language': 'Idioma',
  'nav.donate': 'Donar',
  'link.newTab': '(se abre en una pestaña nueva)',
  'theme.toDark': 'Cambiar a modo oscuro',
  'theme.toLight': 'Cambiar a modo claro',

  'suggest.text': 'Esta página también está disponible en español.',
  'suggest.action': 'Ver en español',
  'suggest.dismiss': 'Descartar',

  'hero.eyebrow': 'Compatible con Cosmos Wallet y Freighter',
  'hero.title': 'Tu cuenta *Stellar*, *dentro* de ==MetaMask.==',
  'hero.lead': 'Cuentas, pagos y firmas de Stellar y Soroban sin salir de MetaMask, con el *Stellar Snap*.',
  'hero.install': 'Instalar en MetaMask',
  'hero.installed': 'Instalado en MetaMask',
  'hero.cta': 'Obtener Cosmos Wallet',
  'hero.sponsoredBy': 'Patrocinado por',
  'stats.networks': 'Redes Stellar',
  'stats.api': 'API estándar',
  'stats.extensions': 'Extensiones extra',

  'features.eyebrow': 'Funciones',
  'features.title': 'Todo Stellar, *sin salir de MetaMask.*',
  'features.lead':
    'El *Stellar Snap* agrega a MetaMask una wallet de Stellar completa, con su propia pantalla dentro de la extensión.',
  'features.accounts.title': 'Cuentas Stellar',
  'features.accounts.text':
    'Crea varias cuentas a partir de la frase secreta de MetaMask, o importa una clave secreta o una frase de recuperación.',
  'features.payments.title': 'Enviar y recibir',
  'features.payments.text':
    'Envía XLM y otros activos revisando la comisión y el memo antes de firmar, y recibe con un código QR.',
  'features.assets.title': 'Activos y trustlines',
  'features.assets.text':
    'Agrega activos del registro de Cosmos Pay, o cualquier otro por su código y emisor, y quítalos cuando ya no los uses.',
  'features.swaps.title': 'Canjes',
  'features.swaps.text':
    'Canjea activos en el DEX de Stellar con cotizaciones de Cosmos Pay. El Snap revisa cada transacción antes de pedirte la firma.',
  'features.soroban.title': 'Soroban y mensajes',
  'features.soroban.text':
    'Firma autorizaciones de contratos Soroban viendo el contrato, la función y los argumentos, y firma mensajes con SEP-53.',
  'features.evm.title': 'Cuenta EVM vinculada',
  'features.evm.text':
    'Vincula tu dirección 0x de MetaMask con tu cuenta Stellar mediante firmas que cualquiera puede verificar.',

  'start.eyebrow': 'Cómo empezar',
  'start.title': 'Listo en *tres pasos.*',
  'start.metamask.title': 'Instala MetaMask',
  'start.metamask.text': 'Agrega la extensión de MetaMask a tu navegador de escritorio, si todavía no la tienes.',
  'start.install.title': 'Agrega el Stellar Snap',
  'start.install.text': 'Pulsa «Instalar en MetaMask» en esta página y aprueba los permisos que te muestra MetaMask.',
  'start.use.title': 'Usa tu cuenta Stellar',
  'start.use.text':
    'En MetaMask, abre el menú ⋮ → Snaps → Stellar Snap. Desde ahí envías, recibes, canjeas y administras tus cuentas.',

  'dev.eyebrow': 'Para desarrolladores',
  'dev.title': 'Conecta tu dApp con *una API estándar.*',
  'dev.lead':
    'El adaptador `@cosmosapp/stellar-metamask-adapter` implementa SEP-43: en mainnet usa el soporte de Stellar integrado en MetaMask, y en testnet y futurenet, el Stellar Snap.',
  'dev.sep43': '*SEP-43*: los mismos métodos y códigos de error que las demás wallets de Stellar.',
  'dev.kit': '*Stellar Wallets Kit*: un módulo que agrega MetaMask al selector de wallets.',
  'dev.freighter':
    '*API de Freighter*: las dApps hechas para Freighter funcionan con un alias del bundler, sin cambiar su código.',
  'dev.example': 'Conectar y firmar con SEP-43',
  'dev.repo': 'Ver el código en GitHub',

  'faq.eyebrow': 'Preguntas frecuentes',
  'faq.title': 'Lo que *necesitas saber.*',
  'faq.what.q': '¿Qué es Stellar Snap?',
  'faq.what.a':
    'Es un Snap de MetaMask de código abierto que agrega cuentas de Stellar y Soroban a MetaMask, con su propia pantalla dentro de la extensión. Es un producto de Cosmos Pay y Cosmos.',
  'faq.official.q': '¿Es un producto oficial de MetaMask?',
  'faq.official.a':
    'No. Stellar Snap es un proyecto independiente: no está afiliado, patrocinado ni aprobado por MetaMask, Consensys ni la Stellar Development Foundation.',
  'faq.networks.q': '¿Qué redes de Stellar admite?',
  'faq.networks.a':
    'Las tres. En testnet y futurenet firma el Stellar Snap. En mainnet, el adaptador usa el soporte de Stellar integrado en MetaMask y, si tu versión no lo tiene, el Snap.',
  'faq.keys.q': '¿Dónde quedan mis claves?',
  'faq.keys.a':
    'En MetaMask. Las cuentas se derivan de tu frase secreta con SEP-0005, como en otras wallets de Stellar, y las claves nunca salen de MetaMask. De una cuenta importada solo se guarda la clave secreta, cifrada por MetaMask.',
  'faq.cost.q': '¿Cuánto cuesta?',
  'faq.cost.a':
    'Instalarlo y usarlo es gratis. Pagas las comisiones de la red Stellar, y los canjes incluyen una comisión de plataforma de Cosmos Pay que ves en la cotización antes de confirmar.',
  'faq.extension.q': '¿Necesito otra wallet o extensión?',
  'faq.extension.a':
    'No. Solo necesitas MetaMask: el Snap funciona dentro de la extensión y las dApps de Stellar se conectan a través de ella.',
  'faq.dapp.q': '¿Cómo lo integro en mi dApp?',
  'faq.dapp.a':
    'Con el adaptador SEP-43, el módulo de Stellar Wallets Kit o la API compatible con Freighter. El código y la guía de integración están en [GitHub]({repo}).',

  'donate.eyebrow': 'Donaciones',
  'donate.title': 'Ayúdanos a *seguir construyendo.*',
  'donate.lead':
    'Stellar Snap es gratis y de código abierto. Si te resulta útil, puedes donar en la red Stellar: cada aporte financia auditorías, mantenimiento y nuevas funciones.',
  'donate.address': 'Dirección de Stellar para donaciones',
  'donate.copy': 'Copiar dirección',
  'donate.copied': 'Dirección copiada',
  'donate.qr': 'Código QR con la dirección de donación',
  'donate.note':
    'Acepta XLM y otros activos de Stellar, como USDC, en la red pública (mainnet). No envíes fondos de testnet ni de otras blockchains.',
  'donate.other': 'Otras formas de donar',

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
  'backend.official': 'MetaMask (Stellar integrado)',
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
  'sign.default': 'Hola desde Stellar Snap',
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
  'error.mainnetPayment': 'En mainnet usa el botón «Enviar» de MetaMask.',
  'error.noSignature': 'La wallet no devolvió ninguna firma.',

  'toast.region': 'Notificaciones',
  'toast.close': 'Cerrar',

  'consent.label': 'Medición del sitio',
  'consent.text':
    'Con tu permiso, usamos Google Analytics para contar visitas y medir el rendimiento del sitio. Nada de publicidad.',
  'consent.accept': 'Aceptar',
  'consent.reject': 'Rechazar',
  'consent.policy': 'Política de privacidad',

  'footer.copyright': '© {year} Stellar Snap es un producto de Cosmos Pay y Cosmos.',
  'footer.pages': 'Información y contacto',
  'footer.privacy': 'Privacidad',
  'footer.terms': 'Términos',
  'footer.credits': 'Créditos',
  'footer.contact': 'Contacto',
  'footer.socialLink': 'Cosmos en {network}',
  'footer.analytics': 'Preferencias de medición',
  'doc.updated': 'Última actualización: {date}',
  'doc.translationNote': 'Este documento está disponible en español e inglés; esta es la versión en inglés.',
  'breadcrumb.label': 'Ruta de navegación',
  'breadcrumb.home': 'Inicio',

  'notFound.title': 'Página no encontrada',
  'notFound.text':
    'La dirección que abriste no existe o cambió de lugar. Revisa que esté bien escrita o vuelve al inicio.',
  'notFound.home': 'Ir al inicio',
} as const;

export type MessageKey = keyof typeof es;
export type Messages = Record<MessageKey, string>;
