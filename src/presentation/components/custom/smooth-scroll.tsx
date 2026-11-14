import { type JSX, type RefObject, useEffect, useRef } from "react"

import Lenis from "lenis"

import { ScrollTrigger, gsap } from "~/src/integrations/gsap/gsap.config"

import { shareLenis } from "~/src/hooks/use-lenis"

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"
const SCROLL_LERP = 0.11
const MS_PER_SECOND = 1000
const DISSOLVE_PAST_SCREENS = 1.5
const FALLBACK_GROUND = "#032c20"
const TRANSPARENT = "rgba(0, 0, 0, 0)"
const PIN_SPACER = ".pin-spacer"
const IN_PAGE_LINK = 'a[href^="#"]'
const BARE_HASH = "#"
const LAZY_IMAGES = 'main img[loading="lazy"]'
const IDLE_TIMEOUT_MS = 800
const IDLE_FALLBACK_MS = 200

const GLIDE = { duration: 1.1, force: true } as const
const JUMP = { force: true, immediate: true } as const
const VEIL_IN: gsap.TweenVars = { autoAlpha: 1, duration: 0.38, ease: "power2.inOut" }
const VEIL_OUT: gsap.TweenVars = { autoAlpha: 0, duration: 0.6, ease: "power2.inOut" }
const VEIL_HOLD = "+=0.4"

interface TravelContext {
  readonly journey: { isTraveling: boolean }
  readonly lenis: Lenis
  readonly veilRef: RefObject<HTMLDivElement | null>
}

interface Destination {
  readonly target: HTMLElement
  readonly top: number
  readonly veil: HTMLDivElement
}

const arrive = (target: HTMLElement): void => {
  target.setAttribute("tabindex", "-1")
  target.style.outline = "none"
  target.focus({ preventScroll: true })
}

const readGround = (target: HTMLElement): string => {
  const ground = getComputedStyle(target).backgroundColor

  return ground === TRANSPARENT ? FALLBACK_GROUND : ground
}

const dissolveTo = ({ journey, lenis }: TravelContext, { target, top, veil }: Destination): void => {
  journey.isTraveling = true
  veil.style.backgroundColor = readGround(target)

  gsap
    .timeline({
      onComplete: () => {
        journey.isTraveling = false
      },
    })
    .to(veil, {
      ...VEIL_IN,
      onComplete: () => {
        lenis.scrollTo(top, JUMP)
        ScrollTrigger.update()
        arrive(target)
      },
    })
    .to(veil, { ...VEIL_OUT }, VEIL_HOLD)
}

const travelTo = (context: TravelContext, target: HTMLElement): void => {
  const top = (target.closest(PIN_SPACER) ?? target).getBoundingClientRect().top + globalThis.scrollY
  const veil = context.veilRef.current

  if (!veil || Math.abs(top - globalThis.scrollY) < globalThis.innerHeight * DISSOLVE_PAST_SCREENS) {
    context.lenis.scrollTo(top, GLIDE)
    arrive(target)

    return
  }

  if (context.journey.isTraveling) {
    return
  }

  dissolveTo(context, { target, top, veil })
}

const findLinkedSection = (event: MouseEvent): HTMLElement | undefined => {
  const hash = event.target instanceof Element ? event.target.closest(IN_PAGE_LINK)?.getAttribute("href") : undefined

  if (typeof hash !== "string" || hash === BARE_HASH) {
    return
  }

  const target = document.querySelector(hash)

  return target instanceof HTMLElement ? target : undefined
}

const isSavingData = (): boolean => {
  if (!("connection" in navigator)) {
    return false
  }

  const { connection } = navigator

  return connection instanceof EventTarget && "saveData" in connection && connection.saveData === true
}

const runWhenIdle = (run: () => void): void => {
  if ("requestIdleCallback" in globalThis) {
    requestIdleCallback(run, { timeout: IDLE_TIMEOUT_MS })
  } else {
    setTimeout(run, IDLE_FALLBACK_MS)
  }
}

const primeImages = (): void => {
  if (isSavingData()) {
    return
  }

  const images = [...document.querySelectorAll(LAZY_IMAGES)].filter((image) => image instanceof HTMLImageElement)

  const decodeNext = (): void => {
    const image = images.shift()

    if (!image) {
      return
    }

    image.loading = "eager"
    void image
      .decode()
      .catch(() => false)
      .finally(() => {
        runWhenIdle(decodeNext)
      })
  }

  runWhenIdle(decodeNext)
}

const startSmoothScroll = (veilRef: RefObject<HTMLDivElement | null>): (() => void) => {
  const lenis = new Lenis({ autoRaf: false, lerp: SCROLL_LERP })
  const context: TravelContext = { journey: { isTraveling: false }, lenis, veilRef }

  const tick = (time: number): void => {
    lenis.raf(time * MS_PER_SECOND)
  }

  const onClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) {
      return
    }

    const target = findLinkedSection(event)

    if (!target) {
      return
    }

    event.preventDefault()
    travelTo(context, target)
  }

  if (document.readyState === "complete") {
    primeImages()
  } else {
    globalThis.addEventListener("load", primeImages, { once: true })
  }

  lenis.on("scroll", () => {
    ScrollTrigger.update()
  })
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  document.addEventListener("click", onClick)
  shareLenis(lenis)

  void document.fonts.ready.then(() => {
    ScrollTrigger.refresh()
  })

  return () => {
    document.removeEventListener("click", onClick)
    globalThis.removeEventListener("load", primeImages)
    gsap.ticker.remove(tick)
    lenis.destroy()
    shareLenis(undefined)
  }
}

export const SmoothScroll = (): JSX.Element => {
  const veilRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (globalThis.matchMedia(REDUCED_MOTION).matches) {
      return
    }

    return startSmoothScroll(veilRef)
  }, [])

  return <div aria-hidden className="pointer-events-none invisible fixed inset-0 z-40 opacity-0" ref={veilRef} />
}
