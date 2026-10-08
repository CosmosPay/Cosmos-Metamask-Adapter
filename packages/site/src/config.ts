/** Cosmos Pay: a sponsor, and the company behind Stellar Snap. */
export const COSMOS_URL = 'https://cosmospay.lat';

/** Where to get Cosmos Wallet (its downloads section on cosmospay.lat), not the web wallet itself. */
export const COSMOS_WALLET_URL = 'https://cosmospay.lat/#wallet';

/** Cosmos App, the Cosmos marketplace. */
export const COSMOS_APP_URL = 'https://cosmosapp.lat';

/** Where people write to Cosmos about Stellar Snap (contact page, privacy and terms). */
export const CONTACT_EMAIL = 'contact@cosmospay.lat';

/** Cosmos on social media, as its own materials list it. */
export const COSMOS_X_URL = 'https://x.com/CosmosPay';
export const COSMOS_INSTAGRAM_URL = 'https://www.instagram.com/cosmospay.lat/';
export const COSMOS_GITHUB_URL = 'https://github.com/CosmosPay';

/** The public repository with the snap, the adapter and this site. */
export const REPO_URL = 'https://github.com/CosmosPay/Cosmos-Metamask-Adapter';

/** SaltaDev, the Salta developer community: a sponsor. */
export const SALTA_DEV_URL = 'https://salta.dev';

/**
 * Where this site is published, without a trailing slash: canonical URLs, the
 * sitemap, robots.txt and link previews are absolute. Set `VITE_SITE_URL` when
 * building for another domain.
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://stellarsnap.cosmospay.lat').replace(/\/+$/u, '');

/** No origin was given or announced by the host (see vite.config.ts): the prerender warns, as every absolute URL would use the fallback. */
export const SITE_URL_IS_FALLBACK = !import.meta.env.VITE_SITE_URL;

/** Cosmos's X handle, for the `twitter:site` card tag. */
export const COSMOS_X_HANDLE = '@CosmosPay';

/** Snap the demo installs; override with `VITE_SNAP_ID`. */
export const SNAP_ID = import.meta.env.VITE_SNAP_ID ?? 'local:http://localhost:8080';
