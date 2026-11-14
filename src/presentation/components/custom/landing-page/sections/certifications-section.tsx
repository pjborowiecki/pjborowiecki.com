import { type JSX, useRef } from "react"

import { useTranslations } from "use-intl/react"

import { MOTION_OK, ScrollTrigger, gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

import { CERTIFICATIONS, type Certification } from "~/src/data/certifications"
import { NAV_GROUND, SECTION_IDS } from "~/src/data/marketing"

import { ArrowUpRightIcon, IssuerLogo } from "~/src/presentation/components/custom/icons"
import { Reveal } from "~/src/presentation/components/custom/landing-page/components/reveal"
import { RollText } from "~/src/presentation/components/custom/landing-page/components/roll-text"
import { SectionHead } from "~/src/presentation/components/custom/landing-page/components/section-head"

const LISTED = CERTIFICATIONS.filter(({ url }) => url !== undefined || import.meta.env.MODE !== "production")

const SCROLL_PER_PIXEL = 1.1
const REVEAL_STAGGER = 0.06
const REFRESH_INIT = "refreshInit"

const ROW_SLIDE: gsap.TweenVars = { duration: 1 }
const ROW_SCROLL_TRIGGER = { end: "bottom bottom", invalidateOnRefresh: true, scrub: 0.6 } as const

const holdWhileRowSlides = (outer: HTMLElement, root: HTMLElement, track: HTMLElement): (() => void) | undefined => {
  const distance = (): number => Math.max(0, track.scrollWidth - globalThis.innerWidth)
  if (distance() === 0) {
    return
  }

  const setLength = (): void => {
    root.style.top = `${String(Math.min(0, globalThis.innerHeight - root.offsetHeight))}px`
    outer.style.height = `${String(distance() * SCROLL_PER_PIXEL + root.offsetHeight)}px`
  }
  setLength()
  ScrollTrigger.addEventListener(REFRESH_INIT, setLength)

  gsap
    .timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        ...ROW_SCROLL_TRIGGER,
        start: () => `top+=${String(Math.max(0, root.offsetHeight - globalThis.innerHeight))} top`,
        trigger: outer,
      },
    })
    .to(track, { ...ROW_SLIDE, x: () => -distance() }, 0)

  return () => {
    ScrollTrigger.removeEventListener(REFRESH_INIT, setLength)
    outer.style.height = ""
    root.style.top = ""
  }
}

interface CertificationPanelProps {
  readonly certification: Certification
  readonly index: number
}

const CertificationPanel = ({ certification: { id, issuer, logo, name, url }, index }: CertificationPanelProps): JSX.Element => {
  const t = useTranslations("pages.landing.certifications")

  return (
    <li
      className="group relative flex min-h-0 overflow-hidden border-b border-border px-(--gutter) py-[clamp(1.25rem,2.2vw,2.75rem)] max-md:w-[84vw] max-md:shrink-0 max-md:snap-start max-md:not-first:border-l md:min-h-[clamp(19rem,54svh,42rem)] md:even:border-l xl:px-[clamp(1.25rem,2vw,2.75rem)] xl:not-first:border-l xl:first:pl-(--gutter) xl:last:pr-(--gutter) md:live:w-[50vw] md:live:shrink-0 md:live:grow md:live:not-first:border-l xl:live:w-[25vw]"
      data-dark-ground
    >
      <span
        aria-hidden
        className="absolute inset-0 origin-bottom scale-y-0 bg-cream transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-y-100"
      />
      <Reveal
        className="relative flex w-full flex-col justify-between gap-7 transition-colors duration-300 group-hover:text-emerald-deep md:gap-10"
        delay={index * REVEAL_STAGGER}
      >
        <div className="flex items-baseline justify-between gap-4">
          <span className="type-label text-champagne group-hover:text-emerald">{issuer}</span>
          <span className="text-right type-label text-current opacity-75">{t(`${id}Focus`)}</span>
        </div>

        <div>
          <h3 className="type-display text-[clamp(2.125rem,2.85vw,4.25rem)] max-md:text-[1.75rem]">{name}</h3>
          <p className="mt-4 type-body text-current opacity-85">{t(`${id}Body`)}</p>
          <div className="mt-5 flex items-end justify-between gap-4">
            {url !== undefined && (
              <a
                className="group/verify inline-flex items-center gap-1.5 border-b border-current pb-0.5 font-medium tracking-[-0.012em]"
                href={url}
                rel="noopener noreferrer"
                target="_blank"
              >
                <RollText>{t("verify")}</RollText>
                <ArrowUpRightIcon className="size-[0.85em] transition-transform duration-300 group-hover/verify:translate-x-0.5 group-hover/verify:-translate-y-0.5" />
              </a>
            )}
            {url === undefined && (
              <p className="inline-block border border-dashed border-current px-2.5 py-1 text-[0.8125rem] font-medium tracking-[-0.005em]">
                {t("previewTag")}
              </p>
            )}
            <IssuerLogo className="size-[clamp(1.75rem,2.3vw,2.75rem)] shrink-0" logo={logo} />
          </div>
        </div>
      </Reveal>
    </li>
  )
}

export const CertificationsSection = (): JSX.Element | undefined => {
  const t = useTranslations("pages.landing.certifications")
  const outerRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        const outer = outerRef.current
        const root = rootRef.current
        const track = trackRef.current
        if (!outer || !root || !track) {
          return
        }

        return holdWhileRowSlides(outer, root, track)
      })
    },
    { scope: outerRef },
  )

  if (LISTED.length === 0) {
    return undefined
  }

  return (
    <div className="relative z-10 bg-[#084f3a]" data-nav-ground={NAV_GROUND.EMERALD} id={SECTION_IDS.CERTIFICATIONS} ref={outerRef}>
      <section
        className="relative ground-emerald pt-[clamp(2rem,4vw,4.5rem)] live:sticky live:flex live:min-h-svh live:flex-col max-md:live:pt-[calc(var(--nav-bar-height)+1.5rem)]"
        ref={rootRef}
      >
        <SectionHead label={t("label")} title={t("title")} />

        <Reveal className="frame mt-[clamp(1.25rem,2.4vw,2.75rem)]">
          <p className="max-w-[44ch] type-lead text-lead text-foreground">{t("intro")}</p>
        </Reveal>

        <div className="mt-[clamp(2.5rem,5vw,6rem)] max-md:snap-x max-md:snap-mandatory max-md:[scrollbar-width:none] max-md:overflow-x-auto max-md:overscroll-x-contain live:flex live:flex-1 live:overflow-hidden max-md:[&::-webkit-scrollbar]:hidden">
          <ul
            className="grid w-full border-t border-border max-md:flex max-md:w-max md:grid-cols-2 xl:grid-cols-4 live:flex live:w-fit live:min-w-full live:will-change-transform"
            ref={trackRef}
          >
            {LISTED.map((certification, index) => (
              <CertificationPanel certification={certification} index={index} key={certification.id} />
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
