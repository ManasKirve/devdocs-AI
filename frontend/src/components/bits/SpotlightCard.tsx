import * as React from 'react';
import { useRef, useImperativeHandle } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

const SpotlightCard = React.forwardRef<HTMLElement, SpotlightCardProps>(function SpotlightCard(
  { as = 'div', children, className = '', onPointerMove, onPointerLeave, ...props },
  ref,
) {
  const cardRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useImperativeHandle(ref, () => cardRef.current as HTMLElement);

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    onPointerMove?.(event);
    const el = cardRef.current;
    if (!el || prefersReducedMotion) return;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--spot-x', `${x}%`);
    el.style.setProperty('--spot-y', `${y}%`);
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLElement>) {
    onPointerLeave?.(event);
    const el = cardRef.current;
    if (!el || prefersReducedMotion) return;
    el.style.setProperty('--spot-x', '50%');
    el.style.setProperty('--spot-y', '50%');
  }

  const Tag = as as React.ElementType;

  return React.createElement(
    Tag,
    {
      ref,
      className: `spotlight-card${className ? ` ${className}` : ''}`,
      'data-reduced': prefersReducedMotion || undefined,
      onPointerMove: handlePointerMove,
      onPointerLeave: handlePointerLeave,
      ...props,
    },
    <span className="spotlight-overlay" aria-hidden="true" />,
    children,
  );
});

export default SpotlightCard;
