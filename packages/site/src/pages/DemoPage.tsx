import { AccountCard } from '@/components/AccountCard';
import { Header } from '@/components/Header';
import { LogPanel } from '@/components/LogPanel';
import { PaymentForm } from '@/components/PaymentForm';
import { SignMessageForm } from '@/components/SignMessageForm';
import { SorobanAuthCard } from '@/components/SorobanAuthCard';
import { useLog } from '@/context/LogContext';
import { useWalletActions } from '@/hooks/useWalletActions';
import { useWalletSession } from '@/hooks/useWalletSession';

/** Wires wallet state and actions into the demo sections. */
export function DemoPage() {
  const session = useWalletSession();
  const actions = useWalletActions(session);
  const { entry } = useLog();

  return (
    <main>
      <Header />
      <AccountCard
        connected={session.connected}
        account={session.account}
        selectedNetwork={session.selectedNetwork}
        onConnect={session.connect}
        onSwitchNetwork={session.switchNetwork}
        onRefresh={actions.refreshBalance}
        onFund={actions.fund}
        onLink={actions.linkEvm}
      />
      {session.connected && (
        <>
          <SorobanAuthCard onSign={actions.signAuth} />
          <PaymentForm onSend={actions.pay} />
          <SignMessageForm onSign={actions.signMessage} />
        </>
      )}
      <LogPanel entry={entry} />
    </main>
  );
}
