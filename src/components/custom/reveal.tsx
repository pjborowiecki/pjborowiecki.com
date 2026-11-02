"use client"

import { type JSX, type ReactNode, useRef } from "react"

import { gsap, MOTION_OK, useGSAP } from "~/src/lib/gsap"

type RevealVariant = "slide-up" | "slide-right" | "scale-in"

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  variant?: RevealVariant
}

const FROM: Record<RevealVariant, gsap.TweenVars> = {
  "slide-up": { y: 30 },
  "slide-right": { x: -32 },
  "scale-in": { y: 40, scale: 0.97 },
}

export function Reveal({ children, className, delay = 0, variant = "slide-up" }: Readonly<RevealProps>): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.from(ref.current, {
          ...FROM[variant],
          autoAlpha: 0,
          delay,
          duration: 1,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
        })
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
