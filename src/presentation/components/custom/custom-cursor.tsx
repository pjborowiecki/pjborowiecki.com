import { type JSX, useRef } from "react"

import { gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

import { COLOR_TOKEN } from "~/src/data/colors"
import { LIGHT_NAV_GROUNDS } from "~/src/data/marketing"
import { MEDIA } from "~/src/data/media"

import { readColorToken } from "~/src/lib/color-tokens"

const FINE_POINTER_MOTION = `${MEDIA.MOTION_OK} and ${MEDIA.FINE_POINTER}`
const INTERACTIVE = "a, button, [role='button'], input, textarea"
const NAMED = "[data-cursor]"
const TONED = "[data-tone]"
const LIGHT_GROUND = "[data-light-ground]"
const DARK_GROUND =
  "#hero, .ground-emerald, [data-dark-ground], [data-nav-ground='graphite'], [data-nav-ground='bronze'], [data-nav-ground='ink'], [data-ground='emerald']"

const RING_REST_SIZE = 40
const RING_FULL_SIZE = 112
const RING_REST = RING_REST_SIZE / RING_FULL_SIZE
const RING_ACTIVE_GROWTH = 1.6

const CURSOR_STATE = {
  ACTIVE: "active",
  NAMED: "named",
  REST: "rest",
} as const

type CursorState = (typeof CURSOR_STATE)[keyof typeof CURSOR_STATE]

const DOT_SCALE: Record<CursorState, number> = { active: 0.5, named: 0, rest: 1 }
const RING_SCALE: Record<CursorState, number> = { active: RING_REST * RING_ACTIVE_GROWTH, named: 1, rest: RING_REST }
const LABEL_ALPHA: Record<CursorState, number> = { active: 0, named: 1, rest: 0 }

const DOT_FOLLOW = { duration: 0.1, ease: "power3" } as const
const RING_FOLLOW = { duration: 0.35, ease: "power3" } as const
const CENTRED: gsap.TweenVars = { autoAlpha: 1, xPercent: -50, yPercent: -50 }
const DOT_CHANGE: gsap.TweenVars = { duration: 0.2, overwrite: "auto" }
const RING_CHANGE: gsap.TweenVars = { duration: 0.35, ease: "power3.out", overwrite: "auto" }
const LABEL_CHANGE: gsap.TweenVars = { duration: 0.2, overwrite: "auto" }

interface CursorParts {
  readonly dot: HTMLDivElement
  readonly label: HTMLSpanElement
  readonly ring: HTMLDivElement
}

interface CursorPalette {
  readonly champagne: string
  readonly champagneClear: string
  readonly inkOnDark: string
  readonly inkOnLight: string
}

const readNavTone = (target: Element): string => {
  const toned = target.closest(TONED)

  return toned instanceof HTMLElement ? (toned.dataset["tone"] ?? "") : ""
}

const readCursorLabel = (target: Element): string => {
  const named = target.closest(NAMED)

  return named instanceof HTMLElement ? (named.dataset["cursor"] ?? "") : ""
}

const isOverDark = (target: Element): boolean => {
  const navTone = readNavTone(target)

  if (navTone !== "") {
    return !LIGHT_NAV_GROUNDS.has(navTone)
  }

  return target.closest(DARK_GROUND) instanceof Element && !(target.closest(LIGHT_GROUND) instanceof Element)
}

const resolveCursorState = (target: Element): CursorState => {
  if (target.closest(NAMED) instanceof Element) {
    return CURSOR_STATE.NAMED
  }

  if (target.closest(INTERACTIVE) instanceof Element) {
    return CURSOR_STATE.ACTIVE
  }

  return CURSOR_STATE.REST
}

const readPalette = (): CursorPalette => {
  const champagne = readColorToken(COLOR_TOKEN.CHAMPAGNE)
  const [red, green, blue] = gsap.utils.splitColor(champagne)

  return {
    champagne,
    champagneClear: `rgba(${String(red)},${String(green)},${String(blue)},0)`,
    inkOnDark: readColorToken(COLOR_TOKEN.CREAM),
    inkOnLight: readColorToken(COLOR_TOKEN.NAVY),
  }
}

const followPointer = ({ dot, label, ring }: CursorParts): (() => void) => {
  const palette = readPalette()
  const dotX = gsap.quickTo(dot, "x", DOT_FOLLOW)
  const dotY = gsap.quickTo(dot, "y", DOT_FOLLOW)
  const ringX = gsap.quickTo(ring, "x", RING_FOLLOW)
  const ringY = gsap.quickTo(ring, "y", RING_FOLLOW)
  const pointer = { hasMoved: false }

  const onMove = (event: PointerEvent): void => {
    if (!pointer.hasMoved) {
      pointer.hasMoved = true
      gsap.set([dot, ring], { ...CENTRED, x: event.clientX, y: event.clientY })
      gsap.set(ring, { scale: RING_REST })
    }

    dotX(event.clientX)
    dotY(event.clientY)
    ringX(event.clientX)
    ringY(event.clientY)
  }

  const onOver = (event: PointerEvent): void => {
    if (!(event.target instanceof Element)) {
      return
    }

    const state = resolveCursorState(event.target)
    const isNamed = state === CURSOR_STATE.NAMED
    const ink = isOverDark(event.target) ? palette.inkOnDark : palette.inkOnLight

    label.textContent = readCursorLabel(event.target)
    gsap.to(dot, { ...DOT_CHANGE, backgroundColor: ink, scale: DOT_SCALE[state] })
    gsap.to(ring, {
      ...RING_CHANGE,
      backgroundColor: isNamed ? palette.champagne : palette.champagneClear,
      borderColor: isNamed ? palette.champagne : ink,
      scale: RING_SCALE[state],
    })
    gsap.to(label, { ...LABEL_CHANGE, autoAlpha: LABEL_ALPHA[state] })
  }

  globalThis.addEventListener("pointermove", onMove, { passive: true })
  globalThis.addEventListener("pointerover", onOver, { passive: true })

  return () => {
    globalThis.removeEventListener("pointermove", onMove)
    globalThis.removeEventListener("pointerover", onOver)
  }
}

export const CustomCursor = (): JSX.Element => {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    gsap.matchMedia().add(FINE_POINTER_MOTION, () => {
      const dot = dotRef.current
      const ring = ringRef.current
      const label = labelRef.current

      if (!dot || !ring || !label) {
        return
      }

      return followPointer({ dot, label, ring })
    })
  })

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none invisible fixed top-0 left-0 z-[200] size-2 rounded-full bg-foreground"
        ref={dotRef}
      />
      <div
        aria-hidden
        className="pointer-events-none invisible fixed top-0 left-0 z-[199] flex size-28 items-center justify-center rounded-full border-[2.8px] border-foreground"
        ref={ringRef}
      >
        <span className="invisible text-[0.8125rem] font-medium tracking-[-0.01em] whitespace-nowrap text-emerald-deep" ref={labelRef} />
      </div>
    </>
  )
}
