import { AccountCard } from '@/components/AccountCard';
import { Header } from '@/components/Header';
import { LogPanel } from '@/components/LogPanel';
import { PaymentForm } from '@/components/PaymentForm';
import { SignMessageForm } from '@/components/SignMessageForm';
import { SorobanAuthCard } from '@/components/SorobanAuthCard';
import { useLog } from '@/context/LogContext';
import { useWalletActions } from '@/hooks/useWalletActions';
import { useWalletSession } from '@/hooks/useWalletSession';

/** Landing header with the connect flow; the demo sections appear once connected. */
export function DemoPage() {
  const session = useWalletSession();
  const actions = useWalletActions(session);
  const { entry } = useLog();

  return (
    <main>
      <Header connected={session.connected} account={session.account} onConnect={session.connect} />
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
    </main>
  );
}
