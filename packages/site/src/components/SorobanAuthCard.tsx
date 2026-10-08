import { ActionButton } from '@/components/ActionButton';
import { Card } from '@/components/Card';

export function SorobanAuthCard({ onSign }: { onSign: () => Promise<unknown> }) {
  return (
    <Card title="Autorización Soroban (signAuthEntry)">
      <p className="muted">
        Construye la autorización de un <code>transfer</code> de ejemplo, la firma en MetaMask y la verifica con el SDK
        de Stellar, igual que haría una dApp de Soroban.
      </p>
      <ActionButton label="Autorización Soroban firmada y verificada" action={onSign}>
        Firmar autorización de ejemplo
      </ActionButton>
    </Card>
  );
}
