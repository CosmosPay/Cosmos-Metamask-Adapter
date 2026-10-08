import type { ComponentProps } from 'react';
import { useI18n } from '@/i18n';

/** A link to another site. It opens in a new tab, which a hidden note tells screen reader users. */
export function ExternalLink({ children, ...props }: ComponentProps<'a'> & { href: string }) {
  const { t } = useI18n();
  return (
    <a {...props} target="_blank" rel="noreferrer">
      {children}
      <span className="visually-hidden"> {t('link.newTab')}</span>
    </a>
  );
}
