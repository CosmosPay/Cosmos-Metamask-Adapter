/**
 * The hero previews the snap's home page with the snap's own SVG art and
 * strings (Vite resolves `@snap/…` to `packages/snap`). TypeScript gets these
 * declarations instead of the sources, which only compile with the snap's own
 * `@/` alias and Node types. Keep them in sync with `ui/graphics/icons.ts`.
 */
declare module '@snap/src/ui/graphics/icons' {
  export type ActionIcon = 'fund' | 'send' | 'receive' | 'assets' | 'swap' | 'sign';
  export function identicon(address: string, size?: number): string;
  export function actionTile(icon: ActionIcon, label: string, disabled?: boolean, width?: number): string;
  export function fundIllustration(): string;
  export function assetIcon(code: string): string;
  export function textLabel(text: string, options?: { size?: number; weight?: number; chevron?: boolean }): string;
  export function networkPill(label: string): string;
  export function tokenInfo(title: string, who: string, change: { text: string; tone: 'up' | 'down' | 'flat' }): string;
  export function pillButton(label: string, kind?: 'primary' | 'secondary' | 'danger'): string;
}

declare module '@snap/locales/*.json' {
  const locale: { locale: string; messages: Record<string, { message: string }> };
  export default locale;
}

declare module '@snap/src/domain/amounts' {
  /** `10000.5` → `10,000.5` (trailing zeros trimmed). */
  export function formatAmount(amount: string): string;
}

declare module '@snap/src/config/networks' {
  export type StellarNetwork = 'mainnet' | 'testnet' | 'futurenet';
  export const NETWORKS: Record<StellarNetwork, { id: StellarNetwork; name: string; friendbotUrl: string | null }>;
}

declare module '@snap/snap.manifest.json' {
  const manifest: { proposedName: string };
  export default manifest;
}

declare module '@snap/src/ui/graphics/qr' {
  /** Rounded-dot QR (dark on a white card) as SVG markup, `displaySize` px wide. */
  export function qrSvg(text: string, displaySize?: number): string;
}
