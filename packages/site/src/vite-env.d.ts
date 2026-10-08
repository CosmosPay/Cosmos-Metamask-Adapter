/// <reference types="vite/client" />

/** Build-time settings; packages/site/.env.example documents each one. */
interface ImportMetaEnv {
  /** Snap to install, e.g. `npm:@cosmosapp/stellar-snap`. Defaults to the local dev server in dev, the npm package in a build. */
  readonly VITE_SNAP_ID?: string;
  /** Public origin of the site, e.g. `https://snap.cosmospay.lat`. See `SITE_URL` in config.ts. */
  readonly VITE_SITE_URL?: string;
  /** Stellar account (G…) on the public network that receives donations. */
  readonly VITE_DONATION_ADDRESS?: string;
  /** Page with other ways to donate (GitHub Sponsors, Open Collective…). */
  readonly VITE_DONATION_URL?: string;
  /** Google Analytics 4 measurement ID (`G-…`); loads only with the visitor's consent. */
  readonly VITE_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
