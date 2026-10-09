import type { ComponentProps, MouseEvent } from 'react';
import { isSectionOfCurrentPage, navigate, urlFor } from '@/lib/router';

/**
 * A link to one of the site's pages (`href` is its site path, see router.ts)
 * that switches the page in place. Clicks meant for the browser (new tab or
 * window, middle button) keep its default, and so does a link to a section of
 * the page already shown.
 */
export function Link({ href, onClick, ...props }: ComponentProps<'a'> & { href: string }) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (isSectionOfCurrentPage(href)) return;
    event.preventDefault();
    navigate(href);
  };
  return <a {...props} href={urlFor(href)} onClick={handleClick} />;
}
