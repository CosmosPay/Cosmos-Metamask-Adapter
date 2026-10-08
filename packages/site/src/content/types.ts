/** A paragraph, or a bulleted list; both take RichText markup (*bold*, `code`, [links](url)). */
export type Block = string | readonly string[];

export type Section = { heading: string; blocks: readonly Block[] };

export type Doc = { title: string; intro: readonly Block[]; sections: readonly Section[] };

/**
 * A site document. Written in Spanish and English; the other languages show
 * the English text with a note. `updated` is an ISO date, formatted per language.
 */
export type DocSet = { updated?: string; es: Doc; en: Doc };
