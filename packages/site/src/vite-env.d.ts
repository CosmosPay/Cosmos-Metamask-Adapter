/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Snap to install, e.g. `npm:@cosmospay/stellar-snap`. Defaults to the local dev server. */
  readonly VITE_SNAP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
