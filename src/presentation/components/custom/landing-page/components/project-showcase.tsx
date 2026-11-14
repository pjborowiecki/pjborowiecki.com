import { type JSX, useRef } from "react"

import { Button } from "react-aria-components"
import { useTranslations } from "use-intl/react"

import { gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

import { NAV_GROUND, type NavGround } from "~/src/data/marketing"
import { MEDIA } from "~/src/data/media"
import { PROJECT_ID, type Project, type ProjectId } from "~/src/data/projects"

import { cn } from "~/src/lib/cn"

import { ArrowRightIcon, StarIcon } from "~/src/presentation/components/custom/icons"
import { ResponsiveImage } from "~/src/presentation/components/custom/landing-page/components/responsive-image"

const PROOFS = ["Proof1", "Proof2", "Proof3"] as const
const FEATURES = ["Feature1", "Feature2", "Feature3", "Feature4"] as const
const COMPOSED = `${MEDIA.MOTION_OK} and ${MEDIA.COVER}`

const LABEL_CLASSNAME = "text-[clamp(0.8125rem,min(0.84vw,1.42svh),1.0625rem)] font-medium leading-[1.35] tracking-[-0.004em]"
const TEXT_CLASSNAME = "text-[clamp(0.9375rem,min(1vw,1.7svh),1.3125rem)] leading-[1.5] tracking-[-0.009em]"
const GAP_CLASSNAME = "mt-[clamp(1rem,3.4svh,3.25rem)]"

interface ShowcaseTone {
  readonly ground: string
  readonly nav: NavGround
}

const SAASYLAND_TONE: ShowcaseTone = {
  ground:
    "bg-[#0a1316] bg-[linear-gradient(to_bottom,#0a1316_var(--nav-bar-height),transparent_24%),radial-gradient(85%_95%_at_66%_38%,#176a70_0%,#0c3238_44%,#0a1316_100%)] [--tone:#62d6d0]",
  nav: NAV_GROUND.GRAPHITE,
}

const TONES: Partial<Record<ProjectId, ShowcaseTone>> = {
  [PROJECT_ID.MARTE]: {
    ground:
      "bg-[#1c120c] bg-[linear-gradient(to_bottom,#1c120c_var(--nav-bar-height),transparent_24%),radial-gradient(85%_95%_at_66%_40%,#8a5531_0%,#4d2e1a_44%,#1c120c_100%)] [--tone:#e6bd83]",
    nav: NAV_GROUND.BRONZE,
  },
  [PROJECT_ID.SAASYLAND]: SAASYLAND_TONE,
}

const SCREEN_PERSPECTIVE: gsap.TweenVars = { transformPerspective: 1800 }
const MAIN_ARRIVAL_FROM: gsap.TweenVars = { rotationY: -14, scale: 0.92, y: "30svh" }
const MAIN_ARRIVAL_TO: gsap.TweenVars = { duration: 2, ease: "power2.out", rotationY: 0, scale: 1, y: 0 }
const BACK_ARRIVAL_FROM: gsap.TweenVars = { rotationY: -18, x: "10vw", y: "46svh" }
const BACK_ARRIVAL_TO: gsap.TweenVars = { duration: 2.2, ease: "power2.out", rotationY: 0, x: 0, y: 0 }
const PHONE_ARRIVAL_FROM: gsap.TweenVars = { rotationZ: -5, y: "60svh" }
const PHONE_ARRIVAL_TO: gsap.TweenVars = { duration: 2.3, ease: "power3.out", rotationZ: 0, y: 0 }
const DRIFT_START = 2.3
const MAIN_DRIFT: gsap.TweenVars = { duration: 1, y: "-2svh" }
const BACK_DRIFT: gsap.TweenVars = { duration: 1, y: "3svh" }
const PHONE_DRIFT: gsap.TweenVars = { duration: 1, y: "-7svh" }

const COPY_START = "top 45%"
const COPY_RISE: gsap.TweenVars = {
  autoAlpha: 0,
  clearProps: "transform,opacity,visibility",
  duration: 0.9,
  ease: "power3.out",
  stagger: 0.06,
  y: 18,
}
const PROOF_COUNT: gsap.TweenVars = { duration: 1.5, ease: "power2.out" }
const PROOF_PATTERN = /^(?<before>\D*)(?<digits>\d+)(?<after>\D*)$/u

const STEP_BACK: gsap.TweenVars = { ease: "none", scale: 0.93 }
const DIM_FROM: gsap.TweenVars = { opacity: 0 }
const DIM_TO: gsap.TweenVars = { ease: "none", opacity: 0.6 }

const TILT_FOLLOW: gsap.TweenVars = { duration: 1.2, ease: "power3" }
const TILT = { ROTATE_X: -3, ROTATE_Y: 5 } as const
const DEPTHS = [
  { amount: -14, layer: "back" },
  { amount: 8, layer: "main" },
  { amount: 26, layer: "phone" },
] as const
const DEPTH_Y_SHARE = 0.6
const POINTER_CENTER = 0.5

const arrangeScreens = (hold: HTMLElement, select: gsap.utils.SelectorFunc): void => {
  const main = select("[data-layer='main']")
  const back = select("[data-layer='back']")
  const phone = select("[data-layer='phone']")
  gsap.set([main, back, phone], { ...SCREEN_PERSPECTIVE })

  gsap
    .timeline({
      defaults: { ease: "none" },
      scrollTrigger: { end: "bottom bottom", scrub: true, start: "top bottom", trigger: hold },
    })
    .fromTo(main, { ...MAIN_ARRIVAL_FROM }, { ...MAIN_ARRIVAL_TO }, 0)
    .fromTo(back, { ...BACK_ARRIVAL_FROM }, { ...BACK_ARRIVAL_TO }, 0)
    .fromTo(phone, { ...PHONE_ARRIVAL_FROM }, { ...PHONE_ARRIVAL_TO }, 0)
    .to(main, { ...MAIN_DRIFT }, DRIFT_START)
    .to(back, { ...BACK_DRIFT }, DRIFT_START)
    .to(phone, { ...PHONE_DRIFT }, DRIFT_START)
}

const riseCopy = (hold: HTMLElement, select: gsap.utils.SelectorFunc): void => {
  gsap.from(select("[data-rise]"), { ...COPY_RISE, scrollTrigger: { once: true, start: COPY_START, trigger: hold } })
}

const countUpProof = (hold: HTMLElement, element: HTMLElement): void => {
  const { after = "", before = "", digits = "0" } = PROOF_PATTERN.exec(element.textContent)?.groups ?? {}
  const target = Number(digits)
  if (target === 0) {
    return
  }
  const counter = { value: 0 }
  gsap.to(counter, {
    ...PROOF_COUNT,
    onUpdate: () => {
      element.textContent = `${before}${String(Math.round(counter.value))}${after}`
    },
    scrollTrigger: { once: true, start: COPY_START, trigger: hold },
    value: target,
  })
}

const countUpProofs = (hold: HTMLElement, select: gsap.utils.SelectorFunc): void => {
  for (const element of select<HTMLElement>("[data-proof]")) {
    countUpProof(hold, element)
  }
}

const stepBackUnderNext = (hold: HTMLElement, select: gsap.utils.SelectorFunc): void => {
  const next = hold.nextElementSibling
  if (next?.matches("[data-hold]") !== true) {
    return
  }
  const scrollTrigger = { end: "top top", scrub: true, start: "top bottom", trigger: next }
  gsap.to(select("[data-panel]"), { ...STEP_BACK, scrollTrigger })
  gsap.fromTo(select("[data-dim]"), { ...DIM_FROM }, { ...DIM_TO, scrollTrigger })
}

const followPointer = (select: gsap.utils.SelectorFunc): (() => void) | undefined => {
  if (!globalThis.matchMedia(MEDIA.FINE_POINTER).matches) {
    return
  }
  const [panel] = select<HTMLElement>("[data-panel]")
  const tilt = select("[data-tilt]")
  const toRotateY = gsap.quickTo(tilt, "rotationY", { ...TILT_FOLLOW })
  const toRotateX = gsap.quickTo(tilt, "rotationX", { ...TILT_FOLLOW })
  const depths = DEPTHS.map(({ amount, layer }) => {
    const target = select(`[data-depth='${layer}']`)
    return { amount, toX: gsap.quickTo(target, "x", { ...TILT_FOLLOW }), toY: gsap.quickTo(target, "y", { ...TILT_FOLLOW }) }
  })
  const tiltTowards = (nx: number, ny: number): void => {
    toRotateY(nx * TILT.ROTATE_Y)
    toRotateX(ny * TILT.ROTATE_X)
    for (const depth of depths) {
      depth.toX(nx * depth.amount)
      depth.toY(ny * depth.amount * DEPTH_Y_SHARE)
    }
  }
  const handlePointerMove = (event: PointerEvent): void => {
    tiltTowards(event.clientX / globalThis.innerWidth - POINTER_CENTER, event.clientY / globalThis.innerHeight - POINTER_CENTER)
  }
  const handlePointerLeave = (): void => {
    tiltTowards(0, 0)
  }

  panel?.addEventListener("pointermove", handlePointerMove, { passive: true })
  panel?.addEventListener("pointerleave", handlePointerLeave)
  return () => {
    panel?.removeEventListener("pointermove", handlePointerMove)
    panel?.removeEventListener("pointerleave", handlePointerLeave)
  }
}

const composeShowcase = (hold: HTMLElement): (() => void) | undefined => {
  const select = gsap.utils.selector(hold)
  arrangeScreens(hold, select)
  riseCopy(hold, select)
  countUpProofs(hold, select)
  stepBackUnderNext(hold, select)
  return followPointer(select)
}

interface BrowserFrameProps {
  readonly alt: string
  readonly isDimmed?: boolean
  readonly name: string
  readonly sizes: string
}

const BrowserFrame = ({ alt, isDimmed = false, name, sizes }: BrowserFrameProps): JSX.Element => (
  <div className="relative">
    <span
      aria-hidden
      className="absolute -inset-x-[7%] top-[14%] -bottom-[16%] bg-[radial-gradient(closest-side,rgb(0_0_0/62%)_35%,transparent)]"
    />
    <div className="relative overflow-hidden rounded-[clamp(0.4rem,0.7vw,0.9rem)] bg-[#17191d] ring-1 ring-white/14">
      <div aria-hidden className="flex h-[clamp(1rem,1.5vw,1.9rem)] items-center gap-[0.35vw] px-[0.8vw]">
        <span className="size-[clamp(0.3rem,0.45vw,0.6rem)] rounded-full bg-white/25" />
        <span className="size-[clamp(0.3rem,0.45vw,0.6rem)] rounded-full bg-white/25" />
        <span className="size-[clamp(0.3rem,0.45vw,0.6rem)] rounded-full bg-white/25" />
      </div>
      <div className="relative aspect-[16/10]">
        <ResponsiveImage alt={alt} className="object-cover object-top" isFill name={name} sizes={sizes} />
        {isDimmed && <span aria-hidden className="absolute inset-0 bg-black/38" />}
      </div>
    </div>
  </div>
)

const ShowcaseTitle = ({ project }: { readonly project: Project }): JSX.Element => {
  const t = useTranslations("pages.landing.work")

  return (
    <div className="relative z-20 frame pt-[calc(var(--nav-bar-height)+0.75rem)]">
      <div className="flex flex-wrap items-end gap-x-[clamp(1rem,1.5vw,2.25rem)] gap-y-2">
        <h3 className="type-display text-[clamp(2.75rem,min(7.4vw,14svh),11rem)]">{project.title}</h3>
        {project.github !== undefined && (
          <p
            className="flex items-center gap-[0.35em] pb-[0.2em] font-display text-[clamp(1.5rem,min(2.4vw,4.4svh),3.75rem)] leading-none font-medium tracking-[-0.03em] text-(--tone)"
            data-rise
          >
            <StarIcon className="size-[0.82em]" />
            <span>{t("starsCount", { stars: project.github.stars })}</span>
            <span className={cn("ml-[0.35em] max-w-[6ch] text-cream/80", LABEL_CLASSNAME)}>{t("starsLabel")}</span>
          </p>
        )}
      </div>
    </div>
  )
}

const ShowcaseScreens = ({ project }: { readonly project: Project }): JSX.Element => {
  const t = useTranslations("pages.landing.work")

  return (
    <div className="relative mt-5 aspect-[6/5] [perspective:1800px] cover:absolute cover:inset-y-0 cover:right-0 cover:mt-0 cover:aspect-auto cover:w-[68vw]">
      <div className="absolute inset-0 cover:will-change-transform" data-tilt>
        <div
          className="absolute top-[4%] right-[-22%] w-[66%] cover:top-[8.5%] cover:right-[-14%] cover:w-[60%] cover:will-change-transform"
          data-layer="back"
        >
          <div data-depth="back">
            <div className="[transform:perspective(1800px)_rotateY(18deg)_rotateX(3deg)]">
              <BrowserFrame alt="" isDimmed name={`show-${project.id}-back`} sizes="(min-width: 900px) 42vw, 66vw" />
            </div>
          </div>
        </div>

        <div
          className="absolute top-[22%] left-[20%] w-[100%] cover:top-[25%] cover:left-[18%] cover:w-[90%] cover:will-change-transform"
          data-layer="main"
        >
          <div data-depth="main">
            <div className="[transform:perspective(1800px)_rotateY(10deg)_rotateX(3deg)]">
              <BrowserFrame
                alt={`${project.title}: ${t(`projects.${project.id}.category`)}`}
                name={`show-${project.id}-main`}
                sizes="(min-width: 900px) 62vw, 100vw"
              />
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-[2%] left-[3%] w-[26%] cover:bottom-[6%] cover:left-[6%] cover:w-[17%] cover:will-change-transform"
          data-layer="phone"
        >
          <div data-depth="phone">
            <div className="relative [transform:perspective(1800px)_rotateY(6deg)_rotateX(2deg)]">
              <span
                aria-hidden
                className="absolute -inset-x-[16%] top-[8%] -bottom-[8%] bg-[radial-gradient(closest-side,rgb(0_0_0/70%)_30%,transparent)]"
              />
              <div className="relative overflow-hidden rounded-[clamp(0.9rem,1.9vw,2.6rem)] bg-black ring-[clamp(2px,0.32vw,5px)] ring-[#0b0c0e]">
                <div className="relative aspect-[390/844]">
                  <ResponsiveImage
                    alt=""
                    className="object-cover"
                    isFill
                    name={`show-${project.id}-phone`}
                    sizes="(min-width: 900px) 12vw, 26vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShowcaseCopy = ({ project }: { readonly project: Project }): JSX.Element => {
  const t = useTranslations("pages.landing.work")
  const { id } = project

  return (
    <div className="relative z-20 mt-6 px-(--gutter) cover:mt-[clamp(1rem,4.2svh,3.75rem)] cover:w-[calc(29vw+var(--gutter))] cover:pr-0">
      <div
        className={cn(
          "flex items-baseline justify-between gap-4 border-b border-cream/18 pb-[clamp(0.5rem,1.1svh,0.9rem)]",
          LABEL_CLASSNAME,
        )}
        data-rise
      >
        <span className="text-(--tone)">{t(`${id}Tag`)}</span>
        <span className="text-cream/60 tabular-nums">{project.year}</span>
      </div>

      <p
        className="mt-[clamp(0.75rem,2svh,1.75rem)] font-display text-[clamp(1.375rem,min(2.1vw,3.5svh),3.25rem)] leading-[1.14] font-normal tracking-[-0.022em] text-balance"
        data-rise
      >
        {t(`${id}Headline`)}
      </p>
      <p className={cn("mt-[clamp(0.5rem,1.3svh,1.1rem)] text-pretty text-cream/68", TEXT_CLASSNAME)} data-rise>
        {t(`${id}Body`)}
      </p>

      <dl className={cn("border-t border-cream/18", GAP_CLASSNAME)} data-rise>
        {FEATURES.map((feature) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,3fr)] gap-x-4 border-b border-cream/18 py-[clamp(0.4rem,1.2svh,1.15rem)]"
            key={feature}
          >
            <dt className={cn("pt-[0.1em] text-cream/55", LABEL_CLASSNAME)}>{t(`${id}${feature}Label`)}</dt>
            <dd className={cn("leading-[1.35]! text-pretty text-cream", TEXT_CLASSNAME)}>{t(`${id}${feature}Value`)}</dd>
          </div>
        ))}
      </dl>

      <dl className={cn("showcase-proof grid grid-cols-3 gap-x-4", GAP_CLASSNAME)} data-rise>
        {PROOFS.map((proof) => (
          <div className="flex flex-col-reverse gap-[0.45em]" key={proof}>
            <dt className={cn("text-cream/60", LABEL_CLASSNAME)}>{t(`${id}${proof}Label`)}</dt>
            <dd
              className="font-display text-[clamp(1.5rem,min(2.1vw,3.6svh),3.25rem)] leading-none tracking-[-0.03em] tabular-nums"
              data-proof
            >
              {t(`${id}${proof}Value`)}
            </dd>
          </div>
        ))}
      </dl>

      <span
        className={cn(
          "inline-flex items-center gap-3 bg-cream px-5 py-[clamp(0.55rem,1.3svh,0.95rem)] text-[clamp(0.9375rem,0.95vw,1.125rem)] font-medium tracking-[-0.01em] text-[#14100c]",
          GAP_CLASSNAME,
        )}
        data-rise
      >
        {t("readCaseStudy")}
        <ArrowRightIcon className="size-[1.15em] transition-transform duration-300 ease-out group-hover:translate-x-1" />
      </span>
    </div>
  )
}

