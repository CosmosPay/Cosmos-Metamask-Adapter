import { COSMOS_URL, REPO_URL } from '@/config';
import type { DocSet } from '@/content/types';

/** Terms of service. The swap clause mirrors the snap's product rules (Cosmos Pay server, platform fee, minimum check). */
export const terms: DocSet = {
  updated: '2026-10-08',
  es: {
    title: 'Términos de servicio',
    intro: [
      'Estos términos regulan el uso de Stellar Snap: el Snap para MetaMask, este sitio y el adaptador para dApps. Al instalar el Snap, usar este sitio o integrar el adaptador, los aceptas. Si no estás de acuerdo, no los uses.',
    ],
    sections: [
      {
        heading: 'Qué es Stellar Snap',
        blocks: [
          'Es software de código abierto que agrega cuentas de Stellar a MetaMask: el Snap para testnet y futurenet y un adaptador SEP-43 para dApps. En mainnet, el adaptador usa las funciones de Stellar integradas en MetaMask, que se rigen por los términos de MetaMask.',
          '*Stellar Snap no está afiliado, patrocinado ni aprobado por MetaMask, Consensys ni la Stellar Development Foundation.* Sus nombres y logos pertenecen a sus dueños.',
        ],
      },
      {
        heading: 'No custodiamos tus fondos',
        blocks: [
          'No guardamos tus fondos ni tus claves, y no podemos recuperar una cuenta, revertir una transacción ni acceder a tus activos. Eres responsable de tu frase de recuperación, de tus claves y de revisar cada transacción antes de firmarla. Las transacciones en Stellar son irreversibles.',
        ],
      },
      {
        heading: 'Redes de prueba',
        blocks: [
          'Los fondos de testnet y futurenet no tienen valor, y esas redes pueden reiniciarse en cualquier momento.',
        ],
      },
      {
        heading: 'Canjes',
        blocks: [
          `Los canjes se cotizan y se arman en el servidor comunitario de [Cosmos Pay](${COSMOS_URL}) e incluyen una comisión de plataforma que se muestra en la cotización antes de que confirmes. El precio puede cambiar hasta que se ejecuta el canje; antes de pedirte la firma, el Snap verifica que la transacción respete el monto mínimo a recibir. Los canjes pueden no estar disponibles en algunas redes o en algunos momentos.`,
        ],
      },
      {
        heading: 'Servicios de terceros',
        blocks: [
          'Stellar Snap depende de servicios de terceros: los servidores de la red Stellar, Friendbot, la API de Cosmos Pay y los proveedores de precios e íconos. No controlamos su disponibilidad, su exactitud ni sus términos.',
        ],
      },
      {
        heading: 'Uso aceptable',
        blocks: [
          'No uses Stellar Snap para actividades ilegales, para eludir sanciones ni para dañar a otras personas o a los servicios de los que depende.',
        ],
      },
      {
        heading: 'Licencia',
        blocks: [
          `El código se distribuye con licencia MIT en el [repositorio público](${REPO_URL}); esa licencia rige su uso, copia y modificación. Las marcas y los logos no están incluidos en ella.`,
        ],
      },
      {
        heading: 'Sin garantías',
        blocks: [
          'Stellar Snap se ofrece «tal cual» y «según disponibilidad», sin garantías de ningún tipo, expresas o implícitas, incluidas las de comerciabilidad, idoneidad para un fin determinado y no infracción.',
        ],
      },
      {
        heading: 'Limitación de responsabilidad',
        blocks: [
          'En la máxima medida que permita la ley, ni Cosmos Pay ni Cosmos serán responsables por pérdidas de fondos, datos o ganancias, ni por daños indirectos, que resulten del uso o la imposibilidad de usar Stellar Snap, de errores del software, de servicios de terceros o de transacciones que hayas firmado.',
        ],
      },
      {
        heading: 'Cambios y contacto',
        blocks: [
          'Podemos actualizar estos términos; la fecha de arriba indica la última versión. Seguir usando Stellar Snap después de un cambio implica aceptarlo.',
          `Para consultas, escríbenos por los canales de contacto de [cosmospay.lat](${COSMOS_URL}) o abre un issue en el [repositorio](${REPO_URL}). Tus datos se tratan según la [política de privacidad](/privacy/).`,
        ],
      },
    ],
  },
  en: {
    title: 'Terms of service',
    intro: [
      'These terms govern the use of Stellar Snap: the MetaMask Snap, this site and the dApp adapter. By installing the snap, using this site or integrating the adapter, you accept them. If you disagree, do not use them.',
    ],
    sections: [
      {
        heading: 'What Stellar Snap is',
        blocks: [
          "It is open-source software that adds Stellar accounts to MetaMask: the snap for testnet and futurenet, and a SEP-43 adapter for dApps. On mainnet, the adapter uses MetaMask's built-in Stellar features, which are governed by MetaMask's terms.",
          '*Stellar Snap is not affiliated with, sponsored or endorsed by MetaMask, Consensys or the Stellar Development Foundation.* Their names and logos belong to their owners.',
        ],
      },
      {
        heading: 'We do not hold your funds',
        blocks: [
          'We do not keep your funds or your keys, and cannot recover an account, reverse a transaction or access your assets. You are responsible for your recovery phrase, your keys and for reviewing every transaction before you sign it. Stellar transactions are irreversible.',
        ],
      },
      {
        heading: 'Test networks',
        blocks: ['Testnet and futurenet funds have no value, and those networks can be reset at any time.'],
      },
      {
        heading: 'Swaps',
        blocks: [
          `Swaps are quoted and built by the [Cosmos Pay](${COSMOS_URL}) community server and include a platform fee shown in the quote before you confirm. The price may change until the swap executes; before asking for your signature, the snap checks that the transaction honours the minimum amount to receive. Swaps may be unavailable on some networks or at some times.`,
        ],
      },
      {
        heading: 'Third-party services',
        blocks: [
          'Stellar Snap relies on third-party services: the Stellar network servers, Friendbot, the Cosmos Pay API and the price and icon providers. We do not control their availability, accuracy or terms.',
        ],
      },
      {
        heading: 'Acceptable use',
        blocks: [
          'Do not use Stellar Snap for illegal activity, to evade sanctions, or to harm other people or the services it relies on.',
        ],
      },
      {
        heading: 'License',
        blocks: [
          `The code is distributed under the MIT license in the [public repository](${REPO_URL}); that license governs its use, copying and modification. Trademarks and logos are not covered by it.`,
        ],
      },
      {
        heading: 'No warranty',
        blocks: [
          'Stellar Snap is provided "as is" and "as available", without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose and non-infringement.',
        ],
      },
      {
        heading: 'Limitation of liability',
        blocks: [
          'To the fullest extent permitted by law, neither Cosmos Pay nor Cosmos will be liable for any loss of funds, data or profits, or for indirect damages, arising from the use of or inability to use Stellar Snap, from software errors, from third-party services or from transactions you signed.',
        ],
      },
      {
        heading: 'Changes and contact',
        blocks: [
          'We may update these terms; the date above shows the latest version. Continuing to use Stellar Snap after a change means you accept it.',
          `For questions, reach us through the contact channels at [cosmospay.lat](${COSMOS_URL}) or open an issue in the [repository](${REPO_URL}). Your data is handled as described in the [privacy policy](/privacy/).`,
        ],
      },
    ],
  },
};
