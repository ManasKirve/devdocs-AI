import * as React from 'react';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { registerBits } from '../../debug/registry';

interface MagneticButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onPointerMove' | 'onPointerLeave'> {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  onPointerMove?: React.PointerEventHandler<HTMLSpanElement>;
  onPointerLeave?: React.PointerEventHandler<HTMLSpanElement>;
}

const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  function MagneticButton(
    { children, strength = 6, className = '', disabled, onPointerMove, onPointerLeave, ...props },
    ref,
  ) {
    const wrapRef = useRef<HTMLSpanElement>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
      console.log('[bits] MagneticButton mounted', wrapRef.current);
      registerBits('MagneticButton');
      return () => {
        if (wrapRef.current) gsap.killTweensOf(wrapRef.current);
      };
    }, []);

    function handlePointerMove(event: React.PointerEvent<HTMLSpanElement>) {
      onPointerMove?.(event);
      if (prefersReducedMotion || disabled) return;
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const px = Math.max(-1, Math.min(1, dx / (rect.width / 2)));
      const py = Math.max(-1, Math.min(1, dy / (rect.height / 2)));
      gsap.to(wrap, {
        x: px * strength,
        y: py * strength,
        duration: 0.45,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    }

    function handlePointerLeave(event: React.PointerEvent<HTMLSpanElement>) {
      onPointerLeave?.(event);
      if (prefersReducedMotion) return;
      const wrap = wrapRef.current;
      if (!wrap) return;
      gsap.to(wrap, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.4)',
        overwrite: 'auto',
      });
    }

    const isBlock = typeof className === 'string' && className.includes('btn-block');

    return (
      <span
        ref={wrapRef}
        className={`magnetic-wrap${isBlock ? ' is-block' : ''}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <button ref={ref} className={className} disabled={disabled} {...props}>
          {children}
        </button>
      </span>
    );
  },
);

export default MagneticButton;
