import { type JSX, useRef } from "react"

import { useTranslations } from "use-intl/react"

import { gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

import { NAV_GROUND, SECTION_IDS } from "~/src/data/marketing"
import { MEDIA } from "~/src/data/media"

import { CtaLink } from "~/src/presentation/components/custom/landing-page/components/cta-link"
import {
  HarnessDiagram,
  type HarnessDiagramHandle,
  type HarnessState,
} from "~/src/presentation/components/custom/landing-page/components/harness-diagram"
import { Reveal } from "~/src/presentation/components/custom/landing-page/components/reveal"

import { APP_GITHUB_URL } from "~/src/presentation/branding"

const STEPS = ["mess", "guardrails", "harness", "judgment"] as const

const NEXT = 1

const HARNESS_SCROLL: ScrollTrigger.Vars = { end: "bottom bottom", scrub: 0.5, start: "top top" }

const DRAW_IN: gsap.TweenVars = { draw: 1, duration: 0.9, ease: "power1.inOut" }
const STEP_HIDDEN: gsap.TweenVars = { autoAlpha: 0, y: 18 }
const STEP_SHOWN: gsap.TweenVars = { autoAlpha: 1, duration: 0.35, ease: "power2.out", y: 0 }
const STEP_LEAVING: gsap.TweenVars = { autoAlpha: 0, duration: 0.25, ease: "power1.in", y: -14 }
const STEP_ENTER_LAG = 0.25
const FIRST_STEP_AT = 0.1
const GATE_CLOSE: gsap.TweenVars = { duration: 0.8, ease: "power2.inOut" }
const HOLD: gsap.TweenVars = { duration: 0.7 }
const HOLD_AT = 4.6

const GATE_STAGES = [
  { closes: { g1: 1 }, gateAt: 1.4, swapAt: 1.3 },
  { closes: { g2: 1 }, gateAt: 2.6, swapAt: 2.5 },
  { closes: { g3: 1 }, gateAt: 3.8, swapAt: 3.7 },
] as const

interface HarnessProgress {
  draw: number
  g1: number
  g2: number
  g3: number
}

interface StepSwap {
  readonly at: number
  readonly from: Element | undefined
  readonly to: Element | undefined
}

const swapSteps = (timeline: gsap.core.Timeline, { at, from, to }: StepSwap): void => {
  if (!from || !to) {
    return
  }

  timeline.to(from, { ...STEP_LEAVING }, at).fromTo(to, { ...STEP_HIDDEN }, { ...STEP_SHOWN }, at + STEP_ENTER_LAG)
}

const scrubHarness = (root: HTMLElement, progress: HarnessProgress, render: () => void): void => {
  const steps = [...root.querySelectorAll("[data-step]")]
  gsap.set(steps, { autoAlpha: 0 })

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    onUpdate: render,
    scrollTrigger: { ...HARNESS_SCROLL, trigger: root.querySelector("[data-track]") },
  })
  const [firstStep] = steps

  timeline.to(progress, { ...DRAW_IN }, 0)

  if (firstStep) {
    timeline.fromTo(firstStep, { ...STEP_HIDDEN }, { ...STEP_SHOWN }, FIRST_STEP_AT)
  }

  for (const [index, stage] of GATE_STAGES.entries()) {
    swapSteps(timeline, { at: stage.swapAt, from: steps[index], to: steps[index + NEXT] })
    timeline.to(progress, { ...GATE_CLOSE, ...stage.closes }, stage.gateAt)
  }

  timeline.to({}, { ...HOLD }, HOLD_AT)
}

const animateHarness = (root: HTMLElement, update: (state: HarnessState) => void): (() => void) => {
  const progress: HarnessProgress = { draw: 0, g1: 0, g2: 0, g3: 0 }
  const state: HarnessState = { draw: 0, gates: [0, 0, 0], time: 0 }

  const render = (): void => {
    state.draw = progress.draw
    state.gates[0] = progress.g1
    state.gates[1] = progress.g2
    state.gates[2] = progress.g3
    update(state)
  }

  const tick = (time: number): void => {
    state.time = time
    render()
  }

  render()
  scrubHarness(root, progress, render)

  const observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting === true) {
      gsap.ticker.add(tick)
    } else {
      gsap.ticker.remove(tick)
    }
  })
  const stage = root.querySelector("[data-harness-stage]")

  if (stage) {
    observer.observe(stage)
  }

  return () => {
    observer.disconnect()
    gsap.ticker.remove(tick)
  }
}

