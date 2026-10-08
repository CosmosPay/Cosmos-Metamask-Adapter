import {
  CONTACT_EMAIL,
  COSMOS_GITHUB_URL,
  COSMOS_INSTAGRAM_URL,
  COSMOS_URL,
  COSMOS_X_HANDLE,
  COSMOS_X_URL,
  REPO_URL,
  SITE_URL,
} from '@/config';
import { type DocRoute, docLanguage, DOCUMENTS } from '@/content';
import { FAQ, FAQ_VALUES, FEATURES } from '@/content/home';
import { LANGUAGE_TAGS, LANGUAGES, type Language, OG_LOCALES, translate } from '@/i18n';
import { plainText } from '@/lib/markup';
import { type Location, pathFor, type Route } from '@/lib/router';

/**
 * A `<meta>`, `<link>` or `<script>` for the document head, as plain data:
 * the prerender renders it with React (`HeadTags`) and the browser re-applies
 * it after each client-side navigation (`useDocumentHead`). Attribute names
 * are React's (`hrefLang`); HTML reads them case-insensitively.
 */
export type HeadTag = { tag: 'meta' | 'link' | 'script'; attrs: Record<string, string>; text?: string };

export type PageHead = { title: string; lang: string; tags: HeadTag[] };

const SITE_NAME = 'Stellar Snap';

const absolute = (path: string) => `${SITE_URL}${path}`;

/** The languages a page is written in: all of them for home, Spanish and English for the documents. */
export function pageLanguages(route: Route): readonly Language[] {
  return route === 'home' ? LANGUAGES : ['es', 'en'];
}

/** The language of a page's text: its own, or English for a document in a language it isn't written in. */
const contentLanguage = (route: Route, language: Language): Language =>
  pageLanguages(route).includes(language) ? language : 'en';

/** The canonical URL. A document opened in, say, French shows the English text, so that's its canonical page. */
export const canonicalUrl = (route: Route, language: Language) =>
  absolute(pathFor(route, contentLanguage(route, language)));

/** Every written version of a page, plus x-default: English, for readers of any other language. */
export function alternates(route: Route): { hrefLang: string; href: string }[] {
  return [
    ...pageLanguages(route).map((language) => ({
      hrefLang: LANGUAGE_TAGS[language],
      href: absolute(pathFor(route, language)),
    })),
    { hrefLang: 'x-default', href: absolute(pathFor(route, 'en')) },
  ];
}

/**
 * The social card: 1200×630, the wordmark over each language's hero title
 * (public/og/*.png, drawn from the brand SVGs; redraw them if the title changes).
 */
const ogImage = (language: Language) => absolute(`/og/${language}.png`);

const ROBOTS_INDEX = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

const ORGANIZATION_ID = `${COSMOS_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#app`;
const MIT_LICENSE = 'https://opensource.org/license/mit';

