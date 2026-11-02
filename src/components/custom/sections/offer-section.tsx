"use client"

import type { JSX } from "react"

import { useTranslations } from "next-intl"

import { CtaLink } from "~/src/components/custom/cta-link"
import { Reveal } from "~/src/components/custom/reveal"
import { SectionHead } from "~/src/components/custom/section-head"

const STEPS = ["audit", "build", "retain"] as const

export function OfferSection(): JSX.Element {
  const t = useTranslations("custom.offer")

  return (
    <section id="offer" data-nav-ground="paper" className="relative z-10 bg-background pt-[clamp(4.75rem,5.5vw,6.5rem)] pb-(--section-y)">
      <SectionHead label={t("label")} title={t("title")} />

      <ol className="frame mt-[clamp(2.5rem,5vw,6rem)] grid gap-y-10 md:grid-cols-3 md:gap-x-6">
        {STEPS.map((step, index) => (
          <li key={step} className="group relative border-border border-t pt-3">
            {/* Hover: the rule is redrawn in emerald, as on the rows above. */}
            <span
              aria-hidden
              className="absolute -top-px left-0 h-0.5 w-full origin-left scale-x-0 bg-emerald transition-transform duration-500 ease-out group-hover:scale-x-100"
            />
            <Reveal delay={index * 0.08}>
              <p className="type-label flex items-baseline justify-between gap-4">
                <span aria-hidden>{String(index + 1).padStart(2, "0")}</span>
                <span className="text-emerald">{t(`${step}Tag`)}</span>
              </p>
              <h3 className="type-title mt-[clamp(1.5rem,3vw,3.5rem)] text-[clamp(1.75rem,2.9vw,4rem)] text-foreground">
                {t(`${step}Title`)}
              </h3>
              <p className="type-body mt-4 max-w-[46ch]">{t(`${step}Body`)}</p>
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal className="frame mt-[clamp(3.5rem,7vw,8rem)]">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <p className="type-lead max-w-[44ch] text-foreground text-lead">{t("filter")}</p>
          <CtaLink href="#contact">{t("cta")}</CtaLink>
        </div>
      </Reveal>
    </section>
  )
}
