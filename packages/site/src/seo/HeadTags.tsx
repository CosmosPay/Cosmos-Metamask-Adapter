import { createElement, useEffect } from 'react';
import type { PageHead } from '@/seo/head';

/** Marks the tags a page owns, so the next page can replace them. */
const OWNED = 'data-head';

/** The page's head tags, rendered into the prerendered HTML (`entry-server.tsx`). */
export function HeadTags({ head }: { head: PageHead }) {
  return (
    <>
      <title>{head.title}</title>
      {head.tags.map((tag, index) => createElement(tag.tag, { key: index, ...tag.attrs, [OWNED]: '' }, tag.text))}
    </>
  );
}

/**
 * Applies a page's head in the browser: `lang`, title and the tags
 * `HeadTags` prerendered, replaced on each client-side navigation so links
 * shared from any page, and crawlers that run scripts, see that page's own.
 */
export function useDocumentHead(head: PageHead): void {
  useEffect(() => {
    document.documentElement.lang = head.lang;
    document.title = head.title;
    for (const element of document.head.querySelectorAll(`[${OWNED}]`)) element.remove();
    const tags = head.tags.map(({ tag, attrs, text }) => {
      const element = document.createElement(tag);
      for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value);
      element.setAttribute(OWNED, '');
      if (text) element.textContent = text;
      return element;
    });
    document.head.append(...tags);
  }, [head]);
}
