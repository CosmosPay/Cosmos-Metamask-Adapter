import { StrictMode } from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { App } from '@/App';
import { LANGUAGES } from '@/i18n';
import { locate, pathFor, ROUTES, type Route, ServerLocation } from '@/lib/router';
import { pageHead } from '@/seo/head';
import { HeadTags } from '@/seo/HeadTags';

/**
 * The prerender's entry (scripts/prerender.mts builds it for Node): every
 * page as static HTML, so search engines, AI crawlers, link previews and
 * readers without JavaScript get the full page; the browser then hydrates it.
 */

export { SITE_URL, SITE_URL_IS_FALLBACK } from '@/config';
export { llmsFullTxt, llmsTxt, robotsTxt, sitemapXml } from '@/seo/files';

/** Each route in each language, and the 404 page static hosts serve for unknown paths. */
export const PAGES: { path: string; file: string }[] = [
  ...LANGUAGES.flatMap((language) =>
    (Object.keys(ROUTES) as Route[]).map((route) => {
      const path = pathFor(route, language);
      return { path, file: `${path.slice(1)}index.html` };
    }),
  ),
  { path: '/404.html', file: '404.html' },
];

/** A page's body markup, head tags and `lang`, as prerendered at `path`. */
export function render(path: string): { html: string; head: string; lang: string } {
  const head = pageHead(locate(path));
  const html = renderToString(
    <StrictMode>
      <ServerLocation path={path}>
        <App />
      </ServerLocation>
    </StrictMode>,
  );
  return { html, head: renderToStaticMarkup(<HeadTags head={head} />), lang: head.lang };
}
