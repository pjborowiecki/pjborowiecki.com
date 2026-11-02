"use client"

import type { JSX } from "react"

import { useTranslations } from "next-intl"

import { CONSTANTS } from "~/src/constants"

import { ArrowUpRightIcon } from "~/src/components/custom/icons"
import { ImageReveal } from "~/src/components/custom/image-reveal"
import { Reveal } from "~/src/components/custom/reveal"
import { RollText } from "~/src/components/custom/roll-text"
import { SectionHead } from "~/src/components/custom/section-head"

function LedgerLink({ href, label }: Readonly<{ href?: string; label: string }>): JSX.Element {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5">
      <RollText>{label}</RollText>
      <ArrowUpRightIcon className="size-[0.8em] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  )
}

const COMMITMENTS = ["direct", "scope", "risk"] as const

const LEDGER_VALUE = "type-title mt-2 text-[clamp(1.5rem,2.5vw,3.25rem)] text-foreground"

export function AboutSection(): JSX.Element {
  const t = useTranslations("custom.about")
  const github = CONSTANTS.SOCIAL_LINKS.find((link) => link.name === "GitHub")?.url
  const linkedin = CONSTANTS.SOCIAL_LINKS.find((link) => link.name === "LinkedIn")?.url

  return (
    <section id="intro" data-nav-ground="paper" className="relative z-10 live:-mt-[30svh] bg-background pt-[clamp(4.75rem,5.5vw,6.5rem)]">
      <SectionHead label={t("sectionHeader")} title={t("title")} />

      {/* The photograph holds still while the account of the work slides up over it. */}
      <div className="relative mt-[clamp(2rem,4vw,4.5rem)]">
        <div className="md:sticky md:top-0">
          <ImageReveal
            src="/images/site/advisor-meeting.webp"
            alt={t("photoAlt")}
            sizes="100vw"
            className="aspect-[3/2] md:aspect-auto md:h-svh"
            caption={
              <>
                <span className="block text-[0.8125rem] text-cream/75">{t("location")}</span>
                <span className="type-title block text-[1.375rem]">{t("krakow")}</span>
              </>
            }
          />
        </div>

        <div className="frame relative z-10 md:grid md:grid-cols-12 md:gap-x-6">
          <article className="-mx-(--gutter) bg-background px-(--gutter) pt-10 pb-4 md:col-span-7 md:col-start-6 md:mx-0 md:-mt-[42svh] md:px-[clamp(2rem,3.4vw,4.5rem)] md:py-[clamp(2.5rem,4vw,5rem)] md:shadow-[0_40px_90px_-50px_rgb(13_21_38/60%)]">
            <Reveal>
              <p className="type-lead text-foreground text-lead">
                {t.rich("description", {
                  strong: (chunks) => <strong className="font-semibold">{chunks}</strong>,
                })}
              </p>
            </Reveal>

            <div className="mt-[clamp(2rem,3.4vw,4rem)] grid gap-x-6 gap-y-8 border-border border-t pt-5 md:grid-cols-2">
              <Reveal>
                <h3 className="type-label text-foreground">{t("backgroundTitle")}</h3>
                <p className="type-body mt-3">
                  {t.rich("backgroundText", {
                    strong: (chunks) => <strong>{chunks}</strong>,
                  })}
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <h3 className="type-label text-foreground">{t("expertiseTitle")}</h3>
                <p className="type-body mt-3">
                  {t.rich("expertiseText", {
                    strong: (chunks) => <strong>{chunks}</strong>,
                  })}
                </p>
              </Reveal>
            </div>
          </article>
        </div>
      </div>

      <div data-nav-ground="ink" className="ground-ink relative z-10">
        <div className="frame pt-[clamp(3.5rem,7vw,8rem)] pb-[clamp(3.5rem,7vw,8rem)]">
          <Reveal variant="slide-right">
            <blockquote className="type-display text-[clamp(2.125rem,5vw,7rem)] text-foreground [text-wrap:pretty] md:w-[88%]">
              {t("quote")}
            </blockquote>
          </Reveal>

          <div className="mt-[clamp(2.5rem,5vw,6rem)] border-foreground border-t pt-3">
            <p className="type-label text-foreground">{t("termsLabel")}</p>
            <ol className="mt-[clamp(1.5rem,2.6vw,3rem)] grid gap-x-6 gap-y-8 md:grid-cols-3">
              {COMMITMENTS.map((commitment) => (
                <li key={commitment}>
                  <Reveal>
                    <h3 className="type-title text-[clamp(1.5rem,2.3vw,3.25rem)] text-foreground">{t(`${commitment}Title`)}</h3>
                    <p className="type-body mt-3 max-w-[42ch]">{t(`${commitment}Body`)}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>

          <dl className="mt-[clamp(3rem,6vw,7rem)] grid grid-cols-2 gap-x-6 gap-y-8 border-foreground border-t pt-3 md:grid-cols-4">
            <div>
              <dt className="type-label">{t("education")}</dt>
              <dd className={LEDGER_VALUE}>{t("degree")}</dd>
              <dd className="type-label mt-1">{t("university")}</dd>
            </div>
            <div>
              <dt className="type-label">{t("experience")}</dt>
              <dd className={LEDGER_VALUE}>{t("years")}</dd>
              <dd className="type-label mt-1">{t("company")}</dd>
            </div>
            <div>
              <dt className="type-label">{t("codebases")}</dt>
              <dd className={LEDGER_VALUE}>
                <LedgerLink href={github} label="GitHub" />
              </dd>
            </div>
            <div>
              <dt className="type-label">{t("network")}</dt>
              <dd className={LEDGER_VALUE}>
                <LedgerLink href={linkedin} label="LinkedIn" />
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
