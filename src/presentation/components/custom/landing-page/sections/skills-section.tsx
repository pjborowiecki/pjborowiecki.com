import { type JSX, useRef } from "react"

import { useTranslations } from "use-intl/react"

import { ScrollTrigger, gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

import { NAV_GROUND, SECTION_IDS } from "~/src/data/marketing"
import { MEDIA } from "~/src/data/media"

import type { Discipline } from "~/src/lib/expertise-drawings"
import { ordinal } from "~/src/lib/numbers"

import { ExpertiseFigure } from "~/src/presentation/components/custom/landing-page/components/expertise-figure"
import { Marquee } from "~/src/presentation/components/custom/landing-page/components/marquee"
import { Reveal } from "~/src/presentation/components/custom/landing-page/components/reveal"
import { SplitHeading } from "~/src/presentation/components/custom/landing-page/components/split-heading"

const DISCIPLINES = ["payments", "interfaces", "products", "ai"] as const satisfies readonly Discipline[]
const ITEMS = ["Item1", "Item2", "Item3", "Item4", "Item5"] as const

const PRACTICES = ["iso20022", "accessibility", "localisation", "testing", "websockets", "authBilling", "xmlJson", "agentic"] as const

const CORE_TECHNOLOGIES = [
  "TypeScript",
  "React",
  "TanStack",
  "Node.js",
  "Bun",
  "Go",
  "Python",
  "Java",
  "PostgreSQL",
  "Cloudflare Workers",
] as const

const WIDE_MOTION = `${MEDIA.MOTION_OK} and ${MEDIA.MD}`

const SCROLL_PER_PIXEL = 1.1

const TRACK_SCROLL: ScrollTrigger.Vars = { end: "bottom bottom", invalidateOnRefresh: true, scrub: 0.6, start: "top top" }

const PRACTICES_MARQUEE = { copies: 4, duration: 90 } as const

const slideTrack = (outer: HTMLDivElement, track: HTMLDivElement): (() => void) => {
  const distance = (): number => track.scrollWidth - globalThis.innerWidth

  const setLength = (): void => {
    outer.style.height = `${String(distance() * SCROLL_PER_PIXEL + globalThis.innerHeight)}px`
  }

  setLength()
  ScrollTrigger.addEventListener("refreshInit", setLength)

  gsap
    .timeline({ defaults: { ease: "none" }, scrollTrigger: { ...TRACK_SCROLL, trigger: outer } })
    .to(track, { duration: 1, x: () => -distance() }, 0)

  return () => {
    ScrollTrigger.removeEventListener("refreshInit", setLength)
    outer.style.height = ""
  }
}

interface DisciplinePanelProps {
  readonly discipline: Discipline
  readonly index: number
}

const DisciplinePanel = ({ discipline, index }: DisciplinePanelProps): JSX.Element => {
  const t = useTranslations("pages.landing.skills")

  return (
    <article
      className="group relative flex flex-col gap-6 overflow-hidden border-t border-border px-(--gutter) py-8 md:live:w-[clamp(28rem,38vw,52rem)] md:live:gap-[clamp(0.75rem,2svh,2rem)] md:live:border-t-0 md:live:border-l md:live:px-[clamp(1.5rem,2.4vw,3rem)] md:live:pt-[calc(var(--nav-height)+0.75rem)] md:live:pb-14"
      data-dark-ground
    >
      <span
        aria-hidden
        className="absolute inset-0 origin-bottom scale-y-0 bg-cream transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-y-100"
      />

      <div className="relative transition-colors duration-300 group-hover:text-emerald-deep">
        <div className="flex items-baseline justify-between gap-6">
          <span aria-hidden className="type-label text-current">
            {ordinal(index)}
          </span>
          <span className="text-right type-label text-champagne group-hover:text-emerald">{t(`${discipline}Where`)}</span>
        </div>
        <h3 className="mt-[clamp(0.75rem,3svh,4.5rem)] type-display text-[clamp(2.25rem,4.5vw,6.25rem)] md:live:text-[max(1.875rem,min(3.9vw,6.8svh))]">
          {t(discipline)}
        </h3>
        <p className="mt-[clamp(0.5rem,1.5svh,2rem)] type-body text-current opacity-85">{t(`${discipline}Desc`)}</p>
      </div>

      <ExpertiseFigure
        className="relative h-[clamp(10rem,48vw,15rem)] md:live:h-auto md:live:min-h-0 md:live:flex-1"
        discipline={discipline}
      />

      <ul className="relative transition-colors duration-300 group-hover:text-emerald-deep">
        {ITEMS.map((item) => (
          <li
            className="flex items-center gap-[0.75em] border-t border-border py-[clamp(0.3rem,1svh,1rem)] text-[clamp(0.875rem,min(1.05vw,1.85svh),1.5rem)] tracking-[-0.01em] transition-colors duration-300 group-hover:border-emerald-deep/20"
            key={item}
          >
            <span
              aria-hidden
              className="size-[0.34em] shrink-0 rounded-full bg-champagne transition-colors duration-300 group-hover:bg-emerald"
            />
            {t(`${discipline}${item}`)}
          </li>
        ))}
      </ul>
    </article>
  )
}

const SkillsMarquees = (): JSX.Element => {
  const t = useTranslations("pages.landing.skills")

  return (
    <div className="surface-paper py-[clamp(1.75rem,3.2vw,4rem)]" data-nav-ground={NAV_GROUND.PAPER}>
      <h3 className="sr-only">{t("coreTechnologies")}</h3>
      <Marquee className="marquee-fade">
        {CORE_TECHNOLOGIES.map((technology) => (
          <span
            className="flex cursor-default items-center font-display text-[clamp(2.75rem,7.4vw,10rem)] leading-[1.1] font-medium tracking-[-0.032em] whitespace-nowrap transition-colors duration-200 after:mx-[0.34em] after:size-[0.07em] after:rounded-full after:bg-emerald after:content-[''] hover:text-emerald"
            key={technology}
          >
            {technology}
          </span>
        ))}
      </Marquee>

      <h3 className="sr-only">{t("practicesTitle")}</h3>
      <Marquee
        className="marquee-fade mt-[clamp(0.5rem,1.2vw,1.5rem)]"
        copies={PRACTICES_MARQUEE.copies}
        direction="right"
        duration={PRACTICES_MARQUEE.duration}
      >
        {PRACTICES.map((practice) => (
          <span
            className="flex cursor-default items-center text-[clamp(0.9375rem,1.05vw,1.25rem)] font-medium tracking-[-0.01em] whitespace-nowrap text-foreground/65 transition-colors duration-200 after:mx-[1em] after:size-[3px] after:rounded-full after:bg-emerald after:content-[''] hover:text-foreground"
            key={practice}
          >
            {t(`practices.${practice}`)}
          </span>
        ))}
      </Marquee>
    </div>
  )
}

export const SkillsSection = (): JSX.Element => {
  const t = useTranslations("pages.landing.skills")
  const outerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.matchMedia().add(WIDE_MOTION, () => {
        const outer = outerRef.current
        const track = trackRef.current

        if (!outer || !track) {
          return
        }

        return slideTrack(outer, track)
      })
    },
    { scope: outerRef },
  )

  return (
    <section className="relative overflow-x-clip ground-emerald" data-nav-ground={NAV_GROUND.EMERALD} id={SECTION_IDS.SKILLS}>
      <div ref={outerRef}>
        <div className="relative md:live:sticky md:live:top-0 md:live:h-svh md:live:overflow-hidden">
          <div className="flex flex-col md:live:h-full md:live:w-fit md:live:flex-row md:live:will-change-transform" ref={trackRef}>
            <div className="frame flex flex-col gap-6 pt-(--section-y) pb-12 md:live:w-[66vw] md:live:max-w-none md:live:justify-between md:live:pt-[calc(var(--nav-height)+0.75rem)] md:live:pb-14">
              <Reveal variant="slide-right">
                <p className="type-label text-champagne">{t("label")}</p>
              </Reveal>
              <SplitHeading className="type-display text-display md:live:text-[min(9vw,17svh)]">{t("toolkit")}</SplitHeading>
            </div>

            {DISCIPLINES.map((discipline, index) => (
              <DisciplinePanel discipline={discipline} index={index} key={discipline} />
            ))}
          </div>
        </div>
      </div>

      <SkillsMarquees />
    </section>
  )
}
