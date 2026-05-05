"use client"

import type { JSX } from "react"

import { useTranslations } from "next-intl"

import { Marquee } from "~/src/components/custom/marquee"
import { Reveal } from "~/src/components/custom/reveal"

import { SKILLS } from "~/src/data"

export function SkillsSection(): JSX.Element {
  const t = useTranslations("custom.skills")
  const primarySkills =
    SKILLS?.map((s, i) => ({
      id: `skill-${s.name.replaceAll(/\\s+/g, "-").toLowerCase()}-${i}`,
      content:
        i % 2 === 0 ? (
          <span className="font-black font-sans text-7xl text-foreground/5 uppercase tracking-tighter transition-colors hover:text-foreground/30 md:text-9xl">
            {s.name}
          </span>
        ) : (
          <span className="bg-linear-to-b from-foreground/10 to-foreground/5 bg-clip-text font-black font-sans text-7xl text-transparent uppercase tracking-tighter transition-colors hover:from-foreground hover:to-foreground/50 md:text-9xl">
            {s.name}
          </span>
        ),
    })) || []

  const secondaryKeywords = [
    {
      id: "kw-1",
      content: (
        <span className="border border-border bg-foreground/5 px-4 py-2 font-mono text-foreground text-sm uppercase tracking-widest md:text-base">
          {t("eventSourcing")}
        </span>
      ),
    },
    {
      id: "kw-2",
      content: (
        <span className="border border-border/50 px-4 py-2 font-mono text-muted-foreground text-sm uppercase tracking-widest md:text-base">
          {t("cqrs")}
        </span>
      ),
    },
    {
      id: "kw-3",
      content: (
        <span className="border border-border bg-foreground/5 px-4 py-2 font-mono text-foreground text-sm uppercase tracking-widest md:text-base">
          {t("cleanArchitecture")}
        </span>
      ),
    },
    {
      id: "kw-4",
      content: (
        <span className="border border-border/50 px-4 py-2 font-mono text-muted-foreground text-sm uppercase tracking-widest md:text-base">
          {t("ddd")}
        </span>
      ),
    },
    {
      id: "kw-5",
      content: (
        <span className="border border-border bg-foreground/5 px-4 py-2 font-mono text-foreground text-sm uppercase tracking-widest md:text-base">
          {t("tdd")}
        </span>
      ),
    },
    {
      id: "kw-6",
      content: (
        <span className="border border-border/50 px-4 py-2 font-mono text-muted-foreground text-sm uppercase tracking-widest md:text-base">
          {t("microFrontends")}
        </span>
      ),
    },
    {
      id: "kw-7",
      content: (
        <span className="border border-border bg-foreground/5 px-4 py-2 font-mono text-foreground text-sm uppercase tracking-widest md:text-base">
          {t("graphql")}
        </span>
      ),
    },
    {
      id: "kw-8",
      content: (
        <span className="border border-border/50 px-4 py-2 font-mono text-muted-foreground text-sm uppercase tracking-widest md:text-base">
          {t("wasm")}
        </span>
      ),
    },
  ]

  return (
    <section id="skills" className="relative overflow-hidden border-border border-t py-32">
      <div className="container relative z-10 mx-auto mb-24 px-6 md:px-12">
        <Reveal>
          <div className="flex flex-col items-end justify-between gap-8 border-border border-b pb-8 md:flex-row">
            <div>
              <h2 className="mb-4 font-mono text-primary text-xs uppercase tracking-widest">{t("proficiency")}</h2>
              <p className="max-w-3xl font-bold font-sans text-4xl leading-tight tracking-tight md:text-6xl">
                {t.rich("toolkit", {
                  span: (chunks) => <span className="text-muted-foreground">{chunks}</span>,
                  br: () => <br />,
                })}
              </p>
            </div>
            <div className="hidden text-right md:block">
              <p className="border border-border px-3 py-1 font-mono text-foreground text-xs uppercase tracking-widest">{t("fullStack")}</p>
            </div>
          </div>
        </Reveal>
      </div>

      <Marquee items={primarySkills} className="mb-12" gapClass="gap-6 pr-6 md:gap-10 md:pr-10" />
      <Marquee items={secondaryKeywords} direction="right" className="mb-32 opacity-80" />

      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <Reveal delay={0.1}>
            <div className="group space-y-6 border-border border-t pt-6">
              <span className="font-mono text-primary text-xs">{"01"}</span>
              <h3 className="font-bold font-sans text-2xl text-foreground">{t("feArch")}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t("feArchDesc")}</p>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="group space-y-6 border-border border-t pt-6">
              <span className="font-mono text-primary text-xs">{"02"}</span>
              <h3 className="font-bold font-sans text-2xl text-foreground">{t("beSystems")}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t("beSystemsDesc")}</p>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="group space-y-6 border-border border-t pt-6">
              <span className="font-mono text-primary text-xs">{"03"}</span>
              <h3 className="font-bold font-sans text-2xl text-foreground">{t("strategy")}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t("strategyDesc")}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
