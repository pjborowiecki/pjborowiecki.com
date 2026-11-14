import { type JSX, type KeyboardEvent, type RefObject, useEffect, useId, useRef } from "react"
import { createPortal } from "react-dom"

import { Button } from "react-aria-components"
import { FocusScope } from "react-aria/FocusScope"
import { useTranslations } from "use-intl/react"

import { MOTION_OK, gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

import { useLenis } from "~/src/hooks/use-lenis"

import type { Project } from "~/src/data/projects"

import { ArrowRightIcon, ArrowUpRightIcon, CloseIcon } from "~/src/presentation/components/custom/icons"
import { ResponsiveImage } from "~/src/presentation/components/custom/landing-page/components/responsive-image"
import { RollText } from "~/src/presentation/components/custom/landing-page/components/roll-text"

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"
const BACKGROUND_SELECTOR = "main, header:not([data-panel-header])"
const ESCAPE_KEY = "Escape"

const OVERLAY_FADE_IN: gsap.TweenVars = { duration: 0.5, ease: "power3.out", opacity: 0 }
const PANEL_SLIDE_IN: gsap.TweenVars = { duration: 0.85, ease: "expo.out", x: "100%" }
const CONTENT_RISE: gsap.TweenVars = { autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.07, y: 44 }
const RISE_DELAY = { AFTER_SWITCH: 0.05, ON_OPEN: 0.28 } as const
const CAPTURE_SCROLL: gsap.TweenVars = { ease: "none", yPercent: -62 }
const CAPTURE_SCROLL_TRIGGER = { end: "bottom top", scrub: 0.3, start: "top 45%" } as const
const PANEL_SLIDE_OUT: gsap.TweenVars = { duration: 0.5, ease: "power3.in", x: "100%" }
const OVERLAY_FADE_OUT: gsap.TweenVars = { duration: 0.5, ease: "power3.in", opacity: 0 }
const CONTENT_LEAVE: gsap.TweenVars = { autoAlpha: 0, duration: 0.28, ease: "power2.in", y: -28 }

const PANEL_LINK_CLASSNAME =
  "group mt-7 inline-flex items-center gap-1.5 border-foreground border-b-2 pb-0.5 font-semibold tracking-[-0.01em]"
const FACT_VALUE_CLASSNAME = "mt-0.5 font-semibold text-lg tracking-[-0.02em]"
const SECTION_TITLE_CLASSNAME = "type-title text-[clamp(1.75rem,2.8vw,3.25rem)]"
const SECTION_BODY_CLASSNAME = "type-body mt-5 md:text-lg"

const prefersReducedMotion = (): boolean => globalThis.matchMedia(REDUCED_MOTION).matches

interface EntranceTargets {
  readonly capture: HTMLElement | null
  readonly captureFrame: HTMLElement | null
  readonly container: HTMLElement | null
  readonly isSwitching: boolean
  readonly panel: HTMLElement
}

const playEntrance = ({ capture, captureFrame, container, isSwitching, panel }: EntranceTargets): void => {
  if (!isSwitching) {
    gsap.from(container, { ...OVERLAY_FADE_IN })
    gsap.from(panel, { ...PANEL_SLIDE_IN })
  }

  gsap.from(gsap.utils.toArray("[data-rise]", panel), {
    ...CONTENT_RISE,
    delay: isSwitching ? RISE_DELAY.AFTER_SWITCH : RISE_DELAY.ON_OPEN,
  })

  gsap.to(capture, { ...CAPTURE_SCROLL, scrollTrigger: { ...CAPTURE_SCROLL_TRIGGER, scroller: panel, trigger: captureFrame } })
}

const useHeldBackground = (isOpen: boolean, closeRef: RefObject<HTMLButtonElement | null>): void => {
  const lenis = useLenis()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const background = [...document.querySelectorAll(BACKGROUND_SELECTOR)]
    const previousOverflow = document.documentElement.style.overflow

    for (const element of background) {
      element.setAttribute("inert", "")
    }
    if (lenis) {
      lenis.stop()
    } else {
      document.documentElement.style.overflow = "hidden"
    }
    closeRef.current?.focus({ focusVisible: false, preventScroll: true })

    return () => {
      for (const element of background) {
        element.removeAttribute("inert")
      }
      lenis?.start()
      document.documentElement.style.overflow = previousOverflow
    }
  }, [closeRef, isOpen, lenis])
}

interface PanelLinkProps {
  readonly children: string
  readonly href: string
}

const PanelLink = ({ children, href }: PanelLinkProps): JSX.Element => (
  <a className={PANEL_LINK_CLASSNAME} href={href} rel="noopener noreferrer" target="_blank">
    <RollText>{children}</RollText>
    <ArrowUpRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
  </a>
)

