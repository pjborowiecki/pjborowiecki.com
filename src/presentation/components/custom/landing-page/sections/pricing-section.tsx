import { type JSX, useRef } from "react"

import { useTranslations } from "use-intl/react"

import { MOTION_OK, gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

import { NAV_GROUND, SECTION_IDS } from "~/src/data/marketing"

import { cn } from "~/src/lib/cn"

import { Reveal } from "~/src/presentation/components/custom/landing-page/components/reveal"

const PRINCIPLES = ["value", "fixed", "aligned"] as const
const WORD = "type-display block text-[clamp(4rem,16vw,26rem)] leading-[0.92]"

const STAGGER_SECONDS = 0.08

const STRIKE_AT = 0
const FADE_HOURS_AT = 0.4
const RAISE_OUTCOMES_AT = 0.45

const STRIKE_TRIGGER = { end: "top 15%", scrub: 0.4, start: "top 75%" } as const

export const PricingSection = (): JSX.Element => {
  const t = useTranslations("pages.landing.pricing")
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const select = gsap.utils.selector(rootRef)
      const [words] = select("[data-words]")
      if (words === undefined) {
        return
      }

      gsap.matchMedia().add(MOTION_OK, () => {
        gsap
          .timeline({ defaults: { ease: "none" }, scrollTrigger: { ...STRIKE_TRIGGER, trigger: words } })
          .fromTo(select("[data-strike]"), { scaleX: 0 }, { duration: 1, scaleX: 1 }, STRIKE_AT)
          .fromTo(select("[data-hours]"), { opacity: 1 }, { duration: 0.6, opacity: 0.42 }, FADE_HOURS_AT)
          .fromTo(
            select("[data-outcomes]"),
            { opacity: 0, yPercent: 26 },
            { duration: 0.7, ease: "power2.out", opacity: 1, yPercent: 0 },
            RAISE_OUTCOMES_AT,
          )
      })
    },
    { scope: rootRef },
  )

  return (
    <section
      className="relative z-10 ground-ink pt-[clamp(4.75rem,5.5vw,6.5rem)] pb-(--section-y)"
      data-nav-ground={NAV_GROUND.INK}
      id={SECTION_IDS.PRICING}
      ref={rootRef}
    >
      <div className="frame">
        <div className="border-t border-foreground pt-3">
          <p className="type-label text-champagne">{t("label")}</p>
        </div>
        <h2 className="sr-only">{t("title")}</h2>

        <div aria-hidden className="mt-[clamp(1.5rem,3vw,3.5rem)] overflow-hidden pb-[0.1em]" data-words>
          <span className={cn(WORD, "relative w-fit")}>
            <span className="block opacity-[0.42] live:will-change-[opacity]" data-hours>
              {t("hours")}
            </span>
            <span
              className="absolute inset-x-[-0.02em] top-[55%] h-[0.055em] origin-left bg-signal live:will-change-transform"
              data-strike
            />
          </span>
          <span className={cn(WORD, "text-champagne")} data-outcomes>
            {t("outcomes")}
          </span>
        </div>

        <Reveal className="mt-[clamp(1.75rem,3.5vw,4rem)]">
          <p className="max-w-[38ch] type-lead text-[clamp(1.5rem,2.6vw,3.5rem)] text-foreground">{t("lead")}</p>
        </Reveal>

        <ol className="mt-[clamp(3rem,6vw,7rem)] grid gap-y-10 border-t border-border pt-[clamp(1.75rem,2.6vw,3.25rem)] md:grid-cols-3 md:gap-x-6">
          {PRINCIPLES.map((principle, index) => (
            <li key={principle}>
              <Reveal delay={index * STAGGER_SECONDS}>
                <h3 className="type-title text-[clamp(1.5rem,2.3vw,3.25rem)] text-foreground">{t(`${principle}Title`)}</h3>
                <p className="mt-[clamp(0.75rem,1.1vw,1.5rem)] max-w-[44ch] type-body">{t(`${principle}Body`)}</p>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className="mt-[clamp(3.5rem,7vw,8rem)]">
          <p className="max-w-[48ch] type-lead text-lead text-foreground">{t("closing")}</p>
        </Reveal>
      </div>
    </section>
  )
}
