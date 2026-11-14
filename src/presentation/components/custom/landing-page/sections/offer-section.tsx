import type { JSX } from "react"

import { useTranslations } from "use-intl/react"

import { NAV_GROUND, SECTION_IDS, sectionHref } from "~/src/data/marketing"

import { CtaLink } from "~/src/presentation/components/custom/landing-page/components/cta-link"
import { Reveal } from "~/src/presentation/components/custom/landing-page/components/reveal"
import { SectionHead } from "~/src/presentation/components/custom/landing-page/components/section-head"

const STEPS = ["audit", "build", "retain"] as const

const STAGGER_SECONDS = 0.08
const ORDINAL_OFFSET = 1
const ORDINAL_DIGITS = 2

export const OfferSection = (): JSX.Element => {
  const t = useTranslations("pages.landing.offer")

  return (
    <section
      className="relative z-10 bg-background pt-[clamp(4.75rem,5.5vw,6.5rem)] pb-(--section-y)"
      data-nav-ground={NAV_GROUND.PAPER}
      id={SECTION_IDS.OFFER}
    >
      <SectionHead label={t("label")} title={t("title")} />

      <ol className="frame mt-[clamp(2.5rem,5vw,6rem)] grid gap-y-10 md:grid-cols-3 md:gap-x-6">
        {STEPS.map((step, index) => (
          <li className="group relative border-t border-border pt-3" key={step}>
            <span
              aria-hidden
              className="absolute -top-px left-0 h-0.5 w-full origin-left scale-x-0 bg-emerald transition-transform duration-500 ease-out group-hover:scale-x-100"
            />
            <Reveal delay={index * STAGGER_SECONDS}>
              <p className="flex items-baseline justify-between gap-4 type-label">
                <span aria-hidden>{String(index + ORDINAL_OFFSET).padStart(ORDINAL_DIGITS, "0")}</span>
                <span className="text-emerald">{t(`${step}Tag`)}</span>
              </p>
              <h3 className="mt-[clamp(1.5rem,3vw,3.5rem)] type-title text-[clamp(1.75rem,2.9vw,4rem)] text-foreground">
                {t(`${step}Title`)}
              </h3>
              <p className="mt-4 max-w-[46ch] type-body">{t(`${step}Body`)}</p>
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal className="frame mt-[clamp(3.5rem,7vw,8rem)]">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <p className="max-w-[44ch] type-lead text-lead text-foreground">{t("filter")}</p>
          <CtaLink href={sectionHref(SECTION_IDS.CONTACT)}>{t("cta")}</CtaLink>
        </div>
      </Reveal>
    </section>
  )
}
