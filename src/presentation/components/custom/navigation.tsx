import { type JSX, type Ref, useEffect, useRef, useState } from "react"

import type Lenis from "lenis"
import { Button } from "react-aria-components"
import { useTranslations } from "use-intl/react"

import { MOTION_OK, ScrollTrigger, gsap, useGSAP } from "~/src/integrations/gsap/gsap.config"

import { useLenis } from "~/src/hooks/use-lenis"

import { LIGHT_NAV_GROUNDS, NAV_GROUND, NAV_ITEMS, SECTION_IDS, sectionHref } from "~/src/data/marketing"

import { cn } from "~/src/lib/cn"

import { ArrowUpIcon } from "~/src/presentation/components/custom/icons"
import { CtaLink } from "~/src/presentation/components/custom/landing-page/components/cta-link"
import { RollText } from "~/src/presentation/components/custom/landing-page/components/roll-text"
import { MobileMenu } from "~/src/presentation/components/custom/mobile-menu"

import { APP_NAME } from "~/src/presentation/branding"

const SCROLLED_AT = 0.45
const READING_LINE = 0.45
const BACK_TO_TOP_AT = 1.5
const BACK_TO_TOP_PROBE = 48
const INITIAL_BAR_HEIGHT = 60
const DOT_HALF_WIDTH = 2.5
const HALF = 2
const DESKTOP_MIN_WIDTH = 1024

const INITIALS = "PJB"
const MENU_ID = "mobile-menu"
const MENU_TONE = "menu"
const FULL_LAYER = ""
const HIDDEN_LAYER = "inset(100% 0 0 0)"
const NO_ARRIVAL = ""
const BACK_TO_TOP_TONE = {
  DARK: "dark",
  LIGHT: "light",
} as const

const NAV_INTRO_TARGETS = "[data-nav-layer='base'] [data-nav-intro]"
const BASE_LAYER_LINK = "[data-nav-layer='base'] a"
const GROUND = "[data-nav-ground]"
const NAV_DOT = "[data-nav-dot]"
const ACTIVE_LINK = "[data-active]"

const NAV_INTRO: gsap.TweenVars = {
  autoAlpha: 0,
  clearProps: "transform,opacity,visibility",
  delay: 0.2,
  duration: 1,
  ease: "power3.out",
  stagger: 0.05,
  y: -22,
}

const MENU_LINE =
  "absolute top-1/2 left-1/2 h-[1.5px] w-[26px] -translate-x-1/2 bg-current transition-[translate,rotate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"

interface Span {
  readonly bottom: number
  readonly top: number
}

interface Ground extends Span {
  readonly tone: string
}

interface TrackedSection extends Span {
  isActive: boolean
  readonly links: NodeListOf<Element>
}

interface LayerMemory {
  clip: string
  tone: string
}

interface LayerWrite {
  readonly clip: string
  readonly tone?: string
}

interface Crossing {
  readonly arriving: string
  readonly edge: number
  readonly tone: string
}

interface ScrollMoment {
  readonly isMenuUp: boolean
  readonly scrollY: number
}

interface NavElements {
  readonly base: HTMLElement
  readonly dots: readonly HTMLElement[]
  readonly header: HTMLElement
  readonly links: HTMLElement
  readonly next: HTMLElement
  readonly top: HTMLElement
}

interface NavState {
  barHeight: number
  readonly baseLayer: LayerMemory
  frame: number
  grounds: readonly Ground[]
  isScrolled: boolean
  isTopVisible: boolean
  readonly nextLayer: LayerMemory
  pointed: HTMLAnchorElement | undefined
  sections: readonly TrackedSection[]
  tone: string
  topTone: string
  viewport: number
}

interface NavSync {
  readonly measure: () => void
  readonly point: (event: Event) => void
  readonly release: () => void
  readonly schedule: () => void
  readonly stop: () => void
  readonly sync: () => void
}

interface MenuLock {
  readonly close: () => void
  readonly header: HTMLElement | null
  readonly lenis: Lenis | undefined
  readonly returnFocus: () => void
}

interface NavRowProps {
  readonly isOpen: boolean
  readonly linksRef?: Ref<HTMLElement>
  readonly menuButtonRef?: Ref<HTMLButtonElement>
  readonly onMenuPress: () => void
}

