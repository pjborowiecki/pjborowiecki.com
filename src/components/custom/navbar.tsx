"use client"

import { type JSX, type MouseEventHandler, type Ref, useEffect, useRef, useState } from "react"

import { useTranslations } from "next-intl"

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "~/src/lib/gsap"
import { cn } from "~/src/lib/utils"

import { CtaLink } from "~/src/components/custom/cta-link"
import { ArrowUpIcon } from "~/src/components/custom/icons"
import { MobileMenu } from "~/src/components/custom/mobile-menu"
import { RollText } from "~/src/components/custom/roll-text"
import { useLenis } from "~/src/components/custom/smooth-scroll"

import { NAV_ITEMS } from "~/src/data"

/** Past this share of the screen the name replaces the initials. */
const SCROLLED_AT = 0.45
/** The section crossing this share of the screen is the one being read. */
const READING_LINE = 0.45
/** Back to top appears this many screens down, once the way back is worth a shortcut. */
const BACK_TO_TOP_AT = 1.5
const LIGHT_TONES = new Set(["flood", "paper", "board"])
const HIDDEN_LAYER = "inset(100% 0 0 0)"

interface Span {
  bottom: number
  top: number
}

interface NavRowProps {
  linksRef?: Ref<HTMLElement>
  menuButtonRef?: Ref<HTMLButtonElement>
  onMenu?: MouseEventHandler<HTMLButtonElement>
  open: boolean
}

function NavRow({ linksRef, menuButtonRef, onMenu, open }: Readonly<NavRowProps>): JSX.Element {
  const t = useTranslations("custom.navbar")

  return (
    <div className="nav-row">
      <a
        data-nav-intro
        href="#hero"
        aria-label={t("home")}
        className="relative justify-self-start font-display font-semibold text-[1.0625rem] leading-none tracking-[-0.025em]"
      >
        <span className="block transition-opacity duration-500 group-data-open/nav:opacity-0 group-data-scrolled/nav:opacity-0">
          {"PJB"}
        </span>
        <span
          aria-hidden
          className="absolute top-0 left-0 whitespace-nowrap opacity-0 transition-opacity duration-500 group-data-open/nav:opacity-100 group-data-scrolled/nav:opacity-100"
        >
          {"Piotr J. Borowiecki"}
        </span>
      </a>

      <nav ref={linksRef} aria-label={t("primaryNav")} className="relative hidden items-center gap-[clamp(0.25rem,0.7vw,1rem)] lg:flex">
        <span
          data-nav-dot
          aria-hidden
          className="absolute -bottom-0.5 left-0 size-[5px] rounded-full bg-(--nav-accent) opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)]"
        />
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            data-nav-intro
            href={item.href}
            data-nav={item.href}
            className="whitespace-nowrap px-2.5 py-2 font-medium text-[0.875rem] tracking-[-0.01em]"
          >
            <RollText>{t(item.key)}</RollText>
          </a>
        ))}
      </nav>

      <div data-nav-intro className="col-start-3 flex items-center gap-2 justify-self-end">
        <CtaLink href="#contact" size="compact" className="hidden whitespace-nowrap lg:inline-flex">
          {t("letsTalk")}
        </CtaLink>
        <button
          ref={menuButtonRef}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t("close") : t("menu")}
          onClick={onMenu}
          className="relative -mr-2.5 size-11 lg:hidden"
        >
          <span
            aria-hidden
            className={cn(
              "absolute top-1/2 left-1/2 h-[1.5px] w-[26px] -translate-x-1/2 bg-current transition-[translate,rotate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              open ? "-translate-y-1/2 rotate-45" : "-translate-y-[5px]",
            )}
          />
          <span
            aria-hidden
            className={cn(
              "absolute top-1/2 left-1/2 h-[1.5px] w-[26px] -translate-x-1/2 bg-current transition-[translate,rotate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              open ? "-translate-y-1/2 -rotate-45" : "translate-y-[4px]",
            )}
          />
        </button>
      </div>
    </div>
  )
}

/**
 * A bar in the exact colour of the section beneath it. Nothing floats, blurs or fades: when the next section arrives,
 * its edge cuts straight through the nav, which is drawn twice so each side of that line carries its own section's colours.
 */
