"use client"

import Image from "next/image"
import type { JSX } from "react"

import { useTranslations } from "next-intl"

import { CONSTANTS } from "~/src/constants"

import { Reveal } from "~/src/components/custom/reveal"

export function AboutSection(): JSX.Element {
  const t = useTranslations("custom.about")

  return (
    <section id="about" className="relative border-border border-b py-32">
      <div className="container mx-auto px-6 md:px-12">
        <Reveal variant="slide-right">
          <div className="mb-24 flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <h2 className="font-mono text-foreground text-xs uppercase tracking-widest">{t("sectionHeader")}</h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-24">
          <div className="sticky top-32 flex flex-col gap-12 self-start lg:col-span-4">
            <Reveal width="100%" variant="blur-slide" duration={1.2}>
              <div className="group relative aspect-square w-full overflow-hidden border border-border bg-background">
                <Image
                  fill
                  src="https://avatars.githubusercontent.com/u/27385980?v=4"
                  alt="Piotr J. Borowiecki"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center grayscale transition-all duration-700 ease-out group-hover:grayscale-0"
                />
                <div className="absolute inset-0 z-10 bg-linear-to-t from-background/80 to-transparent opacity-60"></div>

                <div className="absolute bottom-6 left-6 z-20 overflow-hidden">
                  <div className="translate-y-full transform transition-transform delay-100 duration-500 group-hover:translate-y-0">
                    <div className="mb-1 font-mono text-primary text-xs uppercase tracking-widest">{t("location")}</div>
                    <div className="font-bold font-sans text-foreground text-xl">{t("krakow")}</div>
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="grid grid-cols-2 gap-8 border-border border-t pt-8">
              <Reveal delay={0.2} variant="slide-up">
                <div>
                  <h3 className="mb-2 font-mono text-muted-foreground text-xs uppercase tracking-widest">{t("education")}</h3>
                  <p className="mb-1 font-bold text-foreground">{t("degree")}</p>
                  <p className="text-muted-foreground text-sm">{t("university")}</p>
                </div>
              </Reveal>
              <Reveal delay={0.3} variant="slide-up">
                <div>
                  <h3 className="mb-2 font-mono text-muted-foreground text-xs uppercase tracking-widest">{t("experience")}</h3>
                  <p className="mb-1 font-bold text-foreground">{t("years")}</p>
                  <p className="text-muted-foreground text-sm">{t("company")}</p>
                </div>
              </Reveal>
              <Reveal delay={0.4} variant="slide-up">
                <div className="border-border border-t pt-8">
                  <h3 className="mb-2 font-mono text-muted-foreground text-xs uppercase tracking-widest">{t("codebases")}</h3>
                  <a
                    href={CONSTANTS.SOCIAL_LINKS.find((l) => l.name === "GitHub")?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-bold text-foreground transition-colors hover:text-primary"
                  >
                    {"GitHub"}
                  </a>
                </div>
              </Reveal>
              <Reveal delay={0.5} variant="slide-up">
                <div className="border-border border-t pt-8">
                  <h3 className="mb-2 font-mono text-muted-foreground text-xs uppercase tracking-widest">{t("network")}</h3>
                  <a
                    href={CONSTANTS.SOCIAL_LINKS.find((l) => l.name === "LinkedIn")?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-bold text-foreground transition-colors hover:text-primary"
                  >
                    {"LinkedIn"}
                  </a>
                </div>
              </Reveal>
            </div>
          </div>

          <div className="flex flex-col gap-16 lg:col-span-8">
            <div className="flex flex-col gap-2">
              {t.rich("title", {
                line1: (chunks) => (
                  <Reveal variant="text-mask">
                    <h2 className="font-black font-sans text-4xl text-foreground uppercase leading-[0.95] tracking-tighter md:text-6xl">
                      {chunks}
                    </h2>
                  </Reveal>
                ),
                line2: (chunks) => (
                  <Reveal variant="text-mask" delay={0.1}>
                    <h2 className="font-black font-sans text-4xl text-foreground uppercase leading-[0.95] tracking-tighter md:text-6xl">
                      {chunks}
                    </h2>
                  </Reveal>
                ),
                line3: (chunks) => (
                  <Reveal variant="text-mask" delay={0.2}>
                    <h2 className="font-black font-sans text-4xl text-muted-foreground uppercase leading-[0.95] tracking-tighter md:text-6xl">
                      {chunks}
                    </h2>
                  </Reveal>
                ),
              })}
            </div>

            <Reveal variant="blur-slide" delay={0.3}>
              <p className="border-primary border-l-2 pl-6 font-normal text-foreground leading-relaxed md:text-2xl">
                {t.rich("description", {
                  strong: (chunks) => <strong className="font-bold text-foreground">{chunks}</strong>,
                })}
              </p>
            </Reveal>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
              <Reveal variant="slide-up" delay={0.4}>
                <div className="border-border border-t pt-6">
                  <span className="mb-4 block font-mono text-primary text-xs uppercase tracking-widest">{t("backgroundTitle")}</span>
                  <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
                    {t.rich("backgroundText", {
                      strong: (chunks) => <strong className="text-foreground">{chunks}</strong>,
                    })}
                  </p>
                </div>
              </Reveal>

              <Reveal variant="slide-up" delay={0.5}>
                <div className="border-border border-t pt-6">
                  <span className="mb-4 block font-mono text-primary text-xs uppercase tracking-widest">{t("expertiseTitle")}</span>
                  <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
                    {t.rich("expertiseText", {
                      strong: (chunks) => <strong className="text-foreground">{chunks}</strong>,
                    })}
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal variant="blur-slide" delay={0.6}>
              <div className="rounded-sm border border-border bg-foreground/5 p-8">
                <p className="text-muted-foreground italic leading-relaxed">{t("quote")}</p>
              </div>
            </Reveal>

            <div className="mt-8 border-border border-t pt-12">
              <Reveal delay={0.7}>
                <h3 className="mb-8 font-mono text-foreground text-xs uppercase tracking-widest">{t("coreTechnologies")}</h3>
              </Reveal>
              <div className="flex flex-wrap gap-x-12 gap-y-4">
                {[
                  "React",
                  "Next.js",
                  "TypeScript",
                  "Node.js",
                  "Go (Golang)",
                  "Python",
                  "PostgreSQL",
                  "Docker",
                  "Kubernetes",
                  "AI / LLMs",
                ].map((tech, i) => (
                  <Reveal key={tech} delay={0.8 + i * 0.05} variant="slide-right" className="inline-block">
                    <span className="cursor-default font-bold font-sans text-2xl text-foreground/40 transition-colors hover:text-foreground md:text-3xl">
                      {tech}
                    </span>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