/** What every page says about who makes the site and what it's for (schema.org, JSON-LD). */
function sharedGraph(language: Language): object[] {
  const t = (key: Parameters<typeof translate>[1]) => plainText(translate(language, key));
  return [
    {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: 'Cosmos',
      alternateName: 'Cosmos Pay',
      url: COSMOS_URL,
      email: CONTACT_EMAIL,
      logo: { '@type': 'ImageObject', url: absolute('/icons/icon-512.png'), width: 512, height: 512 },
      sameAs: [COSMOS_X_URL, COSMOS_INSTAGRAM_URL, COSMOS_GITHUB_URL],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: CONTACT_EMAIL,
        availableLanguage: ['es', 'en'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: absolute('/'),
      name: SITE_NAME,
      description: t('meta.description'),
      inLanguage: LANGUAGES.map((code) => LANGUAGE_TAGS[code]),
      publisher: { '@id': ORGANIZATION_ID },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': APP_ID,
      name: SITE_NAME,
      url: absolute(pathFor('home', language)),
      description: t('meta.description'),
      image: ogImage(language),
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'MetaMask Snap',
      operatingSystem: 'Windows, macOS, Linux, ChromeOS',
      browserRequirements: 'Requires the MetaMask browser extension',
      featureList: FEATURES.map((feature) => t(feature.title)),
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      license: MIT_LICENSE,
      inLanguage: LANGUAGES.map((code) => LANGUAGE_TAGS[code]),
      author: { '@id': ORGANIZATION_ID },
      publisher: { '@id': ORGANIZATION_ID },
    },
    {
      '@type': 'SoftwareSourceCode',
      '@id': REPO_URL,
      name: SITE_NAME,
      codeRepository: REPO_URL,
      programmingLanguage: 'TypeScript',
      license: MIT_LICENSE,
      targetProduct: { '@id': APP_ID },
      publisher: { '@id': ORGANIZATION_ID },
    },
  ];
}

type PageText = { title: string; description: string };

function homePage(language: Language): PageText & { graph: object[] } {
  const t = (key: Parameters<typeof translate>[1]) => plainText(translate(language, key, FAQ_VALUES));
  const url = canonicalUrl('home', language);
  const text = { title: t('meta.title'), description: t('meta.description') };
  return {
    ...text,
    graph: [
      {
        '@type': ['WebPage', 'FAQPage'],
        '@id': `${url}#webpage`,
        url,
        name: text.title,
        description: text.description,
        inLanguage: LANGUAGE_TAGS[language],
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': APP_ID },
        primaryImageOfPage: { '@type': 'ImageObject', url: ogImage(language), width: 1200, height: 630 },
        mainEntity: FAQ.map((item) => ({
          '@type': 'Question',
          name: t(item.question),
          acceptedAnswer: { '@type': 'Answer', text: t(item.answer) },
        })),
      },
    ],
  };
}

function documentPage(route: DocRoute, language: Language): PageText & { graph: object[] } {
  const docs = DOCUMENTS[route];
  const doc = docs[docLanguage(language)];
  const contentLang = contentLanguage(route, language);
  const url = canonicalUrl(route, language);
  const text = { title: `${doc.title} · ${SITE_NAME}`, description: doc.description };
  return {
    ...text,
    graph: [
      {
        '@type': route === 'contact' ? 'ContactPage' : 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: text.title,
        description: text.description,
        inLanguage: LANGUAGE_TAGS[contentLang],
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': APP_ID },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        ...(docs.updated ? { dateModified: docs.updated } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: translate(contentLang, 'breadcrumb.home'),
            item: canonicalUrl('home', contentLang),
          },
          { '@type': 'ListItem', position: 2, name: doc.title, item: url },
        ],
      },
    ],
  };
}

const meta = (name: string, content: string): HeadTag => ({ tag: 'meta', attrs: { name, content } });
const property = (name: string, content: string): HeadTag => ({ tag: 'meta', attrs: { property: name, content } });

/**
 * Everything a page puts in its head: title and description, canonical and
 * hreflang links, Open Graph and X cards, and schema.org data. The 404 is
 * kept out of indexes.
 */
export function pageHead({ route, language }: Location): PageHead {
  const lang = LANGUAGE_TAGS[language];
  if (route === null) {
    return {
      title: `${translate(language, 'notFound.title')} · ${SITE_NAME}`,
      lang,
      tags: [meta('description', translate(language, 'notFound.text')), meta('robots', 'noindex, follow')],
    };
  }

  const page = route === 'home' ? homePage(language) : documentPage(route, language);
  const contentLang = contentLanguage(route, language);
  const url = canonicalUrl(route, language);
  const image = ogImage(contentLang);
  const imageAlt = `${SITE_NAME}: ${plainText(translate(contentLang, 'hero.title'))}`;
  const otherLocales = pageLanguages(route).filter((code) => code !== contentLang);

  return {
    title: page.title,
    lang,
    tags: [
      meta('description', page.description),
      meta('robots', ROBOTS_INDEX),
      { tag: 'link', attrs: { rel: 'canonical', href: url } },
      ...alternates(route).map(({ hrefLang, href }) => ({
        tag: 'link' as const,
        attrs: { rel: 'alternate', hrefLang, href },
      })),
      property('og:type', 'website'),
      property('og:site_name', SITE_NAME),
      property('og:title', page.title),
      property('og:description', page.description),
      property('og:url', url),
      property('og:locale', OG_LOCALES[contentLang]),
      ...otherLocales.map((code) => property('og:locale:alternate', OG_LOCALES[code])),
      property('og:image', image),
      property('og:image:type', 'image/png'),
      property('og:image:width', '1200'),
      property('og:image:height', '630'),
      property('og:image:alt', imageAlt),
      meta('twitter:card', 'summary_large_image'),
      meta('twitter:site', COSMOS_X_HANDLE),
      meta('twitter:image:alt', imageAlt),
      {
        tag: 'script',
        attrs: { type: 'application/ld+json' },
        text: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [...sharedGraph(contentLang), ...page.graph],
        }),
      },
    ],
  };
}
