import { useState } from 'react';
import { contact } from '@/content/contact';
import { credits } from '@/content/credits';
import { privacy } from '@/content/privacy';
import { terms } from '@/content/terms';
import type { DocSet } from '@/content/types';
import { LogProvider } from '@/context/LogContext';
import { ToastProvider } from '@/context/ToastContext';
import { WalletProvider } from '@/context/WalletContext';
import { type Route, useRoute } from '@/lib/router';
import { DemoPage } from '@/pages/DemoPage';
import { DocumentPage } from '@/pages/DocumentPage';
import { createWallet } from '@/services/wallet';

/** The text pages, by route. */
const DOCUMENTS: Record<Exclude<Route, 'home'>, DocSet> = { privacy, terms, credits, contact };

/** Composition root: creates the wallet once, provides it to the tree and shows the page for the URL. */
export function App() {
  const [wallet] = useState(createWallet);
  const route = useRoute();
  return (
    <WalletProvider wallet={wallet}>
      <LogProvider>
        <ToastProvider>{route === 'home' ? <DemoPage /> : <DocumentPage docs={DOCUMENTS[route]} />}</ToastProvider>
      </LogProvider>
    </WalletProvider>
  );
}
