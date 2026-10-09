import { AccountCard } from '@/components/AccountCard';
import { ConnectButton } from '@/components/ConnectButton';
import { Developers } from '@/components/Developers';
import { Donations } from '@/components/Donations';
import { Faq } from '@/components/Faq';
import { Features } from '@/components/Features';
import { Footer } from '@/components/Footer';
import { GetStarted } from '@/components/GetStarted';
import { Hero } from '@/components/Hero';
import { LogPanel } from '@/components/LogPanel';
import { PaymentForm } from '@/components/PaymentForm';
import { SignMessageForm } from '@/components/SignMessageForm';
import { SiteHeader } from '@/components/SiteHeader';
import { SorobanAuthCard } from '@/components/SorobanAuthCard';
import { useLog } from '@/context/LogContext';
import { useReveal } from '@/hooks/useReveal';
import { useWalletActions } from '@/hooks/useWalletActions';
import { useWalletSession } from '@/hooks/useWalletSession';

/**
 * The landing: the hero with the connect flow, the demo sections (once
 * connected), then what the snap does, how to start, the developer API and
 * the FAQ, so people and search engines alike learn what Stellar Snap is,
 * and how to support it. Every piece enters as it scrolls into view.
 */
export function HomePage() {
  const session = useWalletSession();
  const actions = useWalletActions(session);
  const { entry } = useLog();
  useReveal();

  return (
    <>
      <SiteHeader>
        <ConnectButton
          className="nav-connect"
          connected={session.connected}
          account={session.account}
          onConnect={session.connect}
        />
      </SiteHeader>
      <main id="main" tabIndex={-1}>
        <Hero connected={session.connected} account={session.account} onConnect={session.connect} />
        <div className="demo">
          {session.connected && (
            <>
              <AccountCard
                account={session.account}
                selectedNetwork={session.selectedNetwork}
                onSwitchNetwork={session.switchNetwork}
                onRefresh={actions.refreshBalance}
                onFund={actions.fund}
                onLink={actions.linkEvm}
              />
              <SorobanAuthCard onSign={actions.signAuth} />
              <PaymentForm onSend={actions.pay} />
              <SignMessageForm onSign={actions.signMessage} />
            </>
          )}
          <LogPanel entry={entry} />
        </div>
        <Features />
        <GetStarted />
        <Developers />
        <Faq />
        <Donations />
      </main>
      <Footer />
    </>
  );
}
