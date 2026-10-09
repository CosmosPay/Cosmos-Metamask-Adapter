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
export const REPO_URL = 'https://github.com/CosmosPay/Stellar-Snap';

/** SaltaDev, the Salta developer community: a sponsor. */
export const SALTA_DEV_URL = 'https://salta.dev';

/**
 * Where this site is published, without a trailing slash: canonical URLs, the
 * sitemap, robots.txt and link previews are absolute. Set `VITE_SITE_URL` when
 * building for another domain.
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://snap.cosmospay.lat').replace(/\/+$/u, '');

/** No origin was given or announced by the host (see vite.config.ts): the prerender warns, as every absolute URL would use the fallback. */
export const SITE_URL_IS_FALLBACK = !import.meta.env.VITE_SITE_URL;

/** Cosmos's X handle, for the `twitter:site` card tag. */
export const COSMOS_X_HANDLE = '@CosmosPay';

/** The snap's npm package, which a published site installs. */
export const SNAP_PACKAGE = '@cosmosapp/stellar-snap';

/** Snap the site installs: `VITE_SNAP_ID` when set, else the local dev server while developing and the npm package in a build. */
export const SNAP_ID =
  import.meta.env.VITE_SNAP_ID || (import.meta.env.DEV ? 'local:http://localhost:8080' : `npm:${SNAP_PACKAGE}`);

/** A Stellar account ID: G and 55 more base32 characters. */
const STELLAR_ACCOUNT = /^G[A-Z2-7]{55}$/u;

/**
 * Donations: a Stellar account on the public network (`VITE_DONATION_ADDRESS`)
 * and/or a page for other ways to give (`VITE_DONATION_URL`). The home page's
 * donations section shows what's set, and hides when neither is.
 */
const donationAddress = (import.meta.env.VITE_DONATION_ADDRESS ?? '').trim();
export const DONATION_ADDRESS = STELLAR_ACCOUNT.test(donationAddress) ? donationAddress : null;
export const DONATION_URL = (import.meta.env.VITE_DONATION_URL ?? '').trim() || null;

/**
 * Google Analytics 4 (`VITE_GA_MEASUREMENT_ID`, `G-…`). It only loads after
 * the visitor accepts it (AnalyticsConsent); unset, the site has no analytics
 * and the privacy policy says so.
 */
const gaId = (import.meta.env.VITE_GA_MEASUREMENT_ID ?? '').trim();
export const GA_MEASUREMENT_ID = /^G-[A-Z0-9]+$/u.test(gaId) ? gaId : null;
