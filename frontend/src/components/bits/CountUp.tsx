import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { registerBits } from '../../debug/registry';

gsap.registerPlugin(ScrollTrigger);

interface CountUpProps {
  value: number;
  duration?: number;
  decimals?: number;
  separator?: boolean;
  className?: string;
}

function formatValue(value: number, decimals: number, separator: boolean): string {
  const fixed = value.toFixed(decimals);
  if (!separator) return fixed;
  const parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

const CountUp: React.FC<CountUpProps> = ({
  value,
  duration = 1.6,
  decimals = 0,
  separator = true,
  className = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    console.log('[bits] CountUp mounted', el);
    registerBits('CountUp');

    if (prefersReducedMotion) {
      el.textContent = formatValue(value, decimals, separator);
      return;
    }

    const state = { value: 0 };
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(state, {
          value,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = formatValue(state.value, decimals, separator);
          },
          onComplete: () => {
            el.textContent = formatValue(value, decimals, separator);
          },
        });
      },
    });

    return () => {
      st.kill();
      gsap.killTweensOf(state);
    };
  }, [value, duration, decimals, separator, prefersReducedMotion]);

  return (
    <span ref={ref} className={className}>
      {formatValue(prefersReducedMotion ? value : 0, decimals, separator)}
    </span>
  );
};

export default CountUp;
