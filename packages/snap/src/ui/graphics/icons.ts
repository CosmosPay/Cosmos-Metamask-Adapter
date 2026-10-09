/**
 * SVG artwork that mimics MetaMask's wallet overview. Snaps can't style
 * buttons, so tiles and pills are drawn as images inside the buttons.
 *
 * Colors follow the light/dark color scheme through a media query inside the
 * SVG (MetaMask renders snap images as <img>, which honors it).
 */

import { STELLAR_BLACK, STELLAR_MARK_PATH, STELLAR_MARK_VIEWBOX } from '@/ui/graphics/stellarMark';

export type ActionIcon = 'fund' | 'send' | 'receive' | 'assets' | 'swap' | 'sign';

const escapeXml = (text: string) => text.replace(/[&<>"']/gu, (char) => `&#${char.charCodeAt(0)};`);

/** Cuts `text` to `max` characters (code points, so emoji aren't split), ending in "…". */
const clip = (text: string, max: number) => {
  const chars = Array.from(text);
  return chars.length > max ? `${chars.slice(0, max - 1).join('')}…` : text;
};

const FONT = `font-family="ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif"`;

/** Light values first; the dark scheme matches MetaMask's #18181b surfaces. */
const THEME = `<style>
.surface{fill:#f2f2f3}.ink{fill:#121314}.stroke{stroke:#121314}
.off .ink{fill:#9b9ba1}.off .stroke{stroke:#9b9ba1}
@media (prefers-color-scheme:dark){
.surface{fill:#18181b}.ink{fill:#ffffff}.stroke{stroke:#ffffff}
.off .ink{fill:#6b6b70}.off .stroke{stroke:#6b6b70}}
</style>`;

const GLYPHS: Record<ActionIcon, string> = {
  fund: '<path d="M0 -6v12M-6 0h12"/>',
  send: '<path d="M-5 5 5 -5M-2.5 -5H5v7.5"/>',
  receive: '<path d="M5 -5 -5 5M-5 -2.5V5h7.5"/>',
  swap: '<path d="M-4.5 6V-6M-4.5 -6l-3 3M-4.5 -6l3 3M4.5 -6V6M4.5 6l-3-3M4.5 6l3-3"/>',
  assets: '<circle cx="-2" cy="-1.5" r="4.5"/><path d="M2.6 -4.6A4.5 4.5 0 1 1 1 4.9"/>',
  sign: '<path d="M3.5 -6.5l3 3L-2 5H-5V2z"/><path d="M-6 7.5h12"/>',
};

/**
 * Deterministic account avatar (jazzicon-style rotated shapes on a colored
 * disc), drawn so the whole account row can be one clickable image.
 *
 * @param address - Stellar address (the seed).
 * @param size - Rendered size in px.
 * @returns SVG markup.
 */
export function identicon(address: string, size = 40): string {
  let seed = 0;
  for (const char of address) {
    seed = (Math.imul(seed, 31) + char.charCodeAt(0)) >>> 0;
  }
  const next = () => {
    seed = (Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9) >>> 0;
    return seed / 4294967296;
  };
  const palette = [
    '#01888C',
    '#FC7500',
    '#034F5D',
    '#F73F01',
    '#FC1960',
    '#C7144C',
    '#F3C100',
    '#1598F2',
    '#2465E1',
    '#F19E02',
  ];
  const pick = () => palette[Math.floor(next() * palette.length)] as string;
  const background = pick();
  const shapes = [0, 1, 2]
    .map(() => {
      const angle = Math.round(next() * 360);
      const x = Math.round((next() - 0.5) * 20);
      const y = Math.round((next() - 0.5) * 20);
      return `<rect x="${x}" y="${y}" width="40" height="40" fill="${pick()}" transform="rotate(${angle} 20 20)"/>`;
    })
    .join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">` +
    `<defs><clipPath id="c"><circle cx="20" cy="20" r="20"/></clipPath></defs>` +
    `<g clip-path="url(#c)"><rect width="40" height="40" fill="${background}"/>${shapes}</g></svg>`
  );
}

/**
 * Official Stellar monogram scaled into a box.
 *
 * @param size - Box size.
 * @param fill - Mark color.
 * @param padding - Inner padding.
 * @returns SVG path element.
 */
function stellarMark(size: number, fill: string, padding: number): string {
  const scale = (size - padding * 2) / STELLAR_MARK_VIEWBOX.width;
  const offsetY = (size - STELLAR_MARK_VIEWBOX.height * scale) / 2;
  return `<path fill="${fill}" transform="translate(${padding} ${offsetY.toFixed(2)}) scale(${scale.toFixed(4)})" d="${STELLAR_MARK_PATH}"/>`;
}

/**
 * Rounded action tile (icon on top, label below) like MetaMask's
 * Buy / Swap / Send / Receive buttons.
 *
 * @param icon - Which action.
 * @param label - Localized label.
 * @param disabled - Muted variant.
 * @returns SVG markup.
 */
export function actionTile(icon: ActionIcon, label: string, disabled = false, width = 104): string {
  const mid = width / 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="72" viewBox="0 0 ${width} 72">${THEME}` +
    `<g class="${disabled ? 'off' : ''}">` +
    `<rect class="surface" width="${width}" height="72" rx="12"/>` +
    `<g class="stroke" transform="translate(${mid} 25)" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${GLYPHS[icon]}</g>` +
    `<text class="ink" x="${mid}" y="54" text-anchor="middle" font-size="14" font-weight="600" ${FONT}>${escapeXml(label)}</text>` +
    `</g></svg>`
  );
}

/**
 * Hero illustration for the "fund your wallet" card.
 *
 * @returns SVG markup.
 */
export function fundIllustration(): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="72" viewBox="0 0 96 72">` +
    `<defs><linearGradient id="c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#f5b83d"/></linearGradient></defs>` +
    `<ellipse cx="48" cy="66" rx="34" ry="4" fill="#000" opacity=".12"/>` +
    `<circle cx="40" cy="34" r="26" fill="${STELLAR_BLACK}"/>` +
    `<g transform="translate(14 8)">${stellarMark(52, '#FFFFFF', 11)}</g>` +
    `<circle cx="70" cy="46" r="14" fill="url(#c)"/>` +
    `<path d="M70 40v12M64 46h12" stroke="#7a4b00" stroke-width="2.6" stroke-linecap="round"/>` +
    `</svg>`
  );
}

