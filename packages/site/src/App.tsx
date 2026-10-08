import { useMemo, useState } from 'react';
import { LanguageSuggestion } from '@/components/LanguageSuggestion';
import { LogProvider } from '@/context/LogContext';
import { ToastProvider } from '@/context/ToastContext';
import { WalletProvider } from '@/context/WalletContext';
import { usePageFocus } from '@/hooks/usePageFocus';
import { useI18n } from '@/i18n';
import { type Route, useLocation } from '@/lib/router';
import { DocumentPage } from '@/pages/DocumentPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { pageHead } from '@/seo/head';
import { useDocumentHead } from '@/seo/HeadTags';
import { createWallet } from '@/services/wallet';

function Page({ route }: { route: Route | null }) {
  if (route === null) return <NotFoundPage />;
  if (route === 'home') return <HomePage />;
  return <DocumentPage route={route} />;
}

/**
 * Composition root: creates the wallet once, provides it to the tree and
 * shows the page for the URL, keeping the document head, `lang` and focus in
 * step with it. The skip link is the first thing a keyboard reaches.
 */
export function App() {
  const [wallet] = useState(createWallet);
  const location = useLocation();
  const { t } = useI18n();
  useDocumentHead(useMemo(() => pageHead(location), [location]));
  usePageFocus(location);
  return (
    <WalletProvider wallet={wallet}>
      <LogProvider>
        <ToastProvider>
          <a className="skip-link" href="#main">
            {t('nav.skip')}
          </a>
          <Page route={location.route} />
          <LanguageSuggestion />
        </ToastProvider>
      </LogProvider>
    </WalletProvider>
  );
}
