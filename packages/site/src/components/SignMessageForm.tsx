import { useState, type FormEvent } from 'react';
import { useAction } from '@/hooks/useAction';
import { useI18n } from '@/i18n';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export function SignMessageForm({ onSign }: { onSign: (message: string) => Promise<unknown> }) {
  const { t } = useI18n();
  // The sample text is filled in once, in the language the page opened with.
  const [message, setMessage] = useState(() => t('sign.default'));
  const { run, pending } = useAction(t('sign.done'), onSign);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void run(message);
  };

  return (
    <Card title={t('sign.title')}>
      <form onSubmit={submit}>
        <label>
          {t('sign.message')}{' '}
          <textarea
            name="message"
            rows={3}
            required
            value={message}
            onChange={(event) => setMessage(event.currentTarget.value)}
          />
        </label>
        <Button type="submit" disabled={pending}>
          {t('sign.submit')}
        </Button>
      </form>
    </Card>
  );
}
