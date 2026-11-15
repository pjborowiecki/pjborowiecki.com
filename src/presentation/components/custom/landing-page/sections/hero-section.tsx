import { type JSX, type ReactNode, useRef } from "react"
import { preload } from "react-dom"

import { useTranslations } from "use-intl/react"

import { ScrollTrigger, gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

import { imageSource } from "~/src/data/images"
import { NAV_GROUND, SECTION_IDS, sectionHref } from "~/src/data/marketing"
import { MEDIA } from "~/src/data/media"

import { type HeroStudio, createHeroStudio } from "~/src/lib/hero-studio"
import { ordinal } from "~/src/lib/numbers"

import { CtaLink } from "~/src/presentation/components/custom/landing-page/components/cta-link"
import { NAME_STEM_ORIGIN, NameMark, NameMarkStacked } from "~/src/presentation/components/custom/landing-page/components/name-mark"
import { ResponsiveImage } from "~/src/presentation/components/custom/landing-page/components/responsive-image"
import { RollText } from "~/src/presentation/components/custom/landing-page/components/roll-text"

const FOCUS_AREAS = ["focusPayments", "focusProducts", "focusAi"] as const
const CREDENTIALS = ["credentialCompany", "credentialDegree", "basedIn"] as const

const PORTRAIT = { name: "hero-subject", sizes: "(min-width: 900px) 50vw, 100vw" } as const

const NAME_FLOOD_SCALE = 90
const NAME_REST_CLEAR_AT = 0.05

const CANVAS_REVEAL: gsap.TweenVars = { autoAlpha: 1, duration: 0.6, ease: "power1.out" }
const INTRO_WINDOW_MS = 1200
const NAME_RISE: gsap.TweenVars = { delay: 0.25, duration: 1.5, ease: "expo.out", stagger: 0.09, y: 880 }
const COPY_CLEAR: gsap.TweenVars = { autoAlpha: 0, duration: 0.2, ease: "power1.in", y: "-5svh" }
const CAMERA_PUSH: gsap.TweenVars = { duration: 0.9, ease: "power1.in", zoom: 1.28 }
const NAME_DIVE: gsap.TweenVars = { duration: 1, ease: "expo.in", scale: NAME_FLOOD_SCALE, svgOrigin: NAME_STEM_ORIGIN }
const NAME_REST_CLEAR: gsap.TweenVars = { autoAlpha: 0, duration: 0.3, ease: "power1.in" }
const DIVE_SCROLL: ScrollTrigger.Vars = { end: "bottom bottom", scrub: true, start: "top top" }
const ON_SCREEN: ScrollTrigger.Vars = { end: "bottom top", start: "top bottom" }
const HERO_MEDIA = { motion: MEDIA.MOTION_OK, pin: `${MEDIA.MOTION_OK} and ${MEDIA.TALL}` } as const

const STRONG_TAGS = { strong: (chunks: ReactNode) => <strong>{chunks}</strong> }

interface HeroElements {
  readonly box: HTMLDivElement
  readonly canvas: HTMLCanvasElement
  readonly name: HTMLDivElement
  readonly root: HTMLElement
  readonly stage: HTMLDivElement
}

interface HeroView {
  zoom: number
}

interface NameDive {
  readonly marks: Element[]
  readonly root: HTMLElement
  readonly studio: HeroStudio | undefined
  readonly view: HeroView
}

const selectAll = (root: HTMLElement, selector: string): Element[] => [...root.querySelectorAll(selector)]

const startStudio = ({ box, canvas, name, stage }: HeroElements): HeroStudio | undefined => {
  const html = document.documentElement

  const showPoster = (): void => {
    html.classList.remove("studio-live")
    gsap.set(canvas, { autoAlpha: 0 })
  }

  const studio: HeroStudio | undefined = createHeroStudio({
    box,
    canvas,
    fadeAnchor: name,
    onFail: showPoster,
    onReady: () => {
      gsap.to(canvas, {
        ...CANVAS_REVEAL,
        onComplete: () => {
          html.classList.add("studio-live")
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

  const sync = (self: ScrollTrigger): void => {
    studio?.setVisible(self.isActive || self.progress === 0)
  }

  gsap
    .timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        ...DIVE_SCROLL,
        onRefresh: sync,
        onToggle: sync,
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

const renderWhileOnScreen = (root: HTMLElement, studio: HeroStudio | undefined): void => {
  const sync = (self: ScrollTrigger): void => {
    studio?.setVisible(self.isActive)
  }

  ScrollTrigger.create({ ...ON_SCREEN, onRefresh: sync, onToggle: sync, trigger: root })
}

const animateHero = (elements: HeroElements, canPin: boolean): (() => void) => {
  const { root } = elements
  const view: HeroView = { zoom: 1 }
  const studio = startStudio(elements)
  const marks = selectAll(root, "[data-name-mark]")

  if (performance.now() <= INTRO_WINDOW_MS) {
    riseName(root, marks)
  }

  if (canPin) {
    diveIntoName({ marks, root, studio, view })
  } else {
    renderWhileOnScreen(root, studio)
  }

  return () => {
    studio?.destroy()
    document.documentElement.classList.remove("studio-live")
  }
}

const HeroIntro = (): JSX.Element => {
  const t = useTranslations("pages.landing.hero")

  return (
    <div className="hero-copy z-10 cover:flex cover:flex-col" data-copy>
      <p className="hidden border-b border-cream/22 pb-[clamp(0.5rem,calc(0.85*var(--hero-unit)),1rem)] type-label text-champagne cover:block">
        {t("introLabel")}
      </p>
      <p className="type-label text-champagne cover:hidden">{t("focusShort")}</p>
      <p className="hero-role mt-2 type-display text-[clamp(1.375rem,6.1vw,2.75rem)] leading-[1.03]! tracking-[-0.034em]! max-sm:leading-[1.1]! cover:mt-[clamp(0.75rem,calc(1.05*var(--hero-unit)),1.5rem)] cover:text-[calc(2.6*var(--hero-unit))]">
        {t("role")}
      </p>
      <p className="hero-para mt-3 type-body text-[0.9375rem] leading-[1.48] text-cream/88 max-sm:hidden cover:mt-[clamp(0.6rem,calc(0.9*var(--hero-unit)),1.25rem)] cover:text-[clamp(0.875rem,calc(0.98*var(--hero-unit)),1.25rem)] [&_strong]:font-medium [&_strong]:text-cream">
        {t.rich("building", STRONG_TAGS)}
      </p>

      <dl className="hero-creds mt-[clamp(0.75rem,calc(1.15*var(--hero-unit)),1.5rem)] hidden border-t border-cream/22 text-[clamp(0.8125rem,calc(0.86*var(--hero-unit)),1.0625rem)] tracking-[-0.008em] [@media(min-width:900px)_and_(min-aspect-ratio:11/10)_and_(min-height:760px)]:block">
        {CREDENTIALS.map((credential) => (
          <div
            className="grid grid-cols-[calc(6.2*var(--hero-unit))_1fr] gap-x-[calc(0.6*var(--hero-unit))] border-b border-cream/22 py-[clamp(0.3rem,calc(0.5*var(--hero-unit)),0.65rem)]"
            key={credential}
          >
            <dt className="text-cream/65">{t(`${credential}Label`)}</dt>
            <dd className="font-medium">{t(credential)}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 ground-tokens cover:mt-auto cover:pt-[clamp(0.75rem,calc(1.1*var(--hero-unit)),1.5rem)]">
        <CtaLink href={sectionHref(SECTION_IDS.WORK)}>{t("viewWork")}</CtaLink>
        <a
          className="border-b border-cream/70 pb-0.5 text-[0.9375rem] font-medium tracking-[-0.012em]"
          href={sectionHref(SECTION_IDS.CONTACT)}
        >
          <RollText>{t("getInTouch")}</RollText>
        </a>
      </div>
    </div>
  )
}

const HeroFocus = (): JSX.Element => {
  const t = useTranslations("pages.landing.hero")

  return (
    <div className="hero-copy z-10 hidden cover:block" data-copy>
      <p className="border-b border-cream/22 pb-[clamp(0.5rem,calc(0.85*var(--hero-unit)),1rem)] type-label text-champagne">
        {t("focusLabel")}
      </p>
      <ol>
        {FOCUS_AREAS.map((area, index) => (
          <li className="border-cream/22 not-last:border-b" key={area}>
            <a
              className="group grid grid-cols-[calc(2.1*var(--hero-unit))_1fr] pt-[clamp(0.6rem,calc(1.05*var(--hero-unit)),1.35rem)] pb-[clamp(0.7rem,calc(1.25*var(--hero-unit)),1.6rem)]"
              href={sectionHref(SECTION_IDS.SKILLS)}
            >
              <span aria-hidden className="mt-[0.5em] type-label text-champagne">
                {ordinal(index)}
              </span>
              <span className="block">
                <span className="block type-title text-[calc(2*var(--hero-unit))] transition-transform duration-500 ease-out group-hover:translate-x-1.5">
                  {t(`${area}Title`)}
                </span>
                <span className="mt-[calc(0.5*var(--hero-unit))] block text-[clamp(0.8125rem,calc(0.9*var(--hero-unit)),1.1875rem)] leading-[1.42] tracking-[-0.011em] text-pretty text-cream/80">
                  {t(`${area}Desc`)}
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

      gsap.matchMedia().add(HERO_MEDIA, ({ conditions }) => {
        if (conditions?.["motion"] !== true) {
          return
        }

        return animateHero({ box, canvas, name, root, stage }, conditions["pin"] === true)
      })
    },
    { scope: rootRef },
  )

  const portrait = imageSource(PORTRAIT.name)

  preload(portrait.src, {
    as: "image",
    fetchPriority: "high",
    imageSizes: PORTRAIT.sizes,
    imageSrcSet: portrait.srcSet,
    type: "image/webp",
  })

  return (
    <section className="hero relative pin:h-[260svh]" data-nav-ground={NAV_GROUND.HERO} id={SECTION_IDS.HERO} ref={rootRef}>
      <div className="hero-stage relative top-0 h-svh min-h-[36rem] overflow-hidden text-cream pin:sticky" ref={stageRef}>
        <div className="hero-subject" ref={boxRef}>
          <ResponsiveImage
            alt={t("portraitAlt")}
            className="hero-poster object-contain object-top"
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
            <HeroFocus />
          </div>

          <div
            className="hero-name z-20 -order-1 text-background cover:absolute cover:right-(--hero-inset) cover:bottom-[clamp(0.75rem,calc(1.5*var(--hero-unit)),2rem)] cover:left-(--hero-inset)"
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
        className="pointer-events-none absolute inset-x-0 top-[49%] bottom-0 hidden pin:block"
        data-nav-ground={NAV_GROUND.FLOOD}
      />
    </section>
  )
}
