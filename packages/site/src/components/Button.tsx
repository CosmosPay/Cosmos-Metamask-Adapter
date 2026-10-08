import type { ComponentProps, PointerEventHandler } from 'react';
import { moveInk } from '@/lib/ink';

export type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
  /** Hover fill: a circle grows from where the pointer enters until it paints the button (`.ink` in CSS). */
  ink?: boolean;
};

export function Button({
  variant = 'primary',
  ink = false,
  className,
  type = 'button',
  onPointerEnter,
  onPointerLeave,
  ...props
}: ButtonProps) {
  const classes = [variant === 'secondary' && 'secondary', ink && 'ink', className].filter(Boolean).join(' ');
  const withInk = (
    handler?: PointerEventHandler<HTMLButtonElement>,
  ): PointerEventHandler<HTMLButtonElement> | undefined =>
    ink
      ? (event) => {
          moveInk(event);
          handler?.(event);
        }
      : handler;
  return (
    <button
      type={type}
      className={classes || undefined}
      onPointerEnter={withInk(onPointerEnter)}
      onPointerLeave={withInk(onPointerLeave)}
      {...props}
    />
  );
}
