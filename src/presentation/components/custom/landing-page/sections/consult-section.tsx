import { type JSX, useRef } from "react"

import { useTranslations } from "use-intl/react"

import { MOTION_OK, gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

import { NAV_GROUND, SECTION_IDS, sectionHref } from "~/src/data/marketing"

import { ArrowRightIcon } from "~/src/presentation/components/custom/icons"
import { Reveal } from "~/src/presentation/components/custom/landing-page/components/reveal"
import { RollText } from "~/src/presentation/components/custom/landing-page/components/roll-text"
import { SplitHeading } from "~/src/presentation/components/custom/landing-page/components/split-heading"

const TAKEAWAYS = ["takeaway1", "takeaway2", "takeaway3"] as const

const FINE_POINTER = "(pointer: fine)"

const GROUND_OPEN = {
  from: { scaleX: 0.9 },
  to: { ease: "none", scaleX: 1 },
  trigger: { end: "top 40%", scrub: true, start: "top bottom" },
} as const

const LAMP_CENTRED: gsap.TweenVars = { xPercent: -50, yPercent: -50 }
const LAMP_FOLLOW: gsap.TweenVars = { duration: 1.1, ease: "power3" }
const LAMP_ON: gsap.TweenVars = { autoAlpha: 1, duration: 0.6, overwrite: "auto" }
const LAMP_OFF: gsap.TweenVars = { autoAlpha: 0, duration: 0.8, overwrite: "auto" }

const followPointer = (root: HTMLElement, lamp: HTMLElement): (() => void) => {
  gsap.set(lamp, LAMP_CENTRED)
  const toX = gsap.quickTo(lamp, "x", LAMP_FOLLOW)
  const toY = gsap.quickTo(lamp, "y", LAMP_FOLLOW)

  const onMove = (event: PointerEvent): void => {
    const bounds = root.getBoundingClientRect()
    toX(event.clientX - bounds.left)
    toY(event.clientY - bounds.top)
  }
  const onEnter = (): void => {
    gsap.to(lamp, LAMP_ON)
  }
  const onLeave = (): void => {
    gsap.to(lamp, LAMP_OFF)
  }

  root.addEventListener("pointermove", onMove, { passive: true })
  root.addEventListener("pointerenter", onEnter)
  root.addEventListener("pointerleave", onLeave)

  return () => {
    root.removeEventListener("pointermove", onMove)
    root.removeEventListener("pointerenter", onEnter)
    root.removeEventListener("pointerleave", onLeave)
  }
}

export const ConsultSection = (): JSX.Element => {
  const t = useTranslations("pages.landing.consult")
  const rootRef = useRef<HTMLElement>(null)
  const groundRef = useRef<HTMLDivElement>(null)
  const lampRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      const lamp = lampRef.current
      if (!root || !lamp) {
        return
      }

      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.fromTo(groundRef.current, GROUND_OPEN.from, { ...GROUND_OPEN.to, scrollTrigger: { ...GROUND_OPEN.trigger, trigger: root } })

        if (!globalThis.matchMedia(FINE_POINTER).matches) {
          return
        }

        return followPointer(root, lamp)
      })
    },
    { scope: rootRef },
  )

  return (
    <section
      className="relative z-10 overflow-clip bg-background"
      data-nav-ground={NAV_GROUND.EMERALD}
      id={SECTION_IDS.CONSULT}
      ref={rootRef}
    >
      <div aria-hidden className="absolute inset-0 ground-emerald will-change-transform" ref={groundRef} />
      <div
        aria-hidden
        className="pointer-events-none invisible absolute top-0 left-0 size-[64vw] rounded-full bg-[radial-gradient(closest-side,rgb(34_168_124/42%),transparent)] opacity-0 will-change-transform"
        ref={lampRef}
      />

      <div className="relative frame pt-[calc(var(--nav-bar-height)+clamp(1.25rem,3vw,3.5rem))] pb-[clamp(1.25rem,var(--gutter),4rem)] text-cream ground-tokens max-md:pb-12">
        <Reveal variant="slide-right">
          <p className="type-label text-champagne">{t("label")}</p>
        </Reveal>

        <SplitHeading className="mt-[clamp(1rem,2vw,2.5rem)] max-w-[13ch] type-display text-[clamp(3.25rem,min(10vw,19svh),15rem)] max-md:text-[2.75rem]">
          {t("title")}
        </SplitHeading>

        <div className="mt-[clamp(2rem,3.9vw,5rem)] grid gap-x-6 gap-y-8 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <p className="max-w-[30ch] type-lead text-[clamp(1.375rem,1.9vw,2.625rem)] text-cream max-md:text-[1.1875rem]">{t("body")}</p>
          </Reveal>

          <Reveal className="md:col-span-6 md:col-start-7">
            <p className="type-label text-champagne">{t("takeawaysLabel")}</p>
            <ul className="mt-[clamp(0.75rem,1vw,1.25rem)] border-b border-cream/22">
              {TAKEAWAYS.map((takeaway) => (
                <li
                  className="flex items-center gap-[0.75em] border-t border-cream/22 py-[clamp(0.6rem,0.95vw,1.15rem)] text-[clamp(1rem,1.25vw,1.625rem)] tracking-[-0.012em]"
                  key={takeaway}
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
            className="group relative flex items-stretch justify-between overflow-hidden bg-cream text-[#121412] [--cell:clamp(4.5rem,7.4vw,10rem)] active:translate-y-px max-md:[--cell:3.5rem]"
            href={sectionHref(SECTION_IDS.CONTACT)}
          >
            <span
              aria-hidden
              className="absolute inset-0 bg-champagne transition-[clip-path] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [clip-path:inset(0_0_0_calc(100%-var(--cell)))] group-hover:[clip-path:inset(0_0_0_0)] group-focus-visible:[clip-path:inset(0_0_0_0)]"
            />
            <span className="relative flex min-h-(--cell) items-center px-[clamp(1.125rem,2.6vw,3.5rem)] py-3 font-display text-[clamp(1.375rem,3.9vw,5.5rem)] leading-[1.1] font-medium tracking-[-0.035em] max-md:px-4 max-md:text-[1.1875rem] max-md:tracking-[-0.02em]">
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
