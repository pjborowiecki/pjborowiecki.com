"use client"

import Image from "next/image"
import { type JSX, useRef } from "react"

import { useTranslations } from "next-intl"

import { gsap, MOTION_OK, useGSAP } from "~/src/lib/gsap"

import { type DiagramState, SystemDiagram, type SystemDiagramHandle } from "~/src/components/custom/system-diagram"

/**
 * The page's peak. The camera pushes past Piotr into his whiteboard, which becomes the viewport, and the reader's
 * scroll takes a system from a mess to something that makes sense. One idea, told once.
 */
export function PhilosophySection(): JSX.Element {
  const t = useTranslations("custom.philosophy")
  const rootRef = useRef<HTMLElement>(null)
  const diagramRef = useRef<SystemDiagramHandle>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      const q = gsap.utils.selector(root)

      gsap.matchMedia().add(MOTION_OK, () => {
        const state: DiagramState = { draw: 0, order: 0, bus: 0 }
        const render = () => diagramRef.current?.update(state)
        render()

        const steps = q<HTMLElement>("[data-step]")
        gsap.set(steps, { autoAlpha: 0 })
        gsap.set(q("[data-signoff]"), { autoAlpha: 0 })

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: render,
          scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.5 },
        })

        const swap = (from: Element, to: Element, at: number) => {
          timeline
            .to(from, { autoAlpha: 0, y: -18, duration: 0.25, ease: "power1.in" }, at)
            .fromTo(to, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, at + 0.25)
        }

        // Camera: past the man, into the board.
        timeline
          .to(q("[data-opening]"), { autoAlpha: 0, y: -48, duration: 0.42, ease: "power1.in" }, 0)
          .to(q("[data-photo-image]"), { scale: 3.5, duration: 1, ease: "power2.in" }, 0)
          .to(q("[data-photo]"), { autoAlpha: 0, duration: 0.22 }, 0.8)

        // The mess.
        timeline
          .fromTo(steps[0], { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, 1)
          .to(state, { draw: 1, duration: 1.05, ease: "power1.inOut" }, 0.95)

        // Someone takes it on, and the longest move on the page begins.
        swap(steps[0], steps[1], 2.3)
        timeline
          .to(state, { order: 1, duration: 1.7, ease: "power2.inOut" }, 2.4)
          .to(state, { bus: 1, duration: 0.5, ease: "power2.inOut" }, 3.9)

        // It makes sense.
        swap(steps[1], steps[2], 3.95)
        timeline.fromTo(q("[data-signoff]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }, 4.7)

        timeline.to({}, { duration: 0.65 }, 5.15)
      })
    },
    { scope: rootRef },
  )

  return (
    <section id="philosophy" ref={rootRef} data-nav-ground="board" className="relative live:h-[400svh] bg-board">
      <div className="live:sticky live:top-0 live:h-svh live:overflow-hidden">
        {/* Photograph, on top of the board until the camera has passed through it */}
        <div data-photo className="live:absolute relative live:inset-0 live:z-10 aspect-[3/2] live:aspect-auto overflow-hidden">
          <div data-photo-image className="absolute inset-0 origin-[100%_44%] md:origin-[89%_44%]">
            <Image
              fill
              src="/images/site/architect-whiteboard.webp"
              alt={t("photoAlt")}
              sizes="(min-width: 768px) 130vw, 240vw"
              quality={88}
              className="object-cover object-[76%_40%] md:object-[50%_40%]"
            />
          </div>
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-b from-background/85 via-30% via-background/30 to-55% to-transparent md:bg-linear-to-r md:from-background/85 md:via-22% md:via-background/45 md:to-44%"
          />
          <div
            data-opening
            className="frame absolute inset-x-0 top-[calc(var(--nav-height)+1rem)] md:top-[calc(var(--nav-height)+clamp(1rem,5svh,4rem))]"
          >
            <p className="type-label text-foreground">{t("label")}</p>
            <h2 className="type-display mt-3 max-w-[11ch] text-[clamp(2.75rem,6.5vw,9.5rem)] text-foreground">{t("title")}</h2>
          </div>
        </div>

        {/* Board */}
        <div className="frame live:absolute relative live:inset-0 live:max-w-none live:pt-0 pt-14 live:pb-0 pb-20">
          <div className="grid live:h-full side:grid-cols-12 side:live:grid-rows-1 side:gap-x-6 gap-y-10 live:gap-y-0 live:[grid-template-rows:minmax(0,1fr)_auto]">
            <div className="side:order-2 side:col-span-8 side:col-start-5 side:live:flex side:live:h-svh side:live:items-center live:pt-[calc(var(--nav-height)+0.25rem)] side:live:pt-[calc(var(--nav-height)+0.75rem)] side:live:pb-6">
              <SystemDiagram ref={diagramRef} className="mx-auto size-full max-h-full overflow-visible text-[#0d1526]" />
            </div>

            <div className="relative side:order-1 side:col-span-4 flex live:h-[clamp(15rem,38svh,19rem)] side:live:h-svh flex-col side:live:justify-center live:pt-3 side:live:pt-0">
              <div className="relative flex side:live:h-[60svh] live:flex-1 side:live:flex-none flex-col gap-10 live:gap-0">
                <div data-step className="live:absolute live:inset-x-0 live:top-0">
                  <h3 className="type-display text-[clamp(1.875rem,3.7vw,5.25rem)] text-foreground">{t("messTitle")}</h3>
                  <p className="type-body mt-3 side:mt-6 side:text-[clamp(1rem,1.2vw,1.5rem)] text-[0.9375rem]">{t("messBody")}</p>
                </div>
                <div data-step className="live:absolute live:inset-x-0 live:top-0">
                  <h3 className="type-display text-[clamp(1.875rem,3.7vw,5.25rem)] text-foreground">{t("ownTitle")}</h3>
                </div>
                <div data-step className="live:absolute live:inset-x-0 live:top-0">
                  <h3 className="type-display text-[clamp(1.875rem,3.7vw,5.25rem)] text-foreground">{t("clearTitle")}</h3>
                  <p className="type-body mt-3 side:mt-6 side:text-[clamp(1rem,1.2vw,1.5rem)] text-[0.9375rem]">{t("clearBody")}</p>
                  <p
                    data-signoff
                    className="type-title mt-4 side:mt-8 border-foreground/25 border-t pt-4 side:pt-6 text-[clamp(1.25rem,1.9vw,2.5rem)] text-foreground [@media(max-height:759px)_and_(max-width:767px)]:hidden"
                  >
                    {t("signoff")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
