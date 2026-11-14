import { type JSX, type RefObject, useRef } from "react"

import { useTranslations } from "use-intl/react"

import { MOTION_OK, gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

import { NAV_GROUND, SECTION_IDS } from "~/src/data/marketing"
import type { DiagramState, SystemDiagramHandle } from "~/src/data/system-diagram"

import { ResponsiveImage } from "~/src/presentation/components/custom/landing-page/components/responsive-image"
import { SystemDiagram } from "~/src/presentation/components/custom/landing-page/components/system-diagram"

const SCROLL_STORY: ScrollTrigger.Vars = { end: "bottom bottom", scrub: 0.5, start: "top top" }

const OPENING_EXIT: gsap.TweenVars = { autoAlpha: 0, duration: 0.42, ease: "power1.in", y: -48 }
const PHOTO_PUSH: gsap.TweenVars = { duration: 1, ease: "power2.in", scale: 3.5 }
const PHOTO_EXIT: gsap.TweenVars = { autoAlpha: 0, duration: 0.22 }

const STEP_HIDDEN: gsap.TweenVars = { autoAlpha: 0, y: 22 }
const STEP_ENTER: gsap.TweenVars = { autoAlpha: 1, duration: 0.4, ease: "power2.out", y: 0 }
const STEP_EXIT: gsap.TweenVars = { autoAlpha: 0, duration: 0.25, ease: "power1.in", y: -18 }
const STEP_ENTER_DELAY = 0.25

const SIGNOFF_HIDDEN: gsap.TweenVars = { autoAlpha: 0, y: 16 }
const SIGNOFF_ENTER: gsap.TweenVars = { autoAlpha: 1, duration: 0.45, ease: "power2.out", y: 0 }

const DRAW: gsap.TweenVars = { draw: 1, duration: 1.05, ease: "power1.inOut" }
const ORDER: gsap.TweenVars = { duration: 1.7, ease: "power2.inOut", order: 1 }
const BUS: gsap.TweenVars = { bus: 1, duration: 0.5, ease: "power2.inOut" }
const HOLD: gsap.TweenVars = { duration: 0.65 }

const AT = {
  bus: 3.9,
  clear: 3.95,
  draw: 0.95,
  hold: 5.15,
  mess: 1,
  order: 2.4,
  own: 2.3,
  photoExit: 0.8,
  signoff: 4.7,
} as const

const PHOTO_SIZES = "(min-width: 768px) 130vw, 240vw"

const playScrollStory = (root: HTMLElement, diagram: RefObject<SystemDiagramHandle | null>): void => {
  const select = gsap.utils.selector(root)
  const state: DiagramState = { bus: 0, draw: 0, order: 0 }
  const render = (): void => {
    diagram.current?.update(state)
  }

  render()

  const steps = select<HTMLElement>("[data-step]")
  const [mess, own, clear] = steps

  if (!mess || !own || !clear) {
    return
  }

  gsap.set(steps, { autoAlpha: 0 })
  gsap.set(select("[data-signoff]"), { autoAlpha: 0 })

  const timeline = gsap.timeline({ defaults: { ease: "none" }, onUpdate: render, scrollTrigger: { ...SCROLL_STORY, trigger: root } })
  const swap = (from: Element, to: Element, at: number): void => {
    timeline.to(from, { ...STEP_EXIT }, at).fromTo(to, { ...STEP_HIDDEN }, { ...STEP_ENTER }, at + STEP_ENTER_DELAY)
  }

  timeline
    .to(select("[data-opening]"), { ...OPENING_EXIT }, 0)
    .to(select("[data-photo-image]"), { ...PHOTO_PUSH }, 0)
    .to(select("[data-photo]"), { ...PHOTO_EXIT }, AT.photoExit)

  timeline.fromTo(mess, { ...STEP_HIDDEN }, { ...STEP_ENTER }, AT.mess).to(state, { ...DRAW }, AT.draw)

  swap(mess, own, AT.own)
  timeline.to(state, { ...ORDER }, AT.order).to(state, { ...BUS }, AT.bus)

  swap(own, clear, AT.clear)
  timeline.fromTo(select("[data-signoff]"), { ...SIGNOFF_HIDDEN }, { ...SIGNOFF_ENTER }, AT.signoff)

  timeline.to({}, { ...HOLD }, AT.hold)
}

export const PhilosophySection = (): JSX.Element => {
  const t = useTranslations("pages.landing.philosophy")
  const rootRef = useRef<HTMLElement>(null)
  const diagramRef = useRef<SystemDiagramHandle>(null)

  useGSAP(
    () => {
      const root = rootRef.current

      if (!root) {
        return
      }

      gsap.matchMedia().add(MOTION_OK, () => {
        playScrollStory(root, diagramRef)
      })
    },
    { scope: rootRef },
  )

  return (
    <section className="relative bg-board live:h-[400svh]" data-nav-ground={NAV_GROUND.BOARD} id={SECTION_IDS.PHILOSOPHY} ref={rootRef}>
      <div className="live:sticky live:top-0 live:h-svh live:overflow-hidden">
        <div
          className="relative aspect-[4/5] overflow-hidden md:aspect-[3/2] live:absolute live:inset-0 live:z-10 live:aspect-auto"
          data-photo
        >
          <div className="absolute inset-0 origin-[100%_44%] md:origin-[89%_44%]" data-photo-image>
            <ResponsiveImage
              alt={t("photoAlt")}
              className="object-cover object-[76%_40%] md:object-[50%_40%]"
              isFill
              name="architect-whiteboard"
              sizes={PHOTO_SIZES}
            />
          </div>
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-t from-background/95 from-12% via-background/70 via-36% to-transparent to-60% md:bg-linear-to-r md:from-background/85 md:from-0% md:via-background/45 md:via-22% md:to-44%"
          />
          <div
            className="absolute inset-x-0 bottom-[clamp(1.75rem,5svh,3rem)] frame md:top-[calc(var(--nav-height)+clamp(1rem,5svh,4rem))] md:bottom-auto"
            data-opening
          >
            <p className="type-label text-foreground">{t("label")}</p>
            <h2 className="mt-3 max-w-[11ch] type-display text-[clamp(2.75rem,6.5vw,9.5rem)] text-foreground">{t("title")}</h2>
          </div>
        </div>

        <div className="relative frame pt-14 pb-20 live:absolute live:inset-0 live:max-w-none live:pt-0 live:pb-0">
          <div className="grid gap-y-10 side:grid-cols-12 side:gap-x-6 live:h-full live:[grid-template-rows:minmax(0,1fr)_auto] live:gap-y-0 side:live:grid-rows-1">
            <div className="side:order-2 side:col-span-8 side:col-start-5 live:pt-[calc(var(--nav-height)+0.25rem)] side:live:flex side:live:h-svh side:live:items-center side:live:pt-[calc(var(--nav-height)+0.75rem)] side:live:pb-6">
              <SystemDiagram className="mx-auto size-full max-h-full overflow-visible text-[#0d1526]" ref={diagramRef} />
            </div>

            <div className="relative flex flex-col side:order-1 side:col-span-4 live:mt-5 live:h-[clamp(15rem,38svh,19rem)] live:border-t live:border-foreground/15 live:pt-6 side:live:mt-0 side:live:h-svh side:live:justify-center side:live:border-t-0 side:live:pt-0">
              <div className="relative flex flex-col gap-10 live:flex-1 live:gap-0 side:live:h-[60svh] side:live:flex-none">
                <div className="live:absolute live:inset-x-0 live:top-0" data-step>
                  <h3 className="type-display text-[clamp(1.875rem,3.7vw,5.25rem)] text-foreground">{t("messTitle")}</h3>
                  <p className="mt-3 type-body text-[0.9375rem] side:mt-6 side:text-[clamp(1rem,1.2vw,1.5rem)]">{t("messBody")}</p>
                </div>
                <div className="live:absolute live:inset-x-0 live:top-0" data-step>
                  <h3 className="type-display text-[clamp(1.875rem,3.7vw,5.25rem)] text-foreground">{t("ownTitle")}</h3>
                </div>
                <div className="live:absolute live:inset-x-0 live:top-0" data-step>
                  <h3 className="type-display text-[clamp(1.875rem,3.7vw,5.25rem)] text-foreground">{t("clearTitle")}</h3>
                  <p className="mt-3 type-body text-[0.9375rem] side:mt-6 side:text-[clamp(1rem,1.2vw,1.5rem)]">{t("clearBody")}</p>
                  <p
                    className="mt-4 border-t border-foreground/25 pt-4 type-title text-[clamp(1.25rem,1.9vw,2.5rem)] text-foreground side:mt-8 side:pt-6 [@media(max-height:759px)_and_(max-width:767px)]:hidden"
                    data-signoff
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
