import type { JSX } from "react"

import { useFormatter, useTranslations } from "use-intl/react"

import { ARTICLES } from "~/src/data/articles"
import { NAV_GROUND, SECTION_IDS } from "~/src/data/marketing"

import { Reveal } from "~/src/presentation/components/custom/landing-page/components/reveal"
import { SectionHead } from "~/src/presentation/components/custom/landing-page/components/section-head"

const PUBLISHED_FORMAT = { month: "short", year: "numeric" } as const

export const InsightsSection = (): JSX.Element => {
  const t = useTranslations("pages.landing.insights")
  const format = useFormatter()

  return (
    <section
      className="relative z-10 bg-background pt-[clamp(4.75rem,5.5vw,6.5rem)] pb-(--section-y)"
      data-nav-ground={NAV_GROUND.PAPER}
      id={SECTION_IDS.INSIGHTS}
    >
      <SectionHead label={t("subtitle")} title={t("title")} />

      <ul className="frame mt-[clamp(2.5rem,5vw,6rem)]">
        {ARTICLES.map(({ id, publishedOn }) => (
          <li className="group relative border-t border-border last:border-b" key={id}>
            <span
              aria-hidden
              className="absolute -top-px left-0 h-0.5 w-full origin-left scale-x-0 bg-emerald transition-transform duration-500 ease-out group-hover:scale-x-100"
            />
            <Reveal>
              <article className="grid gap-y-3 py-[clamp(1.25rem,2.4vw,2.75rem)] md:grid-cols-12 md:gap-x-6">
                <p className="type-label md:col-span-2">
                  {format.dateTime(new Date(publishedOn), PUBLISHED_FORMAT)}
                  <br className="hidden md:block" />
                  <span className="md:hidden">{" · "}</span>
                  {t(`articles.${id}.category`)}
                </p>
                <h3 className="type-title text-[clamp(1.5rem,2.7vw,3.5rem)] transition-[color,translate] duration-500 ease-out group-hover:translate-x-3 group-hover:text-emerald md:col-span-6">
                  {t(`articles.${id}.title`)}
                </h3>
                <div className="md:col-span-4">
                  <p className="type-body">{t(`articles.${id}.excerpt`)}</p>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}
