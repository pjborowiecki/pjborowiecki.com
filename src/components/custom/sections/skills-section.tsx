"use client"

import { type JSX, useRef } from "react"

import { useTranslations } from "next-intl"

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "~/src/lib/gsap"

import { ExpertiseFigure } from "~/src/components/custom/expertise-figure"
import { Marquee } from "~/src/components/custom/marquee"
import { Reveal } from "~/src/components/custom/reveal"
import { SplitHeading } from "~/src/components/custom/split-heading"

import { CORE_TECHNOLOGIES } from "~/src/data"

const DISCIPLINES = ["ai", "beSystems", "feArch", "strategy"] as const
const ITEMS = ["Item1", "Item2", "Item3", "Item4", "Item5"] as const

const METHODS = ["eventSourcing", "cqrs", "cleanArchitecture", "ddd", "tdd", "microFrontends", "graphql", "wasm"] as const

/** Pixels of scroll per pixel of sideways travel. */
const SCROLL_PER_PIXEL = 1.1

export function SkillsSection(): JSX.Element {
  const t = useTranslations("custom.skills")
  const outerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // The track only runs sideways on screens wide enough to show more than one panel.
      gsap.matchMedia().add(`${MOTION_OK} and (min-width: 768px)`, () => {
        const outer = outerRef.current
        const track = trackRef.current
        if (!outer || !track) return
        const distance = () => track.scrollWidth - globalThis.innerWidth
        // Native sticky holds the stage, so nothing jumps where a pin would switch to fixed. This only sets how long it holds.
        const setLength = () => {
          outer.style.height = `${distance() * SCROLL_PER_PIXEL + globalThis.innerHeight}px`
        }
        setLength()
        ScrollTrigger.addEventListener("refreshInit", setLength)

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: outer, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true },
          })
          .to(track, { x: () => -distance(), duration: 1 }, 0)

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", setLength)
          outer.style.height = ""
        }
      })
    },
    { scope: outerRef },
  )

  return (
    <section id="skills" data-nav-ground="emerald" className="ground-emerald relative overflow-x-clip">
      <div ref={outerRef}>
        <div className="relative md:live:sticky md:live:top-0 md:live:h-svh md:live:overflow-hidden">
          <div ref={trackRef} className="flex flex-col md:live:h-full md:live:w-fit md:live:flex-row md:live:will-change-transform">
            <div className="frame flex flex-col gap-6 pt-(--section-y) pb-12 md:live:w-[66vw] md:live:max-w-none md:live:justify-between md:live:pt-[calc(var(--nav-height)+0.75rem)] md:live:pb-14">
              <Reveal variant="slide-right">
                <p className="type-label text-champagne">{t("label")}</p>
              </Reveal>
              <SplitHeading className="type-display text-display md:live:text-[min(9vw,17svh)]">{t("toolkit")}</SplitHeading>
            </div>

            {DISCIPLINES.map((id, index) => (
              <article
                key={id}
                data-dark-ground
                className="group relative flex flex-col gap-6 overflow-hidden border-border border-t px-(--gutter) py-8 md:live:w-[clamp(28rem,38vw,52rem)] md:live:gap-[clamp(0.75rem,2svh,2rem)] md:live:border-t-0 md:live:border-l md:live:px-[clamp(1.5rem,2.4vw,3rem)] md:live:pt-[calc(var(--nav-height)+0.75rem)] md:live:pb-14"
              >
                {/* Hover: the panel fills with paper from the floor up. */}
                <span
                  aria-hidden
                  className="absolute inset-0 origin-bottom scale-y-0 bg-cream transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-y-100"
                />

                <div className="relative transition-colors duration-300 group-hover:text-emerald-deep">
                  <div className="flex items-baseline justify-between gap-6">
                    <span aria-hidden className="type-label text-current">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="type-label text-right text-champagne group-hover:text-emerald">{t(`${id}For`)}</span>
                  </div>
                  <h3 className="type-display mt-[clamp(0.75rem,3svh,4.5rem)] text-[clamp(2.25rem,4.5vw,6.25rem)] md:live:text-[max(1.875rem,min(3.9vw,6.8svh))]">
                    {t(id)}
                  </h3>
                  <p className="type-body mt-[clamp(0.5rem,1.5svh,2rem)] text-current opacity-85">{t(`${id}Desc`)}</p>
                </div>

                <ExpertiseFigure
                  discipline={id}
                  className="relative h-[clamp(10rem,48vw,15rem)] md:live:h-auto md:live:min-h-0 md:live:flex-1"
                />

                <ul className="relative transition-colors duration-300 group-hover:text-emerald-deep">
                  {ITEMS.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-[0.75em] border-border border-t py-[clamp(0.3rem,1svh,1rem)] text-[clamp(0.875rem,min(1.05vw,1.85svh),1.5rem)] tracking-[-0.01em] transition-colors duration-300 group-hover:border-emerald-deep/20"
                    >
                      <span
                        aria-hidden
                        className="size-[0.34em] shrink-0 rounded-full bg-champagne transition-colors duration-300 group-hover:bg-emerald"
                      />
                      {t(`${id}${item}`)}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div data-nav-ground="paper" className="surface-paper py-[clamp(1.75rem,3.2vw,4rem)]">
        <h3 className="sr-only">{t("coreTechnologies")}</h3>
        <Marquee className="marquee-fade">
          {CORE_TECHNOLOGIES.map((tech) => (
            <span
              key={tech}
              className="flex cursor-default items-center whitespace-nowrap font-display font-medium text-[clamp(2.75rem,7.4vw,10rem)] leading-[1.1] tracking-[-0.032em] transition-colors duration-200 after:mx-[0.34em] after:size-[0.07em] after:rounded-full after:bg-emerald after:content-[''] hover:text-emerald"
            >
              {tech}
            </span>
          ))}
        </Marquee>

        <h3 className="sr-only">{t("methods")}</h3>
        <Marquee direction="right" copies={4} duration={90} className="marquee-fade mt-[clamp(0.5rem,1.2vw,1.5rem)]">
          {METHODS.map((method) => (
            <span
              key={method}
              className="flex cursor-default items-center whitespace-nowrap font-medium text-[clamp(0.9375rem,1.05vw,1.25rem)] text-foreground/65 tracking-[-0.01em] transition-colors duration-200 after:mx-[1em] after:size-[3px] after:rounded-full after:bg-emerald after:content-[''] hover:text-foreground"
            >
              {t(method)}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