const createNavState = (): NavState => ({
  barHeight: INITIAL_BAR_HEIGHT,
  baseLayer: { clip: FULL_LAYER, tone: NAV_GROUND.HERO },
  frame: 0,
  grounds: [],
  isScrolled: false,
  isTopVisible: false,
  nextLayer: { clip: HIDDEN_LAYER, tone: NAV_GROUND.HERO },
  pointed: undefined,
  sections: [],
  tone: NAV_GROUND.HERO,
  topTone: BACK_TO_TOP_TONE.DARK,
  viewport: globalThis.innerHeight,
})

const measureGround = (element: HTMLElement, scrollY: number): Ground => {
  const { bottom, top } = element.getBoundingClientRect()

  return { bottom: bottom + scrollY, tone: element.dataset["navGround"] ?? NAV_GROUND.PAPER, top: top + scrollY }
}

const measureGrounds = (scrollY: number): Ground[] =>
  [...document.querySelectorAll(GROUND)]
    .filter((element) => element instanceof HTMLElement)
    .map((element) => measureGround(element, scrollY))
    .filter((ground) => ground.bottom > ground.top)

const measureSections = (header: HTMLElement, scrollY: number): TrackedSection[] =>
  NAV_ITEMS.flatMap((item) => {
    const href = sectionHref(item.section)
    const section = document.querySelector(href)

    if (!section) {
      return []
    }

    const { bottom, top } = section.getBoundingClientRect()

    return [{ bottom: bottom + scrollY, isActive: false, links: header.querySelectorAll(`[data-nav="${href}"]`), top: top + scrollY }]
  })

const remeasure = ({ base, header }: NavElements, state: NavState): void => {
  const { scrollY } = globalThis

  state.viewport = globalThis.innerHeight
  state.barHeight = base.offsetHeight
  state.grounds = measureGrounds(scrollY)
  state.sections = measureSections(header, scrollY)

  for (const link of header.querySelectorAll(ACTIVE_LINK)) {
    if (link instanceof HTMLElement) {
      delete link.dataset["active"]
    }
  }
}

const findPointedAnchor = (event: Event): HTMLAnchorElement | undefined => {
  const anchor = event.target instanceof Element ? event.target.closest("a") : undefined

  return anchor instanceof HTMLAnchorElement ? anchor : undefined
}

const findActiveLink = (links: HTMLElement): HTMLElement | undefined => {
  const active = links.querySelector(ACTIVE_LINK)

  return active instanceof HTMLElement ? active : undefined
}

const placeDots = ({ dots, links }: NavElements, state: NavState): void => {
  const target = state.pointed ?? findActiveLink(links)

  for (const dot of dots) {
    dot.style.opacity = target ? "1" : "0"

    if (target) {
      dot.style.transform = `translateX(${target.offsetLeft + target.offsetWidth / HALF - DOT_HALF_WIDTH}px)`
    }
  }
}

const writeLayer = (element: HTMLElement, memory: LayerMemory, { clip, tone }: LayerWrite): void => {
  if (tone !== undefined && tone !== memory.tone) {
    element.dataset["tone"] = tone
    memory.tone = tone
  }

  if (clip !== memory.clip) {
    element.style.clipPath = clip
    memory.clip = clip
  }
}

const resolveCrossing = (state: NavState, scrollY: number): Crossing => {
  let currentTone = state.tone
  let arriving = NO_ARRIVAL
  let edge = state.barHeight

  for (const ground of state.grounds) {
    const start = ground.top - scrollY

    if (start <= 0 && ground.bottom - scrollY > 0) {
      currentTone = ground.tone
      arriving = NO_ARRIVAL
      edge = state.barHeight
    } else if (start > 0 && start < state.barHeight) {
      arriving = ground.tone
      edge = start
    }
  }

  return { arriving, edge, tone: currentTone }
}

