import * as React from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface AnimatedBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const AnimatedBackground = React.forwardRef<HTMLDivElement, AnimatedBackgroundProps>(
  function AnimatedBackground({ className = '', ...props }, ref) {
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
      <div
        ref={ref}
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
