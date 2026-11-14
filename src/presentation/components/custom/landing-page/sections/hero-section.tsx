import { type JSX, type ReactNode, useRef } from "react"
import { preload } from "react-dom"

import { useTranslations } from "use-intl/react"

import { MOTION_OK, gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

import { imageSource } from "~/src/data/images"
import { NAV_GROUND, SECTION_IDS, sectionHref } from "~/src/data/marketing"

import { type HeroStudio, createHeroStudio } from "~/src/lib/hero-studio"

import { CtaLink } from "~/src/presentation/components/custom/landing-page/components/cta-link"
import { NAME_STEM_ORIGIN, NameMark, NameMarkStacked } from "~/src/presentation/components/custom/landing-page/components/name-mark"
import { ResponsiveImage } from "~/src/presentation/components/custom/landing-page/components/responsive-image"
import { RollText } from "~/src/presentation/components/custom/landing-page/components/roll-text"

const ENGAGEMENTS = ["engagementAi", "engagementArchitecture", "engagementAdvisory"] as const
const CREDENTIALS = ["credentialCompany", "credentialDegree", "basedIn"] as const

const PORTRAIT = { name: "hero-subject", sizes: "(min-width: 900px) 50vw, 100vw" } as const

const FIRST_ORDINAL = 1
const ORDINAL_DIGITS = 2

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

const NAME_FLOOD_SCALE = 90
const NAME_REST_CLEAR_AT = 0.05

const LIGHTS_UP: gsap.TweenVars = { duration: 2.4, ease: "power2.out", intro: 1 }
const NAME_RISE: gsap.TweenVars = { delay: 0.25, duration: 1.5, ease: "expo.out", stagger: 0.09, y: 880 }
const COPY_CLEAR: gsap.TweenVars = { autoAlpha: 0, duration: 0.2, ease: "power1.in", y: "-5svh" }
const CAMERA_PUSH: gsap.TweenVars = { duration: 0.9, ease: "power1.in", zoom: 1.28 }
const NAME_DIVE: gsap.TweenVars = { duration: 1, ease: "expo.in", scale: NAME_FLOOD_SCALE, svgOrigin: NAME_STEM_ORIGIN }
const NAME_REST_CLEAR: gsap.TweenVars = { autoAlpha: 0, duration: 0.3, ease: "power1.in" }
const DIVE_SCROLL: ScrollTrigger.Vars = { end: "bottom bottom", scrub: true, start: "top top" }

const STRONG_TAGS = { strong: (chunks: ReactNode) => <strong>{chunks}</strong> }

interface HeroElements {
  readonly box: HTMLDivElement
  readonly canvas: HTMLCanvasElement
  readonly name: HTMLDivElement
  readonly root: HTMLElement
  readonly stage: HTMLDivElement
}

interface HeroView {
  intro: number
  zoom: number
}

interface NameDive {
  readonly marks: Element[]
  readonly root: HTMLElement
  readonly studio: HeroStudio | undefined
  readonly view: HeroView
}

const selectAll = (root: HTMLElement, selector: string): Element[] => [...root.querySelectorAll(selector)]

const startStudio = ({ box, canvas, name, stage }: HeroElements, view: HeroView): HeroStudio | undefined => {
  const html = document.documentElement

  const showPoster = (): void => {
    html.classList.add("intro-started")
    html.classList.remove("studio-live")
    gsap.set(canvas, { autoAlpha: 0 })
  }

  const studio: HeroStudio | undefined = createHeroStudio({
    box,
    canvas,
    fadeAnchor: name,
    onFail: showPoster,
    onReady: () => {
      html.classList.add("intro-started", "studio-live")
      gsap.set(canvas, { autoAlpha: 1 })
      gsap.to(view, {
        ...LIGHTS_UP,
        onUpdate: () => {
          studio?.setIntro(view.intro)
        },
      })
    },
    stage,
  })

  if (!studio) {
    showPoster()
  }

  return studio
}

const riseName = (root: HTMLElement, marks: Element[]): void => {
  gsap.set(marks, { overflow: "hidden" })

  const words = selectAll(root, "[data-word]").filter((word) => word.getBoundingClientRect().width > 0)

  gsap.from(words, {
    ...NAME_RISE,
    onComplete: () => {
      gsap.set(marks, { overflow: "visible" })
    },
  })
}

const diveIntoName = ({ marks, root, studio, view }: NameDive): void => {
  const mark = { isOpen: false }

  gsap
    .timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        ...DIVE_SCROLL,
        onToggle: (self) => {
          studio?.setVisible(self.isActive || self.progress === 0)
        },
        onUpdate: (self) => {
          if (mark.isOpen || self.progress === 0) {
            return
          }

          mark.isOpen = true
          gsap.set(marks, { overflow: "visible" })
        },
        trigger: root,
      },
    })
    .to(selectAll(root, "[data-copy]"), { ...COPY_CLEAR }, 0)
    .to(
      view,
      {
        ...CAMERA_PUSH,
        onUpdate: () => {
          studio?.setZoom(view.zoom)
        },
      },
      0,
    )
    .to(selectAll(root, "[data-name-zoom]"), { ...NAME_DIVE }, 0)
    .to(selectAll(root, "[data-name-rest]"), { ...NAME_REST_CLEAR }, NAME_REST_CLEAR_AT)
}

