import { contact } from '@/content/contact';
import { credits } from '@/content/credits';
import { privacy } from '@/content/privacy';
import { terms } from '@/content/terms';
import type { DocSet } from '@/content/types';
import type { Language } from '@/i18n/languages';
import type { Route } from '@/lib/router';

/** The routes that show a document: every page but home and the changelog. */
export type DocRoute = Exclude<Route, 'home' | 'changelog'>;

/** Whether a route shows a document. */
export const isDocRoute = (route: Route): route is DocRoute => route !== 'home' && route !== 'changelog';

/** The text pages, by route. */
export const DOCUMENTS: Record<DocRoute, DocSet> = { privacy, terms, credits, contact };

/** Documents are written in Spanish and English; every other language reads the English text. */
export type DocLanguage = 'es' | 'en';

export const docLanguage = (language: Language): DocLanguage => (language === 'es' ? 'es' : 'en');
