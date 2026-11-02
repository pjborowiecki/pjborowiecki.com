"use client"

import { createContext, type JSX, type ReactNode, useContext, useEffect, useRef, useState } from "react"

import Lenis from "lenis"

import { gsap, ScrollTrigger } from "~/src/lib/gsap"

const LenisContext = createContext<Lenis | null>(null)

/** Further than this many screens away, the page dissolves instead of flying through every section in between. */
const DISSOLVE_PAST_SCREENS = 1.5
const FALLBACK_GROUND = "#032c20"

export function useLenis(): Lenis | null {
  return useContext(LenisContext)
}

export function SmoothScroll({ children }: Readonly<{ children: ReactNode }>): JSX.Element {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const veilRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // With reduced motion the browser's own instant anchor jump is exactly right, so none of this runs.
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const instance = new Lenis({ autoRaf: false, lerp: 0.11 })
    const tick = (time: number) => instance.raf(time * 1000)
    let traveling = false

    const arrive = (target: HTMLElement) => {
      target.setAttribute("tabindex", "-1")
      target.style.outline = "none"
      target.focus({ preventScroll: true })
    }

    const travelTo = (target: HTMLElement) => {
      const top = (target.closest(".pin-spacer") ?? target).getBoundingClientRect().top + globalThis.scrollY
      const veil = veilRef.current

      if (!veil || Math.abs(top - globalThis.scrollY) < globalThis.innerHeight * DISSOLVE_PAST_SCREENS) {
        instance.scrollTo(top, { duration: 1.1, force: true })
        arrive(target)
        return
      }
      if (traveling) return
      traveling = true

      // The page dissolves into the colour of where it is going, moves while covered, and the section fades up.
      const ground = getComputedStyle(target).backgroundColor
      veil.style.backgroundColor = ground === "rgba(0, 0, 0, 0)" ? FALLBACK_GROUND : ground
      gsap
        .timeline({
          onComplete: () => {
            traveling = false
          },
        })
        .to(veil, {
          autoAlpha: 1,
          duration: 0.38,
          ease: "power2.inOut",
          onComplete: () => {
            instance.scrollTo(top, { immediate: true, force: true })
            ScrollTrigger.update()
            arrive(target)
          },
        })
        // Scrubbed sections catch up to their new position while still covered.
        .to(veil, { autoAlpha: 0, duration: 0.6, ease: "power2.inOut" }, "+=0.4")
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return
      const hash = (event.target as Element).closest?.('a[href^="#"]')?.getAttribute("href")
      const target = hash && hash.length > 1 ? document.querySelector<HTMLElement>(hash) : null
      if (!target) return
      event.preventDefault()
      travelTo(target)
    }

    // Decoding a large image the moment it scrolls into view is what stalled the first pass, so it happens beforehand.
    const idle = (run: () => void) => {
      if ("requestIdleCallback" in globalThis) requestIdleCallback(run, { timeout: 800 })
      else setTimeout(run, 200)
    }
    const primeImages = () => {
      if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return
      const images = [...document.querySelectorAll<HTMLImageElement>('main img[loading="lazy"]')]
      const next = () => {
        const image = images.shift()
        if (!image) return
        image.loading = "eager"
        void image
          .decode()
          .catch(() => undefined)
          .finally(() => idle(next))
      }
      idle(next)
    }
    if (document.readyState === "complete") primeImages()
    else globalThis.addEventListener("load", primeImages, { once: true })

    instance.on("scroll", ScrollTrigger.update)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    document.addEventListener("click", onClick)
    setLenis(instance)

    // Heading measurements change once the web fonts swap in.
    void document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return () => {
      document.removeEventListener("click", onClick)
      globalThis.removeEventListener("load", primeImages)
      gsap.ticker.remove(tick)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return (
    <LenisContext.Provider value={lenis}>
      {children}
      {/* Under the nav, which stays put, and over everything else. */}
      <div ref={veilRef} aria-hidden className="pointer-events-none invisible fixed inset-0 z-40 opacity-0" />
    </LenisContext.Provider>
  )
}