const syncLayers = ({ base, next }: NavElements, state: NavState, { isMenuUp, scrollY }: ScrollMoment): void => {
  const { arriving, edge, tone } = resolveCrossing(state, scrollY)

  state.tone = tone

  if (isMenuUp) {
    writeLayer(base, state.baseLayer, { clip: FULL_LAYER, tone: MENU_TONE })
    writeLayer(next, state.nextLayer, { clip: HIDDEN_LAYER })

    return
  }

  if (arriving === NO_ARRIVAL || arriving === tone) {
    writeLayer(base, state.baseLayer, { clip: FULL_LAYER, tone })
    writeLayer(next, state.nextLayer, { clip: HIDDEN_LAYER })

    return
  }

  const isBaseOnTop = edge > state.barHeight / HALF
  const above = `inset(0 0 ${state.barHeight - edge}px 0)`
  const below = `inset(${edge}px 0 0 0)`

  writeLayer(base, state.baseLayer, { clip: isBaseOnTop ? above : below, tone: isBaseOnTop ? tone : arriving })
  writeLayer(next, state.nextLayer, { clip: isBaseOnTop ? below : above, tone: isBaseOnTop ? arriving : tone })
}

const syncScrolled = ({ header }: NavElements, state: NavState, scrollY: number): void => {
  const isScrolled = scrollY > state.viewport * SCROLLED_AT

  if (isScrolled === state.isScrolled) {
    return
  }

  state.isScrolled = isScrolled
  header.toggleAttribute("data-scrolled", isScrolled)
}

const syncSections = (state: NavState, scrollY: number): boolean => {
  const line = scrollY + state.viewport * READING_LINE
  let hasChanged = false

  for (const section of state.sections) {
    const isActive = section.top <= line && section.bottom > line

    if (isActive !== section.isActive) {
      section.isActive = isActive
      hasChanged = true

      for (const link of section.links) {
        link.toggleAttribute("data-active", isActive)
      }
    }
  }

  return hasChanged
}

const syncBackToTop = ({ top }: NavElements, state: NavState, { isMenuUp, scrollY }: ScrollMoment): void => {
  const probe = scrollY + state.viewport - BACK_TO_TOP_PROBE
  const groundTone = state.grounds.findLast((ground) => ground.top <= probe && ground.bottom > probe)?.tone ?? NAV_GROUND.HERO
  const topTone = LIGHT_NAV_GROUNDS.has(groundTone) ? BACK_TO_TOP_TONE.LIGHT : BACK_TO_TOP_TONE.DARK
  const isVisible = scrollY > state.viewport * BACK_TO_TOP_AT && !isMenuUp

  if (topTone !== state.topTone) {
    state.topTone = topTone
    top.dataset["on"] = topTone
  }

  if (isVisible !== state.isTopVisible) {
    state.isTopVisible = isVisible
    top.toggleAttribute("data-visible", isVisible)
  }
}

const syncFrame = (elements: NavElements, state: NavState, isMenuUp: boolean): void => {
  const { scrollY } = globalThis

  state.frame = 0
  syncScrolled(elements, state, scrollY)
  syncLayers(elements, state, { isMenuUp, scrollY })

  if (syncSections(state, scrollY)) {
    placeDots(elements, state)
  }

  syncBackToTop(elements, state, { isMenuUp, scrollY })
}

const createNavSync = (elements: NavElements, isMenuUp: () => boolean): NavSync => {
  const state = createNavState()

  const sync = (): void => {
    syncFrame(elements, state, isMenuUp())
  }

  return {
    measure: () => {
      remeasure(elements, state)
      sync()
      placeDots(elements, state)
    },
    point: (event) => {
      state.pointed = findPointedAnchor(event)
      placeDots(elements, state)
    },
    release: () => {
      state.pointed = undefined
      placeDots(elements, state)
    },
    schedule: () => {
      if (state.frame === 0) {
        state.frame = requestAnimationFrame(sync)
      }
    },
    stop: () => {
      cancelAnimationFrame(state.frame)
    },
    sync,
  }
}