const animateHero = (elements: HeroElements): (() => void) => {
  const { root } = elements
  const view: HeroView = { intro: 0, zoom: 1 }
  const studio = startStudio(elements, view)
  const marks = selectAll(root, "[data-name-mark]")

  riseName(root, marks)
  diveIntoName({ marks, root, studio, view })

  return () => {
    studio?.destroy()
    document.documentElement.classList.remove("studio-live")
  }
}

const HeroIntro = (): JSX.Element => {
  const t = useTranslations("pages.landing.hero")

  return (
    <div className="hero-copy z-10 cover:flex cover:flex-col" data-copy>
      <p className="hidden border-b border-cream/22 pb-[clamp(0.5rem,0.85vw,1rem)] type-label text-champagne cover:block">
        {t("practiceLabel")}
      </p>
      <p className="type-label text-champagne cover:hidden">{t("engagementsShort")}</p>
      <p className="hero-role mt-2 type-display text-[clamp(1.375rem,6.1vw,2.75rem)] leading-[1.03]! tracking-[-0.034em]! max-sm:leading-[1.1]! cover:mt-[clamp(0.75rem,1.05vw,1.5rem)] cover:text-[min(2.6vw,4.6svh)]">
        {t("role")}
      </p>
      <p className="hero-para mt-3 type-body text-[0.9375rem] leading-[1.48] text-cream/88 max-sm:hidden cover:mt-[clamp(0.6rem,0.9vw,1.25rem)] cover:text-[clamp(0.875rem,min(0.98vw,1.72svh),1.25rem)] [&_strong]:font-medium [&_strong]:text-cream">
        {t.rich("building", STRONG_TAGS)}
      </p>

      <dl className="hero-creds mt-[clamp(0.75rem,1.15vw,1.5rem)] hidden border-t border-cream/22 text-[clamp(0.8125rem,min(0.86vw,1.5svh),1.0625rem)] tracking-[-0.008em] [@media(min-width:900px)_and_(min-aspect-ratio:11/10)_and_(min-height:760px)]:block">
        {CREDENTIALS.map((credential) => (
          <div
            className="grid grid-cols-[6.2vw_1fr] gap-x-[0.6vw] border-b border-cream/22 py-[clamp(0.3rem,0.5vw,0.65rem)]"
            key={credential}
          >
            <dt className="text-cream/65">{t(`${credential}Label`)}</dt>
            <dd className="font-medium">{t(credential)}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 ground-tokens cover:mt-auto cover:pt-[clamp(0.75rem,1.1vw,1.5rem)]">
        <CtaLink href={sectionHref(SECTION_IDS.OFFER)}>{t("contactMe")}</CtaLink>
        <a
          className="border-b border-cream/70 pb-0.5 text-[0.9375rem] font-medium tracking-[-0.012em]"
          href={sectionHref(SECTION_IDS.WORK)}
        >
          <RollText>{t("viewWork")}</RollText>
        </a>
      </div>
    </div>
  )
}

const HeroEngagements = (): JSX.Element => {
  const t = useTranslations("pages.landing.hero")

  return (
    <div className="hero-copy z-10 hidden cover:block" data-copy>
      <p className="border-b border-cream/22 pb-[clamp(0.5rem,0.85vw,1rem)] type-label text-champagne">{t("engagementsLabel")}</p>
      <ol>
        {ENGAGEMENTS.map((engagement, index) => (
          <li className="border-cream/22 not-last:border-b" key={engagement}>
            <a
              className="group grid grid-cols-[2.1vw_1fr] pt-[clamp(0.6rem,1.05vw,1.35rem)] pb-[clamp(0.7rem,1.25vw,1.6rem)]"
              href={sectionHref(SECTION_IDS.SKILLS)}
            >
              <span aria-hidden className="mt-[0.5em] type-label text-champagne">
                {String(index + FIRST_ORDINAL).padStart(ORDINAL_DIGITS, "0")}
              </span>
              <span className="block">
                <span className="block type-title text-[min(2vw,3.5svh)] transition-transform duration-500 ease-out group-hover:translate-x-1.5">
                  {t(`${engagement}Title`)}
                </span>
                <span className="mt-[0.5vw] block text-[clamp(0.8125rem,min(0.9vw,1.6svh),1.1875rem)] leading-[1.42] tracking-[-0.011em] text-pretty text-cream/80">
                  {t(`${engagement}Desc`)}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}

export const HeroSection = (): JSX.Element => {
  const t = useTranslations("pages.landing.hero")
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      const stage = stageRef.current
      const canvas = canvasRef.current
      const box = boxRef.current
      const name = nameRef.current

      if (!root || !stage || !canvas || !box || !name) {
        return
      }

      gsap.matchMedia().add(MOTION_OK, () => animateHero({ box, canvas, name, root, stage }))

      gsap.matchMedia().add(REDUCED_MOTION, () => {
        document.documentElement.classList.add("intro-started")
      })
    },
    { scope: rootRef },
  )

  const portrait = imageSource(PORTRAIT.name)

  preload(portrait.src, { as: "image", fetchPriority: "high", imageSizes: PORTRAIT.sizes, imageSrcSet: portrait.avif, type: "image/avif" })

  return (
    <section className="hero relative live:h-[260svh]" data-nav-ground={NAV_GROUND.HERO} id={SECTION_IDS.HERO} ref={rootRef}>
      <div className="hero-stage relative top-0 h-svh min-h-[36rem] overflow-hidden text-cream live:sticky" ref={stageRef}>
        <div className="hero-subject" ref={boxRef}>
          <ResponsiveImage
            alt={t("portraitAlt")}
            className="hero-poster intro-hide object-contain object-top"
            isFill
            isPriority
            name={PORTRAIT.name}
            sizes={PORTRAIT.sizes}
          />
        </div>
        <div aria-hidden className="hero-fade hero-poster" />
        <canvas aria-hidden className="invisible absolute inset-0 size-full opacity-0" ref={canvasRef} />

        <div className="hero-foot">
          <div className="hero-flanks">
            <HeroIntro />
            <div aria-hidden className="hidden cover:block" />
            <HeroEngagements />
          </div>

          <div
            className="hero-name z-20 -order-1 text-background cover:absolute cover:right-(--gutter) cover:bottom-[clamp(0.75rem,2.4svh,2rem)] cover:left-(--gutter)"
            ref={nameRef}
          >
            <h1 className="sr-only">{t("name")}</h1>
            <NameMark className="hidden h-auto w-full sm:block" />
            <NameMarkStacked className="sm:hidden" />
          </div>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[49%] bottom-0 hidden live:block"
        data-nav-ground={NAV_GROUND.FLOOD}
      />
    </section>
  )
}
