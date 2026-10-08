import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useAction } from '@/hooks/useAction';
import type { PaymentInput } from '@/types';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

const EMPTY_PAYMENT: PaymentInput = { destination: '', amount: '', memo: '' };

export function PaymentForm({ onSend }: { onSend: (input: PaymentInput) => Promise<unknown> }) {
  const [payment, setPayment] = useState(EMPTY_PAYMENT);
  const { run, pending } = useAction('Pago enviado', onSend);

  const update = (field: keyof PaymentInput) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setPayment((current) => ({ ...current, [field]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void run(payment);
  };

  return (
    <Card title="Enviar pago">
      <form onSubmit={submit}>
        <label>
          Destino{' '}
          <input
            name="destination"
            placeholder="G..."
            required
            value={payment.destination}
            onChange={update('destination')}
          />
        </label>
        <label>
          Monto (XLM){' '}
          <input
            name="amount"
            placeholder="1.5"
            inputMode="decimal"
            required
            value={payment.amount}
            onChange={update('amount')}
          />
        </label>
        <label>
          Memo{' '}
          <input name="memo" maxLength={28} placeholder="opcional" value={payment.memo} onChange={update('memo')} />
        </label>
        <Button type="submit" disabled={pending}>
          Enviar
        </Button>
      </form>
    </Card>
  );
}
