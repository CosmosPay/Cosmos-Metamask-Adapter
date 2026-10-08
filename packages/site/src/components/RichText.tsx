import { Fragment, type ReactNode } from 'react';
import { ExternalLink } from '@/components/ExternalLink';
import { Link } from '@/components/Link';
import { SnapText } from '@/components/SnapText';
import { type Language, useI18n } from '@/i18n';
import { MARKUP } from '@/lib/markup';
import { localizePath } from '@/lib/router';

/** Prose (not code) goes through SnapText, so "Snap" gets its hover circle wherever it is. */
const prose = (text: string) => <SnapText text={text} />;

/**
 * Site pages switch in place, in the reader's language; mail links open the
 * mail app; anything else opens in a new tab.
 */
function link(label: string, href: string, language: Language) {
  if (href.startsWith('/')) return <Link href={localizePath(href, language)}>{prose(label)}</Link>;
  if (href.startsWith('mailto:')) return <a href={href}>{prose(label)}</a>;
  return <ExternalLink href={href}>{prose(label)}</ExternalLink>;
}

/**
 * Renders a translated string's inline markup (see lib/markup.ts) as
 * elements, so word order can differ per language without splitting
 * sentences into fragments. Code is never machine-translated.
 */
export function RichText({ text }: { text: string }) {
  const { language } = useI18n();
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(MARKUP)) {
    const [whole, bold, highlight, code, label, href] = match;
    parts.push(prose(text.slice(last, match.index)));
    if (bold !== undefined) parts.push(<strong>{prose(bold)}</strong>);
    else if (highlight !== undefined) parts.push(<mark>{prose(highlight)}</mark>);
    else if (code !== undefined) parts.push(<code translate="no">{code}</code>);
    else parts.push(link(label ?? '', href ?? '', language));
    last = match.index + whole.length;
  }
  parts.push(prose(text.slice(last)));
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>{part}</Fragment>
      ))}
    </>
  );
}
