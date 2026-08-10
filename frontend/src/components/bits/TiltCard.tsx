import * as React from 'react';
import { useRef, useEffect, useCallback, useImperativeHandle } from 'react';
import { gsap } from 'gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number;
  perspective?: number;
  duration?: number;
  className?: string;
}

const TiltCard = React.forwardRef<HTMLDivElement, TiltCardProps>(function TiltCard(
  {
    children,
    maxTilt = 8,
    perspective = 1000,
    duration = 0.5,
    className = '',
    onPointerMove,
    onPointerLeave,
    ...props
  },
  ref,
) {
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useImperativeHandle(ref, () => cardRef.current as HTMLDivElement);

  const applyTilt = useCallback(
    (nx: number, ny: number) => {
      const el = cardRef.current;
      if (!el) return;
      gsap.to(el, {
        rotateY: nx * maxTilt,
        rotateX: -ny * maxTilt,
        transformPerspective: perspective,
        duration,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    },
    [maxTilt, perspective, duration],
  );

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (prefersReducedMotion) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    applyTilt((px - 0.5) * 2, (py - 0.5) * 2);
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    if (prefersReducedMotion) return;
    const el = cardRef.current;
    if (!el) return;
    gsap.to(el, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.7,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      const el = cardRef.current;
      if (el) gsap.set(el, { rotateX: 0, rotateY: 0 });
    }
    return () => {
      if (cardRef.current) gsap.killTweensOf(cardRef.current);
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={cardRef}
      className={`tilt-card${className ? ` ${className}` : ''}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {children}
    </div>
  );
});

export default TiltCard;
