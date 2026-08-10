import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { registerBits } from '../../debug/registry';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span';
  className?: string;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  stagger?: number;
  start?: string;
  end?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  as = 'h2',
  className = '',
  enableBlur = true,
  baseOpacity = 0,
  baseRotation = 0,
  blurStrength = 4,
  stagger = 0.05,
  start = 'top 88%',
  end = 'top 45%',
}) => {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    registerBits('ScrollReveal');
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, rotate: 0, filter: 'blur(0px)' });
      el.querySelectorAll<HTMLElement>('.scroll-reveal-word').forEach((word) => {
        gsap.set(word, { opacity: 1, filter: 'blur(0px)' });
      });
      return;
    }

    const words = el.querySelectorAll<HTMLElement>('.scroll-reveal-word');
    const targets = words.length > 0 ? words : el;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start,
        end,
        scrub: true,
      },
    });

    tl.fromTo(
      el,
      { transformOrigin: '0% 50%', rotate: baseRotation },
      { rotate: 0, ease: 'none' },
    );

    if (targets === el) {
      tl.fromTo(
        targets,
        { opacity: baseOpacity, filter: enableBlur ? `blur(${blurStrength}px)` : 'blur(0px)' },
        { opacity: 1, filter: 'blur(0px)', ease: 'none' },
      );
    } else {
      tl.fromTo(
        targets,
        { opacity: baseOpacity, willChange: 'opacity' },
        { opacity: 1, stagger, ease: 'none' },
        0,
      );
      if (enableBlur) {
        tl.fromTo(
          targets,
          { filter: `blur(${blurStrength}px)` },
          { filter: 'blur(0px)', stagger, ease: 'none' },
          0,
        );
      }
    }

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [prefersReducedMotion, enableBlur, baseOpacity, baseRotation, blurStrength, stagger, start, end]);

  const Tag = as as React.ElementType;

  const text = typeof children === 'string' ? children : '';

  return (
    <Tag ref={ref} className={className}>
      {text
        ? text.split(/(\s+)/).map((word, index) =>
            word.match(/^\s+$/) ? (
              <React.Fragment key={index}>{word}</React.Fragment>
            ) : (
              <span
                className="scroll-reveal-word"
                key={index}
                style={{ display: 'inline-block' }}
              >
                {word}
              </span>
            ),
          )
        : children}
    </Tag>
  );
};

export default ScrollReveal;
