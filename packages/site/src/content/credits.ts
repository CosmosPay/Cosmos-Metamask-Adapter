import { COSMOS_URL, REPO_URL, SALTA_DEV_URL } from '@/config';
import type { DocSet } from '@/content/types';

/** Credits: the team, sponsors, the open-source software and services Stellar Snap is built on, type and trademarks. */
export const credits: DocSet = {
  es: {
    title: 'Créditos',
    intro: [
      'Stellar Snap es un producto de Cosmos Pay y Cosmos, hecho en código abierto. Gracias a quienes lo hacen posible.',
    ],
    sections: [
      {
        heading: 'Equipo',
        blocks: [['*Emanuel Guzman*, desarrollador principal, de Cosmos Pay.']],
      },
      {
        heading: 'Patrocinadores',
        blocks: [
          [
            `[Cosmos](${COSMOS_URL}): Cosmos Pay y Cosmos Wallet.`,
            `[SaltaDev](${SALTA_DEV_URL}): la comunidad de desarrolladores de Salta.`,
          ],
        ],
      },
      {
        heading: 'Hecho con',
        blocks: [
          [
            '[Stellar SDK](https://github.com/stellar/js-stellar-sdk), de la Stellar Development Foundation (Apache-2.0).',
            '[MetaMask Snaps SDK](https://github.com/MetaMask/snaps) y `@metamask/connect-stellar`, de Consensys (ISC).',
            '`@metamask/key-tree`, `@metamask/superstruct` y `@metamask/scure-bip39` (MIT).',
            '[noble-curves y noble-hashes](https://paulmillr.com/noble/), de Paul Miller (MIT).',
            '[qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator), de Kazuhiko Arase (MIT).',
            '[React](https://react.dev) y [Vite](https://vite.dev) (MIT).',
          ],
        ],
      },
      {
        heading: 'Datos y servicios',
        blocks: [
          [
            'Horizon, Soroban RPC y Friendbot: [Stellar Development Foundation](https://stellar.org).',
            `Registro de activos y canjes: [Cosmos Pay](${COSMOS_URL}).`,
            'Precios: API de precios de MetaMask y [CoinGecko](https://www.coingecko.com).',
            'Íconos: CDN de íconos de MetaMask e [icon.horse](https://icon.horse).',
            'Explorador: [StellarExpert](https://stellar.expert).',
          ],
        ],
      },
      {
        heading: 'Tipografía',
        blocks: [
          [
            '[Open Sauce One](https://github.com/marcologous/Open-Sauce-Fonts), de Marcelo Magalhães (SIL Open Font License 1.1).',
            'Aeronaut, de Felix Summ para [Place of Interest](https://poitype.com). El logo usa Aeronaut y Cosmos Lazos, la adaptación de Aeronaut de Cosmos.',
          ],
        ],
      },
      {
        heading: 'Marcas',
        blocks: [
          'Stellar y el logo de Stellar son marcas de la Stellar Development Foundation. MetaMask es una marca de Consensys. Los logos de Cosmos y de SaltaDev pertenecen a sus dueños. Que aparezcan aquí no implica respaldo.',
        ],
      },
      {
        heading: 'Código',
        blocks: [
          `El código de Stellar Snap es público en [GitHub](${REPO_URL}), con licencia MIT. Las contribuciones son bienvenidas.`,
        ],
      },
    ],
  },
  en: {
    title: 'Credits',
    intro: [
      'Stellar Snap is a product of Cosmos Pay and Cosmos, built in the open. Thanks to everyone who makes it possible.',
    ],
    sections: [
      {
        heading: 'Team',
        blocks: [['*Emanuel Guzman*, lead developer, from Cosmos Pay.']],
      },
      {
        heading: 'Sponsors',
        blocks: [
          [
            `[Cosmos](${COSMOS_URL}): Cosmos Pay and Cosmos Wallet.`,
            `[SaltaDev](${SALTA_DEV_URL}): the Salta developer community.`,
          ],
        ],
      },
      {
        heading: 'Built with',
        blocks: [
          [
            '[Stellar SDK](https://github.com/stellar/js-stellar-sdk), by the Stellar Development Foundation (Apache-2.0).',
            '[MetaMask Snaps SDK](https://github.com/MetaMask/snaps) and `@metamask/connect-stellar`, by Consensys (ISC).',
            '`@metamask/key-tree`, `@metamask/superstruct` and `@metamask/scure-bip39` (MIT).',
            '[noble-curves and noble-hashes](https://paulmillr.com/noble/), by Paul Miller (MIT).',
            '[qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator), by Kazuhiko Arase (MIT).',
            '[React](https://react.dev) and [Vite](https://vite.dev) (MIT).',
          ],
        ],
      },
      {
        heading: 'Data and services',
        blocks: [
          [
            'Horizon, Soroban RPC and Friendbot: [Stellar Development Foundation](https://stellar.org).',
            `Asset registry and swaps: [Cosmos Pay](${COSMOS_URL}).`,
            "Prices: MetaMask's price API and [CoinGecko](https://www.coingecko.com).",
            "Icons: MetaMask's icon CDN and [icon.horse](https://icon.horse).",
            'Explorer: [StellarExpert](https://stellar.expert).',
          ],
        ],
      },
      {
        heading: 'Typography',
        blocks: [
          [
            '[Open Sauce One](https://github.com/marcologous/Open-Sauce-Fonts), by Marcelo Magalhães (SIL Open Font License 1.1).',
            "Aeronaut, by Felix Summ for [Place of Interest](https://poitype.com). The logo uses Aeronaut and Cosmos Lazos, Cosmos's adaptation of Aeronaut.",
          ],
        ],
      },
      {
        heading: 'Trademarks',
        blocks: [
          'Stellar and the Stellar logo are trademarks of the Stellar Development Foundation. MetaMask is a trademark of Consensys. The Cosmos and SaltaDev logos belong to their owners. Their appearance here implies no endorsement.',
        ],
      },
      {
        heading: 'Code',
        blocks: [
          `Stellar Snap's code is public on [GitHub](${REPO_URL}) under the MIT license. Contributions are welcome.`,
        ],
      },
    ],
  },
};