interface CaseStudyHeaderProps {
  readonly project: Project
  readonly titleId: string
}

const CaseStudyHeader = ({ project, titleId }: CaseStudyHeaderProps): JSX.Element => {
  const t = useTranslations("pages.landing.work")

  return (
    <header
      className="px-(--panel-x) pt-[clamp(4.5rem,8vw,7.5rem)] pb-[clamp(1.75rem,3vw,3.5rem)] [--panel-x:clamp(1.25rem,4vw,5rem)]"
      data-panel-header
    >
      <h2 className="type-display text-[clamp(3rem,8.4vw,11rem)]" data-rise id={titleId}>
        {project.title}
      </h2>
      <dl
        className="mt-[clamp(1.5rem,3vw,3rem)] grid grid-cols-2 gap-x-6 gap-y-4 border-t border-foreground pt-3 md:grid-cols-12"
        data-rise
      >
        <div className="md:col-span-3">
          <dt className="type-label">{t("role")}</dt>
          <dd className={FACT_VALUE_CLASSNAME}>{t("lead")}</dd>
        </div>
        <div className="md:col-span-3">
          <dt className="type-label">{t("year")}</dt>
          <dd className={FACT_VALUE_CLASSNAME}>{project.year}</dd>
        </div>
        <div className="col-span-2 md:col-span-6">
          <dt className="type-label">{t("category")}</dt>
          <dd className={FACT_VALUE_CLASSNAME}>{t(`projects.${project.id}.category`)}</dd>
        </div>
      </dl>
    </header>
  )
}

interface CaseStudyCaptureProps {
  readonly captureFrameRef: RefObject<HTMLDivElement | null>
  readonly captureRef: RefObject<HTMLDivElement | null>
  readonly project: Project
}

const CaseStudyCapture = ({ captureFrameRef, captureRef, project }: CaseStudyCaptureProps): JSX.Element => {
  const t = useTranslations("pages.landing.work")

  return (
    <div
      className="relative mx-(--panel-x) aspect-[16/10] overflow-hidden bg-muted ring-1 ring-foreground/10"
      data-rise
      ref={captureFrameRef}
    >
      <div className="absolute inset-x-0 top-0" ref={captureRef}>
        <ResponsiveImage
          alt={`${project.title}: ${t(`projects.${project.id}.category`)}`}
          className="h-auto w-full"
          name={project.image}
          sizes="(min-width: 1024px) 78vw, 100vw"
        />
      </div>
    </div>
  )
}

