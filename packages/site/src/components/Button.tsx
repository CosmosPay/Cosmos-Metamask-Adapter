import type { ComponentProps } from 'react';

export type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps) {
  const classes = [variant === 'secondary' && 'secondary', className].filter(Boolean).join(' ');
  return <button type={type} className={classes || undefined} {...props} />;
}
