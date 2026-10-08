import { useState } from 'react';
import { LogProvider } from '@/context/LogContext';
import { WalletProvider } from '@/context/WalletContext';
import { DemoPage } from '@/pages/DemoPage';
import { createWallet } from '@/services/wallet';

/** Composition root: creates the wallet once and provides it to the tree. */
export function App() {
  const [wallet] = useState(createWallet);
  return (
    <WalletProvider wallet={wallet}>
      <LogProvider>
        <DemoPage />
      </LogProvider>
    </WalletProvider>
  );
}
