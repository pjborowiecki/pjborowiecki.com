"use client"

import { type JSX, useRef } from "react"

import { useTranslations } from "next-intl"

import { gsap, MOTION_OK, useGSAP } from "~/src/lib/gsap"

import { ArrowRightIcon } from "~/src/components/custom/icons"
import { Reveal } from "~/src/components/custom/reveal"
import { RollText } from "~/src/components/custom/roll-text"
import { SplitHeading } from "~/src/components/custom/split-heading"

const TAKEAWAYS = ["takeaway1", "takeaway2", "takeaway3"] as const

/** The one moment on the page that only asks for one thing. The emerald opens out to the edges and the whole bar is the button. */
export function ConsultSection(): JSX.Element {
  const t = useTranslations("custom.consult")
  const rootRef = useRef<HTMLElement>(null)
  const groundRef = useRef<HTMLDivElement>(null)
  const lightRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      const light = lightRef.current
      if (!root || !light) return

      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.fromTo(
          groundRef.current,
          { scaleX: 0.9 },
          { scaleX: 1, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "top 40%", scrub: true } },
        )

        if (!globalThis.matchMedia("(pointer: fine)").matches) return

        // The same lamp as the hero. Moved, never repainted.
        gsap.set(light, { xPercent: -50, yPercent: -50 })
        const toX = gsap.quickTo(light, "x", { duration: 1.1, ease: "power3" })
        const toY = gsap.quickTo(light, "y", { duration: 1.1, ease: "power3" })
        const onMove = (event: PointerEvent) => {
          const rect = root.getBoundingClientRect()
          toX(event.clientX - rect.left)
          toY(event.clientY - rect.top)
        }
        const onEnter = () => gsap.to(light, { autoAlpha: 1, duration: 0.6, overwrite: "auto" })
        const onLeave = () => gsap.to(light, { autoAlpha: 0, duration: 0.8, overwrite: "auto" })

        root.addEventListener("pointermove", onMove, { passive: true })
        root.addEventListener("pointerenter", onEnter)
        root.addEventListener("pointerleave", onLeave)
        return () => {
          root.removeEventListener("pointermove", onMove)
          root.removeEventListener("pointerenter", onEnter)
          root.removeEventListener("pointerleave", onLeave)
        }
      })
    },
    { scope: rootRef },
  )

  return (
    <section ref={rootRef} id="consult" data-nav-ground="emerald" className="relative z-10 overflow-clip bg-background">
      <div ref={groundRef} aria-hidden className="ground-emerald absolute inset-0 will-change-transform" />
      <div
        ref={lightRef}
        aria-hidden
        className="pointer-events-none invisible absolute top-0 left-0 size-[64vw] rounded-full bg-[radial-gradient(closest-side,rgb(34_168_124/42%),transparent)] opacity-0 will-change-transform"
      />

      <div className="ground-tokens frame relative pt-[calc(var(--nav-bar-height)+clamp(1.25rem,3vw,3.5rem))] pb-[clamp(1.25rem,var(--gutter),4rem)] text-cream max-md:pb-12">
        <Reveal variant="slide-right">
          <p className="type-label text-champagne">{t("label")}</p>
        </Reveal>

        <SplitHeading className="type-display mt-[clamp(1rem,2vw,2.5rem)] max-w-[13ch] text-[clamp(3.25rem,min(10vw,19svh),15rem)] max-md:text-[2.75rem]">
          {t("title")}
        </SplitHeading>

        <div className="mt-[clamp(2rem,3.9vw,5rem)] grid gap-x-6 gap-y-8 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <p className="type-lead max-w-[30ch] text-[clamp(1.375rem,1.9vw,2.625rem)] text-cream max-md:text-[1.1875rem]">{t("body")}</p>
          </Reveal>

          <Reveal className="md:col-span-6 md:col-start-7">
            <p className="type-label text-champagne">{t("takeawaysLabel")}</p>
            <ul className="mt-[clamp(0.75rem,1vw,1.25rem)] border-cream/22 border-b">
              {TAKEAWAYS.map((takeaway) => (
                <li
                  key={takeaway}
                  className="flex items-center gap-[0.75em] border-cream/22 border-t py-[clamp(0.6rem,0.95vw,1.15rem)] text-[clamp(1rem,1.25vw,1.625rem)] tracking-[-0.012em]"
                >
                  <span aria-hidden className="size-[0.34em] shrink-0 rounded-full bg-champagne" />
                  {t(takeaway)}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal className="mt-[clamp(2rem,3.4vw,4.5rem)]">
          <a
            href="#contact"
            className="group relative flex items-stretch justify-between overflow-hidden bg-cream text-[#121412] [--cell:clamp(4.5rem,7.4vw,10rem)] active:translate-y-px max-md:[--cell:3.5rem]"
          >
            <span
              aria-hidden
              className="absolute inset-0 bg-champagne transition-[clip-path] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [clip-path:inset(0_0_0_calc(100%-var(--cell)))] group-hover:[clip-path:inset(0_0_0_0)] group-focus-visible:[clip-path:inset(0_0_0_0)]"
            />
            <span className="relative flex min-h-(--cell) items-center px-[clamp(1.125rem,2.6vw,3.5rem)] py-3 font-display font-medium text-[clamp(1.375rem,3.9vw,5.5rem)] leading-[1.1] tracking-[-0.035em] max-md:px-4 max-md:text-[1.1875rem] max-md:tracking-[-0.02em]">
              <RollText>{t("cta")}</RollText>
            </span>
            <span className="relative flex w-(--cell) shrink-0 items-center justify-center">
              <ArrowRightIcon className="size-[38%] transition-transform duration-500 ease-out group-hover:translate-x-[12%]" />
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
