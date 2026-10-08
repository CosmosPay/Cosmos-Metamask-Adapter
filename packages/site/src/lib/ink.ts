import type { PointerEvent } from 'react';

/**
 * Pointer handler for the `.ink` hover fill (see global.css); put it on both
 * `onPointerEnter` and `onPointerLeave`. Centres the ink circle on the pointer
 * and sizes it to reach the farthest corner from there, so it grows from the
 * entry point and shrinks back to the exit point. Only its scale animates, so
 * the centre never drifts.
 */
export function moveInk(event: PointerEvent<HTMLElement>) {
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
  element.style.setProperty('--ink-x', `${x}px`);
  element.style.setProperty('--ink-y', `${y}px`);
  element.style.setProperty('--ink-size', `${2 * radius}px`);
}
