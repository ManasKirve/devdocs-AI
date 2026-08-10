import * as React from 'react';
import { useRef, useEffect } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { registerBits } from '../../debug/registry';

interface AnimatedBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const AnimatedBackground = React.forwardRef<HTMLDivElement, AnimatedBackgroundProps>(
  function AnimatedBackground({ className = '', ...props }, ref) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      console.log('[bits] AnimatedBackground mounted', divRef.current);
      registerBits('AnimatedBackground');
    }, []);

    function setRefs(node: HTMLDivElement | null) {
      (divRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }

    return (
      <div
        ref={setRefs}
        className={`hero-ambient${className ? ` ${className}` : ''}`}
        aria-hidden="true"
        {...props}
      >
        <span className={`ambient-layer${prefersReducedMotion ? ' is-static' : ''}`} />
        {!prefersReducedMotion && <span className="ambient-layer is-reverse" />}
      </div>
    );
  },
);

export default AnimatedBackground;