const attachNavSync = ({ links }: NavElements, { measure, point, release, schedule, stop }: NavSync): (() => void) => {
  const resizeObserver = new ResizeObserver(measure)
  const main = document.querySelector("main")

  if (main) {
    resizeObserver.observe(main)
  }

  ScrollTrigger.addEventListener("refresh", measure)
  links.addEventListener("pointerover", point)
  links.addEventListener("focusin", point)
  links.addEventListener("pointerleave", release)
  links.addEventListener("focusout", release)
  globalThis.addEventListener("scroll", schedule, { passive: true })
  globalThis.addEventListener("resize", measure)
  void document.fonts.ready.then(measure)
  measure()

  return () => {
    stop()
    resizeObserver.disconnect()
    ScrollTrigger.removeEventListener("refresh", measure)
    links.removeEventListener("pointerover", point)
    links.removeEventListener("focusin", point)
    links.removeEventListener("pointerleave", release)
    links.removeEventListener("focusout", release)
    globalThis.removeEventListener("scroll", schedule)
    globalThis.removeEventListener("resize", measure)
  }
}

const collectElements = (
  header: HTMLElement | null,
  { base, links, next, top }: Record<"base" | "links" | "next" | "top", HTMLElement | null>,
): NavElements | undefined => {
  if (!header || !base || !links || !next || !top) {
    return
  }

  const dots = [...header.querySelectorAll(NAV_DOT)].filter((dot) => dot instanceof HTMLElement)

  return { base, dots, header, links, next, top }
}

const lockPageUnderMenu = ({ close, header, lenis, returnFocus }: MenuLock): (() => void) => {
  lenis?.stop()

  const root = document.documentElement
  const main = document.querySelector("main")
  const previousOverflow = root.style.overflow

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      close()
      returnFocus()
    }
  }

  const onResize = (): void => {
    if (globalThis.innerWidth >= DESKTOP_MIN_WIDTH) {
      close()
    }
  }

  const onHeaderClick = (event: MouseEvent): void => {
    if (event.target instanceof Element && event.target.closest(BASE_LAYER_LINK)) {
      close()
      lenis?.start()
    }
  }

  if (!lenis) {
    root.style.overflow = "hidden"
  }

  main?.setAttribute("inert", "")
  header?.addEventListener("click", onHeaderClick)
  globalThis.addEventListener("keydown", onKeyDown)
  globalThis.addEventListener("resize", onResize)

  return () => {
    header?.removeEventListener("click", onHeaderClick)
    globalThis.removeEventListener("keydown", onKeyDown)
    globalThis.removeEventListener("resize", onResize)
    main?.removeAttribute("inert")
    root.style.overflow = previousOverflow
    lenis?.start()
  }
}

const NavRow = ({ isOpen, linksRef, menuButtonRef, onMenuPress }: NavRowProps): JSX.Element => {
  const t = useTranslations("components.custom.navigation")

  return (
    <div className="nav-row">
      <a
        className="relative justify-self-start font-display text-[1.0625rem] leading-none font-semibold tracking-[-0.025em]"
        data-nav-intro
        href={sectionHref(SECTION_IDS.HERO)}
      >
        <span className="block transition-opacity duration-500 group-data-scrolled/nav:opacity-0 group-data-open/nav:opacity-0">
          {INITIALS}
        </span>
        <span className="sr-only">{t("home")}</span>
        <span
          aria-hidden
          className="absolute top-0 left-0 whitespace-nowrap opacity-0 transition-opacity duration-500 group-data-scrolled/nav:opacity-100 group-data-open/nav:opacity-100"
        >
          {APP_NAME}
        </span>
      </a>

      <nav aria-label={t("primaryNav")} className="relative hidden items-center gap-[clamp(0.25rem,0.7vw,1rem)] lg:flex" ref={linksRef}>
        <span
          aria-hidden
          className="absolute -bottom-0.5 left-0 size-[5px] rounded-full bg-(--nav-accent) opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)]"
          data-nav-dot
        />
        {NAV_ITEMS.map((item) => (
          <a
            className="px-2.5 py-2 text-[0.875rem] font-medium tracking-[-0.01em] whitespace-nowrap"
            data-nav={sectionHref(item.section)}
            data-nav-intro
            href={sectionHref(item.section)}
            key={item.key}
          >
            <RollText>{t(`items.${item.key}`)}</RollText>
          </a>
        ))}
      </nav>

      <div className="col-start-3 flex items-center gap-2 justify-self-end" data-nav-intro>
        <CtaLink className="hidden whitespace-nowrap lg:inline-flex" href={sectionHref(SECTION_IDS.CONTACT)} size="compact">
          {t("letsTalk")}
        </CtaLink>
        <Button
          aria-controls={MENU_ID}
          aria-expanded={isOpen}
          aria-label={t(isOpen ? "close" : "menu")}
          className="relative -mr-2.5 size-11 lg:hidden"
          onPress={onMenuPress}
          ref={menuButtonRef}
        >
          <span aria-hidden className={cn(MENU_LINE, { "-translate-y-1/2 rotate-45": isOpen, "-translate-y-[5px]": !isOpen })} />
          <span aria-hidden className={cn(MENU_LINE, { "-translate-y-1/2 -rotate-45": isOpen, "translate-y-[4px]": !isOpen })} />
        </Button>
      </div>
    </div>
  )
}