const AiHead = (): JSX.Element => {
  const t = useTranslations("pages.landing.ai")

  return (
    <>
      <p className="type-label text-champagne">{t("label")}</p>
      <h2 className="mt-[clamp(0.5rem,1.2svh,1rem)] max-w-[15ch] type-display text-[clamp(2.75rem,min(6.2vw,11svh),9.5rem)]">
        {t("title")}
      </h2>
      <p className="mt-[clamp(0.75rem,2svh,1.75rem)] max-w-[44ch] type-lead text-[clamp(1.125rem,min(1.45vw,2.5svh),2rem)] text-foreground">
        {t("intro")}
      </p>
    </>
  )
}

const AiSteps = (): JSX.Element => {
  const t = useTranslations("pages.landing.ai")

  return (
    <div className="relative flex flex-col gap-8 md:col-span-4 live:block live:h-[clamp(11.5rem,27svh,17rem)] md:live:h-auto">
      {STEPS.map((step) => (
        <div className="live:absolute live:inset-x-0 live:top-0" data-step key={step}>
          <h3 className="type-title text-[clamp(1.625rem,min(2.5vw,4.4svh),3.25rem)]">{t(`${step}Title`)}</h3>
          <p className="mt-[clamp(0.4rem,1svh,0.9rem)] type-body text-[clamp(0.9375rem,min(1.02vw,1.8svh),1.25rem)]">{t(`${step}Body`)}</p>
        </div>
      ))}
    </div>
  )
}

export const AiSection = (): JSX.Element => {
  const t = useTranslations("pages.landing.ai")
  const rootRef = useRef<HTMLElement>(null)
  const diagramRef = useRef<HarnessDiagramHandle>(null)

  useGSAP(
    () => {
      const root = rootRef.current

      if (!root) {
        return
      }

      gsap.matchMedia().add(MEDIA.MOTION_OK, () =>
        animateHarness(root, (state) => {
          diagramRef.current?.update(state)
        }),
      )
    },
    { scope: rootRef },
  )

  return (
    <section className="relative z-10 ground-ink" data-nav-ground={NAV_GROUND.INK} id={SECTION_IDS.AI} ref={rootRef}>
      <Reveal className="frame pt-(--section-y) pb-8 md:hidden">
        <AiHead />
      </Reveal>

      <div className="relative live:h-[360svh]" data-track>
        <div className="flex flex-col live:sticky live:top-0 live:h-svh live:overflow-hidden" data-harness-stage>
          <div className="frame grid gap-x-6 md:grid-cols-12 md:pt-(--section-y) live:pt-[calc(var(--nav-height)+0.5rem)] md:live:pt-[calc(var(--nav-height)+clamp(0.75rem,2svh,1.75rem))]">
            <div className="hidden md:col-span-8 md:block">
              <AiHead />
            </div>
            <AiSteps />
          </div>

          <div className="mt-6 h-[52svh] min-h-0 md:mt-[clamp(0.5rem,2svh,1.5rem)] live:h-auto live:flex-1">
            <HarnessDiagram className="block size-full overflow-visible" ref={diagramRef} />
          </div>
        </div>
      </div>

      <div className="frame pt-[clamp(3rem,6vw,7rem)] pb-(--section-y)">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6 border-t border-border pt-[clamp(1.5rem,2.5vw,3rem)]">
          <p className="max-w-[46ch] type-lead text-lead text-foreground">{t("closing")}</p>
          <CtaLink href={APP_GITHUB_URL}>{t("cta")}</CtaLink>
        </Reveal>
      </div>
    </section>
  )
}