interface ProjectShowcaseProps {
  readonly onOpen: () => void
  readonly project: Project
}

export const ProjectShowcase = ({ onOpen, project }: ProjectShowcaseProps): JSX.Element => {
  const t = useTranslations("pages.landing.work")
  const holdRef = useRef<HTMLDivElement>(null)
  const tone = TONES[project.id] ?? SAASYLAND_TONE

  useGSAP(
    () => {
      const hold = holdRef.current
      if (!hold) {
        return
      }
      gsap.matchMedia().add(COMPOSED, () => composeShowcase(hold))
    },
    { scope: holdRef },
  )

  return (
    <div className="relative cover:live:h-[150svh]" data-hold data-nav-ground={tone.nav} ref={holdRef}>
      <div
        className={cn(
          "group relative overflow-hidden pb-8 text-cream cover:h-svh cover:min-h-[38rem] cover:pb-0 cover:will-change-transform cover:live:sticky cover:live:top-0",
          tone.ground,
        )}
        data-panel
      >
        <div aria-hidden className="absolute inset-0 grain-texture" />
        <ShowcaseTitle project={project} />
        <ShowcaseScreens project={project} />
        <ShowcaseCopy project={project} />
        <div aria-hidden className="pointer-events-none absolute inset-0 z-30 bg-black opacity-0" data-dim />
        <Button
          aria-label={`${t("readCaseStudy")}: ${project.title}`}
          className="absolute inset-0 z-40 cursor-pointer focus-visible:outline-offset-[-6px]"
          data-cursor={t("view")}
          onPress={onOpen}
        />
      </div>
    </div>
  )
}
