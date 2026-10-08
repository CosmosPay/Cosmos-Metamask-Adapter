import { CONTACT_EMAIL, REPO_URL, SITE_URL } from '@/config';
import { type DocRoute, DOCUMENTS } from '@/content';
import { DEVELOPER_POINTS, FAQ, FAQ_VALUES, FEATURES, STEPS } from '@/content/home';
import type { Block } from '@/content/types';
import { LANGUAGE_NAMES, type Language, translate } from '@/i18n';
import { plainText, toMarkdown } from '@/lib/markup';
import { localizePath, pathFor, ROUTES, type Route } from '@/lib/router';
import { alternates, canonicalUrl, pageLanguages } from '@/seo/head';

/**
 * The crawler-facing files the prerender writes next to the pages: the
 * sitemap, robots.txt and llms.txt (llmstxt.org), all from the same routes and
 * content as the pages themselves.
 */

const ROUTE_NAMES = Object.keys(ROUTES) as Route[];
const DOC_ROUTES = ROUTE_NAMES.filter((route): route is DocRoute => route !== 'home');

const escapeXml = (text: string) => text.replace(/[<>&'"]/gu, (char) => `&#${char.charCodeAt(0)};`);

/** One `<url>` per written version of each page, each listing all of them (hreflang). */
export function sitemapXml(): string {
  const urls = ROUTE_NAMES.flatMap((route) => {
    const updated = route === 'home' ? undefined : DOCUMENTS[route].updated;
    const links = alternates(route)
      .map(({ hrefLang, href }) => `    <xhtml:link rel="alternate" hreflang="${hrefLang}" href="${escapeXml(href)}"/>`)
      .join('\n');
    return pageLanguages(route).map((language) =>
      [
        '  <url>',
        `    <loc>${escapeXml(canonicalUrl(route, language))}</loc>`,
        ...(updated ? [`    <lastmod>${updated}</lastmod>`] : []),
        links,
        '  </url>',
      ].join('\n'),
    );
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

/** AI crawlers, named so the welcome is explicit (the `*` group already lets them in). */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Meta-ExternalAgent',
  'Amazonbot',
  'DuckAssistBot',
  'MistralAI-User',
  'cohere-ai',
  'CCBot',
];

export function robotsTxt(): string {
  return [
    '# Stellar Snap: every page is public. Search engines, AI assistants and link previews are welcome.',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    ...AI_CRAWLERS.map((agent) => `User-agent: ${agent}`),
    'Allow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');
}

/** llms.txt is written in English, the language LLMs read best; links point at the English pages. */
const LLM_LANGUAGE: Language = 'en';

const t = (key: Parameters<typeof translate>[1]) => translate(LLM_LANGUAGE, key, FAQ_VALUES);
const markdown = (text: string) =>
  toMarkdown(text, (href) => (href.startsWith('/') ? `${SITE_URL}${localizePath(href, LLM_LANGUAGE)}` : href));

const blockMarkdown = (block: Block) =>
  typeof block === 'string' ? markdown(block) : block.map((item) => `- ${markdown(item)}`).join('\n');

/** The site in brief, with links to every page: what an assistant needs to describe and cite Stellar Snap. */
export function llmsTxt(): string {
  const pages = DOC_ROUTES.map((route) => {
    const doc = DOCUMENTS[route].en;
    return `- [${doc.title}](${canonicalUrl(route, 'en')}): ${doc.description}`;
  });
  const translations = (Object.keys(LANGUAGE_NAMES) as Language[])
    .filter((language) => language !== LLM_LANGUAGE)
    .map((language) => `[${LANGUAGE_NAMES[language]}](${SITE_URL}${pathFor('home', language)})`)
    .join(', ');
  return [
    '# Stellar Snap',
    '',
    `> ${t('meta.description')}`,
    '',
    markdown(t('faq.what.a')),
    '',
    `**${t('faq.official.q')}** ${markdown(t('faq.official.a'))}`,
    '',
    ...FEATURES.map((feature) => `- **${t(feature.title)}**: ${markdown(t(feature.text))}`),
    '',
    '## Pages',
    '',
    `- [Home](${canonicalUrl('home', 'en')}): ${t('meta.description')}`,
    ...pages,
    `- The home page in other languages: ${translations}.`,
    '',
    '## Developers',
    '',
    `- [Source code on GitHub](${REPO_URL}): the snap (\`@cosmospay/stellar-snap\`), the SEP-43 dApp adapter (\`@cosmospay/stellar-metamask-adapter\`) and this site, MIT licensed.`,
    ...DEVELOPER_POINTS.map((point) => `- ${markdown(t(point))}`),
    '',
    '## Optional',
    '',
    `- [Full text](${SITE_URL}/llms-full.txt): every page of the site in one Markdown file.`,
    `- Contact: ${CONTACT_EMAIL}`,
    '',
  ].join('\n');
}

/** Every page's text in English, as one Markdown file. */
export function llmsFullTxt(): string {
  const docs = DOC_ROUTES.flatMap((route) => {
    const doc = DOCUMENTS[route].en;
    return [
      `## ${doc.title}`,
      '',
      `Source: ${canonicalUrl(route, 'en')}`,
      '',
      ...doc.intro.map(blockMarkdown).flatMap((text) => [text, '']),
      ...doc.sections.flatMap((section) => [
        `### ${section.heading}`,
        '',
        ...section.blocks.map(blockMarkdown).flatMap((text) => [text, '']),
      ]),
    ];
  });
  return [
    '# Stellar Snap',
    '',
    `> ${t('meta.description')}`,
    '',
    `Source: ${canonicalUrl('home', 'en')}`,
    '',
    `## ${plainText(t('features.title'))}`,
    '',
    markdown(t('features.lead')),
    '',
    ...FEATURES.map((feature) => `- **${t(feature.title)}**: ${markdown(t(feature.text))}`),
    '',
    `## ${plainText(t('start.title'))}`,
    '',
    ...STEPS.map((step, index) => `${index + 1}. **${t(step.title)}**: ${markdown(t(step.text))}`),
    '',
    `## ${plainText(t('dev.title'))}`,
    '',
    markdown(t('dev.lead')),
    '',
    ...DEVELOPER_POINTS.map((point) => `- ${markdown(t(point))}`),
    '',
    `## ${t('faq.eyebrow')}`,
    '',
    ...FAQ.flatMap((item) => [`### ${t(item.question)}`, '', markdown(t(item.answer)), '']),
    ...docs,
  ].join('\n');
}