export function Navbar(): JSX.Element {
  const t = useTranslations("custom.navbar")
  const lenis = useLenis()
  const headerRef = useRef<HTMLElement>(null)
  const baseRef = useRef<HTMLDivElement>(null)
  const nextRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLElement>(null)
  const topRef = useRef<HTMLAnchorElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuUpRef = useRef(false)
  const syncRef = useRef<() => void>(() => undefined)
  const [open, setOpen] = useState(false)

  const closeMenu = () => {
    setOpen(false)
    lenis?.start()
  }

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.from("[data-nav-layer='base'] [data-nav-intro]", {
          y: -22,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.05,
          delay: 0.2,
          clearProps: "transform,opacity,visibility",
        })
      })
    },
    { scope: headerRef },
  )

  useEffect(() => {
    const header = headerRef.current
    const base = baseRef.current
    const next = nextRef.current
    const links = linksRef.current
    const top = topRef.current
    if (!header || !base || !next || !links || !top) return

    const dots = header.querySelectorAll<HTMLElement>("[data-nav-dot]")
    let pointed: HTMLElement | null = null
    let frame = 0
    let tone = "hero"
    let barHeight = 60
    let viewport = globalThis.innerHeight
    let grounds: Array<Span & { tone: string }> = []
    let items: Array<Span & { active: boolean; links: NodeListOf<Element> }> = []
    let wasScrolled = false
    let wasOn = "dark"
    let wasVisible = false
    const baseLast = { clip: "", tone: "hero" as string | null }
    const nextLast = { clip: HIDDEN_LAYER, tone: "hero" as string | null }

    // One dot travels between the links: to whichever is pointed at, otherwise back to the current section.
    const place = () => {
      const target = pointed ?? links.querySelector<HTMLElement>("[data-active]")
      for (const dot of dots) {
        dot.style.opacity = target ? "1" : "0"
        if (target) dot.style.transform = `translateX(${target.offsetLeft + target.offsetWidth / 2 - 2.5}px)`
      }
    }

    const setClip = (element: HTMLElement, tone: string | null, clip: string, last: { clip: string; tone: string | null }) => {
      if (tone !== null && tone !== last.tone) {
        element.dataset.tone = tone
        last.tone = tone
      }
      if (clip !== last.clip) {
        element.style.clipPath = clip
        last.clip = clip
      }
    }

    // Runs on every scroll, so it only does arithmetic: the page is measured in `measure` and never read here,
    // and nothing is written unless it changed.
    const sync = () => {
      frame = 0
      const y = globalThis.scrollY
      const scrolled = y > viewport * SCROLLED_AT
      if (scrolled !== wasScrolled) {
        wasScrolled = scrolled
        header.toggleAttribute("data-scrolled", scrolled)
      }

      let arriving: string | undefined
      let edge = barHeight
      // Later in the page paints on top, so the last match wins.
      for (const ground of grounds) {
        const start = ground.top - y
        if (start <= 0 && ground.bottom - y > 0) {
          tone = ground.tone
          arriving = undefined
          edge = barHeight
        } else if (start > 0 && start < barHeight) {
          arriving = ground.tone
          edge = start
        }
      }

      if (menuUpRef.current) {
        setClip(base, "menu", "", baseLast)
        setClip(next, null, HIDDEN_LAYER, nextLast)
      } else if (arriving && arriving !== tone) {
        // Clipping also stops clicks, so the live links always draw whichever side covers the middle of the bar.
        const baseOnTop = edge > barHeight / 2
        const above = `inset(0 0 ${barHeight - edge}px 0)`
        const below = `inset(${edge}px 0 0 0)`
        setClip(base, baseOnTop ? tone : arriving, baseOnTop ? above : below, baseLast)
        setClip(next, baseOnTop ? arriving : tone, baseOnTop ? below : above, nextLast)
      } else {
        setClip(base, tone, "", baseLast)
        setClip(next, null, HIDDEN_LAYER, nextLast)
      }

      const line = y + viewport * READING_LINE
      let changed = false
      for (const item of items) {
        const active = item.top <= line && item.bottom > line
        if (active === item.active) continue
        item.active = active
        changed = true
        for (const link of item.links) link.toggleAttribute("data-active", active)
      }
      if (changed) place()

      // Back to top takes the colours of whatever is behind it, at the bottom of the screen.
      const low = y + viewport - 48
      let lowTone = "hero"
      for (const ground of grounds) if (ground.top <= low && ground.bottom > low) lowTone = ground.tone
      const on = LIGHT_TONES.has(lowTone) ? "light" : "dark"
      if (on !== wasOn) {
        wasOn = on
        top.dataset.on = on
      }
      const visible = y > viewport * BACK_TO_TOP_AT && !menuUpRef.current
      if (visible !== wasVisible) {
        wasVisible = visible
        top.toggleAttribute("data-visible", visible)
      }
    }
    syncRef.current = sync

    const schedule = () => {
      frame ||= requestAnimationFrame(sync)
    }

    const span = (element: Element, y: number): Span => {
      const rect = element.getBoundingClientRect()
      return { top: rect.top + y, bottom: rect.bottom + y }
    }

    const measure = () => {
      const y = globalThis.scrollY
      viewport = globalThis.innerHeight
      barHeight = base.offsetHeight
      grounds = [...document.querySelectorAll<HTMLElement>("[data-nav-ground]")]
        .map((element) => ({ ...span(element, y), tone: element.dataset.navGround ?? "paper" }))
        .filter((ground) => ground.bottom > ground.top)
      items = NAV_ITEMS.flatMap((item) => {
        const target = document.querySelector(item.href)
        return target ? [{ ...span(target, y), active: false, links: header.querySelectorAll(`[data-nav="${item.href}"]`) }] : []
      })
      for (const link of header.querySelectorAll("[data-active]")) link.removeAttribute("data-active")
      sync()
      place()
    }

    const onPoint = (event: Event) => {
      pointed = (event.target as Element).closest<HTMLElement>("a")
      place()
    }
    const onRelease = () => {
      pointed = null
      place()
    }

    const size = new ResizeObserver(measure)
    const main = document.querySelector("main")
    if (main) size.observe(main)
    ScrollTrigger.addEventListener("refresh", measure)
    links.addEventListener("pointerover", onPoint)
    links.addEventListener("focusin", onPoint)
    links.addEventListener("pointerleave", onRelease)
    links.addEventListener("focusout", onRelease)
    globalThis.addEventListener("scroll", schedule, { passive: true })
    globalThis.addEventListener("resize", measure)
    void document.fonts?.ready.then(measure)
    measure()

    return () => {
      cancelAnimationFrame(frame)
      size.disconnect()
      ScrollTrigger.removeEventListener("refresh", measure)
      links.removeEventListener("pointerover", onPoint)
      links.removeEventListener("focusin", onPoint)
      links.removeEventListener("pointerleave", onRelease)
      links.removeEventListener("focusout", onRelease)
      globalThis.removeEventListener("scroll", schedule)
      globalThis.removeEventListener("resize", measure)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    menuUpRef.current = true
    syncRef.current()
    lenis?.stop()
    const root = document.documentElement
    const main = document.querySelector("main")
    const previousOverflow = root.style.overflow
    if (!lenis) root.style.overflow = "hidden"
    main?.setAttribute("inert", "")

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setOpen(false)
      menuButtonRef.current?.focus()
    }
    const onResize = () => {
      if (globalThis.innerWidth >= 1024) setOpen(false)
    }
    // The name in the bar leads home from inside the menu too.
    const onHeaderClick = (event: MouseEvent) => {
      if (!(event.target as Element).closest("[data-nav-layer='base'] a")) return
      setOpen(false)
      lenis?.start()
    }
    headerRef.current?.addEventListener("click", onHeaderClick)
    globalThis.addEventListener("keydown", onKeyDown)
    globalThis.addEventListener("resize", onResize)

    return () => {
      headerRef.current?.removeEventListener("click", onHeaderClick)
      globalThis.removeEventListener("keydown", onKeyDown)
      globalThis.removeEventListener("resize", onResize)
      main?.removeAttribute("inert")
      root.style.overflow = previousOverflow
      lenis?.start()
    }
  }, [open, lenis])

  return (
    <>
      <a
        href="#intro"
        className="fixed top-2 left-2 z-60 -translate-y-20 bg-emerald-deep px-4 py-2.5 font-medium text-cream text-sm focus-visible:translate-y-0"
      >
        {t("skip")}
      </a>
      <header ref={headerRef} data-open={open ? "" : undefined} className="nav group/nav fixed inset-x-0 top-0 z-50">
        <div ref={baseRef} data-nav-layer="base" data-tone="hero" className="nav-layer">
          <NavRow linksRef={linksRef} menuButtonRef={menuButtonRef} open={open} onMenu={() => setOpen((value) => !value)} />
        </div>
        <div ref={nextRef} aria-hidden inert data-tone="hero" className="nav-layer nav-layer-next">
          <NavRow open={open} />
        </div>

        <MobileMenu
          open={open}
          originRef={menuButtonRef}
          onNavigate={closeMenu}
          onClosed={() => {
            menuUpRef.current = false
            syncRef.current()
          }}
        />

        <a ref={topRef} href="#hero" aria-label={t("home")} data-on="dark" className="back-to-top group">
          <ArrowUpIcon className="size-5 transition-transform duration-300 ease-out group-hover:-translate-y-0.5" />
        </a>
      </header>
    </>
  )
}
