import { shortAddress } from '@/lib/account';
import { networkLabel } from '@/lib/network';
import type { AccountSnapshot, Balance } from '@/types';

function BalanceAmount({ balance }: { balance: Balance | undefined }) {
  if (balance?.kind === 'funded') return <>{balance.xlm}</>;
  if (balance?.kind === 'unfunded') return <>0</>;
  // Masked, not a dash: at this size a lone dash reads as a stray rule.
  return <>••••</>;
}

/**
 * The tilted card stack in the hero. Decorative (the account card below carries
 * the same data accessibly), but it mirrors the connected account so the hero
 * doesn't advertise a balance that isn't yours.
 */
export function WalletPreview({ account }: { account: AccountSnapshot | null }) {
  return (
    <div className="preview" aria-hidden="true">
      <div className="preview-back">
        <svg viewBox="0 0 200 120" preserveAspectRatio="none">
          <path d="M0 90 L20 70 L35 80 L55 40 L70 55 L90 30 L110 60 L125 45 L145 70 L165 25 L185 40 L200 15" />
        </svg>
      </div>
      <div className="preview-card">
        <div className="preview-head">
          <span className="preview-title">{account?.backend === 'official' ? 'MetaMask' : 'Stellar Snap'}</span>
          <span className="preview-chip">{networkLabel(account?.network ?? 'testnet')}</span>
        </div>
        <p className="preview-label">Saldo</p>
        <p className="preview-balance">
          <BalanceAmount balance={account?.balance} /> <small>XLM</small>
        </p>
        <p className="preview-address">{account ? shortAddress(account.address) : 'Sin conectar'}</p>
        <svg className="preview-spark" viewBox="0 0 200 48" preserveAspectRatio="none">
          <path d="M0 40 C20 38 30 20 50 26 S80 44 100 30 S135 6 155 16 S185 12 200 4" />
        </svg>
        <div className="preview-actions">
          <span className="preview-pill preview-pill-dark">Enviar</span>
          <span className="preview-pill preview-pill-lime">Recibir</span>
        </div>
      </div>
    </div>
  );
}
