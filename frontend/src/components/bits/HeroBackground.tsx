import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

gsap.registerPlugin(useGSAP)

interface HeroBackgroundProps {
  className?: string
}

export default function HeroBackground({ className = '' }: HeroBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const orb1Ref = useRef<HTMLSpanElement>(null)
  const orb2Ref = useRef<HTMLSpanElement>(null)
  const orb3Ref = useRef<HTMLSpanElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (prefersReducedMotion) return
      gsap.to(orb1Ref.current, {
        x: 70,
        y: 44,
        scale: 1.1,
        duration: 16,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
      gsap.to(orb2Ref.current, {
        x: -60,
        y: -36,
        scale: 1.06,
        duration: 19,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
      gsap.to(orb3Ref.current, {
        x: -46,
        y: 30,
        scale: 1.12,
        duration: 22,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    },
    { scope: rootRef, dependencies: [prefersReducedMotion] },
  )

  return (
    <div ref={rootRef} className={`hero-fx ${className}`} aria-hidden="true">
      <span ref={orb1Ref} className="hero-fx-orb hero-fx-orb-1" />
      <span ref={orb2Ref} className="hero-fx-orb hero-fx-orb-2" />
      <span ref={orb3Ref} className="hero-fx-orb hero-fx-orb-3" />
    </div>
  )
}