/**
 * Token avatar. XLM gets the Stellar mark; other assets their initials.
 *
 * @param code - Asset code.
 * @returns SVG markup.
 */
export function assetIcon(code: string): string {
  let content: string;
  if (code === 'XLM') {
    // Thin ring keeps the black disc visible on MetaMask's black dark theme.
    content =
      `<circle cx="20" cy="20" r="19.5" fill="${STELLAR_BLACK}" stroke="#3a3a40" stroke-width="1"/>` +
      stellarMark(40, '#FFFFFF', 9);
  } else {
    const symbol = KNOWN_SYMBOLS[code] ?? code.slice(0, 2);
    const color = KNOWN_COLORS[code] ?? '#4459ff';
    const size = symbol.length > 1 ? 13 : 18;
    content =
      `<circle cx="20" cy="20" r="20" fill="${color}"/>` +
      `<text x="20" y="${symbol.length > 1 ? 24.5 : 26.5}" text-anchor="middle" font-size="${size}" font-weight="700" fill="#fff" ${FONT}>${escapeXml(symbol)}</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">${content}</svg>`;
}

/** Circle's stablecoins get their currency sign and brand blue. */
const KNOWN_SYMBOLS: Record<string, string> = { USDC: '$', EURC: '€' };
const KNOWN_COLORS: Record<string, string> = {
  USDC: '#2775CA',
  EURC: '#2775CA',
};

/**
 * Activity avatar: arrow out (sent) or in (received).
 *
 * @param direction - Payment direction.
 * @returns SVG markup.
 */
export function activityIcon(direction: 'in' | 'out' | 'swap'): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">${THEME}` +
    `<circle class="surface" cx="20" cy="20" r="20"/>` +
    `<g class="stroke" transform="translate(20 20)" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">` +
    `${GLYPHS[direction === 'out' ? 'send' : direction === 'swap' ? 'swap' : 'receive']}</g></svg>`
  );
}

