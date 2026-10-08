import type { ComponentProps, PointerEvent, PointerEventHandler } from 'react';

export type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
  /** Hover fill: a circle grows from where the pointer enters until it paints the button (`.ink` in CSS). */
  ink?: boolean;
};

/**
 * Centres the ink circle on the pointer and sizes it to reach the farthest
 * corner from there, so it grows from the entry point and shrinks back to the
 * exit point. Only its scale animates, so the centre never drifts.
 */
function moveInk(event: PointerEvent<HTMLButtonElement>) {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
  button.style.setProperty('--ink-x', `${x}px`);
  button.style.setProperty('--ink-y', `${y}px`);
  button.style.setProperty('--ink-size', `${2 * radius}px`);
}

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