const CaseStudyBrief = ({ project }: { readonly project: Project }): JSX.Element => {
  const t = useTranslations("pages.landing.work")

  return (
    <div className="grid gap-y-5 px-(--panel-x) pt-[clamp(3.5rem,7vw,7rem)] md:grid-cols-12 md:gap-x-6">
      <h3 className="type-label text-foreground md:col-span-3">{t("brief")}</h3>
      <div className="md:col-span-9">
        <p className="type-lead text-lead text-foreground">
          {t(`projects.${project.id}.summary`)} {t(`projects.${project.id}.challenge`)}
        </p>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-1">
          {project.techStack.map((tech) => (
            <li className="type-label text-foreground" key={tech}>
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const CaseStudyDecisions = ({ project }: { readonly project: Project }): JSX.Element => {
  const t = useTranslations("pages.landing.work")

  return (
    <div className="grid gap-y-10 px-(--panel-x) pt-[clamp(3.5rem,7vw,7rem)] md:grid-cols-12 md:gap-x-6">
      <div className="md:col-span-6">
        <h3 className={SECTION_TITLE_CLASSNAME}>{t("architectural")}</h3>
        <p className={SECTION_BODY_CLASSNAME}>{t(`projects.${project.id}.solution`)}</p>
        {project.url !== undefined && <PanelLink href={project.url}>{t("visit")}</PanelLink>}
        {project.github !== undefined && (
          <PanelLink href={project.github.url}>{`${t("starsCount", { stars: project.github.stars })} ${t("starsLabel")}`}</PanelLink>
        )}
      </div>

      <div className="md:col-span-6">
        <h3 className={SECTION_TITLE_CLASSNAME}>{t("results")}</h3>
        <p className={SECTION_BODY_CLASSNAME}>{t(`projects.${project.id}.outcome`)}</p>
      </div>
    </div>
  )
}

interface NextProjectButtonProps {
  readonly next: Project
  readonly onPress: () => void
}

const NextProjectButton = ({ next, onPress }: NextProjectButtonProps): JSX.Element => {
  const t = useTranslations("pages.landing.work")

  return (
    <Button
      className="group relative mt-[clamp(3.5rem,7vw,7rem)] grid w-full grid-cols-[1fr_auto] items-end gap-x-6 overflow-hidden border-t border-foreground px-(--panel-x) py-[clamp(2rem,4vw,4.5rem)] text-left"
      onPress={onPress}
    >
      <span
        aria-hidden
        className="absolute inset-0 origin-bottom scale-y-0 bg-champagne transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-y-100"
      />
      <span className="relative">
        <span className="block type-label">{t("nextProject")}</span>
        <span className="mt-3 block type-display text-[clamp(2.5rem,6.4vw,8rem)]">{next.title}</span>
      </span>
      <ArrowRightIcon className="relative mb-[0.5vw] size-[clamp(2rem,4.5vw,5rem)] transition-transform duration-500 ease-out group-hover:translate-x-2" />
    </Button>
  )
}

interface CaseStudyPanelProps {
  readonly next: Project | undefined
  readonly onClose: () => void
  readonly onSelect: (project: Project) => void
  readonly project: Project | undefined
}

export const CaseStudyPanel = ({ next, onClose, onSelect, project }: CaseStudyPanelProps): JSX.Element | undefined => {
  const t = useTranslations("pages.landing.work")
  const titleId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const captureFrameRef = useRef<HTMLDivElement>(null)
  const captureRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const wasOpenRef = useRef(false)
  const isClosingRef = useRef(false)

  useHeldBackground(project !== undefined, closeRef)

  useGSAP(
    () => {
      const panel = panelRef.current
      if (project === undefined || !panel) {
        wasOpenRef.current = false
        return
      }

      panel.scrollTop = 0
      gsap.set(contentRef.current, { clearProps: "all" })
      gsap.matchMedia().add(MOTION_OK, () => {
        playEntrance({
          capture: captureRef.current,
          captureFrame: captureFrameRef.current,
          container: containerRef.current,
          isSwitching: wasOpenRef.current,
          panel,
        })
      })
      wasOpenRef.current = true
    },
    { dependencies: [project?.id], revertOnUpdate: true },
  )

  const close = (): void => {
    if (isClosingRef.current) {
      return
    }
    if (prefersReducedMotion()) {
      onClose()
      return
    }
    isClosingRef.current = true
    gsap.to(panelRef.current, { ...PANEL_SLIDE_OUT })
    gsap.to(containerRef.current, {
      ...OVERLAY_FADE_OUT,
      onComplete: () => {
        isClosingRef.current = false
        onClose()
      },
    })
  }

  const goTo = (target: Project): void => {
    if (prefersReducedMotion()) {
      onSelect(target)
      return
    }
    gsap.to(contentRef.current, {
      ...CONTENT_LEAVE,
      onComplete: () => {
        onSelect(target)
      },
    })
  }

  const closeOnEscape = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === ESCAPE_KEY) {
      close()
    }
  }

  if (project === undefined) {
    return undefined
  }

  return createPortal(
    <FocusScope contain restoreFocus>
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="fixed inset-0 z-100 flex justify-end font-sans text-foreground"
        data-lenis-prevent
        onKeyDown={closeOnEscape}
        ref={containerRef}
        role="dialog"
      >
        <Button
          aria-label={t("close")}
          className="absolute inset-0 block size-full bg-foreground/60 backdrop-blur-sm"
          excludeFromTabOrder
          onPress={close}
        />

        <article
          className="relative h-full w-full overflow-y-auto overscroll-contain bg-background shadow-[-40px_0_90px_-30px_rgb(13_21_38/55%)] lg:w-[85vw]"
          data-lenis-prevent
          ref={panelRef}
        >
          <div className="pointer-events-none sticky top-0 z-20 flex h-0 justify-end">
            <Button
              className="group pointer-events-auto mt-4 mr-4 flex h-fit items-center gap-3 text-sm font-semibold tracking-[-0.01em] md:mt-7 md:mr-7"
              onPress={close}
              ref={closeRef}
            >
              <span className="sr-only">{t("close")}</span>
              <span className="flex size-11 items-center justify-center rounded-full bg-foreground text-background transition-transform duration-500 ease-out group-hover:rotate-90">
                <CloseIcon className="size-5" />
              </span>
            </Button>
          </div>

          <div ref={contentRef}>
            <CaseStudyHeader project={project} titleId={titleId} />

            <div className="[--panel-x:clamp(1.25rem,4vw,5rem)]">
              <CaseStudyCapture captureFrameRef={captureFrameRef} captureRef={captureRef} project={project} />

              <CaseStudyBrief project={project} />
              <CaseStudyDecisions project={project} />
              {next !== undefined && (
                <NextProjectButton
                  next={next}
                  onPress={() => {
                    goTo(next)
                  }}
                />
              )}
            </div>
          </div>
        </article>
      </div>
    </FocusScope>,
    document.body,
  )
}
