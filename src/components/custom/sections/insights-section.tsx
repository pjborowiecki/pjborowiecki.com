"use client"

import type { JSX } from "react"

import { useTranslations } from "next-intl"

import { ArrowRightIcon } from "~/src/components/custom/icons"
import { Reveal } from "~/src/components/custom/reveal"
import { RollText } from "~/src/components/custom/roll-text"
import { SectionHead } from "~/src/components/custom/section-head"

import { ARTICLES } from "~/src/data"

export function InsightsSection(): JSX.Element {
  const t = useTranslations("custom.insights")

  return (
    <section
      id="insights"
      data-nav-ground="paper"
      className="relative z-10 bg-background pt-[clamp(4.75rem,5.5vw,6.5rem)] pb-(--section-y)"
    >
      <SectionHead label={t("subtitle")} title={t("title")} />

      <ul className="frame mt-[clamp(2.5rem,5vw,6rem)]">
        {ARTICLES.map((article) => (
          <li key={article.id} className="group relative border-border border-t last:border-b">
            {/* Hover: the rule is redrawn in emerald and the title leans into it. */}
            <span
              aria-hidden
              className="absolute -top-px left-0 h-0.5 w-full origin-left scale-x-0 bg-emerald transition-transform duration-500 ease-out group-hover:scale-x-100"
            />
            <Reveal>
              <article className="grid gap-y-3 py-[clamp(1.25rem,2.4vw,2.75rem)] md:grid-cols-12 md:gap-x-6">
                <p className="type-label md:col-span-2">
                  {article.date}
                  <br className="hidden md:block" />
                  <span className="md:hidden">{" · "}</span>
                  {article.category}
                </p>
                <h3 className="type-title text-[clamp(1.5rem,2.7vw,3.5rem)] transition-[color,translate] duration-500 ease-out group-hover:translate-x-3 group-hover:text-emerald md:col-span-6">
                  {article.title}
                </h3>
                <div className="md:col-span-4">
                  <p className="type-body">{article.excerpt}</p>
                  {article.href && (
                    <a href={article.href} className="mt-4 inline-flex items-center gap-2 font-medium tracking-[-0.012em]">
                      <RollText>{t("readArticle")}</RollText>
                      <ArrowRightIcon className="size-[1.1em] transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  )}
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}
