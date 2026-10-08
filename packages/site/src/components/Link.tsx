import type { ComponentProps, MouseEvent } from 'react';
import { navigate } from '@/lib/router';

/**
 * A link to one of the site's pages that switches the page in place. Clicks
 * meant for the browser (new tab or window, middle button) keep its default.
 */
export function Link({ href, onClick, ...props }: ComponentProps<'a'> & { href: string }) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(href);
  };
  return <a {...props} href={href} onClick={handleClick} />;
}
