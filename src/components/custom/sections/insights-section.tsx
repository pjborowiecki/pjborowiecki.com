"use client"

import Image from "next/image"
import type { JSX } from "react"

import { useTranslations } from "next-intl"

import { Reveal } from "~/src/components/custom/reveal"

import { ARTICLES } from "~/src/data"

export function InsightsSection(): JSX.Element {
  const t = useTranslations("custom.insights")
  return (
    <section id="insights" className="relative border-border border-t py-32">
      <div className="container mx-auto px-6 md:px-12">
        <Reveal variant="text-mask">
          <div className="mb-24 flex flex-col items-start justify-between md:flex-row">
            <h2 className="font-black font-sans text-6xl text-foreground leading-[0.9] tracking-tighter md:text-8xl">{t("title")}</h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES?.map((article, index) => (
            <article
              key={article.id}
              className="group flex h-full cursor-pointer flex-col border-border border-l pl-6 md:border-l-0 md:pl-0"
            >
              <Reveal delay={index * 0.15} variant="blur-slide" className="h-full">
                <div className="relative mb-8 aspect-16/10 overflow-hidden border border-border bg-muted">
                  <div className="absolute inset-0 z-10 bg-foreground/10 opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100" />

                  <Image
                    fill
                    src={article.image}
                    alt={article.title}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover grayscale transition-all duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
                    unoptimized
                  />

                  <div className="absolute top-0 left-0 z-20 border-border border-r border-b bg-background px-4 py-2">
                    <span className="font-mono text-foreground text-xs uppercase tracking-wider">{article.category}</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="mb-4 flex items-center gap-4 font-mono text-muted-foreground text-xs uppercase tracking-widest">
                    <span>{article.date}</span>
                    <span className="h-1 w-1 rounded-full bg-primary"></span>
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="mb-4 font-bold font-sans text-2xl text-foreground leading-tight transition-colors group-hover:text-primary">
                    {article.title}
                  </h3>

                  <p className="mb-8 line-clamp-3 text-muted-foreground text-sm leading-relaxed">{article.excerpt}</p>

                  <div className="mt-auto flex items-center gap-2 font-mono text-foreground text-xs uppercase tracking-widest transition-transform group-hover:translate-x-2">
                    <span>{t("readArticle")}</span>
                    <span className="text-lg leading-none">{"\u2192"}</span>
                  </div>
                </div>
              </Reveal>
            </article>
          ))}
        </div>

        <div className="mt-24 flex justify-center">
          <Reveal variant="blur-slide">
            <a
              href="/"
              className="group flex items-center gap-3 font-mono text-muted-foreground text-sm uppercase tracking-widest transition-colors hover:text-foreground"
            >
              <span>{t("viewArchive")}</span>
              <div className="h-px w-12 bg-muted-foreground transition-colors group-hover:bg-foreground" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
