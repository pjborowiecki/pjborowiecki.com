"use client"

import { type JSX, type ReactNode, useRef } from "react"

import { gsap, MOTION_OK, useGSAP } from "~/src/lib/gsap"
import { cn } from "~/src/lib/utils"

import { Reveal } from "~/src/components/custom/reveal"
import { SplitHeading } from "~/src/components/custom/split-heading"

interface SectionHeadProps {
  className?: string
  label: string
  meta?: ReactNode
  title: string
  /** The label says it all: the heading is kept for screen readers and the document outline. */
  titleHidden?: boolean
}

/** Every section opens the same way: a rule drawn across the frame, a label line, then the heading at full width. */
export function SectionHead({ className, label, meta, title, titleHidden }: Readonly<SectionHeadProps>): JSX.Element {
  const ruleRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.from(ruleRef.current, {
          scaleX: 0,
          transformOrigin: "0% 50%",
          duration: 1.5,
          ease: "expo.inOut",
          scrollTrigger: { trigger: ruleRef.current, start: "top 92%", once: true },
        })
      })
    },
    { scope: ruleRef },
  )

  return (
    <header className={cn("frame", className)}>
      <div ref={ruleRef} aria-hidden className="h-px bg-foreground" />
      <Reveal variant="slide-right" className="mt-3 flex items-baseline justify-between gap-6">
        <p className="type-label text-foreground">{label}</p>
        {meta}
      </Reveal>
      {titleHidden ? (
        <h2 className="sr-only">{title}</h2>
      ) : (
        <SplitHeading className="type-display mt-[clamp(1.5rem,3vw,3.5rem)] text-display">{title}</SplitHeading>
      )}
    </header>
  )
}
