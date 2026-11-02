"use client"

import Image from "next/image"
import { type JSX, type KeyboardEvent, useEffect, useId, useRef, useState } from "react"

import { useTranslations } from "next-intl"
import { createPortal } from "react-dom"

import { gsap, MOTION_OK, useGSAP } from "~/src/lib/gsap"

import { ArrowRightIcon, ArrowUpRightIcon, CloseIcon } from "~/src/components/custom/icons"
import { RollText } from "~/src/components/custom/roll-text"
import { useLenis } from "~/src/components/custom/smooth-scroll"

import type { Project } from "~/src/types"

const FOCUSABLE = "a[href], button:not([tabindex='-1']), [tabindex='0']"

/** Share of the capture that scrolls past while the panel is read. */
const CAPTURE_TRAVEL = 0.62

interface CaseStudyPanelProps {
  next: Project | null
  onClose: () => void
  onSelect: (project: Project) => void
  project: Project | null
}

export function CaseStudyPanel({ next, onClose, onSelect, project }: Readonly<CaseStudyPanelProps>): JSX.Element | null {
  const t = useTranslations("custom.work")
  const lenis = useLenis()
  const titleId = useId()
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const captureFrameRef = useRef<HTMLDivElement>(null)
  const captureRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const wasOpenRef = useRef(false)
  const closingRef = useRef(false)
  const isOpen = project !== null

  // The portal target only exists in the browser.
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!isOpen) return

    const opener = document.activeElement as HTMLElement | null
    const background = [...document.querySelectorAll("main, header:not([data-panel-header])")]
    const previousOverflow = document.documentElement.style.overflow

    for (const element of background) element.setAttribute("inert", "")
    if (lenis) lenis.stop()
    else document.documentElement.style.overflow = "hidden"
    closeRef.current?.focus({ preventScroll: true, focusVisible: false })

    return () => {
      for (const element of background) element.removeAttribute("inert")
      lenis?.start()
      document.documentElement.style.overflow = previousOverflow
      opener?.focus({ preventScroll: true })
    }
  }, [isOpen, lenis])

  useGSAP(
    () => {
      const panel = panelRef.current
      if (!project || !panel) {
        wasOpenRef.current = false
        return
      }

      panel.scrollTop = 0
      gsap.set(contentRef.current, { clearProps: "all" })

      gsap.matchMedia().add(MOTION_OK, () => {
        if (!wasOpenRef.current) {
          gsap.from(containerRef.current, { opacity: 0, duration: 0.5, ease: "power3.out" })
          gsap.from(panel, { x: "100%", duration: 0.85, ease: "expo.out" })
        }

        gsap.from(gsap.utils.toArray("[data-rise]", panel), {
          y: 44,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.07,
          delay: wasOpenRef.current ? 0.05 : 0.28,
        })

        // The real site scrolls inside its frame as the panel is read.
        gsap.to(captureRef.current, {
          yPercent: -100 * CAPTURE_TRAVEL,
          ease: "none",
          scrollTrigger: { scroller: panel, trigger: captureFrameRef.current, start: "top 45%", end: "bottom top", scrub: 0.3 },
        })
      })

      wasOpenRef.current = true
    },
    { dependencies: [project?.id], revertOnUpdate: true },
  )

  const close = () => {
    if (closingRef.current) return
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose()
      return
    }
    closingRef.current = true
    gsap.to(panelRef.current, { x: "100%", duration: 0.5, ease: "power3.in" })
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: "power3.in",
      onComplete: () => {
        closingRef.current = false
        onClose()
      },
    })
  }

  const goTo = (target: Project) => {
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onSelect(target)
      return
    }
    gsap.to(contentRef.current, { y: -28, autoAlpha: 0, duration: 0.28, ease: "power2.in", onComplete: () => onSelect(target) })
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      close()
      return
    }
    if (event.key !== "Tab") return

    // Everything behind is inert, so Tab only has to wrap around inside the panel.
    const focusable = [...(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
    const first = focusable[0]
    const last = focusable.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  if (!mounted || !project) return null

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-lenis-prevent
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-100 flex justify-end font-sans text-foreground"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={t("close")}
        onClick={close}
        className="absolute inset-0 block size-full bg-foreground/60 backdrop-blur-sm"
      />

      <article
        ref={panelRef}
        data-lenis-prevent
        className="relative h-full w-full overflow-y-auto overscroll-contain bg-background shadow-[-40px_0_90px_-30px_rgb(13_21_38/55%)] lg:w-[85vw]"
      >
        <div className="pointer-events-none sticky top-0 z-20 flex h-0 justify-end">
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="group pointer-events-auto mt-4 mr-4 flex h-fit items-center gap-3 font-semibold text-sm tracking-[-0.01em] md:mt-7 md:mr-7"
          >
            <span className="sr-only">{t("close")}</span>
            <span className="flex size-11 items-center justify-center rounded-full bg-foreground text-background transition-transform duration-500 ease-out group-hover:rotate-90">
              <CloseIcon className="size-5" />
            </span>
          </button>
        </div>

        <div ref={contentRef}>
          <header
            data-panel-header
            className="px-(--panel-x) pt-[clamp(4.5rem,8vw,7.5rem)] pb-[clamp(1.75rem,3vw,3.5rem)] [--panel-x:clamp(1.25rem,4vw,5rem)]"
          >
            <h2 data-rise id={titleId} className="type-display text-[clamp(3rem,8.4vw,11rem)]">
              {project.title}
            </h2>
            <dl
              data-rise
              className="mt-[clamp(1.5rem,3vw,3rem)] grid grid-cols-2 gap-x-6 gap-y-4 border-foreground border-t pt-3 md:grid-cols-12"
            >
              <div className="md:col-span-3">
                <dt className="type-label">{t("role")}</dt>
                <dd className="mt-0.5 font-semibold text-lg tracking-[-0.02em]">{t("lead")}</dd>
              </div>
              <div className="md:col-span-3">
                <dt className="type-label">{t("year")}</dt>
                <dd className="mt-0.5 font-semibold text-lg tracking-[-0.02em]">{project.year}</dd>
              </div>
              <div className="col-span-2 md:col-span-6">
                <dt className="type-label">{t("category")}</dt>
                <dd className="mt-0.5 font-semibold text-lg tracking-[-0.02em]">{project.category}</dd>
              </div>
            </dl>
          </header>

          <div className="[--panel-x:clamp(1.25rem,4vw,5rem)]">
            <div
              ref={captureFrameRef}
              data-rise
              className="relative mx-(--panel-x) aspect-[16/10] overflow-hidden bg-muted ring-1 ring-foreground/10"
            >
              <div ref={captureRef} className="absolute inset-x-0 top-0">
                <Image
                  src={project.image}
                  alt={`${project.title}: ${project.category}`}
                  width={project.imageWidth ?? 1600}
                  height={project.imageHeight ?? 1000}
                  sizes="(min-width: 1024px) 78vw, 100vw"
                  className="h-auto w-full"
                />
              </div>
            </div>

            <div className="grid gap-y-5 px-(--panel-x) pt-[clamp(3.5rem,7vw,7rem)] md:grid-cols-12 md:gap-x-6">
              <h3 className="type-label text-foreground md:col-span-3">{t("brief")}</h3>
              <div className="md:col-span-9">
                <p className="type-lead text-foreground text-lead">
                  {project.shortDescription} {project.challenge}
                </p>
                <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-1">
                  {project.techStack.map((tech) => (
                    <li key={tech} className="type-label text-foreground">
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-y-10 px-(--panel-x) pt-[clamp(3.5rem,7vw,7rem)] md:grid-cols-12 md:gap-x-6">
              <div className="md:col-span-6">
                <h3 className="type-title text-[clamp(1.75rem,2.8vw,3.25rem)]">{t("architectural")}</h3>
                <p className="type-body mt-5 md:text-lg">{project.solution}</p>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-7 inline-flex items-center gap-1.5 border-foreground border-b-2 pb-0.5 font-semibold tracking-[-0.01em]"
                  >
                    <RollText>{t("visit")}</RollText>
                    <ArrowUpRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-7 inline-flex items-center gap-1.5 border-foreground border-b-2 pb-0.5 font-semibold tracking-[-0.01em]"
                  >
                    <RollText>{`${project.github.stars} ${t("starsLabel")}`}</RollText>
                    <ArrowUpRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                )}
              </div>

              <div className="md:col-span-6">
                <h3 className="type-title text-[clamp(1.75rem,2.8vw,3.25rem)]">{t("results")}</h3>
                <p className="type-body mt-5 md:text-lg">{project.outcome}</p>
              </div>
            </div>

            {next && (
              <button
                type="button"
                onClick={() => goTo(next)}
                className="group relative mt-[clamp(3.5rem,7vw,7rem)] grid w-full grid-cols-[1fr_auto] items-end gap-x-6 overflow-hidden border-foreground border-t px-(--panel-x) py-[clamp(2rem,4vw,4.5rem)] text-left"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 origin-bottom scale-y-0 bg-champagne transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-y-100"
                />
                <span className="relative">
                  <span className="type-label block">{t("nextProject")}</span>
                  <span className="type-display mt-3 block text-[clamp(2.5rem,6.4vw,8rem)]">{next.title}</span>
                </span>
                <ArrowRightIcon className="relative mb-[0.5vw] size-[clamp(2rem,4.5vw,5rem)] transition-transform duration-500 ease-out group-hover:translate-x-2" />
              </button>
            )}
          </div>
        </div>
      </article>
    </div>,
    document.body,
  )
}
