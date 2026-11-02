"use client"

import { type JSX, useRef } from "react"

import { useTranslations } from "next-intl"

import { gsap, MOTION_OK, useGSAP } from "~/src/lib/gsap"

import { Reveal } from "~/src/components/custom/reveal"

const PRINCIPLES = ["value", "fixed", "aligned"] as const
const WORD = "type-display block text-[clamp(4rem,16vw,26rem)] leading-[0.92]"

export function PricingSection(): JSX.Element {
  const t = useTranslations("custom.pricing")
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(rootRef)

      // Scrolling crosses out the hours, and the outcome takes their place.
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: q("[data-words]")[0], start: "top 75%", end: "top 15%", scrub: 0.4 },
          })
          .fromTo(q("[data-strike]"), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
          .fromTo(q("[data-hours]"), { opacity: 1 }, { opacity: 0.42, duration: 0.6 }, 0.4)
          .fromTo(q("[data-outcomes]"), { yPercent: 26, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: "power2.out" }, 0.45)
      })
    },
    { scope: rootRef },
  )

  return (
    <section
      ref={rootRef}
      id="pricing"
      data-nav-ground="ink"
      className="ground-ink relative z-10 pt-[clamp(4.75rem,5.5vw,6.5rem)] pb-(--section-y)"
    >
      <div className="frame">
        <div className="border-foreground border-t pt-3">
          <p className="type-label text-champagne">{t("label")}</p>
        </div>
        <h2 className="sr-only">{t("title")}</h2>

        <div data-words aria-hidden className="mt-[clamp(1.5rem,3vw,3.5rem)] overflow-hidden pb-[0.1em]">
          <span className={`${WORD} relative w-fit`}>
            <span data-hours className="block opacity-[0.42] live:will-change-[opacity]">
              {t("hours")}
            </span>
            <span
              data-strike
              className="absolute inset-x-[-0.02em] top-[55%] h-[0.055em] origin-left bg-signal live:will-change-transform"
            />
          </span>
          <span data-outcomes className={`${WORD} text-champagne`}>
            {t("outcomes")}
          </span>
        </div>

        <Reveal className="mt-[clamp(1.75rem,3.5vw,4rem)]">
          <p className="type-lead max-w-[38ch] text-[clamp(1.5rem,2.6vw,3.5rem)] text-foreground">{t("lead")}</p>
        </Reveal>

        <ol className="mt-[clamp(3rem,6vw,7rem)] grid gap-y-10 border-border border-t pt-[clamp(1.75rem,2.6vw,3.25rem)] md:grid-cols-3 md:gap-x-6">
          {PRINCIPLES.map((principle, index) => (
            <li key={principle}>
              <Reveal delay={index * 0.08}>
                <h3 className="type-title text-[clamp(1.5rem,2.3vw,3.25rem)] text-foreground">{t(`${principle}Title`)}</h3>
                <p className="type-body mt-[clamp(0.75rem,1.1vw,1.5rem)] max-w-[44ch]">{t(`${principle}Body`)}</p>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className="mt-[clamp(3.5rem,7vw,8rem)]">
          <p className="type-lead max-w-[48ch] text-foreground text-lead">{t("closing")}</p>
        </Reveal>
      </div>
    </section>
  )
}
