import { type JSX, type ReactNode, useRef } from "react"

import { MOTION_OK, gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

import { cn } from "~/src/lib/cn"

import { Reveal } from "~/src/presentation/components/custom/landing-page/components/reveal"
import { SplitHeading } from "~/src/presentation/components/custom/landing-page/components/split-heading"

interface SectionHeadProps {
  readonly className?: string
  readonly isTitleHidden?: boolean
  readonly label: string
  readonly meta?: ReactNode
  readonly title: string
}

const RULE_DRAW: gsap.TweenVars = { duration: 1.5, ease: "expo.inOut", scaleX: 0, transformOrigin: "0% 50%" }

const RULE_START = "top 92%"

export const SectionHead = ({ className, isTitleHidden = false, label, meta, title }: SectionHeadProps): JSX.Element => {
  const ruleRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.from(ruleRef.current, { ...RULE_DRAW, scrollTrigger: { once: true, start: RULE_START, trigger: ruleRef.current } })
      })
    },
    { scope: ruleRef },
  )

  return (
    <header className={cn("frame", className)}>
      <div aria-hidden className="h-px bg-foreground" ref={ruleRef} />
      <Reveal className="mt-3 flex items-baseline justify-between gap-6" variant="slide-right">
        <p className="type-label text-foreground">{label}</p>
        {meta}
      </Reveal>
      {isTitleHidden && <h2 className="sr-only">{title}</h2>}
      {!isTitleHidden && <SplitHeading className="mt-[clamp(1.5rem,3vw,3.5rem)] type-display text-display">{title}</SplitHeading>}
    </header>
  )
}