/** Rough text width for the system UI font (SVG can't measure text). */
const textWidth = (text: string, size: number, weight: number) =>
  Math.ceil(Array.from(text).length * size * (weight >= 600 ? 0.57 : 0.53));

/**
 * Plain bold text (optionally with a chevron) that follows the theme, for
 * buttons that must not look like links — e.g. "Account 1 ⌄" in the header.
 *
 * @param text - Label.
 * @param options - Font size, weight and chevron.
 * @param options.size - Font size in px.
 * @param options.weight - Font weight.
 * @param options.chevron - Draws a ⌄ after the text.
 * @returns SVG markup.
 */
export function textLabel(
  text: string,
  { size = 16, weight = 700, chevron = false }: { size?: number; weight?: number; chevron?: boolean } = {},
): string {
  const width = textWidth(text, size, weight);
  const height = Math.round(size * 1.5);
  const total = width + (chevron ? size + 4 : 0);
  const baseline = Math.round(size * 1.1);
  const chevronPath = chevron
    ? `<path class="stroke" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M${width + 5} ${baseline - size * 0.45}l${size * 0.3} ${size * 0.3} ${size * 0.3} ${-size * 0.3}"/>`
    : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${height}" viewBox="0 0 ${total} ${height}">${THEME}` +
    `<text class="ink" x="0" y="${baseline}" font-size="${size}" font-weight="${weight}" ${FONT}>${escapeXml(text)}</text>` +
    `${chevronPath}</svg>`
  );
}

/**
 * Outlined filter pill like MetaMask's "Network: Ethereum".
 *
 * @param label - Localized label.
 * @returns SVG markup.
 */
export function networkPill(label: string): string {
  const width = textWidth(label, 14, 600) + 46;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="34" viewBox="0 0 ${width} 34">` +
    `<style>.b{fill:none;stroke:#d6d9dc}.a{stroke:#4459ff}.l{fill:#4459ff}@media (prefers-color-scheme:dark){.b{stroke:#3a3a40}.a{stroke:#8b99ff}.l{fill:#8b99ff}}</style>` +
    `<rect class="b" x="0.5" y="0.5" width="${width - 1}" height="33" rx="8"/>` +
    `<path class="a" fill="none" stroke-width="1.6" stroke-linecap="round" d="M12 12h12M14.5 17h7M17 22h2"/>` +
    `<text class="l" x="32" y="22" font-size="14" font-weight="600" ${FONT}>${escapeXml(label)}</text>` +
    `</svg>`
  );
}

/** SVG markup as a data URL, to nest it inside another SVG's <image>. */
export const svgDataUrl = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;

/**
 * Token avatar with a small badge in the bottom-right corner, like MetaMask's
 * network badge: the token's official logo plus its issuer's logo (Circle,
 * Stellar, …). Images are data URLs (PNG/SVG) nested in the SVG, which is how
 * snaps can show raster logos.
 *
 * @param main - Data URL of the token logo.
 * @param badge - Data URL of the issuer/network logo, if any.
 * @param size - Avatar size in px.
 * @returns SVG markup.
 */
