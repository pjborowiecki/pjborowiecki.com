"use client"

import { type JSX, useRef } from "react"

import { gsap, MOTION_OK, useGSAP } from "~/src/lib/gsap"

const INTERACTIVE = "a, button, [role='button'], input, textarea"
/** The ring is drawn at its largest and scaled down, so changing size never touches layout. */
const RING_REST = 40 / 112
const LIGHT_NAV_TONES = ["flood", "paper", "board"]
const DARK_GROUND =
  "#hero, .ground-emerald, [data-dark-ground], [data-nav-ground='graphite'], [data-nav-ground='bronze'], [data-nav-ground='ink'], [data-ground='emerald']"

export function CustomCursor(): JSX.Element {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    gsap.matchMedia().add(`${MOTION_OK} and (pointer: fine)`, () => {
      const dot = dotRef.current
      const ring = ringRef.current
      const label = labelRef.current
      if (!dot || !ring || !label) return

      const dotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" })
      const dotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" })
      const ringX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" })
      const ringY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" })
      let seen = false

      const onMove = (event: PointerEvent) => {
        if (!seen) {
          seen = true
          gsap.set([dot, ring], { x: event.clientX, y: event.clientY, xPercent: -50, yPercent: -50, autoAlpha: 1 })
          gsap.set(ring, { scale: RING_REST })
        }
        dotX(event.clientX)
        dotY(event.clientY)
        ringX(event.clientX)
        ringY(event.clientY)
      }

      const onOver = (event: PointerEvent) => {
        const target = event.target as Element
        const named = target.closest?.("[data-cursor]") as HTMLElement | null
        const active = target.closest?.(INTERACTIVE) !== null
        const navTone = target.closest?.("[data-tone]")?.getAttribute("data-tone")
        const dark = navTone
          ? !LIGHT_NAV_TONES.includes(navTone)
          : target.closest?.(DARK_GROUND) && !target.closest?.("[data-light-ground]")
        const ink = dark ? "#f5f0e4" : "#0d1526"

        // Over a project the ring becomes a labelled disc.
        label.textContent = named?.dataset.cursor ?? ""
        gsap.to(dot, { scale: named ? 0 : active ? 0.5 : 1, backgroundColor: ink, duration: 0.2, overwrite: "auto" })
        gsap.to(ring, {
          scale: named ? 1 : active ? RING_REST * 1.6 : RING_REST,
          backgroundColor: named ? "#e2c690" : "rgba(226,198,144,0)",
          borderColor: named ? "#e2c690" : ink,
          duration: 0.35,
          ease: "power3.out",
          overwrite: "auto",
        })
        gsap.to(label, { autoAlpha: named ? 1 : 0, duration: 0.2, overwrite: "auto" })
      }

      globalThis.addEventListener("pointermove", onMove, { passive: true })
      globalThis.addEventListener("pointerover", onOver, { passive: true })

      return () => {
        globalThis.removeEventListener("pointermove", onMove)
        globalThis.removeEventListener("pointerover", onOver)
      }
    })
  })

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none invisible fixed top-0 left-0 z-[200] size-2 rounded-full bg-foreground"
      />
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none invisible fixed top-0 left-0 z-[199] flex size-28 items-center justify-center rounded-full border-[2.8px] border-foreground"
      >
        <span ref={labelRef} className="invisible whitespace-nowrap font-medium text-[0.8125rem] text-emerald-deep tracking-[-0.01em]" />
      </div>
    </>
  )
}
