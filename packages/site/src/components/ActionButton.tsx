import { useAction } from '@/hooks/useAction';
import { Button, type ButtonProps } from '@/components/Button';

type ActionButtonProps = Omit<ButtonProps, 'onClick' | 'disabled'> & {
  /** Log label for the action's result. */
  label: string;
  action: () => Promise<unknown>;
};

/** A button that runs `action`, logs the outcome and stays disabled meanwhile. */
export function ActionButton({ label, action, ...props }: ActionButtonProps) {
  const { run, pending } = useAction(label, action);
  return <Button {...props} disabled={pending} onClick={() => void run()} />;
}
