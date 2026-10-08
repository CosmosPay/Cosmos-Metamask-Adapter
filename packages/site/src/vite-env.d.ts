/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Snap to install, e.g. `npm:@cosmospay/stellar-snap`. Defaults to the local dev server. */
  readonly VITE_SNAP_ID?: string;
  /** Public origin of the site, e.g. `https://stellarsnap.cosmospay.lat`. See `SITE_URL` in config.ts. */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
