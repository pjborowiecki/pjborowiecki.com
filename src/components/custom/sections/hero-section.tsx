"use client"

import Image from "next/image"
import { type JSX, useRef } from "react"

import { useTranslations } from "next-intl"

import { gsap, MOTION_OK, useGSAP } from "~/src/lib/gsap"

import { CtaLink } from "~/src/components/custom/cta-link"
import { createHeroStudio, type HeroStudio } from "~/src/components/custom/hero-studio"
import { NAME_STEM_ORIGIN, NameMark } from "~/src/components/custom/name-mark"
import { RollText } from "~/src/components/custom/roll-text"

// Portrait: the supplied headshot. Its sleeve and shoulder, cropped by the original frame, were completed with a
// Higgsfield outpaint; every pixel the photograph already covered, including the face, is the original.

const ENGAGEMENTS = ["engagementAi", "engagementArchitecture", "engagementAdvisory"] as const
const CREDENTIALS = ["credentialCompany", "credentialDegree", "basedIn"] as const

/** How far the name scales to flood the screen with the next section's colour. */
const NAME_FLOOD_SCALE = 90

export function HeroSection(): JSX.Element {
  const t = useTranslations("custom.hero")
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
      if (!root || !stage || !canvas || !box || !name) return

      const q = gsap.utils.selector(root)
      const html = document.documentElement

      gsap.matchMedia().add(MOTION_OK, () => {
        const view = { intro: 0, zoom: 1 }
        let studio: HeroStudio | null = null

        // Falls back to the DOM portrait, which is complete on its own.
        const showPoster = () => {
          html.classList.add("intro-started")
          html.classList.remove("studio-live")
          gsap.set(canvas, { autoAlpha: 0 })
        }

        const lightsUp = () => {
          html.classList.add("intro-started", "studio-live")
          gsap.set(canvas, { autoAlpha: 1 })
          gsap.to(view, {
            intro: 1,
            duration: 2.4,
            ease: "power2.out",
            onUpdate: () => studio?.setIntro(view.intro),
          })
        }

        studio = createHeroStudio({ box, canvas, fadeAnchor: name, stage, onFail: showPoster, onReady: lightsUp })
        if (!studio) showPoster()

        // The name rises out of its own baseline, then the mark is allowed to overflow for the dive.
        const mark = q<SVGSVGElement>("[data-name-mark]")[0]
        gsap.set(mark, { overflow: "hidden" })
        gsap.from(q("[data-word]"), {
          y: 880,
          duration: 1.5,
          ease: "expo.out",
          stagger: 0.09,
          delay: 0.25,
          onComplete: () => {
            gsap.set(mark, { overflow: "visible" })
          },
        })

        let markOpen = false

        // Scrolling goes in through the name: the camera pushes, the copy clears, and the "B" floods the frame with
        // the colour of the section behind it.
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
              onUpdate: (self) => {
                if (markOpen || self.progress === 0) return
                markOpen = true
                gsap.set(mark, { overflow: "visible" })
              },
              onToggle: (self) => studio?.setVisible(self.isActive || self.progress === 0),
            },
          })
          .to(q("[data-copy]"), { autoAlpha: 0, y: "-5svh", duration: 0.2, ease: "power1.in" }, 0)
          .to(
            view,
            {
              zoom: 1.28,
              duration: 0.9,
              ease: "power1.in",
              onUpdate: () => studio?.setZoom(view.zoom),
            },
            0,
          )
          .to(q("[data-name-zoom]"), { scale: NAME_FLOOD_SCALE, svgOrigin: NAME_STEM_ORIGIN, duration: 1, ease: "expo.in" }, 0)

        return () => {
          studio?.destroy()
          html.classList.remove("studio-live")
        }
      })

      gsap.matchMedia().add("(prefers-reduced-motion: reduce)", () => {
        html.classList.add("intro-started")
      })
    },
    { scope: rootRef },
  )

  return (
    <section id="hero" ref={rootRef} data-nav-ground="hero" className="hero relative live:h-[260svh]">
      <div ref={stageRef} className="hero-stage relative live:sticky top-0 h-svh min-h-[36rem] overflow-hidden text-cream">
        <div ref={boxRef} className="hero-subject">
          <Image
            fill
            preload
            src="/images/site/hero-subject.webp"
            alt={t("portraitAlt")}
            sizes="(min-width: 900px) 50vw, 100vw"
            quality={88}
            className="hero-poster intro-hide object-contain object-top"
          />
        </div>
        <div aria-hidden className="hero-fade hero-poster" />
        <canvas ref={canvasRef} aria-hidden className="invisible absolute inset-0 size-full opacity-0" />

        <div className="hero-foot">
          <div className="hero-flanks">
            <div data-copy className="hero-copy z-10 cover:flex cover:flex-col">
              <p className="type-label cover:block hidden border-cream/22 border-b pb-[clamp(0.5rem,0.85vw,1rem)] text-champagne">
                {t("practiceLabel")}
              </p>
              <p className="type-label cover:hidden text-champagne">{t("engagementsShort")}</p>
              <p className="hero-role type-display cover:mt-[clamp(0.75rem,1.05vw,1.5rem)] mt-2 cover:text-[min(2.6vw,4.6svh)] text-[clamp(1.75rem,7.4vw,2.75rem)] leading-[1.03]! tracking-[-0.034em]!">
                {t("role")}
              </p>
              <p className="hero-para type-body cover:mt-[clamp(0.6rem,0.9vw,1.25rem)] mt-3 cover:text-[clamp(0.875rem,min(0.98vw,1.72svh),1.25rem)] text-[0.9375rem] text-cream/88 leading-[1.48] [&_strong]:font-medium [&_strong]:text-cream">
                {t.rich("building", {
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>

              <dl className="hero-creds mt-[clamp(0.75rem,1.15vw,1.5rem)] hidden border-cream/22 border-t text-[clamp(0.8125rem,min(0.86vw,1.5svh),1.0625rem)] tracking-[-0.008em] [@media(min-width:900px)_and_(min-aspect-ratio:11/10)_and_(min-height:760px)]:block">
                {CREDENTIALS.map((credential) => (
                  <div
                    key={credential}
                    className="grid grid-cols-[6.2vw_1fr] gap-x-[0.6vw] border-cream/22 border-b py-[clamp(0.3rem,0.5vw,0.65rem)]"
                  >
                    <dt className="text-cream/65">{t(`${credential}Label`)}</dt>
                    <dd className="font-medium">{t(credential)}</dd>
                  </div>
                ))}
              </dl>

              <div className="ground-tokens cover:mt-auto mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 cover:pt-[clamp(0.75rem,1.1vw,1.5rem)]">
                <CtaLink href="#offer">{t("contactMe")}</CtaLink>
                <a href="#work" className="border-cream/70 border-b pb-0.5 font-medium text-[0.9375rem] tracking-[-0.012em]">
                  <RollText>{t("viewWork")}</RollText>
                </a>
              </div>
            </div>

            <div aria-hidden className="cover:block hidden" />

            <div data-copy className="hero-copy z-10 cover:block hidden">
              <p className="type-label border-cream/22 border-b pb-[clamp(0.5rem,0.85vw,1rem)] text-champagne">{t("engagementsLabel")}</p>
              <ol>
                {ENGAGEMENTS.map((engagement, index) => (
                  <li key={engagement} className="border-cream/22 not-last:border-b">
                    <a
                      href="#skills"
                      className="group grid grid-cols-[2.1vw_1fr] pt-[clamp(0.6rem,1.05vw,1.35rem)] pb-[clamp(0.7rem,1.25vw,1.6rem)]"
                    >
                      <span aria-hidden className="type-label mt-[0.5em] text-champagne">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="block">
                        <span className="type-title block text-[min(2vw,3.5svh)] transition-transform duration-500 ease-out group-hover:translate-x-1.5">
                          {t(`${engagement}Title`)}
                        </span>
                        <span className="mt-[0.5vw] block text-pretty text-[clamp(0.8125rem,min(0.9vw,1.6svh),1.1875rem)] text-cream/80 leading-[1.42] tracking-[-0.011em]">
                          {t(`${engagement}Desc`)}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Paper-coloured, because diving into it lands on the paper of the next section. */}
          <div
            ref={nameRef}
            className="hero-name cover:absolute cover:right-(--gutter) cover:bottom-[clamp(0.75rem,2.4svh,2rem)] cover:left-(--gutter) z-20 -order-1 text-background"
          >
            <h1 className="sr-only">{t("name")}</h1>
            <NameMark className="block h-auto w-full" />
          </div>
        </div>
      </div>
      {/* By this point the name has flooded the screen with paper, so the nav changes ink. */}
      <div aria-hidden data-nav-ground="flood" className="pointer-events-none absolute inset-x-0 top-[49%] bottom-0 live:block hidden" />
    </section>
  )
}
