import { useState, type FormEvent } from 'react';
import { useAction } from '@/hooks/useAction';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

const DEFAULT_MESSAGE = 'Hola desde Cosmos Pay';

export function SignMessageForm({ onSign }: { onSign: (message: string) => Promise<unknown> }) {
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const { run, pending } = useAction('Firma SEP-53', onSign);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void run(message);
  };

  return (
    <Card title="Firmar mensaje (SEP-53)">
      <form onSubmit={submit}>
        <label>
          Mensaje{' '}
          <textarea
            name="message"
            rows={3}
            required
            value={message}
            onChange={(event) => setMessage(event.currentTarget.value)}
          />
        </label>
        <Button type="submit" disabled={pending}>
          Firmar
        </Button>
      </form>
    </Card>
  );
}