const BackToTopLink = ({ topRef }: { readonly topRef: Ref<HTMLAnchorElement> }): JSX.Element => {
  const t = useTranslations("components.custom.back-to-top")

  return (
    <a
      aria-label={t("label")}
      className="back-to-top group"
      data-on={BACK_TO_TOP_TONE.DARK}
      href={sectionHref(SECTION_IDS.HERO)}
      ref={topRef}
    >
      <ArrowUpIcon className="size-5 transition-transform duration-300 ease-out group-hover:-translate-y-0.5" />
    </a>
  )
}

export const Navigation = (): JSX.Element => {
  const t = useTranslations("components.custom.navigation")
  const lenis = useLenis()
  const headerRef = useRef<HTMLElement>(null)
  const baseRef = useRef<HTMLDivElement>(null)
  const nextRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLElement>(null)
  const topRef = useRef<HTMLAnchorElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const isMenuUpRef = useRef(false)
  const syncRef = useRef<(() => void) | undefined>(undefined)

  const [isOpen, setOpen] = useState(false)

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.from(NAV_INTRO_TARGETS, { ...NAV_INTRO })
      })
    },
    { scope: headerRef },
  )

  useEffect(() => {
    const elements = collectElements(headerRef.current, {
      base: baseRef.current,
      links: linksRef.current,
      next: nextRef.current,
      top: topRef.current,
    })

    if (!elements) {
      return
    }

    const navSync = createNavSync(elements, () => isMenuUpRef.current)

    syncRef.current = navSync.sync

    return attachNavSync(elements, navSync)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    isMenuUpRef.current = true
    syncRef.current?.()

    return lockPageUnderMenu({
      close: () => {
        setOpen(false)
      },
      header: headerRef.current,
      lenis,
      returnFocus: () => {
        menuButtonRef.current?.focus()
      },
    })
  }, [isOpen, lenis])

  const toggleMenu = (): void => {
    setOpen((wasOpen) => !wasOpen)
  }

  const closeMenu = (): void => {
    setOpen(false)
    lenis?.start()
  }

  const onMenuClosed = (): void => {
    isMenuUpRef.current = false
    syncRef.current?.()
  }

  return (
    <>
      <a
        className="fixed top-2 left-2 z-60 -translate-y-20 bg-emerald-deep px-4 py-2.5 text-sm font-medium text-cream focus-visible:translate-y-0"
        href={sectionHref(SECTION_IDS.MAIN)}
      >
        {t("skip")}
      </a>
      <header className="nav group/nav fixed inset-x-0 top-0 z-50" data-open={isOpen ? "" : undefined} ref={headerRef}>
        <div className="nav-layer" data-nav-layer="base" data-tone={NAV_GROUND.HERO} ref={baseRef}>
          <NavRow isOpen={isOpen} linksRef={linksRef} menuButtonRef={menuButtonRef} onMenuPress={toggleMenu} />
        </div>
        <div aria-hidden className="nav-layer nav-layer-next" data-tone={NAV_GROUND.HERO} inert ref={nextRef}>
          <NavRow isOpen={isOpen} onMenuPress={toggleMenu} />
        </div>

        <MobileMenu isOpen={isOpen} onClosed={onMenuClosed} onNavigate={closeMenu} originRef={menuButtonRef} />

        <BackToTopLink topRef={topRef} />
      </header>
    </>
  )
}
