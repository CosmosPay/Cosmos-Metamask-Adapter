import { contact } from '@/content/contact';
import { credits } from '@/content/credits';
import { privacy } from '@/content/privacy';
import { terms } from '@/content/terms';
import type { DocSet } from '@/content/types';
import type { Language } from '@/i18n/languages';
import type { Route } from '@/lib/router';

/** The routes that show a document: every page but home. */
export type DocRoute = Exclude<Route, 'home'>;

/** The text pages, by route. */
export const DOCUMENTS: Record<DocRoute, DocSet> = { privacy, terms, credits, contact };

/** Documents are written in Spanish and English; every other language reads the English text. */
export type DocLanguage = 'es' | 'en';

export const docLanguage = (language: Language): DocLanguage => (language === 'es' ? 'es' : 'en');
