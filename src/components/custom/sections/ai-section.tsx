"use client"

import { type JSX, useRef } from "react"

import { useTranslations } from "next-intl"

import { gsap, MOTION_OK, useGSAP } from "~/src/lib/gsap"

import { CtaLink } from "~/src/components/custom/cta-link"
import { HarnessDiagram, type HarnessDiagramHandle, type HarnessState } from "~/src/components/custom/harness-diagram"
import { Reveal } from "~/src/components/custom/reveal"

const STEPS = ["mess", "guardrails", "harness", "judgment"] as const

/** The case for judgment: the same untangling idea, now about what AI produces. Output in, three gates, little survives. */
export function AiSection(): JSX.Element {
  const t = useTranslations("custom.ai")
  const rootRef = useRef<HTMLElement>(null)
  const diagramRef = useRef<HarnessDiagramHandle>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      const q = gsap.utils.selector(root)

      gsap.matchMedia().add(MOTION_OK, () => {
        const progress = { draw: 0, g1: 0, g2: 0, g3: 0 }
        const state: HarnessState = { draw: 0, gates: [0, 0, 0], time: 0 }
        const render = () => {
          state.draw = progress.draw
          state.gates[0] = progress.g1
          state.gates[1] = progress.g2
          state.gates[2] = progress.g3
          diagramRef.current?.update(state)
        }
        render()

        const steps = q<HTMLElement>("[data-step]")
        gsap.set(steps, { autoAlpha: 0 })

        const swap = (from: Element, to: Element, at: number) => {
          timeline
            .to(from, { autoAlpha: 0, y: -14, duration: 0.25, ease: "power1.in" }, at)
            .fromTo(to, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, at + 0.25)
        }

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: render,
          scrollTrigger: { trigger: q("[data-track]")[0], start: "top top", end: "bottom bottom", scrub: 0.5 },
        })

        timeline
          .to(progress, { draw: 1, duration: 0.9, ease: "power1.inOut" }, 0)
          .fromTo(steps[0], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, 0.1)
        swap(steps[0], steps[1], 1.3)
        timeline.to(progress, { g1: 1, duration: 0.8, ease: "power2.inOut" }, 1.4)
        swap(steps[1], steps[2], 2.5)
        timeline.to(progress, { g2: 1, duration: 0.8, ease: "power2.inOut" }, 2.6)
        swap(steps[2], steps[3], 3.7)
        timeline.to(progress, { g3: 1, duration: 0.8, ease: "power2.inOut" }, 3.8)
        timeline.to({}, { duration: 0.7 }, 4.6)

        // What has not been through the gates keeps moving, but only while it can be seen.
        const tick = (time: number) => {
          state.time = time
          render()
        }
        const observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) gsap.ticker.add(tick)
          else gsap.ticker.remove(tick)
        })
        const stage = q("[data-harness-stage]")[0]
        if (stage) observer.observe(stage)

        return () => {
          observer.disconnect()
          gsap.ticker.remove(tick)
        }
      })
    },
    { scope: rootRef },
  )

  const head = (
    <>
      <p className="type-label text-champagne">{t("label")}</p>
      <h2 className="type-display mt-[clamp(0.5rem,1.2svh,1rem)] max-w-[15ch] text-[clamp(2.75rem,min(6.2vw,11svh),9.5rem)]">
        {t("title")}
      </h2>
      <p className="type-lead mt-[clamp(0.75rem,2svh,1.75rem)] max-w-[44ch] text-[clamp(1.125rem,min(1.45vw,2.5svh),2rem)] text-foreground">
        {t("intro")}
      </p>
    </>
  )

  return (
    <section ref={rootRef} id="ai" data-nav-ground="ink" className="ground-ink relative z-10">
      <Reveal className="frame pt-(--section-y) pb-8 md:hidden">{head}</Reveal>

      <div data-track className="relative live:h-[360svh]">
        <div data-harness-stage className="live:sticky live:top-0 flex live:h-svh flex-col live:overflow-hidden">
          <div className="frame grid gap-x-6 live:pt-[calc(var(--nav-height)+0.5rem)] md:grid-cols-12 md:live:pt-[calc(var(--nav-height)+clamp(0.75rem,2svh,1.75rem))] md:pt-(--section-y)">
            <div className="hidden md:col-span-8 md:block">{head}</div>
            <div className="relative live:block flex live:h-[clamp(11.5rem,27svh,17rem)] flex-col gap-8 md:col-span-4 md:live:h-auto">
              {STEPS.map((step) => (
                <div key={step} data-step className="live:absolute live:inset-x-0 live:top-0">
                  <h3 className="type-title text-[clamp(1.625rem,min(2.5vw,4.4svh),3.25rem)]">{t(`${step}Title`)}</h3>
                  <p className="type-body mt-[clamp(0.4rem,1svh,0.9rem)] text-[clamp(0.9375rem,min(1.02vw,1.8svh),1.25rem)]">
                    {t(`${step}Body`)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 h-[52svh] live:h-auto min-h-0 live:flex-1 md:mt-[clamp(0.5rem,2svh,1.5rem)]">
            <HarnessDiagram ref={diagramRef} className="block size-full overflow-visible" />
          </div>
        </div>
      </div>

      <div className="frame pt-[clamp(3rem,6vw,7rem)] pb-(--section-y)">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6 border-border border-t pt-[clamp(1.5rem,2.5vw,3rem)]">
          <p className="type-lead max-w-[46ch] text-foreground text-lead">{t("closing")}</p>
          <CtaLink href="#offer">{t("cta")}</CtaLink>
        </Reveal>
      </div>
    </section>
  )
}
