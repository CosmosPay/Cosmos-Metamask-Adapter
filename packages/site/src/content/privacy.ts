import { CONTACT_EMAIL, COSMOS_URL, GA_MEASUREMENT_ID, REPO_URL } from '@/config';
import type { DocSet } from '@/content/types';

/** Whether this build can measure visits (with consent): the policy describes Google Analytics only then. */
const analytics = GA_MEASUREMENT_ID !== null;

/**
 * Privacy policy. Every service named here is one the snap or this site
 * actually calls (see the snap's `services/*` and the site's `services/*`);
 * keep it in step when that changes.
 */
export const privacy: DocSet = {
  updated: '2026-10-08',
  es: {
    title: 'Política de privacidad',
    description:
      'Qué datos maneja Stellar Snap (el Snap para MetaMask, este sitio y el adaptador para dApps), qué servicios externos usa y cómo contactarnos.',
    intro: [
      `Stellar Snap es un producto de Cosmos Pay y Cosmos («nosotros»). Incluye el Snap para MetaMask, este sitio y el adaptador para dApps, todos de código abierto en el [repositorio público](${REPO_URL}). Esta política explica qué datos maneja cada parte.`,
      '*En resumen:* Stellar Snap no custodia fondos, no tiene cuentas de usuario y no tenemos servidores que recojan tus datos personales. Tus claves nunca salen de MetaMask.',
    ],
    sections: [
      {
        heading: 'Tus claves y tus datos en MetaMask',
        blocks: [
          [
            'Tus cuentas Stellar se derivan de la frase de recuperación de MetaMask dentro de MetaMask. El Snap nunca ve ni guarda esa frase.',
            'Si importas una cuenta, solo se guarda su clave secreta (`S…`), cifrada por MetaMask en el almacenamiento propio del Snap. Al quitar esa cuenta, la clave se borra.',
            'Las preferencias del Snap (red elegida, nombres de cuentas, activos agregados y cuentas EVM vinculadas) también quedan cifradas en MetaMask, en tu dispositivo.',
          ],
        ],
      },
      {
        heading: 'Este sitio',
        blocks: [
          [
            analytics
              ? 'No usa publicidad ni píxeles de seguimiento, y no tiene formularios que envíen datos.'
              : 'No usa cookies, analítica, píxeles de seguimiento ni publicidad, y no tiene formularios que envíen datos.',
            ...(analytics
              ? [
                  'Solo si lo aceptas en el aviso que muestra, usa Google Analytics 4 para contar visitas y medir su rendimiento: páginas vistas, idioma, tipo de dispositivo y de navegador, país aproximado y tiempos de carga. Google recibe esos datos con sus propias cookies (`_ga`) y no guarda tu dirección IP. Puedes cambiar tu elección cuando quieras en «Preferencias de medición», al pie de cada página; si la retiras, el sitio deja de medir y borra esas cookies.',
                ]
              : []),
            analytics
              ? 'Guarda en tu navegador (`localStorage`) solo el idioma y el tema que elegiste, y tu respuesta sobre la medición.'
              : 'Guarda en tu navegador (`localStorage`) solo el idioma y el tema que elegiste.',
            analytics
              ? 'Sus tipografías e imágenes se sirven desde el propio sitio: visitarlo no carga recursos de terceros, salvo Google Analytics si lo aceptas.'
              : 'Sus tipografías e imágenes se sirven desde el propio sitio: visitarlo no carga recursos de terceros.',
            'Cuando conectas MetaMask, el sitio recibe tu dirección pública y cada firma o pago necesita tu aprobación en MetaMask. Si pides fondos de prueba, el sitio envía tu dirección a Friendbot.',
          ],
        ],
      },
      {
        heading: 'Servicios de terceros que usa el Snap',
        blocks: [
          'Al usar sus funciones, el Snap se conecta a estos servicios:',
          [
            '*Red Stellar* (Horizon y Soroban RPC de la Stellar Development Foundation): para consultar los saldos y la actividad de tu dirección pública y enviar las transacciones que firmas.',
            '*Friendbot* (solo testnet y futurenet): recibe tu dirección cuando pides fondos de prueba.',
            `*API de Cosmos Pay* (api.cosmospay.lat): el registro de activos y, si usas canjes, la cotización y la transacción del canje, con tu dirección pública, los activos y los montos. Más información en [cosmospay.lat](${COSMOS_URL}).`,
            '*Precios* (API de precios de MetaMask y, como respaldo, CoinGecko): reciben identificadores de activos y tu moneda, nunca tu dirección, y solo si en MetaMask tienes activado el uso de datos de precios externos.',
            '*Íconos* (CDN de íconos de MetaMask e icon.horse): reciben el identificador del activo o el dominio de su emisor para mostrar su logo.',
          ],
          'Como en cualquier conexión a internet, estos servicios ven tu dirección IP, y cada uno se rige por su propia política de privacidad. Los enlaces al explorador StellarExpert solo se abren si los tocas.',
        ],
      },
      {
        heading: 'La blockchain es pública',
        blocks: [
          'Las transacciones de Stellar, con sus direcciones, montos y memos, quedan registradas de forma pública y permanente. Nadie, ni nosotros, puede modificarlas ni borrarlas.',
        ],
      },
      {
        heading: 'Las dApps que conectes',
        blocks: [
          'Una dApp solo accede a Stellar Snap si la apruebas en MetaMask. Una vez conectada puede consultar tu dirección pública y la red, y proponerte firmas: cada firma, pago o vinculación de cuentas requiere tu confirmación. Lo que la dApp haga con esos datos depende de su propia política.',
        ],
      },
      {
        heading: 'Lo que no hacemos',
        blocks: ['No vendemos ni compartimos datos personales, no creamos perfiles y no mostramos publicidad.'],
      },
      {
        heading: 'Menores',
        blocks: ['Stellar Snap no está dirigido a menores de 18 años.'],
      },
      {
        heading: 'Cambios y contacto',
        blocks: [
          'Si cambiamos esta política, actualizaremos la fecha de arriba; el historial de cambios queda en el repositorio público.',
          `Para consultas de privacidad, escríbenos a [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}) o por los canales de la página de [contacto](/contact/).`,
        ],
      },
    ],
  },
  en: {
    title: 'Privacy policy',
    description:
      'What data Stellar Snap (the MetaMask Snap, this site and the dApp adapter) handles, which outside services it calls and how to reach us.',
    intro: [
      `Stellar Snap is a product of Cosmos Pay and Cosmos ("we"). It includes the MetaMask Snap, this site and the dApp adapter, all open source in the [public repository](${REPO_URL}). This policy explains what data each part handles.`,
      '*In short:* Stellar Snap holds no funds, has no user accounts, and we run no servers that collect your personal data. Your keys never leave MetaMask.',
    ],
    sections: [
      {
        heading: 'Your keys and your data in MetaMask',
        blocks: [
          [
            "Your Stellar accounts are derived from MetaMask's recovery phrase inside MetaMask. The snap never sees or stores that phrase.",
            "If you import an account, only its secret key (`S…`) is stored, encrypted by MetaMask in the snap's own storage. Removing that account erases the key.",
            "The snap's preferences (selected network, account names, added assets and linked EVM accounts) are also kept encrypted by MetaMask, on your device.",
          ],
        ],
      },
      {
        heading: 'This site',
        blocks: [
          [
            analytics
              ? 'It shows no ads, uses no tracking pixels and has no forms that send data.'
              : 'It uses no cookies, analytics, tracking pixels or ads, and has no forms that send data.',
            ...(analytics
              ? [
                  'Only if you accept it in the notice it shows, it uses Google Analytics 4 to count visits and measure its performance: pages viewed, language, device and browser type, approximate country and load times. Google receives that data through its own cookies (`_ga`) and does not store your IP address. You can change your choice at any time from "Measurement preferences" at the foot of every page; if you withdraw it, the site stops measuring and deletes those cookies.',
                ]
              : []),
            analytics
              ? 'It stores only your chosen language and theme in your browser (`localStorage`), and your answer about measurement.'
              : 'It stores only your chosen language and theme in your browser (`localStorage`).',
            analytics
              ? 'Its fonts and images are served from the site itself: visiting it loads nothing from third parties, except Google Analytics if you accept it.'
              : 'Its fonts and images are served from the site itself: visiting it loads nothing from third parties.',
            'When you connect MetaMask, the site receives your public address, and every signature or payment needs your approval in MetaMask. If you ask for test funds, the site sends your address to Friendbot.',
          ],
        ],
      },
      {
        heading: 'Third-party services the snap uses',
        blocks: [
          'When you use its features, the snap connects to these services:',
          [
            "*Stellar network* (the Stellar Development Foundation's Horizon and Soroban RPC): to read the balances and activity of your public address and submit the transactions you sign.",
            '*Friendbot* (testnet and futurenet only): receives your address when you ask for test funds.',
            `*Cosmos Pay API* (api.cosmospay.lat): the asset registry and, if you swap, the swap quote and transaction, with your public address, the assets and the amounts. More at [cosmospay.lat](${COSMOS_URL}).`,
            "*Prices* (MetaMask's price API, with CoinGecko as a fallback): receive asset identifiers and your currency, never your address, and only if external price data is turned on in MetaMask.",
            "*Icons* (MetaMask's icon CDN and icon.horse): receive the asset identifier or its issuer's domain, to show its logo.",
          ],
          'As with any internet connection, these services see your IP address, and each follows its own privacy policy. Links to the StellarExpert explorer only open if you tap them.',
        ],
      },
      {
        heading: 'The blockchain is public',
        blocks: [
          'Stellar transactions, with their addresses, amounts and memos, are recorded publicly and permanently. No one, including us, can change or delete them.',
        ],
      },
      {
        heading: 'dApps you connect',
        blocks: [
          'A dApp can only reach Stellar Snap after you approve it in MetaMask. Once connected it can read your public address and network and propose signatures: every signature, payment or account link needs your confirmation. What the dApp does with that data is up to its own policy.',
        ],
      },
      {
        heading: "What we don't do",
        blocks: ["We don't sell or share personal data, build profiles or show ads."],
      },
      {
        heading: 'Children',
        blocks: ['Stellar Snap is not meant for anyone under 18.'],
      },
      {
        heading: 'Changes and contact',
        blocks: [
          'If we change this policy we will update the date above; the change history stays in the public repository.',
          `For privacy questions, write to us at [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}) or through the channels on the [contact](/contact/) page.`,
        ],
      },
    ],
  },
};