export function tokenAvatar(
  main: string,
  badge: string | null,
  size = 40,
  { knockoutMain = false }: { knockoutMain?: boolean } = {},
): string {
  // MetaMask crops token images to a circle, so everything must fit inside the
  // inscribed circle: a slightly smaller logo, and a badge that straddles its
  // edge (like MetaMask's network badge) while staying within the crop.
  const c = size / 2;
  const mainR = badge ? size * 0.4 : c;
  const mainC = badge ? c - size * 0.04 : c;
  const badgeR = size * 0.17;
  const badgeC = c + (c - badgeR - size * 0.02) / Math.SQRT2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<style>.disc{fill:#ffffff}@media (prefers-color-scheme:dark){.disc{fill:#000000}}</style>` +
    `<defs>${KNOCKOUT_WHITE}<clipPath id="m"><circle cx="${mainC}" cy="${mainC}" r="${mainR}"/></clipPath>` +
    `<clipPath id="b"><circle cx="${badgeC}" cy="${badgeC}" r="${badgeR}"/></clipPath></defs>` +
    `<image href="${main}" x="${mainC - mainR}" y="${mainC - mainR}" width="${mainR * 2}" height="${mainR * 2}" clip-path="url(#m)" preserveAspectRatio="xMidYMid meet"${knockoutMain ? ' filter="url(#k)"' : ''}/>` +
    (badge
      ? `<circle class="disc" cx="${badgeC}" cy="${badgeC}" r="${badgeR}"/>` +
        `<image href="${badge}" x="${badgeC - badgeR + 1}" y="${badgeC - badgeR + 1}" width="${badgeR * 2 - 2}" height="${badgeR * 2 - 2}" clip-path="url(#b)" preserveAspectRatio="xMidYMid meet" filter="url(#k)"/>`
      : '') +
    `</svg>`
  );
}

/**
 * Turns near-white pixels transparent. Company logos come as favicons painted
 * on an opaque white square; without this they show up as white discs.
 * alpha' = 2.85 - (r + g + b): white (3) → 0, any real color stays opaque.
 */
const KNOCKOUT_WHITE =
  '<filter id="k" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 -1 -1 -1 0 2.85"/>' +
  '<feComposite in2="SourceGraphic" operator="in"/></filter>';

/**
 * Name + "change | issuer" as one compact block (snap text rows add a large
 * gap between lines). Colors follow MetaMask's success/error/muted tokens.
 *
 * @param title - Asset name.
 * @param who - Issuer label.
 * @param change - 24h change.
 * @param change.text - Formatted percentage.
 * @param change.tone - Green (up), red (down) or muted (flat / no data).
 * @returns SVG markup.
 */
export function tokenInfo(title: string, who: string, change: { text: string; tone: 'up' | 'down' | 'flat' }): string {
  const width = 210;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="40" viewBox="0 0 ${width} 40">` +
    `<style>.t{fill:#121314}.m{fill:#686e7d}.up{fill:#1c7c34}.down{fill:#d73847}` +
    `@media (prefers-color-scheme:dark){.t{fill:#ffffff}.m{fill:#9b9ba1}.up{fill:#3ec27a}.down{fill:#ff7584}}</style>` +
    `<text class="t" x="0" y="16" font-size="15" font-weight="700" ${FONT}>${escapeXml(clip(title, 22))}</text>` +
    `<text x="0" y="35" font-size="13" ${FONT}>` +
    `<tspan class="${change.tone === 'flat' ? 'm' : change.tone}">${escapeXml(change.text)}</tspan>` +
    `<tspan class="m"> · ${escapeXml(clip(who, 18))}</tspan></text>` +
    `</svg>`
  );
}

/** Stellar logo as a data URL (for XLM avatars and network badges). */
export const stellarLogoDataUrl = () => svgDataUrl(assetIcon('XLM'));

/**
 * Small square action button (+ or ✓) used in picker rows.
 *
 * @param kind - `add` or `added`.
 * @returns SVG markup.
 */
