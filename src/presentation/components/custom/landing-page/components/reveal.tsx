import { type JSX, type ReactNode, useRef } from "react"

import { gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

import { MEDIA } from "~/src/data/media"

type RevealVariant = "scale-in" | "slide-right" | "slide-up"

interface RevealProps {
  readonly children: ReactNode
  readonly className?: string
  readonly delay?: number
  readonly variant?: RevealVariant
}

const FROM: Record<RevealVariant, gsap.TweenVars> = {
  "scale-in": { scale: 0.97, y: 40 },
  "slide-right": { x: -32 },
  "slide-up": { y: 30 },
}

const REVEAL: gsap.TweenVars = { autoAlpha: 0, clearProps: "transform,opacity,visibility", duration: 1, ease: "power3.out" }

const REVEAL_START = "top 90%"

export const Reveal = ({ children, className, delay = 0, variant = "slide-up" }: RevealProps): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.matchMedia().add(MEDIA.MOTION_OK, () => {
        gsap.from(ref.current, {
          ...FROM[variant],
          ...REVEAL,
          delay,
          scrollTrigger: { once: true, start: REVEAL_START, trigger: ref.current },
        })
      })
    },
    { scope: ref },
  )

  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  )
}
