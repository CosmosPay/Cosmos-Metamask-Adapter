import {
  COSMOS_APP_URL,
  COSMOS_GITHUB_URL,
  COSMOS_INSTAGRAM_URL,
  COSMOS_URL,
  COSMOS_WALLET_URL,
  COSMOS_X_URL,
  CONTACT_EMAIL,
  REPO_URL,
} from '@/config';
import type { DocSet } from '@/content/types';

/** Contact: the email, where to report problems, Cosmos's social accounts and products, and privacy questions. */
export const contact: DocSet = {
  es: {
    title: 'Contacto',
    description:
      'Cómo contactar a Stellar Snap y a Cosmos: correo, soporte y reporte de errores en GitHub, y redes sociales.',
    intro: ['¿Preguntas, ideas o algo que no funciona? Estos son los canales de Stellar Snap y de Cosmos.'],
    sections: [
      {
        heading: 'Correo',
        blocks: [`Para cualquier consulta, escríbenos a [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}).`],
      },
      {
        heading: 'Soporte y errores',
        blocks: [
          `Si encontraste un error o quieres proponer una mejora, abre un issue en el [repositorio de GitHub](${REPO_URL}/issues). Es la forma más rápida de que lo veamos y de seguir cómo avanza.`,
          `Si se trata de una vulnerabilidad de seguridad, no la publiques en un issue: escríbenos a [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}).`,
        ],
      },
      {
        heading: 'Redes de Cosmos',
        blocks: [
          [
            `X: [@CosmosPay](${COSMOS_X_URL})`,
            `Instagram: [@cosmospay.lat](${COSMOS_INSTAGRAM_URL})`,
            `GitHub: [CosmosPay](${COSMOS_GITHUB_URL})`,
          ],
        ],
      },
      {
        heading: 'Productos de Cosmos',
        blocks: [
          [
            `[Cosmos Wallet](${COSMOS_WALLET_URL}): la wallet de Cosmos, para web, extensión, Android y escritorio.`,
            `[Cosmos App](${COSMOS_APP_URL}): el marketplace de Cosmos.`,
            `[Cosmos Pay](${COSMOS_URL}): pagos en Stellar para desarrolladores.`,
          ],
        ],
      },
      {
        heading: 'Privacidad',
        blocks: [
          `Para consultas sobre tus datos, revisa la [política de privacidad](/privacy/) y escríbenos a [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}).`,
        ],
      },
    ],
  },
  en: {
    title: 'Contact',
    description: 'How to reach Stellar Snap and Cosmos: email, support and bug reports on GitHub, and social media.',
    intro: ['Questions, ideas or something not working? These are the Stellar Snap and Cosmos channels.'],
    sections: [
      {
        heading: 'Email',
        blocks: [`For anything at all, write to us at [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}).`],
      },
      {
        heading: 'Support and bugs',
        blocks: [
          `If you found a bug or want to suggest an improvement, open an issue in the [GitHub repository](${REPO_URL}/issues). It's the fastest way for us to see it and for you to follow its progress.`,
          `If it's a security vulnerability, don't post it in an issue: write to us at [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}).`,
        ],
      },
      {
        heading: 'Cosmos on social media',
        blocks: [
          [
            `X: [@CosmosPay](${COSMOS_X_URL})`,
            `Instagram: [@cosmospay.lat](${COSMOS_INSTAGRAM_URL})`,
            `GitHub: [CosmosPay](${COSMOS_GITHUB_URL})`,
          ],
        ],
      },
      {
        heading: 'Cosmos products',
        blocks: [
          [
            `[Cosmos Wallet](${COSMOS_WALLET_URL}): Cosmos's wallet, for the web, as an extension, on Android and on desktop.`,
            `[Cosmos App](${COSMOS_APP_URL}): the Cosmos marketplace.`,
            `[Cosmos Pay](${COSMOS_URL}): Stellar payments for developers.`,
          ],
        ],
      },
      {
        heading: 'Privacy',
        blocks: [
          `For questions about your data, read the [privacy policy](/privacy/) and write to us at [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}).`,
        ],
      },
    ],
  },
};