export function rowAction(kind: 'add' | 'added'): string {
  const glyph = kind === 'add' ? '<path d="M16 10v12M10 16h12"/>' : '<path d="M10.5 16.5l3.5 3.5 7.5-7.5"/>';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${THEME}` +
    `<rect class="surface" width="32" height="32" rx="8"/>` +
    `<g class="stroke" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>` +
    `</svg>`
  );
}

/**
 * Full-width button art. MetaMask caps snap images at `max-width: 100%`, so
 * drawing it large makes it scale down to exactly the available width — native
 * footer buttons would do that too, but MetaMask stamps the snap logo on them.
 *
 * @param label - Localized label.
 * @param kind - `primary` (filled), `secondary` (muted) or `danger`.
 * @returns SVG markup.
 */
export function pillButton(label: string, kind: 'primary' | 'secondary' | 'danger' = 'primary'): string {
  const styles = {
    primary: '.p{fill:#121314}.l{fill:#ffffff}@media (prefers-color-scheme:dark){.p{fill:#ffffff}.l{fill:#121314}}',
    secondary: '.p{fill:#f2f2f3}.l{fill:#121314}@media (prefers-color-scheme:dark){.p{fill:#18181b}.l{fill:#ffffff}}',
    danger: '.p{fill:#d73847}.l{fill:#ffffff}@media (prefers-color-scheme:dark){.p{fill:#ff7584}.l{fill:#121314}}',
  };
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="116" viewBox="0 0 1000 116">` +
    `<style>${styles[kind]}</style>` +
    `<rect class="p" width="1000" height="116" rx="32"/>` +
    `<text class="l" x="500" y="72" text-anchor="middle" font-size="38" font-weight="600" ${FONT}>${escapeXml(label)}</text>` +
    `</svg>`
  );
}

/**
 * Vertical gap (snaps have no spacing primitive).
 *
 * @param height - Gap in px.
 * @returns SVG markup.
 */
export const spacer = (height: number) => {
  // Drawn as wide as the pills: MetaMask stretches images to the full width,
  // so a 1px-wide spacer would scale to thousands of px tall. 1000 units map
  // to the ~336px content width, hence the × 3.
  const units = Math.round((height * 1000) / 336);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="${units}" viewBox="0 0 1000 ${units}"></svg>`;
};

/**
 * Full-width row (avatar, name, subtitle, optional right text and chevron or
 * check) drawn large so it scales to the available width — used for the asset
 * field and the asset picker list, which scroll as a normal page instead of a
 * centered modal.
 *
 * @param options - Row content.
 * @param options.avatar - Avatar SVG markup.
 * @param options.title - Main text.
 * @param options.subtitle - Muted second line.
 * @param options.right - Right-aligned text (e.g. a balance).
 * @param options.trailing - `chevron`, `check` or nothing.
 * @param options.surface - Draws the rounded field background.
 * @returns SVG markup.
 */
export function wideRow({
  avatar,
  title,
  subtitle,
  right,
  trailing,
  surface,
  displayWidth = 1000,
}: {
  avatar: string;
  title: string;
  subtitle: string;
  right?: string | undefined;
  trailing?: 'chevron' | 'check' | undefined;
  surface?: boolean | undefined;
  /**
   * Intrinsic width. Full-width rows use 1000 (scaled down by max-width).
   * A row sharing a flex line with another image needs its real size, or
   * flex shrinking squeezes that image to nothing; a native Icon neighbour
   * keeps its size, so the default works there.
   */
  displayWidth?: number;
}): string {
  const rightEdge = trailing ? 900 : 970;
  const glyph =
    trailing === 'chevron'
      ? '<path class="stroke" fill="none" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" d="M935 63l20 20 20-20"/>'
      : trailing === 'check'
        ? '<path class="stroke" fill="none" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" d="M928 76l16 16 32-32"/>'
        : '';
  const avatarUrl = svgDataUrl(avatar);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${displayWidth}" height="${Math.round(displayWidth * 0.15)}" viewBox="0 0 1000 150">${THEME}` +
    (surface ? `<rect class="surface" width="1000" height="150" rx="36"/>` : '') +
    `<image href="${avatarUrl}" x="30" y="25" width="100" height="100"/>` +
    `<text class="ink" x="160" y="68" font-size="40" font-weight="700" ${FONT}>${escapeXml(clip(title, 24))}</text>` +
    `<text class="ink" x="160" y="114" font-size="32" opacity="0.6" ${FONT}>${escapeXml(clip(subtitle, 30))}</text>` +
    (right
      ? `<text class="ink" x="${rightEdge}" y="90" text-anchor="end" font-size="36" font-weight="600" ${FONT}>${escapeXml(right)}</text>`
      : '') +
    glyph +
    `</svg>`
  );
}
