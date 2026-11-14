import type { JSX, ReactNode } from "react"

import { useTranslations } from "use-intl/react"

import { NAV_GROUND, SECTION_IDS } from "~/src/data/marketing"

import { ArrowUpRightIcon } from "~/src/presentation/components/custom/icons"
import { ImageReveal } from "~/src/presentation/components/custom/landing-page/components/image-reveal"
import { Reveal } from "~/src/presentation/components/custom/landing-page/components/reveal"
import { RollText } from "~/src/presentation/components/custom/landing-page/components/roll-text"
import { SectionHead } from "~/src/presentation/components/custom/landing-page/components/section-head"

import { GITHUB_PROFILE_URL, LINKEDIN_PROFILE_URL } from "~/src/presentation/branding"

const PRINCIPLES = ["ownership", "quality", "candour"] as const

const LEDGER_VALUE = "type-title mt-2 text-[clamp(1.5rem,2.5vw,3.25rem)] text-foreground"

const SECOND_COLUMN_DELAY = 0.08

const STRONG_TAGS = { strong: (chunks: ReactNode) => <strong>{chunks}</strong> }
const SEMIBOLD_TAGS = { strong: (chunks: ReactNode) => <strong className="font-semibold">{chunks}</strong> }

interface LedgerLinkProps {
  readonly href: string
  readonly label: string
}

const LedgerLink = ({ href, label }: LedgerLinkProps): JSX.Element => (
  <a className="group inline-flex items-center gap-1.5" href={href} rel="noopener noreferrer" target="_blank">
    <RollText>{label}</RollText>
    <ArrowUpRightIcon className="size-[0.8em] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
  </a>
)

const AboutStory = (): JSX.Element => {
  const t = useTranslations("pages.landing.about")

  return (
    <div className="relative mt-[clamp(2rem,4vw,4.5rem)]">
      <div className="md:sticky md:top-0">
        <ImageReveal
          alt={t("photoAlt")}
          caption={
            <>
              <span className="block text-[0.8125rem] text-cream/85">{t("location")}</span>
              <span className="block type-title text-[1.375rem]">{t("krakow")}</span>
            </>
          }
          className="aspect-[3/2] md:aspect-auto md:h-svh"
          name="advisor-meeting"
          sizes="100vw"
        />
      </div>

      <div className="relative z-10 frame md:grid md:grid-cols-12 md:gap-x-6">
        <article className="-mx-(--gutter) bg-background px-(--gutter) pt-10 pb-4 md:col-span-7 md:col-start-6 md:mx-0 md:-mt-[42svh] md:px-[clamp(2rem,3.4vw,4.5rem)] md:py-[clamp(2.5rem,4vw,5rem)] md:shadow-[0_40px_90px_-50px_rgb(13_21_38/60%)]">
          <Reveal>
            <p className="type-lead text-lead text-foreground">{t.rich("description", SEMIBOLD_TAGS)}</p>
          </Reveal>

          <div className="mt-[clamp(2rem,3.4vw,4rem)] grid gap-x-6 gap-y-8 border-t border-border pt-5 md:grid-cols-2">
            <Reveal>
              <h3 className="type-label text-foreground">{t("backgroundTitle")}</h3>
              <p className="mt-3 type-body">{t.rich("backgroundText", STRONG_TAGS)}</p>
            </Reveal>
            <Reveal delay={SECOND_COLUMN_DELAY}>
              <h3 className="type-label text-foreground">{t("expertiseTitle")}</h3>
              <p className="mt-3 type-body">{t.rich("expertiseText", STRONG_TAGS)}</p>
            </Reveal>
          </div>
        </article>
      </div>
    </div>
  )
}

const AboutTerms = (): JSX.Element => {
  const t = useTranslations("pages.landing.about")

  return (
    <div className="relative z-10 ground-ink" data-nav-ground={NAV_GROUND.INK}>
      <div className="frame pt-[clamp(3.5rem,7vw,8rem)] pb-[clamp(3.5rem,7vw,8rem)]">
        <Reveal variant="slide-right">
          <blockquote className="type-display text-[clamp(2.125rem,5vw,7rem)] [text-wrap:pretty] text-foreground md:w-[88%]">
            {t("quote")}
          </blockquote>
        </Reveal>

        <div className="mt-[clamp(2.5rem,5vw,6rem)] border-t border-foreground pt-3">
          <p className="type-label text-foreground">{t("principlesLabel")}</p>
          <ol className="mt-[clamp(1.5rem,2.6vw,3rem)] grid gap-x-6 gap-y-8 md:grid-cols-3">
            {PRINCIPLES.map((principle) => (
              <li key={principle}>
                <Reveal>
                  <h3 className="type-title text-[clamp(1.5rem,2.3vw,3.25rem)] text-foreground">{t(`${principle}Title`)}</h3>
                  <p className="mt-3 max-w-[42ch] type-body">{t(`${principle}Body`)}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>

        <dl className="mt-[clamp(3rem,6vw,7rem)] grid grid-cols-2 gap-x-6 gap-y-8 border-t border-foreground pt-3 md:grid-cols-4">
          <div>
            <dt className="type-label">{t("education")}</dt>
            <dd className={LEDGER_VALUE}>{t("degree")}</dd>
            <dd className="mt-1 type-label">{t("university")}</dd>
          </div>
          <div>
            <dt className="type-label">{t("experience")}</dt>
            <dd className={LEDGER_VALUE}>{t("years")}</dd>
            <dd className="mt-1 type-label">{t("company")}</dd>
          </div>
          <div>
            <dt className="type-label">{t("codebases")}</dt>
            <dd className={LEDGER_VALUE}>
              <LedgerLink href={GITHUB_PROFILE_URL} label="GitHub" />
            </dd>
          </div>
          <div>
            <dt className="type-label">{t("network")}</dt>
            <dd className={LEDGER_VALUE}>
              <LedgerLink href={LINKEDIN_PROFILE_URL} label="LinkedIn" />
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export const AboutSection = (): JSX.Element => {
  const t = useTranslations("pages.landing.about")

  return (
    <section
      className="relative z-10 bg-background pt-[clamp(4.75rem,5.5vw,6.5rem)] live:-mt-[30svh]"
      data-nav-ground={NAV_GROUND.PAPER}
      id={SECTION_IDS.INTRO}
    >
      <SectionHead label={t("sectionHeader")} title={t("title")} />
      <AboutStory />
      <AboutTerms />
    </section>
  )
}
